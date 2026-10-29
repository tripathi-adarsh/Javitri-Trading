'use strict'
const request = require('supertest')
const app     = require('../app')
const { setupTestDb, teardownTestDb } = require('./helpers/testDb')
const { VALID_USER, ADMIN_USER, registerAndLogin, registerAdmin, loginAdmin } = require('./helpers/authHelper')

let clientToken, adminToken

beforeAll(async () => {
  await setupTestDb()
  const c = await registerAndLogin({ ...VALID_USER, email: 'legal.client@example.com', phone: '9444444401', pan: 'LEGAL1234A' })
  clientToken = c.token
  await registerAdmin()
  const a = await loginAdmin()
  adminToken = a.token
})
afterAll(async () => { await teardownTestDb() })

describe('GET /api/v1/legal/:type', () => {
  it('T40 ✓ public can fetch terms', async () => {
    const res = await request(app).get('/api/v1/legal/terms')
    expect(res.status).toBe(200)
    expect(res.body.data.version).toBe('1.0.0-draft')
    expect(res.body.data.content).toBeInstanceOf(Array)
  })

  it('T41 ✓ public can fetch privacy policy', async () => {
    const res = await request(app).get('/api/v1/legal/privacy')
    expect(res.status).toBe(200)
    expect(res.body.data.type).toBe('privacy')
  })

  it('T42 ✗ invalid type returns 422', async () => {
    const res = await request(app).get('/api/v1/legal/invalid')
    expect(res.status).toBe(422)
  })
})

describe('POST /api/v1/legal (admin only)', () => {
  it('T43 ✗ client cannot create legal document', async () => {
    const res = await request(app)
      .post('/api/v1/legal')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ type: 'terms', version: '2.0.0', title: 'Test', content: [{ id: '1', title: 'T', content: 'C' }] })
    expect(res.status).toBe(403)
  })

  it('T44 ✓ admin can create legal draft', async () => {
    const res = await request(app)
      .post('/api/v1/legal')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type:    'terms',
        version: '2.0.0-draft',
        title:   'Updated Terms',
        content: [{ id: 'intro', title: 'Introduction', content: 'Draft text...' }],
        effectiveDate: '2027-01-01',
      })
    expect(res.status).toBe(201)
    expect(res.body.data.document.status).toBe('draft')
  })
})
