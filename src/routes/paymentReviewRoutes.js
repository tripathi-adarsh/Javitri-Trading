'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/paymentReviewController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/v1/payment-reviews/stats — admin only (dashboard stats)
router.get('/stats', authenticate, requireAdmin, ctrl.getDashboardStats)

// GET /api/v1/payment-reviews — admin only
router.get('/', authenticate, requireAdmin, ctrl.listPaymentReviews)

// GET /api/v1/payment-reviews/:id — admin only
router.get('/:id', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid review ID'),
], validate, ctrl.getPaymentReview)

// POST /api/v1/payment-reviews/:id/decision — admin only
router.post('/:id/decision', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid review ID'),
  body('decision').isIn(['APPROVED', 'REJECTED']).withMessage('decision must be APPROVED or REJECTED'),
  body('rejectionReason').optional().trim().isLength({ max: 2000 }),
], validate, ctrl.submitReviewDecision)

module.exports = router
