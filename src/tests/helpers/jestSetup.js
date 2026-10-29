'use strict'
/**
 * Jest setupFiles — runs in the test worker before any module loads.
 * Sets environment variables so db/sequelize.js initialises SQLite.
 *
 * IMPORTANT: Each test suite file gets its own fresh in-memory DB
 * because Jest runs each file in an isolated VM context when using
 * --runInBand (same process, but module cache is separate per test file
 * in newer Jest versions). We use DB_STORAGE=':memory:' which gives each
 * file its own clean Sequelize instance.
 */
process.env.NODE_ENV      = 'test'
process.env.DB_DIALECT    = 'sqlite'
process.env.DB_STORAGE    = ':memory:'
process.env.BCRYPT_ROUNDS = '1'   // fast hashing — never use 1 in production
// Provide fallback secrets so JWT + admin signup work without a live .env
if (!process.env.JWT_SECRET)          process.env.JWT_SECRET          = 'test_jwt_secret_at_least_32_chars_aabb1122'
if (!process.env.JWT_REFRESH_SECRET)  process.env.JWT_REFRESH_SECRET  = 'test_refresh_secret_at_least_32_chars_bbcc'
if (!process.env.JWT_EXPIRES_IN)      process.env.JWT_EXPIRES_IN      = '1h'
if (!process.env.ADMIN_SIGNUP_TOKEN)  process.env.ADMIN_SIGNUP_TOKEN  = 'admin_signup_secret_replace_me'
if (!process.env.RAZORPAY_KEY_ID)     process.env.RAZORPAY_KEY_ID     = 'rzp_test_dummy'
if (!process.env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = 'dummy_secret_32_chars_aaaaaaaaaaa'
if (!process.env.RAZORPAY_WEBHOOK_SECRET) process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret_replace_me'

// Intercept dotenv so it never overrides our test env vars
const dotenv = require('dotenv')
const _orig  = dotenv.config.bind(dotenv)
dotenv.config = function (opts) {
  const result = _orig(opts)
  // Always re-enforce test overrides after dotenv runs
  process.env.NODE_ENV      = 'test'
  process.env.DB_DIALECT    = 'sqlite'
  process.env.DB_STORAGE    = ':memory:'
  process.env.BCRYPT_ROUNDS = '1'
  return result
}
