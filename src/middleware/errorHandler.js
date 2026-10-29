'use strict'

/**
 * Central Express error handler.
 * - Sequelize validation errors → 422
 * - Sequelize unique constraint errors → 409
 * - JWT errors → 401
 * - Everything else → 500
 * Never leaks stack traces or internal details to the client in production.
 */
function errorHandler (err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development'

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
