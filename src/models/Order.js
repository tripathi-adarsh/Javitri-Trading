'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

const Order = sequelize.define('Order', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  user_id: {
    type:      DataTypes.UUID,
    allowNull: true,   // null for client-flow orders (client may not have login)
  },
  // Client record (Javitri client registration flow)
  client_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // Employee who originated this client (for attribution)
  employee_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  plan_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  promo_code_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // Immutable plan snapshot at time of order creation
  plan_snapshot_json: {
    type:      DataTypes.JSON,
    allowNull: true,
    comment:   'Snapshot of plan fields at order creation — prevents plan changes from affecting existing orders',
  },
  // Idempotency key — client-generated, stored to prevent duplicate orders
  idempotency_key: {
    type:      DataTypes.STRING(64),
    allowNull: false,
    unique:    true,
  },
  // All amounts in paise
  base_amount_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment:   'Plan price in paise',
  },
  platform_fee_paise: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
  },
  discount_paise: {
    type:         DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  gst_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment:   '18% GST in paise',
  },
  total_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment:   'Final amount charged to customer in paise',
  },
  // Razorpay order id returned from their API
  razorpay_order_id: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    unique:    true,
  },
  status: {
    type:         DataTypes.ENUM('created', 'pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'created',
    allowNull:    false,
  },
  // Consent record IDs (FK to LegalConsent)
  terms_consent_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  privacy_consent_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['razorpay_order_id'], unique: true },
    { fields: ['idempotency_key'],   unique: true },
  ],
})

module.exports = Order
