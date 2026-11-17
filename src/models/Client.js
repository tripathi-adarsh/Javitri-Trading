'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Client — a person who registered via an employee registration link.
 * Distinct from the User model (which handles login accounts).
 * Clients may or may not have a corresponding user login account;
 * they are created at registration-link form submission.
 *
 * Sensitive fields (PAN, bank info) are stored in separate models:
 * ClientKYC and ClientBankAccount.
 */
const Client = sequelize.define('Client', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  // Human-readable registration ID shown to clients
  registration_id: {
    type:      DataTypes.STRING(20),
    allowNull: false,
    unique:    true,
  },
  // The employee who registered this client
  originating_employee_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // ── Personal info ────────────────────────────────────────────────────────
  full_name: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  mobile: {
    type:      DataTypes.STRING(15),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  // ── Address ──────────────────────────────────────────────────────────────
  address_line: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  city: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  postal_code: {
    type:      DataTypes.STRING(10),
    allowNull: false,
  },
  country: {
    type:         DataTypes.STRING(60),
    defaultValue: 'India',
  },
  // ── Business ─────────────────────────────────────────────────────────────
  client_type: {
    type:         DataTypes.ENUM('individual', 'business'),
    defaultValue: 'individual',
    allowNull:    false,
  },
  status: {
    // Overall client record status
    type:         DataTypes.ENUM('pending_kyc', 'kyc_submitted', 'active', 'rejected', 'inactive'),
    defaultValue: 'pending_kyc',
    allowNull:    false,
  },
  // Admin who last reviewed/updated this client
  reviewed_by_user_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  reviewed_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  review_notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'clients',
  indexes: [
    { fields: ['registration_id'],         unique: true },
    { fields: ['originating_employee_id'] },
    { fields: ['email'] },
    { fields: ['mobile'] },
    { fields: ['status'] },
  ],
})

module.exports = Client
