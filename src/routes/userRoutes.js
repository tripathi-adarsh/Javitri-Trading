'use strict'
const router = require('express').Router()
const { param } = require('express-validator')
const ctrl     = require('../controllers/userKycController')
const validate = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')
const { kycDocumentUpload } = require('../middleware/upload')

// POST /api/v1/users/kyc-documents — authenticated user uploads their own docs
router.post('/kyc-documents', authenticate, kycDocumentUpload, ctrl.uploadUserKycDocuments)

// GET /api/v1/users/kyc-documents/:docType — authenticated user views their own docs
router.get('/kyc-documents/:docType', authenticate, [
  param('docType').isIn(['aadhaar', 'pan', 'passbook']).withMessage('Invalid document type'),
], validate, ctrl.getUserKycDocumentImage)

module.exports = router
