'use strict'
const router = require('express').Router()
const { body } = require('express-validator')
const ctrl   = require('../controllers/orderController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

// POST /api/v1/orders/preview  — authenticated
router.post('/preview', authenticate, [
  body('planSlug').trim().notEmpty().withMessage('planSlug required'),
], validate, ctrl.previewOrder)

// POST /api/v1/orders  — authenticated + consent required
router.post('/', authenticate, [
  body('planSlug').trim().notEmpty().withMessage('planSlug required'),
  body('idempotencyKey').trim().isLength({ min: 8, max: 64 }).withMessage('idempotencyKey required (8–64 chars)'),
  body('termsConsentVersion').trim().notEmpty().withMessage('Terms consent version required'),
  body('privacyConsentVersion').trim().notEmpty().withMessage('Privacy consent version required'),
], validate, ctrl.createOrder)

// GET /api/v1/orders  — authenticated user's own orders
router.get('/', authenticate, ctrl.getMyOrders)

// GET /api/v1/orders/admin  — admin only
router.get('/admin', authenticate, requireAdmin, ctrl.getAllOrders)

module.exports = router
