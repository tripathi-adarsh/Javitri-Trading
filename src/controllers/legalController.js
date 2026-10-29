'use strict'
const { LegalDocument } = require('../models/index')

// ── Get current published version (public) ────────────────────────────────────

exports.getCurrent = async (req, res, next) => {
  try {
    const { type } = req.params
    if (!['terms', 'privacy'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be terms or privacy' })
    }

    const doc = await LegalDocument.findOne({
      where: { type, status: 'published' },
      order: [['created_at', 'DESC']],
    })

    if (!doc) {
      return res.status(404).json({ success: false, message: `No published ${type} document found` })
    }

    res.json({
      success: true,
      data: {
        id:            doc.id,
        type:          doc.type,
        version:       doc.version,
        title:         doc.title,
        content:       doc.content,
        effectiveDate: doc.effective_date,
        status:        doc.status,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get all versions (admin) ──────────────────────────────────────────────────

exports.getAllVersions = async (req, res, next) => {
  try {
    const { type } = req.query
    const where = type ? { type } : {}
    const docs  = await LegalDocument.findAll({
      where,
      order:      [['created_at', 'DESC']],
      attributes: { exclude: ['content'] },
    })
    res.json({ success: true, data: { documents: docs } })
  } catch (err) {
    next(err)
  }
}

// ── Create new draft version (admin) ──────────────────────────────────────────

exports.createVersion = async (req, res, next) => {
  try {
    const { type, version, title, content, effectiveDate } = req.body

    const exists = await LegalDocument.findOne({ where: { type, version } })
    if (exists) {
      return res.status(409).json({ success: false, message: 'Version already exists' })
    }

    const doc = await LegalDocument.create({
      type,
      version,
      title,
      content,
      effective_date: effectiveDate,
      status:         'draft',
      published_by:   null,
    })

    res.status(201).json({ success: true, data: { document: doc } })
  } catch (err) {
    next(err)
  }
}

// ── Publish a draft version (admin) ───────────────────────────────────────────

exports.publishVersion = async (req, res, next) => {
  try {
    const doc = await LegalDocument.findByPk(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' })
    if (doc.status === 'published') {
      return res.status(400).json({ success: false, message: 'Already published' })
    }

    // Archive the currently published version
    await LegalDocument.update(
      { status: 'archived' },
      { where: { type: doc.type, status: 'published' } }
    )

    await doc.update({ status: 'published', published_by: req.userId })
    res.json({ success: true, data: { document: doc } })
  } catch (err) {
    next(err)
  }
}
