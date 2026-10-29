'use strict'
require('dotenv').config()
const { Sequelize } = require('sequelize')

const dialect  = process.env.DB_DIALECT || 'mysql'
const isSQLite = dialect === 'sqlite'

const sequelize = isSQLite
  // ── SQLite (test / local dev without MySQL) ────────────────────────────────
  ? new Sequelize({
      dialect:  'sqlite',
      storage:  process.env.DB_STORAGE || ':memory:',
      logging:  false,
      define: {
        underscored:     true,
        freezeTableName: false,
        timestamps:      true,
        createdAt:       'created_at',
        updatedAt:       'updated_at',
      },
    })
  // ── MySQL (production / staging) ──────────────────────────────────────────
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host:    process.env.DB_HOST || 'localhost',
        port:    parseInt(process.env.DB_PORT)  || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: {
          underscored:     true,
          freezeTableName: false,
          timestamps:      true,
          createdAt:       'created_at',
          updatedAt:       'updated_at',
        },
      }
    )

module.exports = sequelize
