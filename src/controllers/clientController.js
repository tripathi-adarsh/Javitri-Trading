'use strict'
const crypto  = require('crypto')
const { Op }  = require('sequelize')
const { sequelize, Client, ClientKYC, ClientBankAccount, Employee, RegistrationLink, User } = require('../models/index')
const { encrypt, maskPan, maskAccountNumber } = require('../utils/encryption')
const { audit } = require('../utils/auditLogger')

/**
 * Generate a human-readable registration ID.
 * Format: JVT-YYYYMMDD-XXXXXX (e.g. JVT-20261019-A3F9C2)
 */
function generateRegistrationId () {
  const date = new Date()
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `JVT-${yyyymmdd}-${rand}`
}

/**
 * Hash a raw token (same function used in registrationLinkController).
 */
function hashToken (raw) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

// ── Register a new client via an employee link (public route) ─────────────────

exports.registerClient = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      // Step 1 — Personal info
      fullName, mobile, email, addressLine, city, state, postalCode, country,
      // Step 2 — KYC (optional at registration stage)
      pan,
      // Step 3 — Bank (optional at registration stage)
      accountHolderName, bankName, accountNumber, confirmAccountNumber, ifscCode,
      // Step 4 — Deal info
      clientType, selectedPlanId, selectedPlanSlug, intendedDealAmount,
      // Registration link token (from URL)
      registrationToken,
    } = req.body

    // ── 1. Validate registration link token ───────────────────────────────────
    let linkId        = null
    let employeeId    = null

    if (registrationToken) {
      const tokenHash = hashToken(registrationToken)
      const link = await RegistrationLink.findOne({
        where: { token_hash: tokenHash, status: 'active' },
        transaction: t,
        lock: t.LOCK.UPDATE,
        include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }],
      })

      if (!link) {
        await t.rollback()
        return res.status(400).json({ success: false, message: 'Invalid or expired registration link' })
      }
      if (link.expires_at < new Date()) {
        await t.rollback()
        return res.status(410).json({ success: false, message: 'Registration link has expired' })
      }
      if (link.usage_count >= link.max_uses) {
        await t.rollback()
        return res.status(410).json({ success: false, message: 'Registration link has reached its maximum usage' })
      }
      // Check employee is still active
      const empUser = await User.findByPk(link.employee?.user_id, { transaction: t })
      if (!empUser || !empUser.is_active) {
        await t.rollback()
        return res.status(410).json({ success: false, message: 'This registration link is no longer valid' })
      }

      linkId     = link.id
      employeeId = link.employee_id

      // Increment usage count
      await link.increment('usage_count', { transaction: t })
      // If max uses reached, mark expired
      if (link.usage_count + 1 >= link.max_uses) {
        await link.update({ status: 'expired' }, { transaction: t })
      }
    }

    // ── 2. Check for duplicate client (email or mobile) ───────────────────────
    const [byEmail, byMobile] = await Promise.all([
      Client.findOne({ where: { email: email.toLowerCase().trim() }, transaction: t }),
      Client.findOne({ where: { mobile: mobile.trim() },             transaction: t }),
    ])
    if (byEmail)  { await t.rollback(); return res.status(409).json({ success: false, message: 'Email already registered' }) }
    if (byMobile) { await t.rollback(); return res.status(409).json({ success: false, message: 'Mobile number already registered' }) }

    // ── 3. Create client record ───────────────────────────────────────────────
    const registrationId = generateRegistrationId()

    const client = await Client.create({
      registration_id:         registrationId,
      originating_employee_id: employeeId,
      registration_link_id:    linkId,
      full_name:               fullName.trim(),
      mobile:                  mobile.trim(),
      email:                   email.toLowerCase().trim(),
      address_line:            addressLine?.trim() || null,
      city:                    city.trim(),
      state:                   state.trim(),
      postal_code:             postalCode.trim(),
      country:                 country || 'India',
      client_type:             clientType || 'individual',
      status:                  'pending_kyc',
    }, { transaction: t })

    // ── 4. KYC record (if PAN provided) ──────────────────────────────────────
    if (pan && pan.trim()) {
      const cleanPan = pan.trim().toUpperCase()
      let encryptedPan = null
      let panMasked    = maskPan(cleanPan)

      // Only encrypt if KYC_ENCRYPTION_KEY is configured
      if (process.env.KYC_ENCRYPTION_KEY && process.env.KYC_ENCRYPTION_KEY.length === 64) {
        try {
          const { encrypt: enc } = require('../utils/encryption')
          encryptedPan = enc(cleanPan)
        } catch { /* will store null */ }
      }

      await ClientKYC.create({
        client_id:           client.id,
        encrypted_pan:       encryptedPan,
        pan_masked:          panMasked,
        verification_status: 'submitted',
      }, { transaction: t })

      await client.update({ status: 'kyc_submitted' }, { transaction: t })
    } else {
      // Create empty KYC record placeholder
      await ClientKYC.create({
        client_id:           client.id,
        verification_status: 'not_started',
      }, { transaction: t })
    }

    // ── 5. Bank account (if provided) ────────────────────────────────────────
    if (accountNumber && bankName && ifscCode) {
      if (accountNumber !== confirmAccountNumber) {
        await t.rollback()
        return res.status(422).json({ success: false, message: 'Account numbers do not match' })
      }

      const cleanAccNum = accountNumber.replace(/\s/g, '')
      let encryptedAcc  = null

      if (process.env.KYC_ENCRYPTION_KEY && process.env.KYC_ENCRYPTION_KEY.length === 64) {
        try {
          const { encrypt: enc } = require('../utils/encryption')
          encryptedAcc = enc(cleanAccNum)
        } catch { /* skip if encryption not configured */ }
      }

      if (encryptedAcc) {
        await ClientBankAccount.create({
          client_id:                client.id,
          account_holder_name:      accountHolderName?.trim() || fullName.trim(),
          bank_name:                bankName.trim(),
          encrypted_account_number: encryptedAcc,
          account_number_masked:    maskAccountNumber(cleanAccNum),
          ifsc_code:                ifscCode.trim().toUpperCase(),
          is_primary:               true,
          verification_status:      'unverified',
        }, { transaction: t })
      }
    }

    await t.commit()

    await audit({
      actorUserId: null,   // public route — no logged-in actor
      action:      'CLIENT_REGISTERED',
      entityType:  'client',
      entityId:    client.id,
      metadata:    { registrationId, employeeId, linkId },
      req,
    })

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        registrationId:  client.registration_id,
        clientId:        client.id,
        status:          client.status,
        // Safe to display: name, registrationId
        // Do NOT include PAN, bank details, encrypted values
      },
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

