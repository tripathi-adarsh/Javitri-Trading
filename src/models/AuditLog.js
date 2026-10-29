'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Immutable audit log.
 * Records significant actions: login, user creation, plan changes, payment decisions, etc.
 *
 * IMPORTANT:
 * - Never include full PAN, account numbers, passwords, or secrets in safe_metadata_json.
 * - Masked values (e.g., "ABCDE****F") are acceptable for tracing.
 * - This table is append-only; no updates or deletes should be permitted.
 * - Use safe_metadata_json for structured context (entity names, masked IDs, etc.)
 */
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  // The user who performed the action (null = system/anonymous)
  actor_user_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  action: {
    // e.g. 'USER_LOGIN', 'EMPLOYEE_CREATED', 'PLAN_DEACTIVATED', 'PAYMENT_APPROVED'
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  entity_type: {
    // e.g. 'user', 'employee', 'client', 'plan', 'order', 'payment'
    type:      DataTypes.STRING(50),
    allowNull: true,
  },
  entity_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // Structured metadata — safe subset of relevant fields, NO secrets or full PII
  safe_metadata_json: {
    type:      DataTypes.JSON,
    allowNull: true,
  },
  // IP address of the request (IPv4 or IPv6)
  ip_address: {
    type:      DataTypes.STRING(45),
    allowNull: true,
  },
  // User-agent string (truncated to 500 chars)
  user_agent: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName:  'audit_logs',
  updatedAt:  false,   // immutable — no updates
  indexes: [
    { fields: ['actor_user_id'] },
    { fields: ['action'] },
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['created_at'] },
  ],
})

module.exports = AuditLog
