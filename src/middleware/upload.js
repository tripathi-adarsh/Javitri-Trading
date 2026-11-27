'use strict'
const multer = require('multer')
const path   = require('path')
const crypto = require('crypto')
const fs     = require('fs')

// Use UPLOAD_DIR env var if configured (recommended outside repo on Hostinger),
// otherwise fallback to local uploads/kyc.
const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads')

const KYC_UPLOAD_DIR = BASE_UPLOAD_DIR.endsWith(`${path.sep}kyc`) || BASE_UPLOAD_DIR.endsWith('/kyc')
  ? BASE_UPLOAD_DIR
  : path.join(BASE_UPLOAD_DIR, 'kyc')

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

/**
 * Saves a persistent copy of an uploaded Multer file to MySQL (kyc_document_files)
 * so files survive GitHub / Hostinger redeployments that wipe local uploads/.
 */
async function persistUploadedFile (file) {
  if (!file || !file.filename || !file.path) return null
  try {
    const { KycDocumentFile } = require('../models/index')
    const buffer = await fs.promises.readFile(file.path)
    await KycDocumentFile.upsert({
      filename:   file.filename,
      mime_type:  file.mimetype || 'application/octet-stream',
      size_bytes: file.size || buffer.length,
      data:       buffer,
    })
  } catch (err) {
    // Do not fail upload if DB packet limit rejects a large binary; disk copy still works
    console.warn('[UPLOAD] Persistent DB backup warning:', err.message)
  }
  return file.filename
}

/**
 * Removes an old KYC file from both disk and persistent DB backup.
 */
async function removeStoredKycFile (storedPath) {
  if (!storedPath) return
  const filename = path.basename(storedPath)
  const candidates = [
    path.resolve(storedPath),
    path.resolve(KYC_UPLOAD_DIR, filename),
  ]
  for (const p of candidates) {
    if (p.startsWith(path.resolve(KYC_UPLOAD_DIR)) && fs.existsSync(p)) {
      try { fs.unlinkSync(p) } catch {}
    }
  }
  try {
    const { KycDocumentFile } = require('../models/index')
    await KycDocumentFile.destroy({ where: { filename } })
  } catch {}
}

/**
 * Resolves a stored KYC file (supports both portable filenames and legacy absolute paths).
 * Checks disk first; if missing (e.g. after redeploy), falls back to MySQL kyc_document_files
 * and restores the disk cache automatically.
 */
async function resolveAndServeKycFile (storedPath, res) {
  const filename = path.basename(storedPath)
  const resolvedDir = path.resolve(KYC_UPLOAD_DIR)
  const targetOnDisk = path.resolve(KYC_UPLOAD_DIR, filename)

  // Security: ensure path stays inside KYC_UPLOAD_DIR
  if (!targetOnDisk.startsWith(resolvedDir)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  // 1. Check current KYC_UPLOAD_DIR (and exact storedPath if inside resolvedDir)
  if (fs.existsSync(targetOnDisk)) {
    return res.sendFile(targetOnDisk)
  }
  const exactResolved = path.resolve(storedPath)
  if (exactResolved.startsWith(resolvedDir) && fs.existsSync(exactResolved)) {
    return res.sendFile(exactResolved)
  }

  // 2. Fallback to persistent MySQL backup
  try {
    const { KycDocumentFile } = require('../models/index')
    const record = await KycDocumentFile.findOne({ where: { filename } })
    if (record && record.data) {
      // Restore onto disk cache (best-effort)
      try {
        if (!fs.existsSync(resolvedDir)) fs.mkdirSync(resolvedDir, { recursive: true })
        await fs.promises.writeFile(targetOnDisk, record.data)
      } catch {}

      res.setHeader('Content-Type', record.mime_type || 'application/octet-stream')
      return res.send(record.data)
    }
  } catch (err) {
    console.warn('[UPLOAD] DB fallback read failed:', err.message)
  }

  return res.status(404).json({ success: false, message: 'File not found on server' })
}

module.exports = {
  kycDocumentUpload,
  KYC_UPLOAD_DIR,
  persistUploadedFile,
  removeStoredKycFile,
  resolveAndServeKycFile,
}
