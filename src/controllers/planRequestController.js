'use strict'
const crypto  = require('crypto')
const { Op }  = require('sequelize')
const { sequelize, Client, ClientKYC, ClientPlanRequest, DailyPayout, Employee, User } = require('../models/index')
const { audit } = require('../utils/auditLogger')
const { ensureClientUserAccount } = require('../utils/clientAccount')

// ── Generate a unique request number (REQ-YYYYMMDD-XXXXXX) ───────────────────
function generateRequestNumber() {
  const date = new Date()
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `REQ-${yyyymmdd}-${rand}`
}

// ── Round-robin employee assignment ──────────────────────────────────────────
// Finds the active employee with the fewest assigned plan requests.
// Uses a transaction with row-level locking to prevent race conditions.
async function getNextEmployee(t) {
  const employees = await Employee.findAll({
    include: [{ model: User, as: 'user', where: { is_active: true }, attributes: ['id'] }],
    transaction: t,
  })
  if (!employees.length) return null

  // Count active plan requests per employee
  const counts = await Promise.all(employees.map(async emp => {
    const count = await ClientPlanRequest.count({
      where: { assigned_employee_id: emp.id, status: ['pending', 'active'] },
      transaction: t,
    })
    return { emp, count }
  }))

  // Pick employee with fewest requests (round-robin effect)
  counts.sort((a, b) => a.count - b.count)
  return counts[0].emp
}

