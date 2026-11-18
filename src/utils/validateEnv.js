
'use strict';

/**
 * Validates required environment variables at startup.
 */

function validateEnv() {
  const required = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'KYC_ENCRYPTION_KEY',
    'FRONTEND_URL',
    'ADMIN_SIGNUP_TOKEN',
  ];

  const missing = required.filter(
    key => process.env[key] === undefined || process.env[key] === null || process.env[key] === ''
  );

  if (missing.length > 0) {
    console.error('✗ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }

  // Validate KYC encryption key
  const kycKey = process.env.KYC_ENCRYPTION_KEY;

  if (kycKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(kycKey)) {
    console.error('✗ KYC_ENCRYPTION_KEY must be a 64-character hex string.');
    process.exit(1);
  }

  // Validate production secrets
  if (process.env.NODE_ENV === 'production') {
    const insecure = [
      ['JWT_SECRET', 'replace_with'],
      ['JWT_REFRESH_SECRET', 'replace_with'],
      ['ADMIN_SIGNUP_TOKEN', 'replace_with'],
      ['KYC_ENCRYPTION_KEY', 'replace_with'],
    ];

    insecure.forEach(([key, placeholder]) => {
      if (process.env[key]?.includes(placeholder)) {
        console.error(`✗ SECURITY: ${key} contains a placeholder value.`);
        process.exit(1);
      }
    });
  }

  console.log('✓ Environment validation successful');
}

module.exports = validateEnv;
