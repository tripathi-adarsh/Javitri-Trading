'use strict'
const { ContactMessage } = require('../models/index')
const { audit } = require('../utils/auditLogger')

// ── Public: submit contact form ───────────────────────────────────────────────
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body

    if (!name || !name.trim() || name.trim().length < 2) {
      return res.status(422).json({ success: false, message: 'Name is required (min 2 characters)' })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ success: false, message: 'Valid email is required' })
    }
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(422).json({ success: false, message: 'Valid 10-digit Indian mobile number required' })
    }
    if (!message || !message.trim() || message.trim().length < 10) {
      return res.status(422).json({ success: false, message: 'Message must be at least 10 characters' })
    }

    const contactMsg = await ContactMessage.create({
      name:    name.trim().slice(0, 200),
      email:   email.toLowerCase().trim(),
      phone:   phone.trim(),
      message: message.trim(),
      status:  'new',
    })

    await audit({
      actorUserId: null,
      action:      'CONTACT_FORM_SUBMITTED',
      entityType:  'contact_message',
      entityId:    contactMsg.id,
      metadata:    { name: contactMsg.name, email: contactMsg.email },
      req,
    })

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you shortly.',
      data: { id: contactMsg.id },
    })
  } catch (err) {
    next(err)
  }
}

// ── Admin: list contact messages ──────────────────────────────────────────────
exports.listMessages = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20))
    const offset   = (page - 1) * pageSize
    const { status } = req.query

    const where = {}
    if (status && ['new', 'read', 'archived'].includes(status)) {
      where.status = status
    }

    const { count, rows } = await ContactMessage.findAndCountAll({
      where,
      limit:   pageSize,
      offset,
      order:   [['created_at', 'DESC']],
    })

    res.json({
      success: true,
      data: {
        messages: rows.map(m => ({
          id:        m.id,
          name:      m.name,
          email:     m.email,
          phone:     m.phone,
          message:   m.message,
          status:    m.status,
          adminNotes: m.admin_notes,
          createdAt: m.created_at,
        })),
        pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Admin: get single message ─────────────────────────────────────────────────
exports.getMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' })

    // Auto-mark as read when viewed
    if (msg.status === 'new') {
      await msg.update({ status: 'read' })
    }

    res.json({
      success: true,
      data: {
        id:         msg.id,
        name:       msg.name,
        email:      msg.email,
        phone:      msg.phone,
        message:    msg.message,
        status:     msg.status,
        adminNotes: msg.admin_notes,
        createdAt:  msg.created_at,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Admin: update message status / add notes ──────────────────────────────────
exports.updateMessage = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body
    const msg = await ContactMessage.findByPk(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' })

    const updates = {}
    if (status && ['new', 'read', 'archived'].includes(status)) {
      updates.status = status
    }
    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes || null
    }

    await msg.update(updates)

    await audit({
      actorUserId: req.userId,
      action:      'CONTACT_MESSAGE_UPDATED',
      entityType:  'contact_message',
      entityId:    msg.id,
      metadata:    updates,
      req,
    })

    res.json({
      success: true,
      message: 'Message updated',
      data: {
        id:         msg.id,
        status:     msg.status,
        adminNotes: msg.admin_notes,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Admin: delete message ──────────────────────────────────────────────────────
exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' })

    await msg.destroy()

    await audit({
      actorUserId: req.userId,
      action:      'CONTACT_MESSAGE_DELETED',
      entityType:  'contact_message',
      entityId:    msg.id,
      metadata:    { name: msg.name, email: msg.email },
      req,
    })

    res.json({ success: true, message: 'Message deleted' })
  } catch (err) {
    next(err)
  }
}

// ── Admin: get contact stats for dashboard ────────────────────────────────────
exports.getContactStats = async (req, res, next) => {
  try {
    const { Op } = require('sequelize')
    const total = await ContactMessage.count()
    const newCount = await ContactMessage.count({ where: { status: 'new' } })
    const readCount = await ContactMessage.count({ where: { status: 'read' } })
    const archivedCount = await ContactMessage.count({ where: { status: 'archived' } })

    res.json({
      success: true,
      data: { total, new: newCount, read: readCount, archived: archivedCount },
    })
  } catch (err) {
    next(err)
  }
}