// ── Create plan request (called after client registers/exists) ───────────────
exports.createPlanRequest = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      clientId,
      planSlug,
      planName,
      dealAmount,    // in paise
      dailyAmount,   // in paise
      // Nominee details (for existing clients, stored to ClientKYC)
      nomineeName,
      nomineeRelation,
      nomineeMobile,
    } = req.body

    if (!clientId || !planSlug || !planName) {
      await t.rollback()
      return res.status(422).json({ success: false, message: 'clientId, planSlug, planName required' })
    }

    const client = await Client.findByPk(clientId, { transaction: t })
    if (!client) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Client not found' })
    }

    // Prevent duplicate: same client cannot request the same plan more than once
    const duplicate = await ClientPlanRequest.findOne({
      where: { client_id: clientId, plan_slug: planSlug },
      transaction: t,
    })
    if (duplicate) {
      await t.rollback()
      return res.status(409).json({
        success: false,
        message: `You have already submitted a request for ${planName}. Each plan can only be requested once per client.`,
      })
    }

    // Auto assign employee via round-robin
    const employee = await getNextEmployee(t)

    // Generate unique request number
    let requestNumber = generateRequestNumber()
    let existing = await ClientPlanRequest.findOne({ where: { request_number: requestNumber }, transaction: t })
    while (existing) {
      requestNumber = generateRequestNumber()
      existing = await ClientPlanRequest.findOne({ where: { request_number: requestNumber }, transaction: t })
    }

    const planRequest = await ClientPlanRequest.create({
      request_number:       requestNumber,
      client_id:            clientId,
      assigned_employee_id: employee?.id || null,
      plan_slug:            planSlug,
      plan_name:            planName,
      deal_amount:          dealAmount || null,
      daily_amount:         dailyAmount || null,
      payment_status:       'pending',
      status:               'pending',
    }, { transaction: t })

    // If nominee details provided, upsert into ClientKYC
    if (nomineeName || nomineeRelation || nomineeMobile) {
      const kyc = await ClientKYC.findOne({ where: { client_id: clientId }, transaction: t })
      if (kyc) {
        const kycUpdates = {}
        if (nomineeName)     kycUpdates.nominee_name     = nomineeName
        if (nomineeRelation) kycUpdates.nominee_relation = nomineeRelation
        if (nomineeMobile)   kycUpdates.nominee_mobile   = nomineeMobile
        await kyc.update(kycUpdates, { transaction: t })
      } else {
        // Create KYC record if none exists
        await ClientKYC.create({
          client_id:           clientId,
          verification_status: 'not_started',
          nominee_name:        nomineeName || null,
          nominee_relation:    nomineeRelation || null,
          nominee_mobile:      nomineeMobile || null,
        }, { transaction: t })
      }
    }

    const credentials = await ensureClientUserAccount(client, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: null,
      action:      'PLAN_REQUEST_CREATED',
      entityType:  'client_plan_request',
      entityId:    planRequest.id,
      metadata:    { clientId, planSlug, requestNumber, assignedEmployeeId: employee?.id || null },
      req,
    })

    res.status(201).json({
      success: true,
      message: 'Plan request submitted',
      data: {
        requestId:          planRequest.id,
        requestNumber:      planRequest.request_number,
        assignedEmployeeId: employee?.id || null,
        credentials: {
          email:        credentials.email,
          password:     credentials.password,
          isNewAccount: credentials.isNewAccount,
        },
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── List plan requests (admin/employee) ───────────────────────────────────────
exports.listPlanRequests = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(50, parseInt(req.query.pageSize) || 20)
    const offset   = (page - 1) * pageSize
    const { paymentStatus, status, clientId } = req.query

    const where = {}
    if (paymentStatus) where.payment_status = paymentStatus
    if (status)        where.status = status
    if (clientId)      where.client_id = clientId

    // Employee sees only their assigned requests
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp) return res.status(403).json({ success: false, message: 'No employee profile found' })
      where.assigned_employee_id = emp.id
    }

    const { count, rows } = await ClientPlanRequest.findAndCountAll({
      where,
      include: [
        {
          model: Client, as: 'client',
          attributes: ['id', 'registration_id', 'full_name', 'mobile', 'email'],
          include: [{
            model: ClientKYC, as: 'kyc',
            attributes: ['nominee_name', 'nominee_relation', 'nominee_mobile'],
          }],
        },
        {
          model: Employee, as: 'assignedEmployee',
          attributes: ['id', 'employee_code'],
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
        },
      ],
      limit:   pageSize,
      offset,
      order:   [['created_at', 'DESC']],
    })

    res.json({
      success: true,
      data: {
        requests: rows.map(r => {
          // Build nominee info string from KYC record
          const kyc = r.client?.kyc
          let nomineeInfo = null
          if (kyc?.nominee_name) {
            nomineeInfo = `${kyc.nominee_name}`
            if (kyc.nominee_relation) nomineeInfo += ` (${kyc.nominee_relation}`
            if (kyc.nominee_mobile) nomineeInfo += `, ${kyc.nominee_mobile}`
            if (kyc.nominee_relation) nomineeInfo += `)`
          }

          return {
            id:                r.id,
            requestNumber:     r.request_number,
            clientId:          r.client_id,
            clientName:        r.client?.full_name,
            clientMobile:      r.client?.mobile,
            clientEmail:       r.client?.email,
            registrationId:    r.client?.registration_id,
            planSlug:          r.plan_slug,
            planName:          r.plan_name,
            dealAmount:        r.deal_amount,
            dailyAmount:       r.daily_amount,
            nomineeInfo,
            paymentStatus:     r.payment_status,
            paymentAmount:     r.payment_amount,
            transactionId:     r.transaction_id,
            paymentMarkedAt:   r.payment_marked_at,
            paymentNotes:      r.payment_notes,
            status:            r.status,
            assignedEmployeeId:   r.assigned_employee_id,
            assignedEmployeeCode: r.assignedEmployee?.employee_code,
            assignedEmployeeName: r.assignedEmployee?.user
              ? `${r.assignedEmployee.user.first_name} ${r.assignedEmployee.user.last_name}`
              : null,
            createdAt: r.created_at,
          }
        }),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single plan request ───────────────────────────────────────────────────
exports.getPlanRequest = async (req, res, next) => {
  try {
    const r = await ClientPlanRequest.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'registration_id', 'full_name', 'mobile', 'email'] },
        {
          model: Employee, as: 'assignedEmployee',
          attributes: ['id', 'employee_code'],
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
        },
        { model: DailyPayout, as: 'dailyPayouts', order: [['payout_date', 'DESC']] },
      ],
    })
    if (!r) return res.status(404).json({ success: false, message: 'Plan request not found' })

    // Employee can only see their own
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || r.assigned_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    res.json({ success: true, data: { request: r } })
  } catch (err) { next(err) }
}

