'use strict'
const { Op } = require('sequelize')
const { sequelize, Order, Payment, PaymentReview, Client, Employee, User, Plan } = require('../models/index')
const { audit } = require('../utils/auditLogger')

// ── List payments awaiting or reviewed ───────────────────────────────────────

exports.listPaymentReviews = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize
    const { decision } = req.query

    const where = {}
    if (decision) where.decision = decision

    const { count, rows } = await PaymentReview.findAndCountAll({
      where,
      include: [
        {
          model: Order, as: 'order',
          include: [
            { model: Plan, as: 'plan', attributes: ['name', 'slug', 'deal_amount_paise'] },
            { model: Client, as: 'client', attributes: ['registration_id', 'full_name'] },
            {
              model: Employee, as: 'employee',
              attributes: ['employee_code'],
            },
          ],
        },
        { model: Payment, as: 'payment', attributes: ['id', 'razorpay_payment_id', 'amount_paise', 'status', 'verified_at', 'method'] },
        { model: User, as: 'reviewer', attributes: ['first_name', 'last_name', 'email'] },
      ],
      limit:  pageSize,
      offset,
      order:  [['created_at', 'DESC']],
    })

    res.json({
      success: true,
      data: {
        reviews: rows.map(r => ({
          id:                   r.id,
          orderId:              r.order_id,
          orderNumber:          r.order?.id?.slice(0, 8).toUpperCase(),
          paymentId:            r.payment_id,
          gatewayPaymentRef:    r.payment?.razorpay_payment_id,
          gatewayVerifyStatus:  r.payment?.status,
          verifiedAt:           r.payment?.verified_at,
          amountPaise:          r.payment?.amount_paise,
          amountINR:            r.payment ? r.payment.amount_paise / 100 : null,
          clientName:           r.order?.client?.full_name,
          registrationId:       r.order?.client?.registration_id,
          planName:             r.order?.plan?.name,
          employeeCode:         r.order?.employee?.employee_code,
          decision:             r.decision,
          rejectionReason:      r.rejection_reason,
          reviewerName:         r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}` : null,
          reviewedAt:           r.reviewed_at,
          createdAt:            r.created_at,
        })),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single payment review ─────────────────────────────────────────────────

exports.getPaymentReview = async (req, res, next) => {
  try {
    const review = await PaymentReview.findByPk(req.params.id, {
      include: [
        { model: Order, as: 'order', include: [
          { model: Plan, as: 'plan' },
          { model: Client, as: 'client' },
        ]},
        { model: Payment, as: 'payment' },
        { model: User, as: 'reviewer', attributes: ['first_name', 'last_name', 'email'] },
      ],
    })
    if (!review) return res.status(404).json({ success: false, message: 'Payment review not found' })
    res.json({ success: true, data: { review } })
  } catch (err) {
    next(err)
  }
}

// ── Admin: Approve or Reject a payment ───────────────────────────────────────

exports.submitReviewDecision = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { decision, rejectionReason } = req.body

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      await t.rollback()
      return res.status(422).json({ success: false, message: 'decision must be APPROVED or REJECTED' })
    }
    if (decision === 'REJECTED' && !rejectionReason?.trim()) {
      await t.rollback()
      return res.status(422).json({ success: false, message: 'rejectionReason is required when rejecting' })
    }

    // Lock the review row for concurrent update protection
    const review = await PaymentReview.findByPk(req.params.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [{ model: Payment, as: 'payment' }],
    })
    if (!review) { await t.rollback(); return res.status(404).json({ success: false, message: 'Payment review not found' }) }

    if (review.decision !== 'AWAITING_REVIEW') {
      await t.rollback()
      return res.status(400).json({ success: false, message: `Review already ${review.decision} — cannot change` })
    }

    // CRITICAL: Admin cannot approve an unverified payment
    if (decision === 'APPROVED' && review.payment?.status !== 'captured') {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: `Cannot approve: payment gateway status is '${review.payment?.status}'. Only captured payments can be approved.`,
      })
    }

    await review.update({
      decision:                  decision,
      rejection_reason:          decision === 'REJECTED' ? rejectionReason.trim() : null,
      reviewer_id:               req.userId,
      reviewed_at:               new Date(),
      gateway_status_at_review:  review.payment?.status || null,
    }, { transaction: t })

    // Update order status
    const orderStatus = decision === 'APPROVED' ? 'paid' : 'failed'
    await Order.update({ status: orderStatus }, { where: { id: review.order_id }, transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      `PAYMENT_${decision}`,
      entityType:  'payment_review',
      entityId:    review.id,
      metadata: {
        orderId:    review.order_id,
        paymentId:  review.payment_id,
        decision,
        rejectionReason: decision === 'REJECTED' ? rejectionReason : undefined,
      },
      req,
    })

    res.json({
      success: true,
      message: `Payment ${decision.toLowerCase()} successfully`,
      data:    { decision, reviewId: review.id },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Dashboard statistics ──────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { ClientPlanRequest, DailyPayout, ContactMessage, PaymentRequest } = require('../models/index')

    const [
      totalEmployees,
      activeEmployees,
      totalClients,
      pendingKyc,
      totalPlanRequests,
      pendingPayments,
      successPayments,
      failedPayments,
      totalDailyPayouts,
      newContactMessages,
      pendingClientPaymentRequests,
    ] = await Promise.all([
      require('../models/index').Employee.count(),
      require('../models/index').Employee.count({
        include: [{ model: User, as: 'user', where: { is_active: true }, required: true }],
      }),
      require('../models/index').Client.count(),
      require('../models/index').Client.count({ where: { status: { [Op.in]: ['pending_kyc', 'kyc_submitted'] } } }),
      ClientPlanRequest.count(),
      ClientPlanRequest.count({ where: { payment_status: 'pending' } }),
      ClientPlanRequest.count({ where: { payment_status: 'success' } }),
      ClientPlanRequest.count({ where: { payment_status: 'failed' } }),
      DailyPayout.count(),
      ContactMessage.count({ where: { status: 'new' } }),
      PaymentRequest.count({ where: { status: 'pending' } }),
    ])

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalClients,
        pendingKyc,
        totalPlanRequests,
        pendingPayments,
        successPayments,
        failedPayments,
        totalDailyPayouts,
        newContactMessages,
        pendingClientPaymentRequests,
      },
    })
  } catch (err) {
    next(err)
  }
}
