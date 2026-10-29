'use strict'
const { Plan } = require('../models/index')

// ── Get all active plans (public) ─────────────────────────────────────────────

exports.getPlans = async (req, res, next) => {
  try {
    // Show all plans regardless of active/compliance status on public endpoint
    // Admin must activate plans via admin panel before clients can place orders
    const plans = await Plan.findAll({
      order:   [['sort_order', 'ASC']],
      attributes: { exclude: ['created_at', 'updated_at'] },
    })

    const formatted = plans.map(p => ({
      id:                   p.id,
      slug:                 p.slug,
      name:                 p.name,
      tagline:              p.tagline,
      price:                p.price_paise / 100,
      platformFee:          p.platform_fee_paise / 100,
      billingCycle:         p.billing_cycle,
      badge:                p.badge,
      color:                p.color,
      features:             p.features,
      notIncluded:          p.not_included,
      // Javitri deal fields — only included if associated_value_type is configured
      dealAmountINR:        p.deal_amount_paise ? p.deal_amount_paise / 100 : null,
      // IMPORTANT: associated_value is only shown if type is configured (not 'not_configured')
      associatedValueINR:   (p.associated_value_type && p.associated_value_type !== 'not_configured')
        ? p.associated_value_paise / 100 : null,
      associatedValueType:  p.associated_value_type !== 'not_configured' ? p.associated_value_type : null,
      associatedValueLabel: p.associated_value_label,
      riskDisclosure:       p.risk_disclosure,
    }))

    res.json({ success: true, data: { plans: formatted } })
  } catch (err) {
    next(err)
  }
}

// ── Get single plan by slug ───────────────────────────────────────────────────

exports.getPlanBySlug = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ where: { slug: req.params.slug, is_active: true } })
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' })
    res.json({ success: true, data: { plan } })
  } catch (err) {
    next(err)
  }
}

// ── Admin: create plan ────────────────────────────────────────────────────────

exports.createPlan = async (req, res, next) => {
  try {
    const {
      slug, name, tagline, priceINR, platformFeeINR,
      billingCycle, badge, color, features, notIncluded, sortOrder,
    } = req.body

    const plan = await Plan.create({
      slug,
      name,
      tagline,
      price_paise:        Math.round(priceINR * 100),
      platform_fee_paise: Math.round((platformFeeINR || 0) * 100),
      billing_cycle:      billingCycle || 'monthly',
      badge,
      color,
      features:           features || [],
      not_included:       notIncluded || [],
      sort_order:         sortOrder || 0,
    })

    res.status(201).json({ success: true, data: { plan } })
  } catch (err) {
    next(err)
  }
}

// ── Admin: get all plans including inactive ───────────────────────────────────

exports.adminGetPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({ order: [['sort_order', 'ASC']] })
    res.json({ success: true, data: { plans } })
  } catch (err) {
    next(err)
  }
}

// ── Admin: update plan (including activate/compliance status) ──────────────────

exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id)
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' })

    const {
      name, tagline, priceINR, platformFeeINR,
      billingCycle, badge, color, features, notIncluded, sortOrder, isActive,
    } = req.body

    await plan.update({
      ...(name             !== undefined && { name }),
      ...(tagline          !== undefined && { tagline }),
      ...(priceINR         !== undefined && { price_paise: Math.round(priceINR * 100) }),
      ...(platformFeeINR   !== undefined && { platform_fee_paise: Math.round(platformFeeINR * 100) }),
      ...(billingCycle     !== undefined && { billing_cycle: billingCycle }),
      ...(badge            !== undefined && { badge }),
      ...(color            !== undefined && { color }),
      ...(features         !== undefined && { features }),
      ...(notIncluded      !== undefined && { not_included: notIncluded }),
      ...(sortOrder        !== undefined && { sort_order: sortOrder }),
      ...(isActive         !== undefined && { is_active: isActive }),
      // Javitri-specific fields
      ...(req.body.associatedValueType  !== undefined && { associated_value_type:  req.body.associatedValueType }),
      ...(req.body.associatedValueLabel !== undefined && { associated_value_label: req.body.associatedValueLabel }),
      ...(req.body.complianceStatus     !== undefined && { compliance_status:      req.body.complianceStatus }),
      ...(req.body.riskDisclosure       !== undefined && { risk_disclosure:        req.body.riskDisclosure }),
      ...(req.body.termsVersion         !== undefined && { terms_version:          req.body.termsVersion }),
    })

    res.json({ success: true, data: { plan } })
  } catch (err) {
    next(err)
  }
}
