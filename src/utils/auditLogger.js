'use strict'
const { AuditLog } = require('../models/index')

/**
 * Write an audit log entry asynchronously.
 * Never throws — audit log failures must not break primary flows.
 *
 * @param {object} params
 * @param {string|null} params.actorUserId  - UUID of the acting user (null = system)
 * @param {string}      params.action       - Action constant e.g. 'USER_LOGIN'
 * @param {string|null} params.entityType   - e.g. 'user', 'employee', 'payment'
 * @param {string|null} params.entityId     - UUID of the affected entity
 * @param {object|null} params.metadata     - Safe context, NO secrets or full PII
 * @param {object|null} params.req          - Express request (for IP/UA extraction)
 */
async function audit ({ actorUserId = null, action, entityType = null, entityId = null, metadata = null, req = null } = {}) {
  try {
    await AuditLog.create({
      actor_user_id:      actorUserId,
      action,
      entity_type:        entityType,
      entity_id:          entityId,
      safe_metadata_json: metadata,
      ip_address:         req ? (req.ip || req.headers['x-forwarded-for'] || null) : null,
      user_agent:         req ? (req.headers['user-agent'] || '').slice(0, 500) : null,
    })
  } catch (err) {
    // Intentionally swallow — audit failures must not break the primary flow
    console.error('[AUDIT ERROR]', action, err.message)
  }
}

module.exports = { audit }
