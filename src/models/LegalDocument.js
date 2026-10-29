'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Stores versioned legal documents: Terms & Conditions, Privacy Policy.
 * Each published version is immutable — new edits create a new version row.
 */
const LegalDocument = sequelize.define('LegalDocument', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  type: {
    type:      DataTypes.ENUM('terms', 'privacy'),
    allowNull: false,
  },
  version: {
    // Semantic version string e.g. "1.0.0-draft", "1.0.0"
    type:      DataTypes.STRING(20),
    allowNull: false,
  },
  title: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  content: {
    // Full legal text stored as JSON array of sections
    type:      DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull:    false,
  },
  effective_date: {
    type:      DataTypes.DATEONLY,
    allowNull: true,
  },
  published_by: {
    type:      DataTypes.UUID,
    allowNull: true,   // admin user ID
  },
}, {
  tableName: 'legal_documents',
  indexes: [
    { fields: ['type', 'status'] },
    { fields: ['type', 'version'], unique: true },
  ],
})

module.exports = LegalDocument
