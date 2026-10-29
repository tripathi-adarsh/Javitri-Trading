'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/clientController')
const validate = require('../middleware/validate')
const { authenticate, requireEmployee, requireAdmin } = require('../middleware/auth')
const rateLimit = require('express-rate-limit')

// Strict rate limit for client registration (anti-bot)
const registrationLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,   // 1 hour
  max:            10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { success: false, message: 'Too many registration attempts. Please try again later.' },
})

// POST /api/v1/clients — PUBLIC (via registration link)
router.post('/', registrationLimiter, [
  body('fullName').trim().isLength({ min: 2, max: 200 }).withMessage('Full name required (2–200 chars)'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('state').trim().notEmpty().withMessage('State required'),
  body('postalCode').matches(/^\d{6}$/).withMessage('Valid 6-digit PIN code required'),
  body('pan').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  body('ifscCode').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC format'),
  body('registrationToken').optional().isLength({ min: 20, max: 100 }),
  body('clientType').optional().isIn(['individual', 'business']),
], validate, ctrl.registerClient)

// GET /api/v1/clients — admin or employee (employee sees own clients)
router.get('/', authenticate, requireEmployee, ctrl.listClients)

// GET /api/v1/clients/:id — admin or employee (employees see own clients)
router.get('/:id', authenticate, requireEmployee, [
  param('id').isUUID().withMessage('Invalid client ID'),
], validate, ctrl.getClient)

// PATCH /api/v1/clients/:id/kyc-status — admin only
router.patch('/:id/kyc-status', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid client ID'),
  body('status').isIn(['in_review', 'verified', 'rejected']).withMessage('Invalid KYC status'),
  body('rejectionReason').optional().trim().isLength({ max: 1000 }),
], validate, ctrl.updateKycStatus)

module.exports = router
