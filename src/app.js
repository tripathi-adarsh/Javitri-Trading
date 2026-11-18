'use strict'
require('dotenv').config()
const express      = require('express')
const helmet       = require('helmet')
const cors         = require('cors')
const hpp          = require('hpp')
const cookieParser = require('cookie-parser')
const morgan       = require('morgan')
const rateLimit    = require('express-rate-limit')
const path         = require('path')

const sanitize     = require('./middleware/sanitize')
const errorHandler = require('./middleware/errorHandler')

const authRoutes              = require('./routes/authRoutes')
const planRoutes              = require('./routes/planRoutes')
const orderRoutes             = require('./routes/orderRoutes')
const paymentRoutes           = require('./routes/paymentRoutes')
const legalRoutes             = require('./routes/legalRoutes')
const employeeRoutes          = require('./routes/employeeRoutes')
const clientRoutes            = require('./routes/clientRoutes')
const paymentReviewRoutes     = require('./routes/paymentReviewRoutes')
const auditLogRoutes          = require('./routes/auditLogRoutes')
const userRoutes              = require('./routes/userRoutes')
const planRequestRoutes       = require('./routes/planRequestRoutes')
const contactRoutes           = require('./routes/contactRoutes')

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", 'https://checkout.razorpay.com'],
      frameSrc:    ["'self'", 'https://api.razorpay.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'", 'https://api.razorpay.com'],
    },
  },
}))

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key', 'X-Admin-Token'],
}))

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Raw body for Razorpay webhook signature verification ──────────────────────
// Must be registered BEFORE express.json()
app.use((req, res, next) => {
  if (req.path === '/api/v1/payments/webhook') {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      req.rawBody = data
      next()
    })
  } else {
    next()
  }
})

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))          // limit body size
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// ── Serve uploaded KYC documents (access controlled via API route, not direct URL) ──
// Uploads directory is NOT exposed as static — files are served through the authenticated
// /api/v1/clients/:id/kyc-documents/:docType route only.

// ── HTTP Parameter Pollution protection ───────────────────────────────────────
app.use(hpp())

// ── NoSQL/prototype injection sanitization ────────────────────────────────────
app.use(sanitize)

// ── Rate limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              process.env.NODE_ENV === 'test' ? 10000 : 200,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: 'Too many requests, please try again later' },
})

const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              process.env.NODE_ENV === 'test' ? 10000 : 10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
})

app.use('/api/', globalLimiter)
app.use('/api/v1/auth/login',    authLimiter)
app.use('/api/v1/auth/register', authLimiter)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',              authRoutes)
app.use('/api/v1/plans',             planRoutes)
app.use('/api/v1/orders',            orderRoutes)
app.use('/api/v1/payments',          paymentRoutes)
app.use('/api/v1/legal',             legalRoutes)
app.use('/api/v1/employees',         employeeRoutes)
app.use('/api/v1/clients',           clientRoutes)
app.use('/api/v1/payment-reviews',   paymentReviewRoutes)
app.use('/api/v1/audit-logs',        auditLogRoutes)
app.use('/api/v1/users',             userRoutes)
app.use('/api/v1/plan-requests',     planRequestRoutes)
app.use('/api/v1/contact',           contactRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Javitri Trading Service API is running', timestamp: new Date() })
})

// ── Serve React frontend in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(frontendDist))

  // All non-API routes → React app (client-side routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
} else {
  // ── 404 (development only — in production React handles unknown routes) ────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
  })
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

module.exports = app
