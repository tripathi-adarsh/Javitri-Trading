'use strict'
const multer = require('multer')

/**
 * Central Express error handler.
 * - Multer errors → 422
 * - Sequelize validation errors → 422
 * - Sequelize unique constraint errors → 409
 * - JWT errors → 401
 * - Everything else → 500
 * Never leaks stack traces or internal details to the client in production.
 */
function errorHandler (err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development'

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    const msgMap = {
      LIMIT_FILE_SIZE:        'File too large. Maximum size is 5 MB.',
      LIMIT_FILE_COUNT:       'Too many files uploaded.',
      LIMIT_UNEXPECTED_FILE:  `Unexpected field: "${err.field}". Allowed: aadhaarImage, panImage, passbookImage.`,
    }
    return res.status(422).json({
      success: false,
      message: msgMap[err.code] || `File upload error: ${err.message}`,
    })
  }

  // Invalid file type (thrown by fileFilter)
  if (err.message?.startsWith('Invalid file type')) {
    return res.status(422).json({ success: false, message: err.message })
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  err.errors.map(e => ({ field: e.path, message: e.message })),
    })
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field'
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  // JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }

  // Default
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', req.method, req.path, err)
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  })
}

module.exports = errorHandler
