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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-white">
          <div>
            <p className="font-extrabold text-[#0f172a] text-base">{msg.name}</p>
            <p className="text-xs text-[#64748b]">{new Date(msg.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={STATUS_COLOR[msg.status] || 'gray'}>{msg.status}</Badge>
            <button onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0] transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#059669] shrink-0" />
              <a href={`mailto:${msg.email}`} className="text-[#059669] font-bold hover:underline truncate">{msg.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#059669] shrink-0" />
              <a href={`tel:${msg.phone}`} className="text-[#059669] font-bold hover:underline">{msg.phone}</a>
            </div>
          </div>

          {/* Message content */}
          <div className="rounded-xl p-4 bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">Enquiry Message</p>
            <p className="text-xs text-[#0f172a] whitespace-pre-wrap leading-relaxed font-medium">{msg.message}</p>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">Internal Response Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes on follow-up…"
              className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669] resize-none"
            />
            <button onClick={saveNotes} disabled={saving}
              className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] hover:bg-[#e2e8f0] transition-colors cursor-pointer disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-[#f1f5f9]">
            {msg.status !== 'read' && (
              <button onClick={() => updateStatus('read')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50">
                <CheckCheck className="h-3.5 w-3.5" /> Mark Read
              </button>
            )}
            {msg.status !== 'archived' && (
              <button onClick={() => updateStatus('archived')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-all cursor-pointer disabled:opacity-50">
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            )}
            {msg.status === 'archived' && (
              <button onClick={() => updateStatus('read')} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50">
                Unarchive
              </button>
            )}
            <button onClick={deleteMsg} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50 ml-auto">
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
    try {
      const res = await api.admin.contact.get(msg.id, token)
      setSelected(res.data)
    } catch {
      setSelected(msg)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Contact Messages & Enquiries</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            {total} total messages received
            {stats?.new > 0 && <span className="ml-2 text-[#059669] font-bold">· {stats.new} unread messages</span>}
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => { fetchMessages(); fetchStats() }}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Messages', value: stats.total, color: '#0f172a' },
            { label: 'Unread (New)',   value: stats.new,   color: '#059669' },
            { label: 'Read Messages',  value: stats.read,  color: '#1a3c8f' },
            { label: 'Archived',       value: stats.archived, color: '#64748b' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 bg-white border border-[#e2e8f0] shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{s.label}</p>
              <p className="text-2xl font-extrabold mt-1 tracking-tight" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white p-2.5 rounded-2xl border border-[#e2e8f0] shadow-xs flex-wrap">
        {[
          { val: 'all',      label: 'All Enquiries' },
          { val: 'new',      label: '🔔 Unread (New)' },
          { val: 'read',     label: '✓ Read' },
          { val: 'archived', label: 'Archived' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === val
                ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] border border-transparent'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Sender Name</th>
                <th className="py-3.5 px-6">Contact Info</th>
                <th className="py-3.5 px-6">Message Preview</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Received Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#94a3b8] opacity-50" />
                    <p className="text-sm font-bold text-[#0f172a]">No messages found</p>
                  </td>
                </tr>
              ) : messages.map(msg => (
                <tr key={msg.id}
                  className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  onClick={() => openMessage(msg)}>
                  <td className="py-4 px-6">
                    <p className={`font-bold text-sm ${msg.status === 'new' ? 'text-[#0f172a]' : 'text-[#334155]'}`}>
                      {msg.status === 'new' && <span className="inline-block w-2 h-2 rounded-full bg-[#059669] mr-2 mb-0.5" />}
                      {msg.name}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[#0f172a] font-medium">{msg.email}</p>
                    <p className="text-[11px] text-[#64748b]">{msg.phone}</p>
                  </td>
                  <td className="py-4 px-6 max-w-[240px]">
                    <p className="text-[#475569] font-medium truncate">{msg.message}</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={STATUS_COLOR[msg.status] || 'gray'}>{msg.status}</Badge>
                  </td>
                  <td className="py-4 px-6 text-[#64748b] whitespace-nowrap font-medium">
                    {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); openMessage(msg) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f8fafc] text-[#059669] border border-[#e2e8f0] hover:bg-emerald-50 transition-colors cursor-pointer">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs font-bold text-[#64748b]">Page {page} of {totalPages}</span>
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
