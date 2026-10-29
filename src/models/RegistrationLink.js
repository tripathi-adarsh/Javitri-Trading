'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Employee-generated client registration links.
 * Each link contains a cryptographically random token (stored as a SHA-256 hash).
 * When a client visits the URL, the token is looked up, the employee is identified,
 * and the client is associated with that employee upon registration.
 *
 * SECURITY:
 * - token_hash: stores SHA-256(token) — the raw token is never persisted
 * - The URL carries the raw token; only the hash lives in DB
 * - Expired, revoked, or exceeded-limit links reject registration silently
 */
const RegistrationLink = sequelize.define('RegistrationLink', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  employee_id: {
    // FK to employees.id (NOT users.id)
    type:      DataTypes.UUID,
    allowNull: false,
  },
  token_hash: {
    // SHA-256 hex of the raw token — raw token never stored
    type:      DataTypes.STRING(64),
    allowNull: false,
    unique:    true,
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  max_uses: {
    type:         DataTypes.INTEGER.UNSIGNED,
    defaultValue: 1,   // default: single use
    allowNull:    false,
  },
  usage_count: {
    type:         DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  status: {
    type:         DataTypes.ENUM('active', 'revoked', 'expired'),
    defaultValue: 'active',
    allowNull:    false,
  },
  revoked_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  revoked_by_user_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // Human-friendly label, optional
  label: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'registration_links',
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['token_hash'], unique: true },
    { fields: ['status'] },
    { fields: ['expires_at'] },
  ],
})

module.exports = RegistrationLink
