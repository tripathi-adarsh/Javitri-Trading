'use strict'
const router   = require('express').Router()
const { body, param } = require('express-validator')
const ctrl     = require('../controllers/planRequestController')
const validate = require('../middleware/validate')
const { authenticate, requireEmployee, requireAdmin } = require('../middleware/auth')

// POST /api/v1/plan-requests — PUBLIC (called right after client registers)
router.post('/', [
  body('clientId').isUUID().withMessage('clientId required'),
  body('planSlug').notEmpty().withMessage('planSlug required'),
  body('planName').notEmpty().withMessage('planName required'),
], validate, ctrl.createPlanRequest)

// GET /api/v1/plan-requests — employee/admin
router.get('/', authenticate, requireEmployee, ctrl.listPlanRequests)

// GET /api/v1/plan-requests/reports/payouts — admin/employee (daily payout reports)
router.get('/reports/payouts', authenticate, requireEmployee, ctrl.getPayoutReport)

// GET /api/v1/plan-requests/:id — employee/admin
router.get('/:id', authenticate, requireEmployee, [
  param('id').isUUID(),
], validate, ctrl.getPlanRequest)

// PATCH /api/v1/plan-requests/:id/payment — mark payment success/failed/pending
router.patch('/:id/payment', authenticate, requireEmployee, [
  param('id').isUUID(),
  body('paymentStatus').isIn(['success', 'failed', 'pending']),
  body('paymentAmount').optional().isInt({ min: 0 }),
  body('transactionId').optional().trim().isLength({ max: 200 }),
], validate, ctrl.markPayment)

// POST /api/v1/plan-requests/:id/daily-payouts — add daily payout
router.post('/:id/daily-payouts', authenticate, requireEmployee, [
  param('id').isUUID(),
  body('payoutDate').isDate().withMessage('payoutDate required (YYYY-MM-DD)'),
  body('amount').isInt({ min: 1 }).withMessage('amount in paise required'),
  body('transactionReference').optional().trim().isLength({ max: 200 }),
  body('paymentMethod').optional().isIn(['bank_transfer', 'upi', 'cash', 'cheque', 'other']),
], validate, ctrl.addDailyPayout)

// GET /api/v1/plan-requests/:id/daily-payouts — list payouts
router.get('/:id/daily-payouts', authenticate, requireEmployee, [
  param('id').isUUID(),
], validate, ctrl.getDailyPayouts)

// PATCH /api/v1/plan-requests/:id/assign — admin only
router.patch('/:id/assign', authenticate, requireAdmin, [
  param('id').isUUID(),
  body('employeeId').optional({ nullable: true }).isUUID(),
], validate, ctrl.assignEmployee)

module.exports = router
