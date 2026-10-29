'use strict'
const router = require('express').Router()
const { body } = require('express-validator')
const ctrl   = require('../controllers/paymentController')
const validate = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')

// POST /api/v1/payments/verify  — authenticated
router.post('/verify', authenticate, [
  body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id required'),
  body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id required'),
  body('razorpay_signature').notEmpty().withMessage('razorpay_signature required'),
], validate, ctrl.verifyPayment)

// POST /api/v1/payments/webhook  — public, Razorpay calls this
// NOTE: raw body must be preserved — handled in app.js
router.post('/webhook', ctrl.webhook)

// GET /api/v1/payments/status/:orderId  — authenticated
router.get('/status/:orderId', authenticate, ctrl.getPaymentStatus)

module.exports = router
