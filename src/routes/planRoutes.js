'use strict'
const router = require('express').Router()
const { body, param } = require('express-validator')
const ctrl   = require('../controllers/planController')
const validate = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/v1/plans  — public (active + approved only)
router.get('/', ctrl.getPlans)

// GET /api/v1/plans/admin  — admin only (all plans incl. inactive)
router.get('/admin', authenticate, requireAdmin, ctrl.adminGetPlans)

// GET /api/v1/plans/:slug  — public
router.get('/:slug', [
  param('slug').trim().notEmpty(),
], validate, ctrl.getPlanBySlug)

// POST /api/v1/plans  — admin only
router.post('/', authenticate, requireAdmin, [
  body('slug').trim().notEmpty().withMessage('Slug required'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('priceINR').isFloat({ min: 1 }).withMessage('Valid price required'),
], validate, ctrl.createPlan)

// PUT /api/v1/plans/:id  — admin only
router.put('/:id', authenticate, requireAdmin, ctrl.updatePlan)

module.exports = router
