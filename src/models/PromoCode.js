'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  code: {
    type:      DataTypes.STRING(30),
    allowNull: false,
    unique:    true,
  },
  // Discount in paise
  discount_paise: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  description: {
    type:      DataTypes.STRING(200),
    allowNull: true,
  },
  // null = applicable to all plans
  applicable_plan_slug: {
    type:      DataTypes.STRING(50),
    allowNull: true,
  },
  max_uses: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: true,   // null = unlimited
  },
  used_count: {
    type:         DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  valid_from: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  valid_until: {
    type:      DataTypes.DATE,
    allowNull: true,   // null = no expiry
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'promo_codes',
  indexes: [
    { fields: ['code'],      unique: true },
    { fields: ['is_active'] },
  ],
})

module.exports = PromoCode
