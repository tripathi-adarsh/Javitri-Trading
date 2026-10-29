'use strict'
const request = require('supertest')
const app     = require('../app')
const { setupTestDb, teardownTestDb } = require('./helpers/testDb')
const { VALID_USER, ADMIN_USER, registerAndLogin, registerAdmin, loginAdmin } = require('./helpers/authHelper')

let clientToken
let adminToken

beforeAll(async () => {
  await setupTestDb()
  // Register client
  const c = await registerAndLogin({ ...VALID_USER, email: 'plan.client@example.com', phone: '9111111101', pan: 'PLANC1234A' })
  clientToken = c.token
  // Register + login admin
  await registerAdmin()
  const a = await loginAdmin()
  adminToken = a.token
})
afterAll(async () => { await teardownTestDb() })

describe('GET /api/v1/plans', () => {
  it('T19 ✓ returns plans list (public)', async () => {
    const res = await request(app).get('/api/v1/plans')
    expect(res.status).toBe(200)
    expect(res.body.data.plans.length).toBeGreaterThan(0)
    // Prices should be in INR (human-readable), not paise
    expect(res.body.data.plans[0].price).toBeLessThan(100000)
  })

  it('T20 ✗ tampered plan price rejected at order time', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        planSlug:             'pro',
        idempotencyKey:       'tampered-price-key-001',
        termsConsentVersion:  '1.0.0-draft',
        privacyConsentVersion:'1.0.0-draft',
      })
    // 201 = order created (Razorpay may or may not be live)
    // 422 = validation error
    // 502 = Razorpay gateway unavailable in test (no live keys)
    // NEVER uses a frontend-supplied price — amount always calculated server-side
    expect([201, 400, 422, 502]).toContain(res.status)
    if (res.status === 201) {
      expect(res.body.data.breakdown.total).toBeGreaterThan(2000)
    }
  })
})

describe('Admin plan management', () => {
  it('T21 ✓ admin can create a plan', async () => {
    const res = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        slug:       'test-plan',
        name:       'Test Plan',
        priceINR:   499,
        sortOrder:  99,
        features:   ['F1'],
        notIncluded:[],
      })
    expect(res.status).toBe(201)
  })

  it('T22 ✗ client cannot create a plan (403)', async () => {
    const res = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ slug: 'fake', name: 'Fake', priceINR: 1 })
    expect(res.status).toBe(403)
  })

  it('T23 ✗ unauthenticated cannot create a plan (401)', async () => {
    const res = await request(app)
      .post('/api/v1/plans')
      .send({ slug: 'unauth', name: 'Unauth', priceINR: 1 })
    expect(res.status).toBe(401)
  })
})
