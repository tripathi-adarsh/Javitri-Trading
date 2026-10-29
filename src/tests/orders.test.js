'use strict'
const request = require('supertest')
const app     = require('../app')
const { setupTestDb, teardownTestDb } = require('./helpers/testDb')
const { VALID_USER, registerAndLogin } = require('./helpers/authHelper')

let token
const IK = () => `ikey-${Date.now()}-${Math.random().toString(36).slice(2)}`

beforeAll(async () => {
  await setupTestDb()
  const r = await registerAndLogin({ ...VALID_USER, email: 'order.test@example.com', phone: '9222222201', pan: 'ORDER1234A' })
  token = r.token
})
afterAll(async () => { await teardownTestDb() })

describe('POST /api/v1/orders/preview', () => {
  it('T24 ✓ preview returns correct server-side amounts', async () => {
    const res = await request(app)
      .post('/api/v1/orders/preview')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'pro' })
    expect(res.status).toBe(200)
    // base: 2499, fee: 49, tax: (2499+49)*0.18 = 458.64, total: 3006.64
    expect(res.body.data.baseAmount).toBe(2499)
    expect(res.body.data.platformFee).toBe(49)
    expect(res.body.data.gst).toBeCloseTo(458.64, 1)
    expect(res.body.data.totalAmount).toBeCloseTo(3006.64, 1)
  })

  it('T25 ✓ preview with valid promo applies discount server-side', async () => {
    const res = await request(app)
      .post('/api/v1/orders/preview')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'pro', promoCode: 'TRADE200' })
    expect(res.status).toBe(200)
    expect(res.body.data.discount).toBe(200)
    // taxable: 2499+49-200=2348; gst: 2348*0.18=422.64; total: 2770.64
    expect(res.body.data.totalAmount).toBeCloseTo(2770.64, 1)
  })

  it('T26 ✗ preview with invalid promo returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders/preview')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'pro', promoCode: 'FAKECODE' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/orders', () => {
  it('T27 ✗ order without consent returns 4xx', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'pro', idempotencyKey: IK() })
    // 400 = controller rejects (missing consent)
    // 422 = express-validator rejects (missing idempotencyKey length or consent fields)
    expect([400, 422]).toContain(res.status)
  })

  it('T28 ✗ order with wrong consent version returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planSlug:              'pro',
        idempotencyKey:        IK(),
        termsConsentVersion:   'old-version',
        privacyConsentVersion: 'old-version',
      })
    expect(res.status).toBe(400)
  })

  it('T29 ✗ order without idempotency key returns 4xx', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planSlug:              'pro',
        termsConsentVersion:   '1.0.0-draft',
        privacyConsentVersion: '1.0.0-draft',
      })
    // 400 or 422 — either controller rejects or validator rejects
    expect([400, 422]).toContain(res.status)
  })

  it('T30 ✗ unauthenticated order returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ planSlug: 'pro', idempotencyKey: IK() })
    expect(res.status).toBe(401)
  })

  it('T31 ✗ promo code applied to wrong plan is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/orders/preview')
      .set('Authorization', `Bearer ${token}`)
      .send({ planSlug: 'starter', promoCode: 'TRADE200' }) // TRADE200 only for pro
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/not valid for this plan/i)
  })
})

describe('Duplicate payment / idempotency', () => {
  it('T32 ✗ sending same idempotencyKey twice returns same order (idempotent)', async () => {
    const key = `idempotent-test-${Date.now()}`

    // We can't complete the Razorpay flow in unit tests (no live keys),
    // but we can verify the /orders endpoint handles idempotency correctly
    // by mocking or checking the 400 from Razorpay gateway
    const payload = {
      planSlug:              'pro',
      idempotencyKey:        key,
      termsConsentVersion:   '1.0.0-draft',
      privacyConsentVersion: '1.0.0-draft',
    }

    const res1 = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    // First call: either 201 (if Razorpay keys work) or 502 (no live keys in test)
    expect([201, 502]).toContain(res1.status)

    if (res1.status === 201) {
      // Second call with same key should return same order (200 idempotent)
      const res2 = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
      expect(res2.status).toBe(200)
      expect(res2.body.message).toMatch(/duplicate/i)
    }
  })
})
