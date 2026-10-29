'use strict'
const jwt  = require('jsonwebtoken')
const { User } = require('../models/index')

/**
 * Reads JWT from Authorization: Bearer <token>  OR  httpOnly cookie 'accessToken'.
 * Attaches req.user (safe user object) and req.userId.
 */
async function authenticate (req, res, next) {
  try {
    let token = null

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      const msg = e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      return res.status(401).json({ success: false, message: msg })
    }

    const user = await User.findByPk(decoded.sub)
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated' })
    }

    req.user   = user.toSafeJSON()
    req.userId = user.id
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Require employee role or higher. Must be called after authenticate().
 */
function requireEmployee (req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' })
  const allowed = ['employee', 'admin', 'super_admin']
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Employee access required' })
  }
  next()
}

/**
 * Require admin or super_admin role. Must be called after authenticate().
 */
function requireAdmin (req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' })
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

/**
 * Require super_admin role only. Must be called after authenticate().
 */
function requireSuperAdmin (req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' })
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' })
  }
  next()
}

module.exports = { authenticate, requireEmployee, requireAdmin, requireSuperAdmin }
