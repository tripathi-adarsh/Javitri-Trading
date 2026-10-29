'use strict'
const crypto = require('crypto')

const ALGORITHM    = 'aes-256-gcm'
const IV_LENGTH    = 16   // bytes
const AUTH_TAG_LEN = 16   // bytes (128-bit)

/**
 * Get the 32-byte encryption key from environment.
 * KYC_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).
 * Throws if not configured — sensitive data must not be stored unencrypted.
 */
function getKey () {
  const hex = process.env.KYC_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('KYC_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Configure this in your .env file.')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in the format: <iv_hex>:<auth_tag_hex>:<ciphertext_base64>
 *
 * @param {string} plaintext
 * @returns {string}
 */
function encrypt (plaintext) {
  const key = getKey()
  const iv  = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LEN })
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const authTag   = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('base64')}`
}

/**
 * Decrypt a value encrypted by encrypt().
 * Returns the original plaintext string.
 *
 * @param {string} encryptedValue  format: <iv_hex>:<auth_tag_hex>:<ciphertext_base64>
 * @returns {string}
 */
function decrypt (encryptedValue) {
  if (!encryptedValue) return null
  const parts = encryptedValue.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted value format')
  const [ivHex, tagHex, cipherB64] = parts
  const key     = getKey()
  const iv      = Buffer.from(ivHex,  'hex')
  const authTag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(cipherB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LEN })
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Mask a PAN number for display: show first 5 chars + **** + last char
 * e.g. "ABCDE1234F" → "ABCDE****F"
 *
 * @param {string} pan
 * @returns {string}
 */
function maskPan (pan) {
  if (!pan || pan.length < 6) return '**********'
  return pan.slice(0, 5) + '****' + pan.slice(-1)
}

/**
 * Mask an account number: show only last 4 digits
 * e.g. "123456789012" → "XXXX XXXX 9012"
 *
 * @param {string} accountNumber
 * @returns {string}
 */
function maskAccountNumber (accountNumber) {
  if (!accountNumber) return 'XXXX XXXX XXXX'
  const cleaned = accountNumber.replace(/\s/g, '')
  const last4   = cleaned.slice(-4)
  const masked  = 'XXXX '.repeat(Math.max(0, Math.ceil((cleaned.length - 4) / 4))).trim()
  return `${masked} ${last4}`.trim()
}

module.exports = { encrypt, decrypt, maskPan, maskAccountNumber }
