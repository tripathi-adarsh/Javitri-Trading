
'use strict';

require('dotenv').config();

const validateEnv = require('./utils/validateEnv');
const app = require('./app');
const { sequelize } = require('./models/index');

// Validate required environment variables
validateEnv();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Connect to MySQL before starting the server
    await sequelize.authenticate();
    console.log('✓ MySQL connected');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.query('SELECT 1');
      console.log('✓ Database connected (development mode)');
    }

    // Start server only once
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (err) {
    console.error('✗ Server startup failed:', err);
    process.exit(1);
  }
}

start();
