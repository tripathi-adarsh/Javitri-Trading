'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Immutable audit trail of every user consent acceptance.
 * Stores: which user, which document version, when, from which IP,
 * and which order the consent was collected for.
 */
const LegalConsent = sequelize.define('LegalConsent', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  user_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  legal_document_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  order_id: {
    // May be null if consent is recorded at registration before any order
    type:      DataTypes.UUID,
    allowNull: true,
  },
  document_type: {
    type:      DataTypes.ENUM('terms', 'privacy'),
    allowNull: false,
  },
  document_version: {
    type:      DataTypes.STRING(20),
    allowNull: false,
  },
  accepted_at: {
    type:         DataTypes.DATE,
    allowNull:    false,
    defaultValue: DataTypes.NOW,
  },
  ip_address: {
    type:      DataTypes.STRING(45),   // IPv6 max 45 chars
    allowNull: true,
  },
  user_agent: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'legal_consents',
  updatedAt: false,   // consent is immutable — no updates
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['legal_document_id'] },
    { fields: ['document_type', 'user_id'] },
  ],
})

module.exports = LegalConsent
