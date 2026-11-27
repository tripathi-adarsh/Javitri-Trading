'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * KycDocumentFile — persistent binary backup of uploaded KYC documents in MySQL.
 * Prevents uploaded files from being lost when Hostinger / GitHub deployments
 * replace or wipe the local filesystem's uploads/ directory.
 */
const KycDocumentFile = sequelize.define('KycDocumentFile', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  filename: {
    type:      DataTypes.STRING(120),
    allowNull: false,
    unique:    true,
  },
  mime_type: {
    type:         DataTypes.STRING(100),
    allowNull:    false,
    defaultValue: 'application/octet-stream',
  },
  size_bytes: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
  },
  data: {
    type:      DataTypes.BLOB('long'),
    allowNull: false,
  },
}, {
  tableName: 'kyc_document_files',
  indexes: [
    { fields: ['filename'], unique: true },
  ],
})

module.exports = KycDocumentFile
