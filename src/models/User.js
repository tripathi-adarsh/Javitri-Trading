'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')
const bcrypt = require('bcryptjs')

const User = sequelize.define('User', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  first_name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  phone: {
    type:      DataTypes.STRING(15),
    allowNull: false,
    unique:    true,
  },
  dob: {
    type:      DataTypes.DATEONLY,
    allowNull: false,
  },
  pan: {
    type:      DataTypes.STRING(10),
    allowNull: false,
    unique:    true,
  },
  city: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type:      DataTypes.STRING(10),
    allowNull: false,
  },
  annual_income: {
    type:      DataTypes.STRING(30),
    allowNull: false,
  },
  trading_experience: {
    type:      DataTypes.STRING(30),
    allowNull: false,
  },
  password_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type:         DataTypes.ENUM('client', 'employee', 'admin', 'super_admin'),
    defaultValue: 'client',
    allowNull:    false,
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  email_verified: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refresh_token_hash: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'],  unique: true },
    { fields: ['phone'],  unique: true },
    { fields: ['pan'],    unique: true },
    { fields: ['role'] },
    { fields: ['is_active'] },
  ],
})

// Instance method — compare password
User.prototype.verifyPassword = async function (plain) {
  return bcrypt.compare(plain, this.password_hash)
}

// Before create — hash password
User.beforeCreate(async (user) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
  user.password_hash = await bcrypt.hash(user.password_hash, rounds)
})

// Before update — hash if password_hash changed
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    user.password_hash = await bcrypt.hash(user.password_hash, rounds)
  }
})

// Safe JSON — strip sensitive fields
User.prototype.toSafeJSON = function () {
  const obj = this.toJSON()
  delete obj.password_hash
  delete obj.refresh_token_hash
  return obj
}

module.exports = User
