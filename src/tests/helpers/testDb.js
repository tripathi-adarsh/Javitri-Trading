'use strict'
/**
 * Test DB helper.
 * DB_DIALECT=sqlite and NODE_ENV=test are already set by jestSetup.js
 * (via jest.setupFiles) before any module loads, so sequelize.js
 * will already be using SQLite when this file is required.
 */

const {
  sequelize,
  User, Employee, Client, ClientKYC,
  ClientPlanRequest, DailyPayout,
  Plan, PromoCode, Order, Payment,
  LegalDocument, LegalConsent, AuditLog,
} = require('../../models/index')

async function setupTestDb () {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })

  // Plans
  await Plan.create({
    slug: 'pro', name: 'Pro Trader', tagline: 'Test plan',
    price_paise: 249900, platform_fee_paise: 4900,
    billing_cycle: 'monthly', badge: 'Most Popular', color: 'emerald',
    sort_order: 2, is_active: true, compliance_status: 'approved',
    associated_value_type: 'service_fee',
    features: ['Feature A'], not_included: [],
  })

  await Plan.create({
    slug: 'starter', name: 'Starter', tagline: 'Basic plan',
    price_paise: 99900, platform_fee_paise: 4900,
    billing_cycle: 'monthly', sort_order: 1,
    is_active: true, compliance_status: 'approved',
    associated_value_type: 'service_fee',
    features: ['Feature B'], not_included: [],
  })

  // Promo codes
  await PromoCode.create({
    code: 'TRADE200', discount_paise: 20000,
    description: 'Test promo', applicable_plan_slug: 'pro',
    max_uses: 1000, used_count: 0,
    valid_from: new Date('2026-01-01'), valid_until: new Date('2029-12-31'),
    is_active: true,
  })

  await PromoCode.create({
    code: 'WELCOME100', discount_paise: 10000,
    description: 'Welcome promo', applicable_plan_slug: null,
    max_uses: null, used_count: 0,
    valid_from: new Date('2026-01-01'), valid_until: null,
    is_active: true,
  })

  // Legal docs
  await LegalDocument.create({
    type: 'terms', version: '1.0.0-draft',
    title: 'Test Terms',
    content: [{ id: 'intro', title: 'Introduction', content: 'Test content' }],
    status: 'published', effective_date: '2026-01-01',
  })

  await LegalDocument.create({
    type: 'privacy', version: '1.0.0-draft',
    title: 'Test Privacy Policy',
    content: [{ id: 'intro', title: 'Introduction', content: 'Test content' }],
    status: 'published', effective_date: '2026-01-01',
  })
}

async function teardownTestDb () {
  await sequelize.close()
}

module.exports = { sequelize, setupTestDb, teardownTestDb }