// ── List clients (admin / employee) ─────────────────────────────────────────

exports.listClients = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize
    const { status, employeeId: queryEmpId } = req.query

    const where = {}
    if (status) where.status = status

    // Employees can only see their own clients
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp) return res.status(403).json({ success: false, message: 'No employee profile found' })
      where.originating_employee_id = emp.id
    } else if (queryEmpId) {
      where.originating_employee_id = queryEmpId
    }

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: [
        { model: ClientKYC, as: 'kyc', attributes: ['verification_status', 'pan_masked'] },
        {
          model: Employee, as: 'originatingEmployee',
          attributes: ['employee_code'],
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
        },
      ],
      limit:   pageSize,
      offset,
      order:   [['created_at', 'DESC']],
      attributes: { exclude: [] },   // all safe columns
    })

    res.json({
      success: true,
      data: {
        clients: rows.map(c => ({
          id:              c.id,
          registrationId:  c.registration_id,
          fullName:        c.full_name,
          mobile:          c.mobile,
          email:           c.email,
          city:            c.city,
          state:           c.state,
          clientType:      c.client_type,
          status:          c.status,
          kycStatus:       c.kyc?.verification_status || 'not_started',
          panMasked:       c.kyc?.pan_masked || null,
          employeeCode:    c.originatingEmployee?.employee_code || null,
          employeeName:    c.originatingEmployee?.user
            ? `${c.originatingEmployee.user.first_name} ${c.originatingEmployee.user.last_name}`
            : null,
          createdAt:       c.created_at,
        })),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single client ─────────────────────────────────────────────────────────

exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: ClientKYC, as: 'kyc', attributes: { exclude: ['encrypted_pan', 'encrypted_identity_reference'] } },
        { model: ClientBankAccount, as: 'bankAccounts', attributes: { exclude: ['encrypted_account_number'] } },
        {
          model: Employee, as: 'originatingEmployee',
          attributes: ['employee_code'],
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }],
        },
      ],
    })
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })

    // Employees can only see their own clients
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || client.originating_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    res.json({ success: true, data: { client } })
  } catch (err) {
    next(err)
  }
}

// ── Update KYC status (admin only) ────────────────────────────────────────────

exports.updateKycStatus = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { status, rejectionReason } = req.body
    const allowed = ['in_review', 'verified', 'rejected']
    if (!allowed.includes(status)) {
      await t.rollback()
      return res.status(422).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` })
    }
    if (status === 'rejected' && !rejectionReason?.trim()) {
      await t.rollback()
      return res.status(422).json({ success: false, message: 'rejectionReason required when rejecting' })
    }

    const client = await Client.findByPk(req.params.id, { transaction: t })
    if (!client) { await t.rollback(); return res.status(404).json({ success: false, message: 'Client not found' }) }

    const kyc = await ClientKYC.findOne({ where: { client_id: client.id }, transaction: t, lock: t.LOCK.UPDATE })
    if (!kyc) { await t.rollback(); return res.status(404).json({ success: false, message: 'KYC record not found' }) }

    await kyc.update({
      verification_status:   status,
      verified_by_user_id:   req.userId,
      verified_at:           status === 'verified' ? new Date() : null,
      rejection_reason:      status === 'rejected' ? rejectionReason.trim() : null,
    }, { transaction: t })

    // Update client status accordingly
    const clientStatus = status === 'verified' ? 'active' : (status === 'rejected' ? 'rejected' : client.status)
    await client.update({ status: clientStatus, reviewed_by_user_id: req.userId, reviewed_at: new Date() }, { transaction: t })

    await t.commit()

    await audit({
      actorUserId: req.userId,
      action:      `KYC_${status.toUpperCase()}`,
      entityType:  'client',
      entityId:    client.id,
      metadata:    { registrationId: client.registration_id, kycStatus: status },
      req,
    })

    res.json({ success: true, message: `KYC status updated to ${status}`, data: { kycStatus: status } })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
