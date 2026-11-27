'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * PaymentRequest — client-initiated daily payout / payment requests sent to admin.
 */
const PaymentRequest = sequelize.define('PaymentRequest', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  request_number: {
    type:      DataTypes.STRING(32),
    allowNull: false,
    unique:    true,
  },
  client_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  plan_request_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  request_type: {
    type:         DataTypes.ENUM('payout_request', 'plan_payment'),
    defaultValue: 'payout_request',
    allowNull:    false,
  },
  payout_date: {
    type:      DataTypes.DATEONLY,
    allowNull: true,
    comment:   'Date of payout request (YYYY-MM-DD)',
  },
  amount_paise: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment:   'Requested amount in paise',
  },
  approved_amount_paise: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Approved/paid amount in paise',
  },
  payment_mode: {
    type:         DataTypes.ENUM('bank_transfer', 'upi', 'cash', 'cheque', 'other'),
    defaultValue: 'bank_transfer',
    allowNull:    false,
  },
  client_reference: {
    type:      DataTypes.STRING(200),
    allowNull: true,
    comment:   'Optional UTR / UPI ID / reference from client',
  },
  client_notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type:         DataTypes.ENUM('pending', 'approved', 'paid', 'rejected'),
    defaultValue: 'pending',
    allowNull:    false,
  },
  admin_transaction_ref: {
    type:      DataTypes.STRING(200),
    allowNull: true,
  },
  admin_notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  has_open_issue: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull:    false,
  },
  issue_messages: {
    type:         DataTypes.JSON,
    allowNull:    true,
    comment:      'Thread of client/admin messages for payment-not-received queries',
  },
  processed_by: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  processed_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'payment_requests',
  indexes: [
    { fields: ['request_number'], unique: true },
    { fields: ['client_id'] },
    { fields: ['plan_request_id'] },
    { fields: ['payout_date'] },
    { fields: ['status'] },
    { fields: ['has_open_issue'] },
  ],
})

module.exports = PaymentRequest
