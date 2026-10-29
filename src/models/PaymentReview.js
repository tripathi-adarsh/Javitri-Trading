'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Admin business-review decision on a verified payment.
 * This is a BUSINESS REVIEW — it is separate from gateway verification.
 *
 * RULES:
 * - A payment can only be reviewed after its gateway status is 'captured'.
 * - Admin cannot approve an unverified payment (enforced in the controller).
 * - Admin cannot manually change the gateway payment status.
 * - If rejected after money was collected, refund must follow approved policy.
 * - Concurrent review protection: use row locking in the controller.
 */
const PaymentReview = sequelize.define('PaymentReview', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  // FK to orders.id
  order_id: {
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,   // one review record per order
  },
  // FK to payments.id (the verified payment this review covers)
  payment_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  // Admin user who performed the review
  reviewer_id: {
    type:      DataTypes.UUID,
    allowNull: true,   // null = pending
  },
  // AWAITING_REVIEW → APPROVED | REJECTED
  decision: {
    type:         DataTypes.ENUM('AWAITING_REVIEW', 'APPROVED', 'REJECTED'),
    defaultValue: 'AWAITING_REVIEW',
    allowNull:    false,
  },
  // Required when decision = REJECTED
  rejection_reason: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  reviewed_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  // Snapshot of gateway status at time of review decision (audit trail)
  gateway_status_at_review: {
    type:      DataTypes.STRING(30),
    allowNull: true,
  },
}, {
  tableName: 'payment_reviews',
  indexes: [
    { fields: ['order_id'],    unique: true },
    { fields: ['payment_id'] },
    { fields: ['reviewer_id'] },
    { fields: ['decision'] },
  ],
})

module.exports = PaymentReview
