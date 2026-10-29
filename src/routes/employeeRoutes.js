'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/employeeController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin, requireEmployee } = require('../middleware/auth')

// GET /api/v1/employees — admin only
router.get('/', authenticate, requireAdmin, ctrl.listEmployees)

// GET /api/v1/employees/:id — admin or the employee themselves
router.get('/:id', authenticate, requireEmployee, [
  param('id').isUUID().withMessage('Invalid employee ID'),
], validate, ctrl.getEmployee)

// POST /api/v1/employees — admin only (create new employee)
router.post('/', authenticate, requireAdmin, [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name required (2–50 chars)'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name required (2–50 chars)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('dob').optional().isDate().withMessage('Valid date of birth required'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City required'),
  body('state').optional().notEmpty().withMessage('State required'),
], validate, ctrl.createEmployee)

// PATCH /api/v1/employees/:id — admin only (update employee info)
router.patch('/:id', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid employee ID'),
], validate, ctrl.updateEmployee)

// PATCH /api/v1/employees/:id/status — admin only (activate/deactivate)
router.patch('/:id/status', authenticate, requireAdmin, [
  param('id').isUUID().withMessage('Invalid employee ID'),
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
], validate, ctrl.setEmployeeStatus)

module.exports = router
