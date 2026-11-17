'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Contact form submissions from the public Contact page.
 * Displayed in the admin panel.
 */
const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  name: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type:      DataTypes.STRING(15),
    allowNull: false,
  },
  message: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('new', 'read', 'archived'),
    defaultValue: 'new',
    allowNull:    false,
  },
  // Admin reply / notes
  admin_notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'contact_messages',
  indexes: [
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['email'] },
  ],
})

module.exports = ContactMessage
