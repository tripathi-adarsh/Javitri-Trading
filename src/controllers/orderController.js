'use strict'
const crypto      = require('crypto')
const Razorpay    = require('razorpay')
const { Op }      = require('sequelize')
const {
  sequelize, Plan, PromoCode, Order,
  LegalDocument, LegalConsent,
} = require('../models/index')

const GST_RATE = 0.18

function getRazorpay () {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// ─── Helper: server-side amount calculation ───────────────────────────────────

async function calculateAmount (plan, promoCode) {
  let discountPaise = 0

  if (promoCode) {
    // Validate applicability
    if (promoCode.applicable_plan_slug && promoCode.applicable_plan_slug !== plan.slug) {
      return { error: 'Promo code is not valid for this plan' }
    }
    // Validate usage limits
    if (promoCode.max_uses !== null && promoCode.used_count >= promoCode.max_uses) {
      return { error: 'Promo code usage limit reached' }
    }
    // Validate date range
    const now = new Date()
    if (promoCode.valid_from > now) return { error: 'Promo code not yet valid' }
    if (promoCode.valid_until && promoCode.valid_until < now) {
      return { error: 'Promo code has expired' }
    }
    discountPaise = promoCode.discount_paise
  }

  const basePaise     = plan.price_paise
  const feePaise      = plan.platform_fee_paise
  const taxablePaise  = basePaise + feePaise - discountPaise
  const gstPaise      = Math.round(taxablePaise * GST_RATE)
  const totalPaise    = taxablePaise + gstPaise

  return { basePaise, feePaise, discountPaise, gstPaise, totalPaise, error: null }
}

// ── Preview order (no DB write) ───────────────────────────────────────────────

exports.previewOrder = async (req, res, next) => {
  try {
    const { planSlug, promoCode: promoCodeStr } = req.body

    const plan = await Plan.findOne({ where: { slug: planSlug, is_active: true } })
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' })

    let promoCode = null
    if (promoCodeStr) {
      promoCode = await PromoCode.findOne({
        where: { code: promoCodeStr.toUpperCase().trim(), is_active: true },
      })
      if (!promoCode) {
        return res.status(400).json({ success: false, message: 'Invalid promo code' })
      }
    }

    const amounts = await calculateAmount(plan, promoCode)
    if (amounts.error) return res.status(400).json({ success: false, message: amounts.error })

    res.json({
      success: true,
      data: {
        planName:     plan.name,
        planSlug:     plan.slug,
        baseAmount:   amounts.basePaise / 100,
        platformFee:  amounts.feePaise / 100,
        discount:     amounts.discountPaise / 100,
        gst:          amounts.gstPaise / 100,
        totalAmount:  amounts.totalPaise / 100,
        promoApplied: promoCode?.code || null,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Create order ──────────────────────────────────────────────────────────────

exports.createOrder = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      planSlug,
      promoCode: promoCodeStr,
      idempotencyKey,
      termsConsentVersion,
      privacyConsentVersion,
    } = req.body

    // ── 1. Idempotency check ──────────────────────────────────────────────────
    if (!idempotencyKey) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'idempotencyKey is required' })
    }
    const existing = await Order.findOne({ where: { idempotency_key: idempotencyKey } })
    if (existing) {
      await t.rollback()
      // Return same order — idempotent
      return res.status(200).json({
        success: true,
        message: 'Duplicate request — returning existing order',
        data: { orderId: existing.id, razorpayOrderId: existing.razorpay_order_id },
      })
    }

    // ── 2. Consent check — must accept CURRENT published version ──────────────
    if (!termsConsentVersion || !privacyConsentVersion) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms & Conditions and Privacy Policy to proceed',
      })
    }

    const [currentTerms, currentPrivacy] = await Promise.all([
      LegalDocument.findOne({ where: { type: 'terms',   status: 'published' }, order: [['created_at', 'DESC']] }),
      LegalDocument.findOne({ where: { type: 'privacy', status: 'published' }, order: [['created_at', 'DESC']] }),
    ])

    if (!currentTerms || termsConsentVersion !== currentTerms.version) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: `Please accept the current Terms & Conditions (version ${currentTerms?.version})`,
      })
    }
    if (!currentPrivacy || privacyConsentVersion !== currentPrivacy.version) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: `Please accept the current Privacy Policy (version ${currentPrivacy?.version})`,
      })
    }

    // ── 3. Plan & promo lookup ────────────────────────────────────────────────
    const plan = await Plan.findOne({ where: { slug: planSlug, is_active: true }, transaction: t })
    if (!plan) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    let promoCode = null
    if (promoCodeStr) {
      promoCode = await PromoCode.findOne({
        where: { code: promoCodeStr.toUpperCase().trim(), is_active: true },
        lock:  t.LOCK.UPDATE,   // row-lock to prevent race on max_uses
        transaction: t,
      })
      if (!promoCode) {
        await t.rollback()
        return res.status(400).json({ success: false, message: 'Invalid promo code' })
      }
    }

    // ── 4. Server-side amount calculation — NEVER trust frontend amounts ───────
    const amounts = await calculateAmount(plan, promoCode)
    if (amounts.error) {
      await t.rollback()
      return res.status(400).json({ success: false, message: amounts.error })
    }

    // ── 5. Create Razorpay order ──────────────────────────────────────────────
    const razorpay = getRazorpay()
    let rzpOrder
    try {
      rzpOrder = await razorpay.orders.create({
        amount:          amounts.totalPaise,
        currency:        'INR',
        receipt:         `rcpt_${idempotencyKey.slice(0, 20)}`,
        notes: {
          planSlug,
          userId: req.userId,
        },
      })
    } catch (rzpErr) {
      await t.rollback()
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Razorpay] Order creation failed:', rzpErr.message)
      }
      return res.status(502).json({ success: false, message: 'Payment gateway unavailable. Please try again.' })
    }

    // ── 6. Save consent records ───────────────────────────────────────────────
    const ip        = req.ip || req.connection?.remoteAddress
    const userAgent = req.headers['user-agent'] || ''

    const [termsConsent, privacyConsent] = await Promise.all([
      LegalConsent.create({
        user_id:           req.userId,
        legal_document_id: currentTerms.id,
        document_type:     'terms',
        document_version:  currentTerms.version,
        accepted_at:       new Date(),
        ip_address:        ip,
        user_agent:        userAgent,
      }, { transaction: t }),

      LegalConsent.create({
        user_id:           req.userId,
        legal_document_id: currentPrivacy.id,
        document_type:     'privacy',
        document_version:  currentPrivacy.version,
        accepted_at:       new Date(),
        ip_address:        ip,
        user_agent:        userAgent,
      }, { transaction: t }),
    ])

    // ── 7. Create Order row ───────────────────────────────────────────────────
    const order = await Order.create({
      user_id:            req.userId,
      plan_id:            plan.id,
      promo_code_id:      promoCode?.id || null,
      idempotency_key:    idempotencyKey,
      base_amount_paise:  amounts.basePaise,
      platform_fee_paise: amounts.feePaise,
      discount_paise:     amounts.discountPaise,
      gst_paise:          amounts.gstPaise,
      total_paise:        amounts.totalPaise,
      razorpay_order_id:  rzpOrder.id,
      status:             'pending',
      terms_consent_id:   termsConsent.id,
      privacy_consent_id: privacyConsent.id,
    }, { transaction: t })

    // Update consent rows with order_id
    await Promise.all([
      termsConsent.update({ order_id: order.id }, { transaction: t }),
      privacyConsent.update({ order_id: order.id }, { transaction: t }),
    ])

    // Increment promo usage
    if (promoCode) {
      await promoCode.increment('used_count', { transaction: t })
    }

    await t.commit()

    res.status(201).json({
      success: true,
      data: {
        orderId:         order.id,
        razorpayOrderId: rzpOrder.id,
        razorpayKeyId:   process.env.RAZORPAY_KEY_ID,
        amount:          amounts.totalPaise,
        currency:        'INR',
        breakdown: {
          base:       amounts.basePaise / 100,
          platformFee:amounts.feePaise / 100,
          discount:   amounts.discountPaise / 100,
          gst:        amounts.gstPaise / 100,
          total:      amounts.totalPaise / 100,
        },
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Get my orders ─────────────────────────────────────────────────────────────

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where:   { user_id: req.userId },
      include: [{ model: Plan, as: 'plan', attributes: ['name', 'slug'] }],
      order:   [['created_at', 'DESC']],
    })
    res.json({ success: true, data: { orders } })
  } catch (err) {
    next(err)
  }
}

// ── Admin: get all orders ─────────────────────────────────────────────────────

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const where = status ? { status } : {}
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit:   parseInt(limit),
      offset:  (parseInt(page) - 1) * parseInt(limit),
      order:   [['created_at', 'DESC']],
      include: [
        { model: Plan, as: 'plan', attributes: ['name', 'slug'] },
      ],
    })
    res.json({ success: true, data: { total: count, page: parseInt(page), orders: rows } })
  } catch (err) {
    next(err)
  }
}
