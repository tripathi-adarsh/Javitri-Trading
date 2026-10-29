'use strict'
const router  = require('express').Router()
const { body } = require('express-validator')
const ctrl    = require('../controllers/authController')
const validate = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Must contain uppercase letter')
  .matches(/[0-9]/).withMessage('Must contain a number')
  .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character')

const registerRules = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name required (2–50 chars)')
    .matches(/^[a-zA-Z\s'\-\.]+$/).withMessage('First name must contain only letters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name required (2–50 chars)')
    .matches(/^[a-zA-Z\s'\-\.]+$/).withMessage('Last name must contain only letters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone')
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('dob')
    .isDate().withMessage('Valid date of birth required')
    .custom(val => {
      const age = (new Date() - new Date(val)) / (365.25 * 24 * 3600 * 1000)
      if (age < 18) throw new Error('Must be at least 18 years old')
      return true
    }),
  body('pan')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format (e.g. ABCDE1234F)')
    .customSanitizer(v => v.toUpperCase()),
  body('city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('state').notEmpty().withMessage('State required'),
  body('annualIncome').notEmpty().withMessage('Annual income required'),
  body('tradingExperience').notEmpty().withMessage('Trading experience required'),
  passwordRules,
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match')
    return true
  }),
]

// POST /api/v1/auth/register
router.post('/register', registerRules, validate, ctrl.register)

// POST /api/v1/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, ctrl.login)

// POST /api/v1/auth/refresh
router.post('/refresh', ctrl.refresh)

// POST /api/v1/auth/logout
router.post('/logout', authenticate, ctrl.logout)

// GET /api/v1/auth/me
router.get('/me', authenticate, ctrl.me)

// POST /api/v1/auth/admin/register  (requires X-Admin-Token header)
router.post('/admin/register', registerRules, validate, ctrl.adminRegister)

module.exports = router
