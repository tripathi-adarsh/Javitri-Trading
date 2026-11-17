import { useEffect, useState } from 'react'
import { RefreshCw, MessageSquare, Mail, Phone, Clock, CheckCheck, Archive, Trash2, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const STATUS_COLOR = { new: 'amber', read: 'blue', archived: 'gray' }

function MessageModal({ msg, token, onClose, onUpdated }) {
  const [notes, setNotes] = useState(msg.adminNotes || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const updateStatus = async (status) => {
    setSaving(true)
    try {
      await api.admin.contact.update(msg.id, { status, adminNotes: notes || undefined }, token)
      onUpdated()
      onClose()
    } catch (e) { alert(e.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      await api.admin.contact.update(msg.id, { adminNotes: notes }, token)
      onUpdated()
    } catch (e) { alert(e.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const deleteMsg = async () => {
    if (!window.confirm('Delete this message permanently?')) return
    setDeleting(true)
    try {
      await api.admin.contact.delete(msg.id, token)
      onUpdated()
      onClose()
    } catch (e) { alert(e.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <p className="font-semibold text-white">{msg.name}</p>
            <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={STATUS_COLOR[msg.status] || 'gray'}>{msg.status}</Badge>
            <button onClick={onClose}
              className="h-7 w-7 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <a href={`mailto:${msg.email}`} className="text-blue-400 hover:underline truncate">{msg.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <a href={`tel:${msg.phone}`} className="text-green-400 hover:underline">{msg.phone}</a>
            </div>
          </div>

          {/* Message */}
          <div className="rounded-xl p-4 bg-gray-800/60 border border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Admin Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes…"
              className="w-full rounded-xl px-3 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button onClick={saveNotes} disabled={saving}
              className="mt-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {msg.status !== 'read' && (
              <button onClick={() => updateStatus('read')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                <CheckCheck className="h-3.5 w-3.5" /> Mark Read
              </button>
            )}
            {msg.status !== 'archived' && (
              <button onClick={() => updateStatus('archived')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', color: '#9ca3af' }}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            )}
            {msg.status === 'archived' && (
              <button onClick={() => updateStatus('read')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                Unarchive
              </button>
            )}
            <button onClick={deleteMsg} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ml-auto"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactMessagesPage() {
  const { token } = useTrading()
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [selected, setSelected]   = useState(null)
  const [stats, setStats]         = useState(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('status', filter)
      const res = await api.admin.contact.list(token, params.toString())
      setMessages(res.data.messages || [])
      setTotalPages(res.data.pagination.pages || 1)
      setTotal(res.data.pagination.total || 0)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const res = await api.admin.contact.stats(token)
      setStats(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchMessages(); fetchStats() }, [page, filter])

  const openMessage = async (msg) => {
    // Fetch full detail (which also marks it read)
    try {
      const res = await api.admin.contact.get(msg.id, token)
      setSelected(res.data)
    } catch {
      setSelected(msg)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total
            {stats?.new > 0 && <span className="ml-2 text-amber-400 font-medium">· {stats.new} new</span>}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => { fetchMessages(); fetchStats() }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, color: '#d4a843' },
            { label: 'New', value: stats.new, color: '#fbbf24' },
            { label: 'Read', value: stats.read, color: '#60a5fa' },
            { label: 'Archived', value: stats.archived, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 bg-gray-900/60 border border-gray-800">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { val: 'all',      label: 'All' },
          { val: 'new',      label: '🔔 New' },
          { val: 'read',     label: '✓ Read' },
          { val: 'archived', label: 'Archived' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === val ? 'rgba(212,168,67,0.2)' : 'rgba(31,41,55,0.5)',
              border: filter === val ? '1px solid rgba(212,168,67,0.5)' : '1px solid rgba(55,65,81,0.8)',
              color: filter === val ? '#d4a843' : '#9ca3af',
              cursor: 'pointer',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                {['Name', 'Contact', 'Message Preview', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm text-gray-500">No messages found</p>
                  </td>
                </tr>
              ) : messages.map(msg => (
                <tr key={msg.id}
                  className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => openMessage(msg)}>
                  <td className="px-4 py-3">
                    <p className={`font-medium ${msg.status === 'new' ? 'text-white' : 'text-gray-300'}`}>
                      {msg.status === 'new' && <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 mb-0.5" />}
                      {msg.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-400 text-xs">{msg.email}</p>
                    <p className="text-gray-500 text-xs">{msg.phone}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-gray-400 text-xs truncate">{msg.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLOR[msg.status] || 'gray'}>{msg.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); openMessage(msg) }}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', color: '#d4a843' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      {selected && (
        <MessageModal
          msg={selected}
          token={token}
          onClose={() => setSelected(null)}
          onUpdated={() => { fetchMessages(); fetchStats(); setSelected(null) }}
        />
      )}
    </div>
  )
}