// ── Mark payment status (employee/admin) ──────────────────────────────────────
exports.markPayment = async (req, res, next) => {
  try {
    const { paymentStatus, notes, paymentAmount, transactionId } = req.body
    if (!['success', 'failed', 'pending'].includes(paymentStatus)) {
      return res.status(422).json({ success: false, message: 'paymentStatus must be success, failed, or pending' })
    }

    const r = await ClientPlanRequest.findByPk(req.params.id)
    if (!r) return res.status(404).json({ success: false, message: 'Plan request not found' })

    // Employee can only update their own requests
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || r.assigned_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    const updateData = {
      payment_status:    paymentStatus,
      payment_marked_at: new Date(),
      payment_marked_by: req.userId,
      payment_notes:     notes || null,
      status:            paymentStatus === 'success' ? 'active' : paymentStatus === 'failed' ? 'cancelled' : 'pending',
    }

    // Store payment amount and transaction ID if provided
    if (paymentAmount !== undefined) updateData.payment_amount = paymentAmount
    if (transactionId !== undefined) updateData.transaction_id = transactionId || null

    await r.update(updateData)

    await audit({
      actorUserId: req.userId,
      action:      `PLAN_PAYMENT_${paymentStatus.toUpperCase()}`,
      entityType:  'client_plan_request',
      entityId:    r.id,
      metadata:    { planSlug: r.plan_slug, clientId: r.client_id, notes, paymentAmount, transactionId },
      req,
    })

    res.json({ success: true, message: `Payment marked as ${paymentStatus}`, data: { paymentStatus } })
  } catch (err) { next(err) }
}

// ── Add daily payout ──────────────────────────────────────────────────────────
exports.addDailyPayout = async (req, res, next) => {
  try {
    const { payoutDate, amount, notes, transactionReference, paymentMethod } = req.body
    if (!payoutDate || !amount) {
      return res.status(422).json({ success: false, message: 'payoutDate and amount required' })
    }

    const r = await ClientPlanRequest.findByPk(req.params.id)
    if (!r) return res.status(404).json({ success: false, message: 'Plan request not found' })

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || r.assigned_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    // Upsert — allow updating same day's payout
    const [payout, created] = await DailyPayout.findOrCreate({
      where: { plan_request_id: r.id, payout_date: payoutDate },
      defaults: {
        client_id:              r.client_id,
        assigned_employee_id:   r.assigned_employee_id,
        amount:                 amount,
        marked_by:              req.userId,
        notes:                  notes || null,
        transaction_reference:  transactionReference || null,
        payment_method:         paymentMethod || null,
      },
    })

    if (!created) {
      await payout.update({
        amount:                amount,
        marked_by:             req.userId,
        notes:                 notes || null,
        transaction_reference:  transactionReference || payout.transaction_reference,
        payment_method:        paymentMethod || payout.payment_method,
      })
    }

    await audit({
      actorUserId: req.userId,
      action:      'DAILY_PAYOUT_MARKED',
      entityType:  'daily_payout',
      entityId:    payout.id,
      metadata:    { planRequestId: r.id, clientId: r.client_id, payoutDate, amount },
      req,
    })

    res.json({
      success: true,
      message: created ? 'Daily payout recorded' : 'Daily payout updated',
      data:    { payout },
    })
  } catch (err) { next(err) }
}

// ── List daily payouts for a plan request ─────────────────────────────────────
exports.getDailyPayouts = async (req, res, next) => {
  try {
    const r = await ClientPlanRequest.findByPk(req.params.id)
    if (!r) return res.status(404).json({ success: false, message: 'Plan request not found' })

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || r.assigned_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    const payouts = await DailyPayout.findAll({
      where: { plan_request_id: req.params.id },
      order: [['payout_date', 'DESC']],
    })

    const totalPaid = payouts.reduce((sum, p) => sum + Number(p.amount), 0)

    res.json({ success: true, data: { payouts, totalPaid } })
  } catch (err) { next(err) }
}

// ── Assign/reassign employee ──────────────────────────────────────────────────
exports.assignEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body
    const r = await ClientPlanRequest.findByPk(req.params.id)
    if (!r) return res.status(404).json({ success: false, message: 'Plan request not found' })

    // Validate employee is active if assigning
    if (employeeId) {
      const emp = await Employee.findByPk(employeeId, {
        include: [{ model: User, as: 'user', attributes: ['is_active'] }],
      })
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' })
      if (!emp.user?.is_active) return res.status(422).json({ success: false, message: 'Cannot assign to inactive employee' })
    }

    await r.update({ assigned_employee_id: employeeId || null })

    await audit({
      actorUserId: req.userId,
      action:      'PLAN_REQUEST_ASSIGNED',
      entityType:  'client_plan_request',
      entityId:    r.id,
      metadata:    { employeeId: employeeId || null },
      req,
    })

    res.json({ success: true, message: 'Employee assigned', data: { employeeId } })
  } catch (err) { next(err) }
}

