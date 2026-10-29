'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/legalController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/v1/legal/:type  — public (type = terms | privacy)
router.get('/:type', [
  param('type').isIn(['terms', 'privacy']).withMessage('type must be terms or privacy'),
], validate, ctrl.getCurrent)

// GET /api/v1/legal  — admin: all versions
router.get('/', authenticate, requireAdmin, ctrl.getAllVersions)

// POST /api/v1/legal  — admin: create draft
router.post('/', authenticate, requireAdmin, [
  body('type').isIn(['terms', 'privacy']).withMessage('type required'),
  body('version').trim().notEmpty().withMessage('version required'),
  body('title').trim().notEmpty().withMessage('title required'),
  body('content').isArray({ min: 1 }).withMessage('content must be non-empty array of sections'),
], validate, ctrl.createVersion)

// PATCH /api/v1/legal/:id/publish  — admin: publish a draft
router.patch('/:id/publish', authenticate, requireAdmin, ctrl.publishVersion)

module.exports = router
