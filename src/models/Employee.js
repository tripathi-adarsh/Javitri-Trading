'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

/**
 * Employee model — extends the base user system.
 * Employees have a unique company code (JVT-EMP-XXXX) and belong to a user account.
 * A user with role='employee' must have a corresponding Employee record.
 */
const Employee = sequelize.define('Employee', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  user_id: {
    // FK to users table — the actual login account
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,
  },
  employee_code: {
    // e.g. JVT-EMP-1001
    type:      DataTypes.STRING(20),
    allowNull: false,
    unique:    true,
  },
  // Optional: which admin created this employee
  created_by_user_id: {
    type:      DataTypes.UUID,
    allowNull: true,
  },
  // Additional profile fields beyond what User stores
  department: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'employees',
  indexes: [
    { fields: ['user_id'],       unique: true },
    { fields: ['employee_code'], unique: true },
    { fields: ['created_by_user_id'] },
  ],
})

module.exports = Employee
