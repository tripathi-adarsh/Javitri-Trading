'use strict'
const crypto = require('crypto')
const { Op } = require('sequelize')
const {
  sequelize,
  Client,
  ClientKYC,
  ClientBankAccount,
  ClientPlanRequest,
  DailyPayout,
  PaymentRequest,
  Employee,
  User,
} = require('../models/index')
const { audit } = require('../utils/auditLogger')

function todayISO() {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset)
  return ist.toISOString().slice(0, 10)
}

function generatePaymentRequestNumber() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `PAYREQ-${ymd}-${rand}`
}

function normalizeMessages(val) {
  if (Array.isArray(val)) return [...val]
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? [...parsed] : []
    } catch {
      return []
    }
  }
  return []
}

async function findClientForUser(user) {
  const email = user.email?.toLowerCase().trim()
  const phone = user.phone?.trim()
  const conditions = []
  if (email) conditions.push({ email })
  if (phone) conditions.push({ mobile: phone })
  if (!conditions.length) return null

  return Client.findOne({
    where: { [Op.or]: conditions },
    include: [
      { model: ClientKYC, as: 'kyc', attributes: ['verification_status', 'pan_masked', 'nominee_name', 'nominee_relation', 'nominee_mobile', 'rejection_reason'] },
      { model: ClientBankAccount, as: 'bankAccounts', attributes: ['id', 'account_holder_name', 'bank_name', 'account_number_masked', 'ifsc_code', 'verification_status', 'is_primary'] },
      {
        model: Employee,
        as: 'originatingEmployee',
        attributes: ['id', 'employee_code'],
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'phone', 'email'] }],
      },
    ],
  })
}

