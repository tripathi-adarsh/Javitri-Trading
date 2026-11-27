'use strict'
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const { User } = require('../models/index')

// ── Token helpers ─────────────────────────────────────────────────────────────

function signAccess (userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function signRefresh (userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  })
}

const isHttps = (process.env.FRONTEND_URL || '').startsWith('https://')
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production' && isHttps,
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,   // 7 days ms
}

// ── Register ──────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, dob, pan,
      city, state, annualIncome, tradingExperience, password,
    } = req.body

    // Duplicate check with clear messages
    const [byEmail, byPhone, byPan] = await Promise.all([
      User.findOne({ where: { email: email.toLowerCase() } }),
      User.findOne({ where: { phone } }),
      User.findOne({ where: { pan: pan.toUpperCase() } }),
    ])
    if (byEmail) return res.status(409).json({ success: false, message: 'Email already registered' })
    if (byPhone) return res.status(409).json({ success: false, message: 'Mobile number already registered' })
    if (byPan)   return res.status(409).json({ success: false, message: 'PAN already registered' })

    const user = await User.create({
      first_name:         firstName.trim(),
      last_name:          lastName.trim(),
      email:              email.toLowerCase().trim(),
      phone,
      dob,
      pan:                pan.toUpperCase(),
      city:               city.trim(),
      state,
      annual_income:      annualIncome,
      trading_experience: tradingExperience,
      password_hash:      password,   // hashed by beforeCreate hook
      role:               'client',
    })

    const accessToken  = signAccess(user.id)
    const refreshToken = signRefresh(user.id)

    // Store hashed refresh token
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    user.refresh_token_hash = await bcrypt.hash(refreshToken, rounds)
    await user.save()

    res
      .cookie('accessToken',  accessToken,  COOKIE_OPTS)
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({
        success: true,
        message: 'Account created successfully',
        data: {
          user:        user.toSafeJSON(),
          accessToken,             // also in body for SPA use
        },
      })
  } catch (err) {
    next(err)
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } })
    // Constant-time comparison even if user not found (prevent user enumeration)
    const dummyHash = '$2a$12$invalidhashforenumerationprotection000000000000'
    const valid = user
      ? await user.verifyPassword(password)
      : await bcrypt.compare(password, dummyHash).then(() => false)

    if (!user || !valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account suspended' })
    }

    const accessToken  = signAccess(user.id)
    const refreshToken = signRefresh(user.id)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    user.refresh_token_hash = await bcrypt.hash(refreshToken, rounds)
    await user.save()

    res
      .cookie('accessToken',  accessToken,  COOKIE_OPTS)
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: 'Login successful',
        data: { user: user.toSafeJSON(), accessToken },
      })
  } catch (err) {
    next(err)
  }
}

// ── Refresh Token ─────────────────────────────────────────────────────────────

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' })

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    const user = await User.findByPk(decoded.sub)
    if (!user || !user.refresh_token_hash) {
      return res.status(401).json({ success: false, message: 'Session invalidated' })
    }

    const valid = await bcrypt.compare(token, user.refresh_token_hash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Refresh token mismatch' })
    }

    const newAccess  = signAccess(user.id)
    const newRefresh = signRefresh(user.id)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    user.refresh_token_hash = await bcrypt.hash(newRefresh, rounds)
    await user.save()

    res
      .cookie('accessToken',  newAccess,  COOKIE_OPTS)
      .cookie('refreshToken', newRefresh, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
      .json({ success: true, data: { accessToken: newAccess } })
  } catch (err) {
    next(err)
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
  try {
    if (req.userId) {
      await User.update({ refresh_token_hash: null }, { where: { id: req.userId } })
    }
    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ success: true, message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}

// ── Get current user ──────────────────────────────────────────────────────────

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: { user: user.toSafeJSON() } })
  } catch (err) {
    next(err)
  }
}

// ── Change password (authenticated user) ──────────────────────────────────────

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const valid = await user.verifyPassword(currentPassword)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    }

    user.password_hash = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

// ── Admin: register (requires ADMIN_SIGNUP_TOKEN header) ─────────────────────
// Also supports super_admin role via x-admin-role header

exports.adminRegister = async (req, res, next) => {
  try {
    const tokenHeader = req.headers['x-admin-token']
    if (!tokenHeader || tokenHeader !== process.env.ADMIN_SIGNUP_TOKEN) {
      return res.status(403).json({ success: false, message: 'Invalid admin token' })
    }

    // Allow specifying 'super_admin' role via header — default is 'admin'
    const requestedRole = req.headers['x-admin-role']
    const allowedRoles  = ['admin', 'super_admin']
    const role          = allowedRoles.includes(requestedRole) ? requestedRole : 'admin'

    const {
      firstName, lastName, email, phone, dob, pan,
      city, state, annualIncome, tradingExperience, password,
    } = req.body

    const user = await User.create({
      first_name:         firstName.trim(),
      last_name:          lastName.trim(),
      email:              email.toLowerCase().trim(),
      phone,
      dob,
      pan:                pan.toUpperCase(),
      city:               city.trim(),
      state,
      annual_income:      annualIncome,
      trading_experience: tradingExperience,
      password_hash:      password,
      role,
      email_verified:     true,
    })

    res.status(201).json({
      success: true,
      message: `${role === 'super_admin' ? 'Super Admin' : 'Admin'} account created`,
      data: { user: user.toSafeJSON() },
    })
  } catch (err) {
    next(err)
  }
}
