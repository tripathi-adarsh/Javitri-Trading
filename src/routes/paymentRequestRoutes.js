'use strict'
const router   = require('express').Router()
const { body, param } = require('express-validator')
const ctrl     = require('../controllers/paymentRequestController')
const validate = require('../middleware/validate')
const { authenticate, requireEmployee } = require('../middleware/auth')

// Client endpoints (any authenticated user with linked client profile)
router.get('/my-profile', authenticate, ctrl.getMyProfile)

router.post('/my', authenticate, [
  body('planRequestId').isUUID().withMessage('Please select your plan'),
  body('amountINR').optional({ nullable: true }).isFloat({ gt: 0 }),
  body('requestType').optional().isIn(['payout_request', 'plan_payment']),
  body('paymentMode').optional().isIn(['bank_transfer', 'upi', 'cash', 'cheque', 'other']),
  body('clientReference').optional().trim().isLength({ max: 200 }),
  body('clientNotes').optional().trim().isLength({ max: 1000 }),
], validate, ctrl.createMyPaymentRequest)

router.post('/my/:id/issue', authenticate, [
  param('id').isUUID(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
], validate, ctrl.postClientIssueMessage)

// Admin / Employee endpoints
router.get('/', authenticate, requireEmployee, ctrl.listPaymentRequests)

router.patch('/:id/status', authenticate, requireEmployee, [
  param('id').isUUID(),
  body('status').optional().isIn(['pending', 'approved', 'paid', 'rejected']),
  body('approvedAmountINR').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('adminTransactionRef').optional().trim().isLength({ max: 200 }),
  body('adminNotes').optional().trim().isLength({ max: 1000 }),
  body('replyMessage').optional().trim().isLength({ max: 1000 }),
  body('resolveIssue').optional().isBoolean(),
], validate, ctrl.updatePaymentRequestStatus)

module.exports = router
