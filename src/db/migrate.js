'use strict'
require('dotenv').config()
const { sequelize } = require('../models/index')

async function migrate () {
  try {
    await sequelize.authenticate()
    console.log('✓ MySQL connection established')

    // alter:true updates existing columns safely in dev; use migrations tool in prod
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    console.log('✓ All tables synced')
    process.exit(0)
  } catch (err) {
    console.error('✗ Migration failed:', err.message)
    process.exit(1)
  }
}

migrate()
