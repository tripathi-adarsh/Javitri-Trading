'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

const Plan = sequelize.define('Plan', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  slug: {
    // e.g. 'starter', 'pro', 'elite'  — used as stable identifier from frontend
    type:      DataTypes.STRING(50),
    allowNull: false,
    unique:    true,
  },
  name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  tagline: {
    type:      DataTypes.STRING(200),
    allowNull: true,
  },
  // Price in paise (integer) to avoid floating-point issues
  // 999 INR → 99900 paise
  price_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment:   'Price in paise (1 INR = 100 paise)',
  },
  platform_fee_paise: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
  },
  billing_cycle: {
    type:         DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly',
    allowNull:    false,
  },
  badge: {
    type:      DataTypes.STRING(50),
    allowNull: true,
  },
  color: {
    type:         DataTypes.STRING(30),
    defaultValue: 'emerald',
  },
  features: {
    // Stored as JSON array of strings
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  not_included: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  // ── Javitri deal plan configurable fields ─────────────────────────────────
  // Primary deal amount in paise (e.g. ₹10,000 = 1000000 paise)
  deal_amount_paise: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Primary deal amount in paise',
  },
  // Second amount — meaning NOT yet confirmed by the company.
  // Do NOT label this as guaranteed profit/income until compliance approval.
  associated_value_paise: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment:   'Second plan value in paise — type must be configured before publishing',
  },
  // Describes what associated_value_paise represents
  associated_value_type: {
    type:         DataTypes.ENUM('not_configured', 'service_fee', 'commission', 'illustrative_estimate', 'other_approved'),
    defaultValue: 'not_configured',
    allowNull:    false,
  },
  associated_value_label: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },
  risk_disclosure: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  terms_version: {
    type:      DataTypes.STRING(20),
    allowNull: true,
  },
  compliance_status: {
    type:         DataTypes.ENUM('pending_review', 'approved', 'suspended'),
    defaultValue: 'pending_review',
    allowNull:    false,
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sort_order: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'plans',
  indexes: [
    { fields: ['slug'],      unique: true },
    { fields: ['is_active'] },
    { fields: ['sort_order'] },
  ],
})

// Helper: price in INR
Plan.prototype.getPriceINR = function () {
  return this.price_paise / 100
}

module.exports = Plan
