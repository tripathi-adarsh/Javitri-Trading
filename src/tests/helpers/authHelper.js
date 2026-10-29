'use strict'
const request = require('supertest')
const app     = require('../../app')

const VALID_USER = {
  firstName:         'Rahul',
  lastName:          'Sharma',
  email:             'rahul.test@example.com',
  phone:             '9876543210',
  dob:               '1995-06-15',
  pan:               'ABCDE1234F',
  city:              'Mumbai',
  state:             'mh',
  annualIncome:      '5l_10l',
  tradingExperience: 'beginner',
  password:          'TestPass@123',
  confirmPassword:   'TestPass@123',
}

const ADMIN_USER = {
  firstName:         'Admin',
  lastName:          'Test',
  email:             'admin.test@example.com',
  phone:             '9000000001',
  dob:               '1985-01-01',
  pan:               'ADMIN1234B',
  city:              'Surat',
  state:             'gj',
  annualIncome:      'above_25l',
  tradingExperience: 'expert',
  password:          'AdminPass@456',
  confirmPassword:   'AdminPass@456',
}

async function registerAndLogin (userData = VALID_USER) {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(userData)
  return {
    token:  res.body?.data?.accessToken,
    userId: res.body?.data?.user?.id,
    status: res.status,
    body:   res.body,
  }
}

async function registerAdmin () {
  const res = await request(app)
    .post('/api/v1/auth/admin/register')
    .set('x-admin-token', process.env.ADMIN_SIGNUP_TOKEN || 'admin_signup_secret_replace_me')
    .send(ADMIN_USER)
  return {
    token:  null,   // need to login separately
    userId: res.body?.data?.user?.id,
    status: res.status,
  }
}

async function loginAdmin () {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_USER.email, password: ADMIN_USER.password })
  return {
    token:  res.body?.data?.accessToken,
    userId: res.body?.data?.user?.id,
    status: res.status,
  }
}

module.exports = { VALID_USER, ADMIN_USER, registerAndLogin, registerAdmin, loginAdmin }