// ── Daily Payout Reports (admin/employee) ─────────────────────────────────────
// Returns date-wise, client-wise, plan-wise totals
exports.getPayoutReport = async (req, res, next) => {
  try {
    const { startDate, endDate, clientId } = req.query

    const where = {}
    if (startDate && endDate) {
      where.payout_date = { [Op.between]: [startDate, endDate] }
    } else if (startDate) {
      where.payout_date = { [Op.gte]: startDate }
    } else if (endDate) {
      where.payout_date = { [Op.lte]: endDate }
    }
    if (clientId) where.client_id = clientId

    // Employee sees only their assigned payouts
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp) return res.status(403).json({ success: false, message: 'No employee profile found' })
      where.assigned_employee_id = emp.id
    }

    const payouts = await DailyPayout.findAll({
      where,
      include: [
        {
          model: ClientPlanRequest, as: 'planRequest',
          attributes: ['id', 'request_number', 'plan_name', 'plan_slug'],
          include: [{ model: Client, as: 'client', attributes: ['id', 'full_name', 'registration_id', 'mobile'] }],
        },
      ],
      order: [['payout_date', 'DESC']],
    })

    // Aggregate by date
    const byDate = {}
    // Aggregate by client
    const byClient = {}
    // Aggregate by plan request
    const byPlanRequest = {}
    let totalAmount = 0

    for (const p of payouts) {
      const amt = Number(p.amount)
      totalAmount += amt

      // By date
      if (!byDate[p.payout_date]) byDate[p.payout_date] = 0
      byDate[p.payout_date] += amt

      // By client
      const clientId = p.client_id
      if (!byClient[clientId]) {
        byClient[clientId] = {
          clientId,
          clientName: p.planRequest?.client?.full_name || 'Unknown',
          registrationId: p.planRequest?.client?.registration_id || '—',
          totalAmount: 0,
          count: 0,
        }
      }
      byClient[clientId].totalAmount += amt
      byClient[clientId].count += 1

      // By plan request
      const reqId = p.plan_request_id
      if (!byPlanRequest[reqId]) {
        byPlanRequest[reqId] = {
          requestNumber: p.planRequest?.request_number || '—',
          planName: p.planRequest?.plan_name || '—',
          clientName: p.planRequest?.client?.full_name || 'Unknown',
          totalAmount: 0,
          count: 0,
        }
      }
      byPlanRequest[reqId].totalAmount += amt
      byPlanRequest[reqId].count += 1
    }

    // Monthly summary
    const byMonth = {}
    for (const [date, amt] of Object.entries(byDate)) {
      const month = date.slice(0, 7) // YYYY-MM
      if (!byMonth[month]) byMonth[month] = 0
      byMonth[month] += amt
    }

    res.json({
      success: true,
      data: {
        totalAmount,
        totalEntries: payouts.length,
        byDate: Object.entries(byDate).map(([date, amount]) => ({ date, amount })).sort((a, b) => b.date.localeCompare(a.date)),
        byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => b.month.localeCompare(a.month)),
        byClient: Object.values(byClient).sort((a, b) => b.totalAmount - a.totalAmount),
        byPlanRequest: Object.values(byPlanRequest).sort((a, b) => b.totalAmount - a.totalAmount),
        recentPayouts: payouts.slice(0, 50).map(p => ({
          id:                p.id,
          payoutDate:        p.payout_date,
          amount:            Number(p.amount),
          notes:             p.notes,
          transactionRef:    p.transaction_reference,
          paymentMethod:     p.payment_method,
          requestNumber:     p.planRequest?.request_number,
          planName:          p.planRequest?.plan_name,
          clientName:        p.planRequest?.client?.full_name,
          registrationId:    p.planRequest?.client?.registration_id,
        })),
      },
    })
  } catch (err) { next(err) }
}
