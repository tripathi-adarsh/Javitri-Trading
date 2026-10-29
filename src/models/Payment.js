'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

const Payment = sequelize.define('Payment', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  order_id: {
    type:      DataTypes.UUID,
    allowNull: true,   // null for webhook stubs when order not found
  },
  user_id: {
    type:      DataTypes.UUID,
    allowNull: true,   // null for webhook stubs
  },
  // Razorpay payment_id returned after capture
  razorpay_payment_id: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    unique:    true,
  },
  // Razorpay signature — stored ONLY after verification
  razorpay_signature: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
  amount_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  currency: {
    type:         DataTypes.STRING(5),
    defaultValue: 'INR',
  },
  status: {
    type:         DataTypes.ENUM('initiated', 'pending', 'captured', 'failed', 'refunded'),
    defaultValue: 'initiated',
  },
  method: {
    type:      DataTypes.STRING(30),
    allowNull: true,   // upi / card / netbanking / wallet
  },
  failure_reason: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  // Webhook: track duplicate event IDs
  webhook_event_id: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    unique:    true,
  },
  verified_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['razorpay_payment_id'], unique: true },
    { fields: ['status'] },
    { fields: ['webhook_event_id'],    unique: true },
  ],
})

module.exports = Payment