// ── Client: Get own profile, plans, payouts, and payment requests ────────────
exports.getMyProfile = async (req, res, next) => {
  try {
    const client = await findClientForUser(req.user)
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'No client profile is linked to this account yet. Please submit a plan registration first.',
      })
    }

    const [planRequests, paymentRequests] = await Promise.all([
      ClientPlanRequest.findAll({
        where: { client_id: client.id },
        include: [
          { model: DailyPayout, as: 'dailyPayouts' },
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'employee_code'],
            include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'phone'] }],
          },
        ],
        order: [['created_at', 'DESC']],
      }),
      PaymentRequest.findAll({
        where: { client_id: client.id },
        include: [
          { model: ClientPlanRequest, as: 'planRequest', attributes: ['id', 'request_number', 'plan_name', 'plan_slug', 'daily_amount'] },
        ],
        order: [['created_at', 'DESC']],
      }),
    ])

    let totalDealAmountPaise = 0
    let totalPlanPaidPaise = 0
    let totalPayoutReceivedPaise = 0
    let activePlans = 0

    const formattedPlans = planRequests.map(pr => {
      const deal = Number(pr.deal_amount || 0)
      const daily = Number(pr.daily_amount || 0)
      const payouts = (pr.dailyPayouts || []).sort((a, b) => String(b.payout_date).localeCompare(String(a.payout_date)))
      const planPayoutSum = payouts.reduce((acc, p) => acc + Number(p.amount || 0), 0)

      totalDealAmountPaise += deal
      totalPayoutReceivedPaise += planPayoutSum

      if (pr.payment_status === 'success') {
        totalPlanPaidPaise += Number(pr.payment_amount || pr.deal_amount || 0)
      }
      if (pr.status === 'active' || pr.payment_status === 'success') {
        activePlans += 1
      }

      return {
        id: pr.id,
        requestNumber: pr.request_number,
        planSlug: pr.plan_slug,
        planName: pr.plan_name,
        dealAmountPaise: deal,
        dailyAmountPaise: daily,
        paymentStatus: pr.payment_status,
        paymentAmountPaise: Number(pr.payment_amount || 0),
        transactionId: pr.transaction_id,
        paymentMarkedAt: pr.payment_marked_at,
        paymentNotes: pr.payment_notes,
        status: pr.status,
        totalPayoutReceivedPaise: planPayoutSum,
        payoutCount: payouts.length,
        payouts: payouts.map(p => ({
          id: p.id,
          payoutDate: p.payout_date,
          amountPaise: Number(p.amount),
          paymentMethod: p.payment_method,
          transactionReference: p.transaction_reference,
          notes: p.notes,
        })),
        assignedManager: pr.assignedEmployee?.user
          ? `${pr.assignedEmployee.user.first_name} ${pr.assignedEmployee.user.last_name} (${pr.assignedEmployee.employee_code})`
          : null,
        createdAt: pr.created_at,
      }
    })

    let totalPaymentRequestsPaidPaise = 0
    let pendingPaymentRequestsCount = 0
    let pendingPaymentRequestsPaise = 0
    let openIssuesCount = 0

    // Track payout dates already synced in DailyPayout so we don't double-count
    const syncedDailyKeys = new Set()
    for (const pr of planRequests) {
      for (const po of (pr.dailyPayouts || [])) {
        syncedDailyKeys.add(`${pr.id}::${po.payout_date}`)
      }
    }

    const formattedPaymentRequests = paymentRequests.map(reqItem => {
      const amt = Number(reqItem.amount_paise || 0)
      const approvedAmt = reqItem.approved_amount_paise !== null ? Number(reqItem.approved_amount_paise) : null
      const pDate = reqItem.payout_date || (reqItem.created_at ? new Date(reqItem.created_at).toISOString().slice(0, 10) : todayISO())

      if (reqItem.status === 'paid') {
        const key = reqItem.plan_request_id ? `${reqItem.plan_request_id}::${pDate}` : null
        if (!key || !syncedDailyKeys.has(key)) {
          totalPaymentRequestsPaidPaise += (approvedAmt !== null ? approvedAmt : amt)
        }
      } else if (reqItem.status === 'pending' || reqItem.status === 'approved') {
        pendingPaymentRequestsCount += 1
        pendingPaymentRequestsPaise += amt
      }

      if (reqItem.has_open_issue) openIssuesCount += 1

      return {
        id: reqItem.id,
        requestNumber: reqItem.request_number,
        planRequestId: reqItem.plan_request_id,
        planName: reqItem.planRequest?.plan_name || null,
        planRequestNumber: reqItem.planRequest?.request_number || null,
        requestType: reqItem.request_type,
        payoutDate: pDate,
        amountPaise: amt,
        approvedAmountPaise: approvedAmt,
        paymentMode: reqItem.payment_mode,
        clientReference: reqItem.client_reference,
        clientNotes: reqItem.client_notes,
        status: reqItem.status,
        adminTransactionRef: reqItem.admin_transaction_ref,
        adminNotes: reqItem.admin_notes,
        hasOpenIssue: Boolean(reqItem.has_open_issue),
        issueMessages: normalizeMessages(reqItem.issue_messages),
        processedAt: reqItem.processed_at,
        createdAt: reqItem.created_at,
      }
    })

    res.json({
      success: true,
      data: {
        todayDate: todayISO(),
        client: {
          id: client.id,
          registrationId: client.registration_id,
          fullName: client.full_name,
          mobile: client.mobile,
          email: client.email,
          addressLine: client.address_line,
          city: client.city,
          state: client.state,
          postalCode: client.postal_code,
          country: client.country,
          clientType: client.client_type,
          status: client.status,
          kycStatus: client.kyc?.verification_status || 'not_started',
          panMasked: client.kyc?.pan_masked || null,
          nomineeName: client.kyc?.nominee_name || null,
          nomineeRelation: client.kyc?.nominee_relation || null,
          nomineeMobile: client.kyc?.nominee_mobile || null,
          bankAccounts: (client.bankAccounts || []).map(b => ({
            id: b.id,
            accountHolderName: b.account_holder_name,
            bankName: b.bank_name,
            accountNumberMasked: b.account_number_masked,
            ifscCode: b.ifsc_code,
            verificationStatus: b.verification_status,
            isPrimary: b.is_primary,
          })),
          accountManager: client.originatingEmployee?.user
            ? {
                code: client.originatingEmployee.employee_code,
                name: `${client.originatingEmployee.user.first_name} ${client.originatingEmployee.user.last_name}`,
                phone: client.originatingEmployee.user.phone,
              }
            : null,
          createdAt: client.created_at,
        },
        summary: {
          totalPlans: formattedPlans.length,
          activePlans,
          totalDealAmountPaise,
          totalPlanPaidPaise,
          totalPayoutReceivedPaise,
          totalPaymentRequestsPaidPaise,
          totalCombinedPayoutPaise: totalPayoutReceivedPaise + totalPaymentRequestsPaidPaise,
          pendingPaymentRequestsCount,
          pendingPaymentRequestsPaise,
          openIssuesCount,
        },
        plans: formattedPlans,
        paymentRequests: formattedPaymentRequests,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Client: Submit daily payout request to admin ─────────────────────────────
exports.createMyPaymentRequest = async (req, res, next) => {
  try {
    const client = await findClientForUser(req.user)
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client profile not found' })
    }

    const {
      planRequestId,
      requestType = 'payout_request',
      amountINR,
      paymentMode = 'bank_transfer',
      clientReference,
      clientNotes,
    } = req.body

    const payoutDate = todayISO()

    if (!planRequestId) {
      return res.status(422).json({ success: false, message: 'Please select your plan to request payout.' })
    }

    const planReq = await ClientPlanRequest.findOne({
      where: { id: planRequestId, client_id: client.id },
    })
    if (!planReq) {
      return res.status(404).json({ success: false, message: 'Selected plan not found for your profile.' })
    }

    // Use the plan's configured daily payout amount if set, preventing mismatched amount claims
    let amountPaise = planReq.daily_amount ? Number(planReq.daily_amount) : 0
    if (!amountPaise) {
      const numericAmt = Number(amountINR)
      if (!Number.isFinite(numericAmt) || numericAmt <= 0) {
        return res.status(422).json({ success: false, message: 'Valid positive amount required' })
      }
      amountPaise = Math.round(numericAmt * 100)
    }

    // Conflict prevention: allow only 1 active (non-rejected) payout request per plan per day
    const existingToday = await PaymentRequest.findOne({
      where: {
        client_id: client.id,
        plan_request_id: planReq.id,
        payout_date: payoutDate,
        status: { [Op.ne]: 'rejected' },
      },
    })
    if (existingToday) {
      return res.status(409).json({
        success: false,
        message: `Today's payout request (${existingToday.request_number}) for ${planReq.plan_name} is already submitted (Status: ${existingToday.status}).`,
      })
    }

    let requestNumber = generatePaymentRequestNumber()
    while (await PaymentRequest.findOne({ where: { request_number: requestNumber } })) {
      requestNumber = generatePaymentRequestNumber()
    }

    const created = await PaymentRequest.create({
      request_number:   requestNumber,
      client_id:        client.id,
      plan_request_id:  planReq.id,
      request_type:     requestType,
      payout_date:      payoutDate,
      amount_paise:     amountPaise,
      payment_mode:     paymentMode,
      client_reference: clientReference?.trim() || null,
      client_notes:     clientNotes?.trim() || null,
      status:           'pending',
      has_open_issue:   false,
      issue_messages:   [],
    })

    await audit({
      actorUserId: req.userId,
      action:      'CLIENT_PAYMENT_REQUEST_CREATED',
      entityType:  'payment_request',
      entityId:    created.id,
      metadata:    { requestNumber, clientId: client.id, planRequestId: planReq.id, payoutDate, amountPaise },
      req,
    })

    res.status(201).json({
      success: true,
      message: `Payout request ${created.request_number} submitted for ${payoutDate}!`,
      data: {
        paymentRequest: {
          id: created.id,
          requestNumber: created.request_number,
          payoutDate: created.payout_date,
          status: created.status,
          amountPaise: Number(created.amount_paise),
          createdAt: created.created_at,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Client: Report payment not received / send message on a request ──────────
exports.postClientIssueMessage = async (req, res, next) => {
  try {
    const client = await findClientForUser(req.user)
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client profile not found' })
    }

    const record = await PaymentRequest.findOne({
      where: { id: req.params.id, client_id: client.id },
    })
    if (!record) {
      return res.status(404).json({ success: false, message: 'Payment request not found' })
    }

    const msgText = req.body.message?.trim()
    if (!msgText) {
      return res.status(422).json({ success: false, message: 'Please enter a message for Admin.' })
    }

    const existingMsgs = normalizeMessages(record.issue_messages)
    existingMsgs.push({
      sender: 'client',
      senderName: client.full_name,
      message: msgText,
      createdAt: new Date().toISOString(),
    })

    await record.update({
      has_open_issue: true,
      issue_messages: existingMsgs,
    })

    await audit({
      actorUserId: req.userId,
      action:      'CLIENT_PAYMENT_ISSUE_REPORTED',
      entityType:  'payment_request',
      entityId:    record.id,
      metadata:    { requestNumber: record.request_number, message: msgText },
      req,
    })

    res.json({
      success: true,
      message: 'Your message has been sent to Admin.',
      data: {
        hasOpenIssue: true,
        issueMessages: existingMsgs,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Admin / Employee: List all client payment requests ───────────────────────
exports.listPaymentRequests = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize
    const { status, requestType, openIssue } = req.query

    const where = {}
    if (status) where.status = status
    if (requestType) where.request_type = requestType
    if (openIssue === 'true') where.has_open_issue = true

    const clientInclude = {
      model: Client,
      as: 'client',
      attributes: ['id', 'registration_id', 'full_name', 'mobile', 'email', 'originating_employee_id'],
      include: [
        { model: ClientBankAccount, as: 'bankAccounts', attributes: ['account_holder_name', 'bank_name', 'account_number_masked', 'ifsc_code', 'is_primary'] },
      ],
    }

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp) return res.status(403).json({ success: false, message: 'No employee profile found' })
      clientInclude.where = { originating_employee_id: emp.id }
      clientInclude.required = true
    }

    const [{ count, rows }, openIssuesTotal] = await Promise.all([
      PaymentRequest.findAndCountAll({
        where,
        include: [
          clientInclude,
          { model: ClientPlanRequest, as: 'planRequest', attributes: ['id', 'request_number', 'plan_name', 'deal_amount', 'daily_amount'] },
          { model: User, as: 'processor', attributes: ['first_name', 'last_name', 'email'] },
        ],
        limit: pageSize,
        offset,
        order: [['has_open_issue', 'DESC'], ['created_at', 'DESC']],
      }),
      PaymentRequest.count({ where: { has_open_issue: true } }),
    ])

    res.json({
      success: true,
      data: {
        openIssuesTotal,
        requests: rows.map(r => {
          const bank = r.client?.bankAccounts?.find(b => b.is_primary) || r.client?.bankAccounts?.[0] || null
          return {
            id: r.id,
            requestNumber: r.request_number,
            clientId: r.client_id,
            clientName: r.client?.full_name || 'Client',
            clientMobile: r.client?.mobile || '',
            clientEmail: r.client?.email || '',
            registrationId: r.client?.registration_id || '',
            bankInfo: bank ? {
              accountHolderName: bank.account_holder_name,
              bankName: bank.bank_name,
              accountNumberMasked: bank.account_number_masked,
              ifscCode: bank.ifsc_code,
            } : null,
            planRequestId: r.plan_request_id,
            planName: r.planRequest?.plan_name || null,
            planRequestNumber: r.planRequest?.request_number || null,
            planDealAmountPaise: r.planRequest?.deal_amount ? Number(r.planRequest.deal_amount) : null,
            requestType: r.request_type,
            payoutDate: r.payout_date || (r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : null),
            amountPaise: Number(r.amount_paise),
            approvedAmountPaise: r.approved_amount_paise !== null ? Number(r.approved_amount_paise) : null,
            paymentMode: r.payment_mode,
            clientReference: r.client_reference,
            clientNotes: r.client_notes,
            status: r.status,
            adminTransactionRef: r.admin_transaction_ref,
            adminNotes: r.admin_notes,
            hasOpenIssue: Boolean(r.has_open_issue),
            issueMessages: normalizeMessages(r.issue_messages),
            processedByName: r.processor ? `${r.processor.first_name} ${r.processor.last_name}` : null,
            processedAt: r.processed_at,
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

// ── Admin / Employee: Update payment request status (auto-syncs DailyPayout when paid) ──
exports.updatePaymentRequestStatus = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { status, approvedAmountINR, adminTransactionRef, adminNotes, replyMessage, resolveIssue } = req.body
    const record = await PaymentRequest.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: ClientPlanRequest, as: 'planRequest' },
      ],
      transaction: t,
    })
    if (!record) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Payment request not found' })
    }

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId }, transaction: t })
      if (!emp || record.client?.originating_employee_id !== emp.id) {
        await t.rollback()
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    const updates = {
      processed_by: req.userId,
      processed_at: new Date(),
    }

    if (status) updates.status = status

    let finalPaidPaise = record.approved_amount_paise || record.amount_paise
    if (approvedAmountINR !== undefined && approvedAmountINR !== null && approvedAmountINR !== '') {
      const amt = Number(approvedAmountINR)
      if (!Number.isFinite(amt) || amt < 0) {
        await t.rollback()
        return res.status(422).json({ success: false, message: 'Invalid approved amount' })
      }
      finalPaidPaise = Math.round(amt * 100)
      updates.approved_amount_paise = finalPaidPaise
    } else if (status === 'paid' && !record.approved_amount_paise) {
      finalPaidPaise = record.amount_paise
      updates.approved_amount_paise = record.amount_paise
    }

    if (adminTransactionRef !== undefined) updates.admin_transaction_ref = adminTransactionRef?.trim() || null
    if (adminNotes !== undefined) updates.admin_notes = adminNotes?.trim() || null

    const messages = normalizeMessages(record.issue_messages)
    const adminName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin'

    if (replyMessage?.trim()) {
      messages.push({
        sender: 'admin',
        senderName: adminName,
        message: replyMessage.trim(),
        createdAt: new Date().toISOString(),
      })
      updates.issue_messages = messages
    }

    if (resolveIssue === true || status === 'paid' || replyMessage?.trim()) {
      updates.has_open_issue = false
    }

    await record.update(updates, { transaction: t })

    // Connectivity: Automatically sync DailyPayout when Admin marks payout request as PAID
    if ((status === 'paid' || record.status === 'paid') && record.plan_request_id && record.request_type === 'payout_request') {
      const payoutDate = record.payout_date || (record.created_at ? new Date(record.created_at).toISOString().slice(0, 10) : todayISO())
      const planReq = record.planRequest || await ClientPlanRequest.findByPk(record.plan_request_id, { transaction: t })
      if (planReq) {
        const [payout, created] = await DailyPayout.findOrCreate({
          where: { plan_request_id: planReq.id, payout_date: payoutDate },
          defaults: {
            client_id:             planReq.client_id,
            assigned_employee_id:  planReq.assigned_employee_id,
            amount:                finalPaidPaise,
            marked_by:             req.userId,
            notes:                 updates.admin_notes || `Paid via request ${record.request_number}`,
            transaction_reference: updates.admin_transaction_ref || record.admin_transaction_ref || null,
            payment_method:        record.payment_mode || 'bank_transfer',
          },
          transaction: t,
        })
        if (!created) {
          await payout.update({
            amount:                finalPaidPaise,
            marked_by:             req.userId,
            notes:                 updates.admin_notes || payout.notes,
            transaction_reference: updates.admin_transaction_ref || payout.transaction_reference,
            payment_method:        record.payment_mode || payout.payment_method,
          }, { transaction: t })
        }
      }
    }

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      status ? `CLIENT_PAYMENT_REQUEST_${status.toUpperCase()}` : 'CLIENT_PAYMENT_ISSUE_REPLIED',
      entityType:  'payment_request',
      entityId:    record.id,
      metadata:    { requestNumber: record.request_number, status: updates.status || record.status, adminTransactionRef },
      req,
    })

    res.json({
      success: true,
      message: status ? `Payment request marked as ${status}` : 'Reply sent to client',
      data: {
        status: updates.status || record.status,
        id: record.id,
        hasOpenIssue: updates.has_open_issue !== undefined ? updates.has_open_issue : record.has_open_issue,
        issueMessages: updates.issue_messages || messages,
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
