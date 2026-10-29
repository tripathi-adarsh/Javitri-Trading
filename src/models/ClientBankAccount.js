'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Bank account details for a client.
 * IMPORTANT SECURITY NOTES:
 * - Account numbers are stored encrypted (AES-256-GCM).
 * - Full account numbers are NEVER displayed in the UI after submission.
 * - Only authorized admin roles (super_admin) can decrypt / view full numbers.
 * - Internet banking passwords, card PINs, CVVs, and UPI PINs are NEVER collected.
 * - Verification of account ownership should use a licensed bank verification provider.
 *
 * This feature should only be enabled after:
 *   1. Confirming legal necessity for the approved business purpose.
 *   2. Implementing proper encryption key management.
 *   3. Restricting access in RBAC middleware.
 */
const ClientBankAccount = sequelize.define('ClientBankAccount', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  client_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  account_holder_name: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  bank_name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  // Encrypted account number — format: <iv_hex>:<auth_tag_hex>:<ciphertext_base64>
  encrypted_account_number: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },
  account_number_masked: {
    // e.g. "XXXX XXXX 1234" — safe to display
    type:      DataTypes.STRING(25),
    allowNull: false,
  },
  ifsc_code: {
    // IFSC is not sensitive — stored plaintext
    type:      DataTypes.STRING(11),
    allowNull: false,
    validate: {
      is: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    },
  },
  is_primary: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  verification_status: {
    type:         DataTypes.ENUM('unverified', 'pending_verification', 'verified', 'failed'),
    defaultValue: 'unverified',
  },
  verification_reference: {
    // Reference from bank verification provider
    type:      DataTypes.STRING(100),
    allowNull: true,
  },
  verified_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'client_bank_accounts',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['ifsc_code'] },
    { fields: ['verification_status'] },
  ],
})

module.exports = ClientBankAccount
