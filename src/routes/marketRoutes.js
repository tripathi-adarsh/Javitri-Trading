'use strict'
const router = require('express').Router()
const ctrl   = require('../controllers/marketController')

// GET /api/v1/market/indices — public live NSE NIFTY 50 & BANK NIFTY + market status
router.get('/indices', ctrl.getLiveIndices)

module.exports = router
