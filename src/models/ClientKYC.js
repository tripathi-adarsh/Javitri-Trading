'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * KYC information for a client.
 * IMPORTANT SECURITY NOTES:
 * - PAN and identity references are stored encrypted at the application layer.
 *   The encrypted_ prefix signals that the value must be decrypted before use.
 * - Aadhaar-based fields are NOT collected here by default; see compliance notes.
 * - Full values are never logged, returned in list endpoints, or included in exports.
 *
 * Encryption: use AES-256-GCM with a key stored in environment config (KYC_ENCRYPTION_KEY).
 * Key rotation must be handled separately.
 */
const ClientKYC = sequelize.define('ClientKYC', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  client_id: {
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,   // one KYC record per client
  },
  // Encrypted PAN (AES-256-GCM, base64-encoded ciphertext + IV + tag)
  // Format: <iv_hex>:<auth_tag_hex>:<ciphertext_base64>
  encrypted_pan: {
    type:      DataTypes.TEXT,
    allowNull: true,   // may be collected later
  },
  pan_masked: {
    // e.g. "ABCDE****F" — safe to display in UI
    type:      DataTypes.STRING(15),
    allowNull: true,
  },
  // Encrypted identity reference (e.g., an authorized eKYC verification reference number)
  // Do NOT store raw Aadhaar numbers — use only an authorized KYC provider reference
  encrypted_identity_reference: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  identity_reference_type: {
    // e.g. 'kyc_provider_ref' | 'dl' | 'passport_ref'
    type:      DataTypes.STRING(50),
    allowNull: true,
  },
  verification_status: {
    type:         DataTypes.ENUM('not_started', 'submitted', 'in_review', 'verified', 'rejected'),
    defaultValue: 'not_started',
    allowNull:    false,
  },
  verified_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  verified_by_user_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  rejection_reason: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  // ── Document image paths (stored server-side, not public) ────────────────
  aadhaar_image_path: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  aadhaar_back_image_path: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  pan_image_path: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  passbook_image_path: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  // Raw metadata from KYC provider (JSON, no sensitive fields)
  provider_metadata: {
    type:      DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'client_kyc',
  indexes: [
    { fields: ['client_id'],         unique: true },
    { fields: ['verification_status'] },
  ],
})

module.exports = ClientKYC
