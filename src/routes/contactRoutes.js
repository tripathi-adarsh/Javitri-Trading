'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl = require('../controllers/contactController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')
const rateLimit = require('express-rate-limit')

// Rate limit for public contact form
const contactLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,  // 1 hour
  max:            10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { success: false, message: 'Too many contact form submissions. Please try again later.' },
})

// POST /api/v1/contact — PUBLIC
router.post('/', contactLimiter, [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name required (2–200 chars)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be 10–5000 chars'),
], validate, ctrl.submitContact)

// GET /api/v1/contact — admin only
router.get('/', authenticate, requireAdmin, ctrl.listMessages)

// GET /api/v1/contact/stats — admin only
router.get('/stats', authenticate, requireAdmin, ctrl.getContactStats)

// GET /api/v1/contact/:id — admin only
router.get('/:id', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid message ID'),
], validate, ctrl.getMessage)

// PATCH /api/v1/contact/:id — admin only (update status / add notes)
router.patch('/:id', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid message ID'),
  body('status').optional().isIn(['new', 'read', 'archived']),
  body('adminNotes').optional().trim().isLength({ max: 5000 }),
], validate, ctrl.updateMessage)

// DELETE /api/v1/contact/:id — admin only
router.delete('/:id', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid message ID'),
], validate, ctrl.deleteMessage)

module.exports = router
