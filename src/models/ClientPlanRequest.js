'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * A client can submit multiple plan requests.
 * Each request tracks: which plan, payment status, assigned employee, daily payout tracking.
 */
const ClientPlanRequest = sequelize.define('ClientPlanRequest', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  client_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  assigned_employee_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  plan_slug: {
    type:      DataTypes.STRING(50),
    allowNull: false,
  },
  plan_name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  deal_amount: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Deal amount in paise',
  },
  daily_amount: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Daily payout amount in paise',
  },
  // Unique request number for display (e.g. REQ-20261116-A3F9C2)
  request_number: {
    type:         DataTypes.STRING(30),
    allowNull:    true,
    unique:       true,
    comment:    'Human-readable unique request ID',
  },
  // Payment status — employee marks this
  payment_status: {
    type:         DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending',
    allowNull:    false,
  },
  payment_amount: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Payment amount in paise (entered by employee)',
  },
  transaction_id: {
    type:      DataTypes.STRING(200),
    allowNull: true,
    comment:   'Transaction/reference ID entered by employee',
  },
  payment_marked_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  payment_marked_by: {
    type:      DataTypes.UUID,
    allowNull: true,
    comment:   'Employee/admin user_id who marked payment',
  },
  payment_notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type:         DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull:    false,
  },
}, {
  tableName: 'client_plan_requests',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['assigned_employee_id'] },
    { fields: ['payment_status'] },
    { fields: ['status'] },
    { fields: ['plan_slug'] },
    { fields: ['request_number'], unique: true },
  ],
})

module.exports = ClientPlanRequest
