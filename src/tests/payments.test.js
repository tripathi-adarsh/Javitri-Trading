'use strict'
const crypto  = require('crypto')
const request = require('supertest')
const app     = require('../app')
const { setupTestDb, teardownTestDb } = require('./helpers/testDb')
const { VALID_USER, registerAndLogin } = require('./helpers/authHelper')

let token

beforeAll(async () => {
  await setupTestDb()
  const r = await registerAndLogin({ ...VALID_USER, email: 'pay.test@example.com', phone: '9333333301', pan: 'PAYTT1234A' })
  token = r.token
})
afterAll(async () => { await teardownTestDb() })

describe('POST /api/v1/payments/verify', () => {
  it('T33 ✗ missing fields returns 422', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ razorpay_order_id: 'order_test' })
    expect(res.status).toBe(422)
  })

  it('T34 ✗ invalid/forged signature returns 400 — NEVER trusts frontend status', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        razorpay_order_id:  'order_fake123',
        razorpay_payment_id:'pay_fake456',
        razorpay_signature: 'forged_signature_here',
      })
    // 404 (order not found) or 400 (sig invalid if order exists) — never 200
    expect([400, 404]).toContain(res.status)
  })

  it('T35 ✗ unauthenticated payment verify returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .send({
        razorpay_order_id:  'order_x',
        razorpay_payment_id:'pay_x',
        razorpay_signature: 'sig_x',
      })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/payments/webhook', () => {
  const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_replace_me'

  function makeWebhookPayload (eventType, orderId, paymentId) {
    return {
      id:    `evt_${Date.now()}`,
      event: eventType,
      payload: {
        payment: {
          entity: {
            id:          paymentId,
            order_id:    orderId,
            amount:      299900,
            method:      'upi',
            status:      'captured',
            error_description: null,
          },
        },
      },
    }
  }

  function signWebhook (body) {
    return crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
  }

  it('T36 ✗ webhook without signature returns 400 (forged webhook)', async () => {
    const body = JSON.stringify(makeWebhookPayload('payment.captured', 'order_test', 'pay_test'))
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'text/plain')
      .send(body)
    expect(res.status).toBe(400)
  })

  it('T37 ✗ webhook with wrong signature returns 400', async () => {
    const body = JSON.stringify(makeWebhookPayload('payment.captured', 'order_test', 'pay_test'))
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', 'wrong_signature')
      .set('Content-Type', 'text/plain')
      .send(body)
    expect(res.status).toBe(400)
  })

  it('T38 ✓ valid webhook with correct signature returns 200', async () => {
    const payload = makeWebhookPayload('payment.captured', 'order_nonexistent', 'pay_nonexistent')
    const body    = JSON.stringify(payload)
    const sig     = signWebhook(body)

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', sig)
      .set('Content-Type', 'text/plain')
      .send(body)
    // Returns 200 always (to prevent Razorpay retries) but logs error
    expect(res.status).toBe(200)
  })

  it('T39 ✓ duplicate webhook (same event ID) is silently ignored (idempotency)', async () => {
    const payload = makeWebhookPayload('payment.captured', 'order_dup', 'pay_dup')
    payload.id    = 'evt_duplicate_test'
    const body    = JSON.stringify(payload)
    const sig     = signWebhook(body)

    // First webhook
    await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', sig)
      .set('Content-Type', 'text/plain')
      .send(body)

    // Duplicate webhook — same event ID
    const res2 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', sig)
      .set('Content-Type', 'text/plain')
      .send(body)
    expect(res2.status).toBe(200)
    expect(res2.body.message).toMatch(/already processed/i)
  })
})
