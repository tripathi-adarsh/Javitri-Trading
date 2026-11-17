'use strict'
const path = require('path')
const fs   = require('fs')
const { User } = require('../models/index')
const { audit } = require('../utils/auditLogger')

// POST /api/v1/users/kyc-documents  — authenticated user uploads their own docs
exports.uploadUserKycDocuments = async (req, res, next) => {
  try {
    const files = req.files || {}
    if (!files.aadhaarImage && !files.panImage && !files.passbookImage) {
      return res.status(422).json({ success: false, message: 'No files uploaded' })
    }

    const user = await User.findByPk(req.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const updates = {}
    if (files.aadhaarImage?.[0]) {
      if (user.aadhaar_image_path) { try { fs.unlinkSync(user.aadhaar_image_path) } catch {} }
      updates.aadhaar_image_path = files.aadhaarImage[0].path
    }
    if (files.panImage?.[0]) {
      if (user.pan_image_path) { try { fs.unlinkSync(user.pan_image_path) } catch {} }
      updates.pan_image_path = files.panImage[0].path
    }
    if (files.passbookImage?.[0]) {
      if (user.passbook_image_path) { try { fs.unlinkSync(user.passbook_image_path) } catch {} }
      updates.passbook_image_path = files.passbookImage[0].path
    }

    await user.update(updates)

    await audit({
      actorUserId: req.userId,
      action:      'USER_KYC_DOCUMENTS_UPLOADED',
      entityType:  'user',
      entityId:    req.userId,
      metadata:    { fields: Object.keys(updates) },
      req,
    })

    res.json({
      success: true,
      message: 'KYC documents uploaded successfully',
      data: {
        hasAadhaar:  !!(user.aadhaar_image_path  || files.aadhaarImage),
        hasPan:      !!(user.pan_image_path       || files.panImage),
        hasPassbook: !!(user.passbook_image_path  || files.passbookImage),
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/users/kyc-documents/:docType  — serve image for logged-in user or admin
exports.getUserKycDocumentImage = async (req, res, next) => {
  try {
    const { docType } = req.params
    const allowed = ['aadhaar', 'pan', 'passbook']
    if (!allowed.includes(docType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' })
    }

    // User can view their own; admin can view any via /admin route
    const userId = req.query.userId && ['admin','super_admin'].includes(req.user?.role)
      ? req.query.userId
      : req.userId

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const fieldMap = {
      aadhaar:  user.aadhaar_image_path,
      pan:      user.pan_image_path,
      passbook: user.passbook_image_path,
    }
    const filePath = fieldMap[docType]
    if (!filePath) {
      return res.status(404).json({ success: false, message: `No ${docType} document uploaded` })
    }

    const { KYC_UPLOAD_DIR } = require('../middleware/upload')
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(KYC_UPLOAD_DIR))) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ success: false, message: 'File not found on server' })
    }

    res.sendFile(resolved)
  } catch (err) {
    next(err)
  }
}
