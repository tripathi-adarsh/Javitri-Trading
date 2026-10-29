'use strict'
const crypto   = require('crypto')
const Razorpay = require('razorpay')
const { Op }   = require('sequelize')
const { sequelize, Order, Payment } = require('../models/index')

function getRazorpay () {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// ── Verify payment (called by frontend after Razorpay Checkout returns) ───────

exports.verifyPayment = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    // ── 1. Find our order — NEVER trust frontend payment status ──────────────
    const order = await Order.findOne({
      where:       { razorpay_order_id },
      transaction: t,
      lock:        t.LOCK.UPDATE,
    })

    if (!order) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Only the authenticated user's order
    if (order.user_id !== req.userId) {
      await t.rollback()
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // ── 2. Duplicate payment protection ──────────────────────────────────────
    if (order.status === 'paid') {
      await t.rollback()
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: { orderId: order.id, status: 'paid' },
      })
    }

    // ── 3. Cryptographic signature verification (HMAC-SHA256) ─────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Record the failed attempt
      await Payment.create({
        order_id:            order.id,
        user_id:             req.userId,
        razorpay_payment_id,
        amount_paise:        order.total_paise,
        status:              'failed',
        failure_reason:      'Signature verification failed',
      }, { transaction: t })

      await order.update({ status: 'failed' }, { transaction: t })
      await t.commit()

      return res.status(400).json({ success: false, message: 'Payment signature verification failed' })
    }

    // ── 4. Duplicate payment_id check ─────────────────────────────────────────
    const existingPayment = await Payment.findOne({
      where: { razorpay_payment_id },
    })
    if (existingPayment) {
      await t.rollback()
      return res.status(200).json({
        success: true,
        message: 'Payment already recorded',
        data: { orderId: order.id, status: order.status },
      })
    }

    // ── 5. Record captured payment ────────────────────────────────────────────
    await Payment.create({
      order_id:            order.id,
      user_id:             req.userId,
      razorpay_payment_id,
      razorpay_signature,
      amount_paise:        order.total_paise,
      status:              'captured',
      verified_at:         new Date(),
    }, { transaction: t })

    await order.update({ status: 'paid' }, { transaction: t })
    await t.commit()

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId:    order.id,
        status:     'paid',
        amountPaid: order.total_paise / 100,
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Razorpay Webhook handler ──────────────────────────────────────────────────

exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const body      = req.rawBody   // set in app.js before JSON parse

    if (!body || !signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook payload or signature' })
    }

    // ── 1. Verify webhook signature ───────────────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSig !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    }

    const event   = JSON.parse(body)
    const eventId = event.id      // Razorpay unique event ID

    // ── 2. Idempotency — ignore duplicate webhooks ────────────────────────────
    // Store a minimal payment record as a processed-event marker.
    // Check by webhook_event_id OR create a stub record if not found.
    const alreadyProcessed = await Payment.findOne({ where: { webhook_event_id: eventId } })
    if (alreadyProcessed) {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    const payload = event.payload?.payment?.entity

    // ── 3. Route by event type ────────────────────────────────────────────────
    switch (event.event) {
      case 'payment.captured': {
        const order = await Order.findOne({ where: { razorpay_order_id: payload.order_id } })
        if (order && order.status !== 'paid') {
          // Update existing Payment row if it exists, otherwise create
          const existingPmt = await Payment.findOne({ where: { razorpay_payment_id: payload.id } })
          if (existingPmt) {
            await existingPmt.update({
              status:           'captured',
              webhook_event_id: eventId,
              verified_at:      new Date(),
            })
          } else {
            await Payment.create({
              order_id:            order.id,
              user_id:             order.user_id,
              razorpay_payment_id: payload.id,
              amount_paise:        payload.amount,
              status:              'captured',
              method:              payload.method,
              webhook_event_id:    eventId,
              verified_at:         new Date(),
            })
          }
          await order.update({ status: 'paid' })
        } else {
          // Order not found — store a stub record so duplicate events are idempotent
          await Payment.create({
            order_id:            null,
            user_id:             null,
            razorpay_payment_id: payload.id || `webhook_${eventId}`,
            amount_paise:        payload.amount || 0,
            status:              'captured',
            method:              payload.method || 'unknown',
            webhook_event_id:    eventId,
            verified_at:         new Date(),
          })
        }
        break
      }

      case 'payment.failed': {
        const order = await Order.findOne({ where: { razorpay_order_id: payload.order_id } })
        if (order && order.status === 'pending') {
          const existingPmt = await Payment.findOne({ where: { razorpay_payment_id: payload.id } })
          if (existingPmt) {
            await existingPmt.update({
              status:           'failed',
              failure_reason:   payload.error_description || 'Payment failed',
              webhook_event_id: eventId,
            })
          } else {
            await Payment.create({
              order_id:            order.id,
              user_id:             order.user_id,
              razorpay_payment_id: payload.id,
              amount_paise:        payload.amount,
              status:              'failed',
              failure_reason:      payload.error_description || 'Payment failed',
              method:              payload.method,
              webhook_event_id:    eventId,
            })
          }
          await order.update({ status: 'failed' })
        }
        break
      }

      case 'refund.created':
      case 'refund.processed': {
        const pmt = await Payment.findOne({ where: { razorpay_payment_id: payload.payment_id } })
        if (pmt) {
          await pmt.update({ status: 'refunded', webhook_event_id: eventId })
          const order = await Order.findByPk(pmt.order_id)
          if (order) await order.update({ status: 'refunded' })
        }
        break
      }

      default:
        // Acknowledge unknown events without error
        break
    }

    res.status(200).json({ success: true })
  } catch (err) {
    // Always return 200 to Razorpay to prevent retries flooding the server
    if (process.env.NODE_ENV !== 'production') {
      console.error('[WEBHOOK ERROR]', err)
    }
    res.status(200).json({ success: true })
  }
}

// ── Get payment status ────────────────────────────────────────────────────────

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.orderId, user_id: req.userId },
    })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const payment = await Payment.findOne({
      where: { order_id: order.id, status: 'captured' },
    })

    res.json({
      success: true,
      data: {
        orderId:    order.id,
        orderStatus:order.status,
        paid:       order.status === 'paid',
        amountPaid: payment ? payment.amount_paise / 100 : null,
        paidAt:     payment?.verified_at || null,
      },
    })
  } catch (err) {
    next(err)
  }
}
