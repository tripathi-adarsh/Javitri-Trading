'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Track daily payouts given to a client for a specific plan request.
 * Employee marks each day's payout as done.
 */
const DailyPayout = sequelize.define('DailyPayout', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  plan_request_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  client_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  assigned_employee_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  payout_date: {
    type:      DataTypes.DATEONLY,
    allowNull: false,
    comment:   'Date for which this payout is recorded (YYYY-MM-DD)',
  },
  amount: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment:   'Amount paid in paise',
  },
  marked_by: {
    type:      DataTypes.UUID,
    allowNull: true,
    comment:   'Employee/admin who marked this payout',
  },
  notes: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  transaction_reference: {
    type:      DataTypes.STRING(200),
    allowNull: true,
    comment:   'Transaction reference / UTR number for this payout',
  },
  payment_method: {
    type:         DataTypes.ENUM('bank_transfer', 'upi', 'cash', 'cheque', 'other'),
    allowNull:    true,
    defaultValue:  null,
  },
}, {
  tableName: 'daily_payouts',
  indexes: [
    { fields: ['plan_request_id'] },
    { fields: ['client_id'] },
    { fields: ['payout_date'] },
    { unique: true, fields: ['plan_request_id', 'payout_date'], name: 'unique_payout_per_day' },
  ],
})

module.exports = DailyPayout
