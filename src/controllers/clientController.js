'use strict'
const crypto  = require('crypto')
const path    = require('path')
const fs      = require('fs')
const { Op }  = require('sequelize')
const { sequelize, Client, ClientKYC, ClientBankAccount, Employee, User } = require('../models/index')
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

// ── Check if client already exists (public route) ────────────────────────────

exports.checkExistingClient = async (req, res, next) => {
  try {
    const { mobile, email } = req.body
    if (!mobile && !email) {
      return res.status(422).json({ success: false, message: 'mobile or email required' })
    }

    const { Op } = require('sequelize')
    const where = []
    if (mobile) where.push({ mobile: mobile.trim() })
    if (email)  where.push({ email: email.toLowerCase().trim() })

    const client = await Client.findOne({ where: { [Op.or]: where } })

    if (!client) {
      return res.json({ success: true, exists: false })
    }

    return res.json({
      success: true,
      exists:  true,
      data: {
        clientId:       client.id,
        registrationId: client.registration_id,
        fullName:       client.full_name,
        status:         client.status,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Register a new client via an employee link (public route) ─────────────────

exports.registerClient = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const {
      fullName, mobile, email, addressLine, city, state, postalCode, country,
      pan,
      accountHolderName, bankName, accountNumber, confirmAccountNumber, ifscCode,
      clientType,
    } = req.body

    // ── 1. Auto-assign employee via round-robin ───────────────────────────────
    let employeeId = null
    const employees = await Employee.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true }, attributes: ['id'] }],
      transaction: t,
    })
    if (employees.length > 0) {
      const { ClientPlanRequest } = require('../models/index')
      const counts = await Promise.all(employees.map(async emp => {
        const count = await ClientPlanRequest.count({
          where: { assigned_employee_id: emp.id },
          transaction: t,
        })
        return { emp, count }
      }))
      counts.sort((a, b) => a.count - b.count)
      employeeId = counts[0].emp.id
    }

    // ── 2. Check for duplicate client (email or mobile) ───────────────────────
    const [byEmail, byMobile] = await Promise.all([
      Client.findOne({ where: { email: email.toLowerCase().trim() }, transaction: t }),
      Client.findOne({ where: { mobile: mobile.trim() },             transaction: t }),
    ])

    // If client already exists (same mobile or email), skip creating new record
    // and return existing clientId so documents/plans can still be added
    const existingClient = byEmail || byMobile
    if (existingClient) {
      await t.rollback()
      return res.status(200).json({
        success:  true,
        message:  'Client already registered — returning existing record',
        existing: true,
        data: {
          registrationId: existingClient.registration_id,
          clientId:       existingClient.id,
          status:         existingClient.status,
        },
      })
    }

    // ── 3. Create client record ───────────────────────────────────────────────
    const registrationId = generateRegistrationId()

    const client = await Client.create({
      registration_id:         registrationId,
      originating_employee_id: employeeId,
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

      // Build nominee fields from request body
      const nomineeName     = req.body.nomineeName || null
      const nomineeRelation = req.body.nomineeRelation || null
      const nomineeMobile   = req.body.nomineeMobile || null

      await ClientKYC.create({
        client_id:           client.id,
        encrypted_pan:       encryptedPan,
        pan_masked:          panMasked,
        verification_status: 'submitted',
        nominee_name:        nomineeName,
        nominee_relation:    nomineeRelation,
        nominee_mobile:      nomineeMobile,
      }, { transaction: t })

      await client.update({ status: 'kyc_submitted' }, { transaction: t })
    } else {
      // Create empty KYC record placeholder (with nominee info if provided)
      const nomineeName     = req.body.nomineeName || null
      const nomineeRelation = req.body.nomineeRelation || null
      const nomineeMobile   = req.body.nomineeMobile || null

      await ClientKYC.create({
        client_id:           client.id,
        verification_status: 'not_started',
        nominee_name:        nomineeName,
        nominee_relation:    nomineeRelation,
        nominee_mobile:      nomineeMobile,
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

    // ── 6. Auto-create plan request if plan slug is provided ───────────────
    if (req.body.selectedPlanSlug) {
      const { ClientPlanRequest } = require('../models/index')
      const crypto = require('crypto')

      // Generate unique request number
      function genReqNum() {
        const d = new Date()
        const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
        return `REQ-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
      }

      // Round-robin assignment is already done above — re-use same employee
      await ClientPlanRequest.create({
        request_number:       genReqNum(),
        client_id:            client.id,
        assigned_employee_id: employeeId,
        plan_slug:            req.body.selectedPlanSlug,
        plan_name:            req.body.selectedPlanName || req.body.selectedPlanSlug,
        deal_amount:          req.body.intendedDealAmount ? req.body.intendedDealAmount * 100 : null,
        daily_amount:         req.body.intendedDailyAmount ? req.body.intendedDailyAmount * 100 : null,
        payment_status:       'pending',
        status:               'pending',
      }, { transaction: t })
    }

    await t.commit()

    await audit({
      actorUserId: null,
      action:      'CLIENT_REGISTERED',
      entityType:  'client',
      entityId:    client.id,
      metadata:    { registrationId, employeeId },
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

    // Build safe client object — image paths are NOT included in the response;
    // the admin fetches images via the dedicated /kyc-documents/:docType route.
    const clientData = client.toJSON()
    if (clientData.kyc) {
      clientData.kyc.hasAadhaarImage     = !!client.kyc?.aadhaar_image_path
      clientData.kyc.hasAadhaarBackImage = !!client.kyc?.aadhaar_back_image_path
      clientData.kyc.hasPanImage         = !!client.kyc?.pan_image_path
      clientData.kyc.hasPassbookImage    = !!client.kyc?.passbook_image_path
      // Remove raw file paths from response
      delete clientData.kyc.aadhaar_image_path
      delete clientData.kyc.aadhaar_back_image_path
      delete clientData.kyc.pan_image_path
      delete clientData.kyc.passbook_image_path
    }

    res.json({ success: true, data: { client: clientData } })
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

// ── Assign client to employee (admin/super_admin only) ────────────────────────

exports.assignClient = async (req, res, next) => {
  try {
    const { employeeId } = req.body
    const client = await Client.findByPk(req.params.id)
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })

    let empRecord = null
    if (employeeId) {
      empRecord = await Employee.findByPk(employeeId, {
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'is_active'] }],
      })
      if (!empRecord) return res.status(404).json({ success: false, message: 'Employee not found' })
      if (!empRecord.user?.is_active) return res.status(422).json({ success: false, message: 'Employee is inactive' })
    }

    await client.update({ originating_employee_id: employeeId || null })

    await audit({
      actorUserId: req.userId,
      action:      'CLIENT_ASSIGNED',
      entityType:  'client',
      entityId:    client.id,
      metadata:    { employeeId: employeeId || null },
      req,
    })

    res.json({
      success: true,
      message: employeeId ? `Client assigned to ${empRecord.user.first_name} ${empRecord.user.last_name}` : 'Client unassigned',
      data: { employeeId: employeeId || null },
    })
  } catch (err) {
    next(err)
  }
}

// ── Upload KYC document images ─────────────────────────────────────────────────
// Called AFTER a client registers (by the client themselves via their clientId,
// or later by an admin). Files come via multipart/form-data processed by multer.

exports.uploadKycDocuments = async (req, res, next) => {
  try {
    const { id } = req.params
    const files  = req.files || {}

    const client = await Client.findByPk(id)
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })

    const kyc = await ClientKYC.findOne({ where: { client_id: id } })
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC record not found' })

    const updates = {}

    if (files.aadhaarImage?.[0]) {
      // Remove old file if exists
      if (kyc.aadhaar_image_path) {
        try { fs.unlinkSync(kyc.aadhaar_image_path) } catch {}
      }
      updates.aadhaar_image_path = files.aadhaarImage[0].path
    }
    if (files.aadhaarBackImage?.[0]) {
      if (kyc.aadhaar_back_image_path) {
        try { fs.unlinkSync(kyc.aadhaar_back_image_path) } catch {}
      }
      updates.aadhaar_back_image_path = files.aadhaarBackImage[0].path
    }
    if (files.panImage?.[0]) {
      if (kyc.pan_image_path) {
        try { fs.unlinkSync(kyc.pan_image_path) } catch {}
      }
      updates.pan_image_path = files.panImage[0].path
    }
    if (files.passbookImage?.[0]) {
      if (kyc.passbook_image_path) {
        try { fs.unlinkSync(kyc.passbook_image_path) } catch {}
      }
      updates.passbook_image_path = files.passbookImage[0].path
    }

    if (Object.keys(updates).length === 0) {
      return res.status(422).json({ success: false, message: 'No files uploaded' })
    }

    // If KYC was not_started and we now have documents, move it to submitted
    if (kyc.verification_status === 'not_started') {
      updates.verification_status = 'submitted'
      await client.update({ status: 'kyc_submitted' })
    }

    await kyc.update(updates)

    await audit({
      actorUserId: req.userId || null,
      action:      'KYC_DOCUMENTS_UPLOADED',
      entityType:  'client',
      entityId:    client.id,
      metadata:    {
        registrationId: client.registration_id,
        uploadedFields: Object.keys(updates).filter(k => k.endsWith('_path')),
      },
      req,
    })

    res.json({
      success: true,
      message: 'KYC documents uploaded successfully',
      data: {
        hasAadhaar:     !!kyc.aadhaar_image_path      || !!files.aadhaarImage,
        hasAadhaarBack: !!kyc.aadhaar_back_image_path || !!files.aadhaarBackImage,
        hasPan:         !!kyc.pan_image_path           || !!files.panImage,
        hasPassbook:    !!kyc.passbook_image_path      || !!files.passbookImage,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Serve a KYC document image (admin only) ────────────────────────────────────

exports.getKycDocumentImage = async (req, res, next) => {
  try {
    const { id, docType } = req.params
    const allowed = ['aadhaar', 'aadhaar-back', 'pan', 'passbook']
    if (!allowed.includes(docType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' })
    }

    const client = await Client.findByPk(id)
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })

    // Employees can only see their own clients
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.userId } })
      if (!emp || client.originating_employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
    }

    const kyc = await ClientKYC.findOne({ where: { client_id: id } })
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC record not found' })

    const fieldMap = {
      aadhaar:      kyc.aadhaar_image_path,
      'aadhaar-back': kyc.aadhaar_back_image_path,
      pan:          kyc.pan_image_path,
      passbook:     kyc.passbook_image_path,
    }
    const filePath = fieldMap[docType]
    if (!filePath) {
      return res.status(404).json({ success: false, message: `No ${docType} document uploaded` })
    }

    // Security: ensure the path is inside the uploads/kyc directory
    const { KYC_UPLOAD_DIR } = require('../middleware/upload')
    const resolvedPath = path.resolve(filePath)
    const resolvedDir  = path.resolve(KYC_UPLOAD_DIR)
    if (!resolvedPath.startsWith(resolvedDir)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' })
    }

    res.sendFile(resolvedPath)
  } catch (err) {
    next(err)
  }
}
