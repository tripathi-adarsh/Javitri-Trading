'use strict'
const crypto = require('crypto')
const { Op }  = require('sequelize')
const { sequelize, User, Employee, RegistrationLink } = require('../models/index')
const { audit } = require('../utils/auditLogger')

const DEFAULT_EXPIRY_DAYS = 30
const MAX_EXPIRY_DAYS     = 90

/**
 * Hash a raw token with SHA-256.
 * The raw token is NEVER stored — only its hash.
 */
function hashToken (raw) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * Generate a cryptographically secure URL-safe random token.
 */
function generateRawToken () {
  return crypto.randomBytes(32).toString('base64url')   // 43-char URL-safe string
}

// ── Create a registration link (employee or admin) ───────────────────────────

exports.createLink = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { expiryDays, maxUses, label } = req.body

    // Identify the employee — derive from session, never trust request body
    let employeeId
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId }, transaction: t })
      if (!emp) {
        await t.rollback()
        return res.status(403).json({ success: false, message: 'No employee profile found for this account' })
      }
      if (!req.user.is_active) {
        await t.rollback()
        return res.status(403).json({ success: false, message: 'Inactive employees cannot create registration links' })
      }
      employeeId = emp.id
    } else {
      // Admin creating on behalf of an employee
      const targetEmployeeId = req.body.employeeId
      if (!targetEmployeeId) {
        await t.rollback()
        return res.status(422).json({ success: false, message: 'employeeId required when admin creates a link' })
      }
      const emp = await Employee.findByPk(targetEmployeeId, { transaction: t })
      if (!emp) {
        await t.rollback()
        return res.status(404).json({ success: false, message: 'Employee not found' })
      }
      employeeId = emp.id
    }

    const days    = Math.min(MAX_EXPIRY_DAYS, Math.max(1, parseInt(expiryDays) || DEFAULT_EXPIRY_DAYS))
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    const uses    = Math.min(1000, Math.max(1, parseInt(maxUses) || 1))

    const rawToken = generateRawToken()
    const tokenHash = hashToken(rawToken)

    const link = await RegistrationLink.create({
      employee_id:  employeeId,
      token_hash:   tokenHash,
      expires_at:   expires,
      max_uses:     uses,
      usage_count:  0,
      status:       'active',
      label:        label?.slice(0, 100) || null,
    }, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      'REGISTRATION_LINK_CREATED',
      entityType:  'registration_link',
      entityId:    link.id,
      metadata:    { employeeId, expiryDays: days, maxUses: uses },
      req,
    })

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const registrationUrl = `${baseUrl}/register/${rawToken}`

    res.status(201).json({
      success: true,
      data: {
        linkId:          link.id,
        registrationUrl, // raw token in URL — this is the ONLY time it's returned
        expiresAt:       expires,
        maxUses:         uses,
        label:           link.label,
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── List registration links ───────────────────────────────────────────────────

exports.listLinks = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize

    let employeeId
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp) return res.status(403).json({ success: false, message: 'No employee profile found' })
      employeeId = emp.id
    } else if (req.query.employeeId) {
      employeeId = req.query.employeeId
    }

    const where = {}
    if (employeeId) where.employee_id = employeeId

    const { count, rows } = await RegistrationLink.findAndCountAll({
      where,
      include: [{
        model: Employee, as: 'employee',
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }],
      }],
      limit:  pageSize,
      offset,
      order:  [['created_at', 'DESC']],
    })

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    res.json({
      success: true,
      data: {
        links: rows.map(l => ({
          id:           l.id,
          // NOTE: we do NOT return the raw token — it was only returned at creation
          // Show a partial registration URL with masked token for display
          registrationPath: `/register/[token]`,
          employeeCode: l.employee?.employee_code,
          employeeName: l.employee?.user ? `${l.employee.user.first_name} ${l.employee.user.last_name}` : null,
          label:        l.label,
          status:       l.status,
          usageCount:   l.usage_count,
          maxUses:      l.max_uses,
          expiresAt:    l.expires_at,
          revokedAt:    l.revoked_at,
          createdAt:    l.created_at,
        })),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Revoke a registration link ────────────────────────────────────────────────

exports.revokeLink = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const link = await RegistrationLink.findByPk(req.params.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [{ model: Employee, as: 'employee' }],
    })
    if (!link) { await t.rollback(); return res.status(404).json({ success: false, message: 'Link not found' }) }

    // Employees can only revoke their own links
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId }, transaction: t })
      if (!emp || link.employee_id !== emp.id) {
        await t.rollback()
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    if (link.status === 'revoked') {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'Link already revoked' })
    }

    await link.update({
      status:               'revoked',
      revoked_at:           new Date(),
      revoked_by_user_id:   req.userId,
    }, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      'REGISTRATION_LINK_REVOKED',
      entityType:  'registration_link',
      entityId:    link.id,
      metadata:    { employeeCode: link.employee?.employee_code },
      req,
    })

    res.json({ success: true, message: 'Registration link revoked successfully' })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Validate a token (public — used by the registration form) ─────────────────

exports.validateToken = async (req, res, next) => {
  try {
    const { token } = req.params
    if (!token || token.length < 20 || token.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid registration token' })
    }

    const tokenHash = hashToken(token)
    const link = await RegistrationLink.findOne({
      where: { token_hash: tokenHash },
      include: [{
        model: Employee, as: 'employee',
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
      }],
    })

    if (!link) {
      return res.status(404).json({ success: false, message: 'Registration link not found or invalid' })
    }

    if (link.status === 'revoked') {
      return res.status(410).json({ success: false, message: 'This registration link has been revoked' })
    }

    if (link.expires_at < new Date()) {
      return res.status(410).json({ success: false, message: 'This registration link has expired' })
    }

    if (link.usage_count >= link.max_uses) {
      return res.status(410).json({ success: false, message: 'This registration link has reached its maximum usage' })
    }

    // Check employee is still active
    const empUser = link.employee?.user
    const empDbUser = empUser ? await User.findOne({ where: { id: link.employee.user_id } }) : null
    if (!empDbUser || !empDbUser.is_active) {
      return res.status(410).json({ success: false, message: 'This registration link is no longer valid' })
    }

    // Return minimal info — enough for the form to show employee attribution
    res.json({
      success: true,
      data: {
        linkId:       link.id,
        employeeCode: link.employee?.employee_code,
        // Only first name for display — do not expose full employee account info
        employeeFirstName: link.employee?.user?.first_name,
        expiresAt:    link.expires_at,
      },
    })
  } catch (err) {
    next(err)
  }
}
