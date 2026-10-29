import React, { useEffect, useState } from 'react'
import { Plus, RefreshCw, Copy, CheckCircle2, XCircle, AlertCircle, Link2 } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

export default function RegistrationLinksPage() {
  const { token } = useTrading()
  const [links, setLinks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newLink, setNewLink]   = useState(null)
  const [copied, setCopied]     = useState(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Config for new link
  const [expiryDays, setExpiryDays] = useState(30)
  const [maxUses, setMaxUses]       = useState(1)
  const [label, setLabel]           = useState('')

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await api.admin.registrationLinks.list(token, `page=${page}&pageSize=20`)
      setLinks(res.data.links)
      setTotalPages(res.data.pagination.pages)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLinks() }, [page])

  const handleGenerate = async () => {
    setGenerating(true)
    setNewLink(null)
    try {
      const res = await api.admin.registrationLinks.create({ expiryDays, maxUses, label }, token)
      setNewLink(res.data)
      fetchLinks()
    } catch (err) {
      alert(err.message || 'Failed to generate link')
    } finally { setGenerating(false) }
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this link? Existing clients already registered will not be affected.')) return
    try {
      await api.admin.registrationLinks.revoke(id, token)
      setLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'revoked' } : l))
    } catch (err) {
      alert(err.message || 'Failed to revoke')
    }
  }

  const copy = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusColor = (s) => ({ active: 'emerald', revoked: 'red', expired: 'amber' }[s] || 'gray')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Registration Links</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate secure client registration links</p>
        </div>
      </div>

      {/* Generator card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-emerald-400" /> Generate New Link
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Expiry (days)</label>
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
            >
              {[7, 14, 30, 60, 90].map(d => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Max Uses</label>
            <select
              value={maxUses}
              onChange={e => setMaxUses(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
            >
              {[1, 2, 5, 10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'use' : 'uses'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Label (optional)</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Surat batch Oct"
              maxLength={100}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <Button loading={generating} onClick={handleGenerate}>
          <Plus className="h-4 w-4" /> Generate Link
        </Button>

        {/* Newly generated link */}
        {newLink && (
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-2">✓ Link generated — copy it now (shown once)</p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2.5">
              <code className="flex-1 text-xs text-gray-200 break-all">{newLink.registrationUrl}</code>
              <button
                onClick={() => copy(newLink.registrationUrl, 'new')}
                className="shrink-0 text-gray-400 hover:text-emerald-400 transition-colors ml-2"
                title="Copy URL"
              >
                {copied === 'new' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Expires: {new Date(newLink.expiresAt).toLocaleDateString('en-IN')} · Max uses: {newLink.maxUses}
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              ⚠ The raw token is shown only at generation time. It cannot be recovered later.
            </p>
          </div>
        )}
      </div>

      {/* Links table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <p className="text-sm font-medium text-white">All Links</p>
          <Button variant="secondary" size="sm" onClick={fetchLinks}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Uses</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : links.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">No links generated yet</td></tr>
              ) : links.map(link => (
                <tr key={link.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-gray-300">{link.label || <span className="text-gray-600 italic">unlabelled</span>}</td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-emerald-400 text-xs">{link.employeeCode}</p>
                    <p className="text-xs text-gray-500">{link.employeeName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor(link.status)}>{link.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{link.usageCount} / {link.maxUses}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {link.status === 'active' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRevoke(link.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
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
    </div>
  )
}
