'use strict'
const multer = require('multer')
const path   = require('path')
const crypto = require('crypto')
const fs     = require('fs')

// Ensure upload directory exists
const KYC_UPLOAD_DIR = path.join(__dirname, '../../uploads/kyc')
if (!fs.existsSync(KYC_UPLOAD_DIR)) {
  fs.mkdirSync(KYC_UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, KYC_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Random hex name to avoid enumeration; keep original extension
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg'
    const name = `${crypto.randomBytes(16).toString('hex')}${ext}`
    cb(null, name)
  },
})

function fileFilter (_req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (allowed.includes(file.mimetype)) return cb(null, true)
  cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, PDF`))
}

/** Multer instance — max 5 MB per file */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
})

/**
 * Middleware: accept fields aadhaarImage, aadhaarBackImage, panImage, passbookImage (each single file).
 */
const kycDocumentUpload = upload.fields([
  { name: 'aadhaarImage',     maxCount: 1 },
  { name: 'aadhaarBackImage', maxCount: 1 },
  { name: 'panImage',         maxCount: 1 },
  { name: 'passbookImage',    maxCount: 1 },
])

module.exports = { kycDocumentUpload, KYC_UPLOAD_DIR }
