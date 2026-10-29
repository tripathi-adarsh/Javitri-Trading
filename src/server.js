'use strict'
require('dotenv').config()
const validateEnv   = require('./utils/validateEnv')
const app           = require('./app')
const { sequelize } = require('./models/index')

// Validate all required env vars before anything else
validateEnv()

const PORT = parseInt(process.env.PORT) || 5000

async function start () {
  try {
    await sequelize.authenticate()
    console.log('✓ MySQL connected')

    // In development only: auto-sync table structure.
    // In production: run migrations manually with `npm run migrate`.
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('✓ Tables synced (development mode)')
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`  Environment: ${process.env.NODE_ENV}`)
    })
  } catch (err) {
    console.error('✗ Server startup failed:', err.message)
    process.exit(1)
  }
}

start()
