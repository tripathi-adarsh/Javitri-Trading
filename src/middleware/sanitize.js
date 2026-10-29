'use strict'

/**
 * Strip any key starting with $ or containing . from req.body / req.query / req.params.
 * Guards against NoSQL-style operator injection patterns in case they leak through.
 * Also strips keys with prototype-polluting names.
 */
const DANGEROUS = /(\$|__proto__|constructor|prototype)/

function sanitizeObject (obj) {
  if (typeof obj !== 'object' || obj === null) return obj
  for (const key of Object.keys(obj)) {
    if (DANGEROUS.test(key)) {
      delete obj[key]
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key])
    }
  }
  return obj
}

function sanitize (req, _res, next) {
  sanitizeObject(req.body)
  sanitizeObject(req.query)
  sanitizeObject(req.params)
  next()
}

module.exports = sanitize
