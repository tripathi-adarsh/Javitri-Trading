'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/clientController')
const validate = require('../middleware/validate')
const { authenticate, requireEmployee, requireAdmin } = require('../middleware/auth')
const { kycDocumentUpload } = require('../middleware/upload')
const rateLimit = require('express-rate-limit')

// Strict rate limit for client registration (anti-bot)
const registrationLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,   // 1 hour
  max:            10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { success: false, message: 'Too many registration attempts. Please try again later.' },
})

// POST /api/v1/clients/check — PUBLIC — check if mobile/email already registered
router.post('/check', [
  body('mobile').optional().matches(/^[6-9]\d{9}$/),
  body('email').optional().isEmail().normalizeEmail(),
], validate, ctrl.checkExistingClient)

// POST /api/v1/clients — PUBLIC
router.post('/', registrationLimiter, [
  body('fullName').trim().isLength({ min: 2, max: 200 }).withMessage('Full name required (2–200 chars)'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('state').trim().notEmpty().withMessage('State required'),
  body('postalCode').matches(/^\d{6}$/).withMessage('Valid 6-digit PIN code required'),
  body('pan').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  body('ifscCode').optional().matches(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i).withMessage('Invalid IFSC format'),
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

// PATCH /api/v1/clients/:id/assign — admin/super_admin only
router.patch('/:id/assign', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid client ID'),
  body('employeeId').optional({ nullable: true }).isUUID().withMessage('Invalid employee ID'),
], validate, ctrl.assignClient)

// POST /api/v1/clients/:id/kyc-documents — public (client uploads their own docs after registration)
// Also accepts authenticated admin/employee uploads
const kycDocRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload attempts. Please try again later.' },
})

function handleKycUpload (req, res, next) {
  kycDocumentUpload(req, res, (err) => {
    if (err) return next(err)   // passes MulterError and fileFilter errors to errorHandler
    next()
  })
}

router.post('/:id/kyc-documents', kycDocRateLimit, [
  param('id').isUUID().withMessage('Invalid client ID'),
], validate, handleKycUpload, ctrl.uploadKycDocuments)

// GET /api/v1/clients/:id/kyc-documents/:docType — admin or employee (to view images)
router.get('/:id/kyc-documents/:docType', authenticate, requireEmployee, [
  param('id').isUUID().withMessage('Invalid client ID'),
  param('docType').isIn(['aadhaar', 'aadhaar-back', 'pan', 'passbook']).withMessage('Invalid document type'),
], validate, ctrl.getKycDocumentImage)

module.exports = router
