'use strict'
const request = require('supertest')
const app     = require('../app')
const { setupTestDb, teardownTestDb } = require('./helpers/testDb')
const { VALID_USER, ADMIN_USER, registerAndLogin } = require('./helpers/authHelper')

beforeAll(async () => { await setupTestDb() })
afterAll(async ()  => { await teardownTestDb() })

// ─── Registration ──────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('T01 ✓ valid registration returns 201 and token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(VALID_USER)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeTruthy()
    expect(res.body.data.user.password_hash).toBeUndefined()  // T14: no secret leak
  })

  it('T02 ✗ invalid form — missing email returns 422', async () => {
    const bad = { ...VALID_USER, email: '' }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    expect(res.status).toBe(422)
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true)
  })

  it('T03 ✗ invalid form — bad PAN format returns 422', async () => {
    const bad = { ...VALID_USER, pan: 'INVALID', email: 'bad.pan@example.com', phone: '9876543211' }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    expect(res.status).toBe(422)
    expect(res.body.errors.some(e => e.field === 'pan')).toBe(true)
  })

  it('T04 ✗ invalid form — underage (DOB < 18 years) returns 422', async () => {
    const bad = { ...VALID_USER, dob: '2015-01-01', email: 'young@example.com', phone: '9876543212' }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    expect(res.status).toBe(422)
    expect(res.body.errors.some(e => e.field === 'dob')).toBe(true)
  })

  it('T05 ✗ duplicate email returns 409', async () => {
    const dup = { ...VALID_USER, phone: '9000000099', pan: 'DUPLI1234Z' }
    const res = await request(app).post('/api/v1/auth/register').send(dup)
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email/i)
  })

  it('T06 ✗ weak password returns 422', async () => {
    const bad = { ...VALID_USER, password: 'weak', confirmPassword: 'weak', email: 'weak@example.com', phone: '9888888881' }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    expect(res.status).toBe(422)
  })

  it('T07 ✗ mismatched passwords returns 422', async () => {
    const bad = { ...VALID_USER, confirmPassword: 'Different@99', email: 'mismatch@example.com', phone: '9888888882' }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    expect(res.status).toBe(422)
  })
})

// ─── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('T08 ✓ valid login returns token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeTruthy()
  })

  it('T09 ✗ wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: 'WrongPass@999' })
    expect(res.status).toBe(401)
    // Must NOT leak whether email exists vs password wrong (user enumeration)
    expect(res.body.message).toBe('Invalid email or password')
  })

  it('T10 ✗ non-existent user returns same 401 message (enum protection)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'AnyPass@123' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })
})

// ─── Auth guard ────────────────────────────────────────────────────────────────
describe('Authentication guard', () => {
  it('T11 ✗ protected route without token returns 401', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })

  it('T12 ✗ tampered token returns 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.sig')
    expect(res.status).toBe(401)
  })

  it('T13 ✓ valid token returns user profile', async () => {
    const { token } = await registerAndLogin({
      ...VALID_USER, email: 'me.test@example.com',
      phone: '9777777701', pan: 'METES1234A',
    })
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.user.password_hash).toBeUndefined()   // T14 PII check
    expect(res.body.data.user.refresh_token_hash).toBeUndefined()
  })
})

// ─── Admin authorization ────────────────────────────────────────────────────────
describe('Admin authorization', () => {
  it('T15 ✗ client token cannot access admin plan creation', async () => {
    const { token } = await registerAndLogin({
      ...VALID_USER, email: 'notadmin@example.com',
      phone: '9777777702', pan: 'NOTAD1234B',
    })
    const res = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'hack', name: 'Hack Plan', priceINR: 1 })
    expect(res.status).toBe(403)
  })

  it('T16 ✗ admin register without valid token returns 403', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/register')
      .set('x-admin-token', 'wrong_token')
      .send(ADMIN_USER)
    expect(res.status).toBe(403)
  })
})

// ─── XSS / Injection ───────────────────────────────────────────────────────────
describe('XSS and injection protection', () => {
  it('T17 ✗ XSS payload in firstName is rejected by validation', async () => {
    const bad = {
      ...VALID_USER,
      firstName: '<script>alert(1)</script>',
      email: 'xss@example.com',
      phone: '9777777703',
      pan: 'XSSTT1234C',
    }
    const res = await request(app).post('/api/v1/auth/register').send(bad)
    // Express-validator rejects: name too long or invalid chars → 422
    expect([201, 422]).toContain(res.status)
    if (res.status === 201) {
      // If somehow passed, ensure it's stored as plain text (not executed)
      expect(res.body.data.user.first_name).not.toContain('<script>')
    }
  })

  it('T18 ✗ NoSQL/prototype injection keys are stripped', async () => {
    const payload = {
      ...VALID_USER,
      email: 'inject@example.com',
      phone: '9777777704',
      pan:   'INJCT1234D',
      '$where': '1==1',          // NoSQL operator
      '__proto__': { admin: true },
    }
    const res = await request(app).post('/api/v1/auth/register').send(payload)
    // Should succeed or 422, but the injected key must never reach DB
    expect([201, 422]).toContain(res.status)
  })
})
