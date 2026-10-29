'use strict'
const router = require('express').Router()
const { AuditLog, User } = require('../models/index')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/v1/audit-logs — admin only, paginated
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 50))
    const offset   = (page - 1) * pageSize

    const { count, rows } = await AuditLog.findAndCountAll({
      order:   [['created_at', 'DESC']],
      limit:   pageSize,
      offset,
      // Exclude safe_metadata_json and user_agent from list to keep payload small
      attributes: ['id', 'actor_user_id', 'action', 'entity_type', 'entity_id', 'ip_address', 'created_at'],
    })

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
