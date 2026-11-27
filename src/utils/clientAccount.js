'use strict'
const crypto = require('crypto')
const { Op } = require('sequelize')
const { User } = require('../models/index')

/**
 * Generates a readable temporary password satisfying strong password rules:
 * uppercase, lowercase, digit, special char, >= 8 chars.
 */
function generateClientPassword() {
  const token = crypto.randomBytes(3).toString('hex').toUpperCase()
  const num   = Math.floor(10 + Math.random() * 90)
  return `Jvt@${token}${num}`
}

/**
 * Generates a unique 10-character placeholder PAN for User table
 * when a client registers without PAN or PAN is already used.
 */
async function resolveUniquePan(preferredPan, transaction) {
  if (preferredPan && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(preferredPan)) {
    const taken = await User.findOne({ where: { pan: preferredPan }, transaction })
    if (!taken) return preferredPan
  }
  for (let i = 0; i < 10; i++) {
    const candidate = `CLNT${crypto.randomBytes(3).toString('hex').toUpperCase()}`.slice(0, 10)
    const taken = await User.findOne({ where: { pan: candidate }, transaction })
    if (!taken) return candidate
  }
  return `C${Date.now().toString(36).toUpperCase().slice(-9)}`
}

/**
 * Ensures a Client has a corresponding User login account (role: 'client').
 * If newly created, returns { email, password, isNewAccount: true }.
 * If already exists, returns { email, password: null, isNewAccount: false }.
 */
async function ensureClientUserAccount(client, { pan = null, transaction = null } = {}) {
  const cleanEmail = client.email.toLowerCase().trim()
  const cleanPhone = client.mobile.trim()

  const existing = await User.findOne({
    where: {
      [Op.or]: [{ email: cleanEmail }, { phone: cleanPhone }],
    },
    transaction,
  })

  if (existing) {
    return {
      user:         existing,
      email:        existing.email,
      password:     null,
      isNewAccount: false,
    }
  }

  const nameParts = (client.full_name || 'Client').trim().split(/\s+/)
  const firstName = nameParts[0].slice(0, 100) || 'Client'
  const lastName  = nameParts.slice(1).join(' ').slice(0, 100) || 'Investor'

  const generatedPassword = generateClientPassword()
  const uniquePan = await resolveUniquePan(pan ? pan.trim().toUpperCase() : null, transaction)

  const user = await User.create({
    first_name:         firstName,
    last_name:          lastName,
    email:              cleanEmail,
    phone:              cleanPhone,
    dob:                '1990-01-01',
    pan:                uniquePan,
    city:               (client.city || 'India').trim().slice(0, 100),
    state:              (client.state || 'IN').trim().slice(0, 10),
    annual_income:      'not_specified',
    trading_experience: 'not_specified',
    password_hash:      generatedPassword, // hashed by User.beforeCreate hook
    role:               'client',
    is_active:          true,
    email_verified:     true,
  }, { transaction })

  return {
    user,
    email:        user.email,
    password:     generatedPassword,
    isNewAccount: true,
  }
}

module.exports = { ensureClientUserAccount, generateClientPassword }
