'use strict'
const bcrypt = require('bcryptjs')
const { sequelize, User, Employee } = require('../models/index')
const { audit } = require('../utils/auditLogger')

// ── Generate unique employee code ─────────────────────────────────────────────
async function generateEmployeeCode (t) {
  // JVT-EMP-XXXX where XXXX starts at 1001
  let code
  let attempts = 0
  do {
    // Count existing employees to get next number; add random salt to avoid races
    const count = await Employee.count({ transaction: t })
    const num   = 1001 + count + attempts
    code = `JVT-EMP-${num}`
    const exists = await Employee.findOne({ where: { employee_code: code }, transaction: t })
    if (!exists) break
    attempts++
  } while (attempts < 20)
  if (attempts >= 20) throw new Error('Could not generate unique employee code')
  return code
}

// ── List employees ────────────────────────────────────────────────────────────

exports.listEmployees = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize
    const { status } = req.query

    const where = {}
    // Employees filter by their user's is_active if status param provided
    const userWhere = {}
    if (status === 'active')   userWhere.is_active = true
    if (status === 'inactive') userWhere.is_active = false

    const { count, rows } = await Employee.findAndCountAll({
      include: [{
        model:      User,
        as:         'user',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'is_active', 'created_at'],
        where:      Object.keys(userWhere).length ? userWhere : undefined,
      }],
      where,
      limit:   pageSize,
      offset,
      order:   [['created_at', 'DESC']],
    })

    res.json({
      success: true,
      data: {
        employees: rows.map(e => ({
          id:            e.id,
          employeeCode:  e.employee_code,
          userId:        e.user_id,
          fullName:      `${e.user.first_name} ${e.user.last_name}`,
          email:         e.user.email,
          phone:         e.user.phone,
          isActive:      e.user.is_active,
          department:    e.department,
          createdAt:     e.created_at,
        })),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single employee ───────────────────────────────────────────────────────

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash', 'refresh_token_hash'] } }],
    })
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })

    // Employees can only view their own record
    if (req.user.role === 'employee' && employee.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({ success: true, data: { employee } })
  } catch (err) {
    next(err)
  }
}

// ── Create employee ───────────────────────────────────────────────────────────

exports.createEmployee = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      firstName, lastName, email, phone,
      dob, city, state, department, notes,
    } = req.body

    // Check for duplicate email / phone
    const [byEmail, byPhone] = await Promise.all([
      User.findOne({ where: { email: email.toLowerCase() }, transaction: t }),
      User.findOne({ where: { phone },                       transaction: t }),
    ])
    if (byEmail) { await t.rollback(); return res.status(409).json({ success: false, message: 'Email already in use' }) }
    if (byPhone) { await t.rollback(); return res.status(409).json({ success: false, message: 'Phone already in use' }) }

    // Generate a temporary password — admin must reset this
    const tempPassword = `JVT@${Date.now().toString(36).toUpperCase()}`
    const rounds       = parseInt(process.env.BCRYPT_ROUNDS) || 12
    const passwordHash = await bcrypt.hash(tempPassword, rounds)

    const user = await User.create({
      first_name:          firstName.trim(),
      last_name:           lastName.trim(),
      email:               email.toLowerCase().trim(),
      phone,
      dob:                 dob || '1990-01-01',
      pan:                 `EMPLO${require('crypto').randomBytes(2).toString('hex').toUpperCase()}E`, // placeholder PAN
      city:                city?.trim() || 'Surat',
      state:               state || 'gj',
      annual_income:       'not_specified',
      trading_experience:  'not_specified',
      password_hash:       tempPassword,  // will be hashed by beforeCreate hook
      role:                'employee',
      email_verified:      false,
    }, { transaction: t })

    const employeeCode = await generateEmployeeCode(t)

    const employee = await Employee.create({
      user_id:             user.id,
      employee_code:       employeeCode,
      created_by_user_id:  req.userId,
      department:          department || null,
      notes:               notes || null,
    }, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      'EMPLOYEE_CREATED',
      entityType:  'employee',
      entityId:    employee.id,
      metadata:    { employeeCode, email: user.email },
      req,
    })

    res.status(201).json({
      success: true,
      message: 'Employee created successfully. Temporary password has been generated — share it securely with the employee.',
      data: {
        employee: {
          id:            employee.id,
          employeeCode,
          userId:        user.id,
          fullName:      `${user.first_name} ${user.last_name}`,
          email:         user.email,
          phone:         user.phone,
          isActive:      user.is_active,
        },
        // Temporary password returned ONCE — must be changed on first login.
        // IMPORTANT: In production, deliver this via secure email instead of API response.
        // This is only acceptable when email service is not yet configured.
        temporaryPassword: tempPassword,
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Update employee ───────────────────────────────────────────────────────────

exports.updateEmployee = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
      transaction: t,
    })
    if (!employee) { await t.rollback(); return res.status(404).json({ success: false, message: 'Employee not found' }) }

    const { firstName, lastName, phone, city, state, department, notes } = req.body

    if (firstName || lastName || phone || city || state) {
      const userUpdates = {}
      if (firstName) userUpdates.first_name = firstName.trim()
      if (lastName)  userUpdates.last_name  = lastName.trim()
      if (phone)     userUpdates.phone      = phone
      if (city)      userUpdates.city       = city.trim()
      if (state)     userUpdates.state      = state
      await employee.user.update(userUpdates, { transaction: t })
    }

    const empUpdates = {}
    if (department !== undefined) empUpdates.department = department
    if (notes      !== undefined) empUpdates.notes      = notes
    if (Object.keys(empUpdates).length) await employee.update(empUpdates, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      'EMPLOYEE_UPDATED',
      entityType:  'employee',
      entityId:    employee.id,
      metadata:    { employeeCode: employee.employee_code },
      req,
    })

    res.json({ success: true, message: 'Employee updated', data: { employee } })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── Set employee active/inactive ──────────────────────────────────────────────

exports.setEmployeeStatus = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { isActive } = req.body
    if (typeof isActive !== 'boolean') {
      await t.rollback()
      return res.status(422).json({ success: false, message: 'isActive must be a boolean' })
    }

    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    })
    if (!employee) { await t.rollback(); return res.status(404).json({ success: false, message: 'Employee not found' }) }

    await employee.user.update({ is_active: isActive }, { transaction: t })
    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      isActive ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED',
      entityType:  'employee',
      entityId:    employee.id,
      metadata:    { employeeCode: employee.employee_code },
      req,
    })

    res.json({
      success: true,
      message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`,
      data:    { isActive },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
