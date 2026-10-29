'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/registrationLinkController')
const validate = require('../middleware/validate')
const { authenticate, requireEmployee, requireAdmin } = require('../middleware/auth')

// POST /api/v1/registration-links — employee or admin
router.post('/', authenticate, requireEmployee, [
  body('expiryDays').optional().isInt({ min: 1, max: 90 }).withMessage('expiryDays must be 1–90'),
  body('maxUses').optional().isInt({ min: 1, max: 1000 }).withMessage('maxUses must be 1–1000'),
  body('label').optional().trim().isLength({ max: 100 }),
  // employeeId only required when an admin creates on behalf of an employee
  body('employeeId').optional().isUUID().withMessage('Invalid employeeId'),
], validate, ctrl.createLink)

// GET /api/v1/registration-links — employee sees own, admin sees all
router.get('/', authenticate, requireEmployee, ctrl.listLinks)

// POST /api/v1/registration-links/:id/revoke — employee or admin
router.post('/:id/revoke', authenticate, requireEmployee, [
  param('id').isUUID().withMessage('Invalid link ID'),
], validate, ctrl.revokeLink)

// GET /api/v1/public/registration-links/:token — PUBLIC (validate token)
// Note: this is mounted at a different base in app.js
// (see /api/v1/public/registration-links/:token)
router.get('/public/:token', ctrl.validateToken)

module.exports = router
