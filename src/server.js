
'use strict';

require('dotenv').config();

const validateEnv = require('./utils/validateEnv');
const app = require('./app');
const { sequelize, PaymentRequest } = require('./models/index');

// Validate required environment variables
validateEnv();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Connect to MySQL before starting the server
    await sequelize.authenticate();
    console.log('✓ MySQL connected');

    // Ensure payment_requests table, columns, and indexes exist safely
    const qi = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');
    let cols = null;
    try {
      cols = await qi.describeTable('payment_requests');
    } catch {
      cols = null;
    }
    if (cols) {
      if (!cols.payout_date) {
        await qi.addColumn('payment_requests', 'payout_date', { type: DataTypes.DATEONLY, allowNull: true });
      }
      if (!cols.has_open_issue) {
        await qi.addColumn('payment_requests', 'has_open_issue', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
      }
      if (!cols.issue_messages) {
        await qi.addColumn('payment_requests', 'issue_messages', { type: DataTypes.JSON, allowNull: true });
      }
    }
    await PaymentRequest.sync();

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
