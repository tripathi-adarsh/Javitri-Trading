'use strict'

/**
 * Validates required environment variables at startup.
 * Prevents silent failures in production due to missing configuration.
 */
function validateEnv () {
  const required = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    // DB_PASSWORD can be empty (e.g. local XAMPP root with no password)
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'KYC_ENCRYPTION_KEY',
    'FRONTEND_URL',
    'ADMIN_SIGNUP_TOKEN',
  ]

  const missing = required.filter(key => process.env[key] === undefined || process.env[key] === null)
  if (missing.length > 0) {
    console.error('✗ Missing required environment variables:')
    missing.forEach(key => console.error(`  - ${key}`))
    console.error('\nCopy .env.example to .env and fill in all values.')
    process.exit(1)
  }

  // Validate specific formats
  const kycKey = process.env.KYC_ENCRYPTION_KEY
  if (kycKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(kycKey)) {
    console.error('✗ KYC_ENCRYPTION_KEY must be a 64-character hex string.')
    console.error('  Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
    process.exit(1)
  }

  // Warn about insecure placeholder values in production
  if (process.env.NODE_ENV === 'production') {
    const insecure = [
      ['JWT_SECRET',           'replace_with'],
      ['JWT_REFRESH_SECRET',   'replace_with'],
      ['ADMIN_SIGNUP_TOKEN',   'replace_with'],
      ['RAZORPAY_KEY_ID',      'rzp_test_'],
      ['KYC_ENCRYPTION_KEY',   'replace_with'],
    ]
    insecure.forEach(([key, placeholder]) => {
      if (process.env[key]?.includes(placeholder)) {
        console.error(`✗ SECURITY: ${key} contains a placeholder value. Update it before going live.`)
        process.exit(1)
      }
    })
  }
}

module.exports = validateEnv
