import React, { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

export default function KycReviewPage() {
  const { token } = useTrading()
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [decision, setDecision] = useState('')
  const [reason, setReason]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await api.admin.clients.list(token, 'status=kyc_submitted&pageSize=50')
      setClients(res.data.clients)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPending() }, [])

  const handleSubmit = async () => {
    if (!decision) { alert('Select a decision'); return }
    if (decision === 'rejected' && !reason.trim()) { alert('Rejection reason required'); return }
    setSubmitting(true)
    try {
      await api.admin.clients.updateKyc(selected.id, { status: decision, rejectionReason: reason }, token)
      setSelected(null)
      setDecision('')
      setReason('')
      fetchPending()
    } catch (err) {
      alert(err.message || 'Failed to submit')
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">KYC Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and verify submitted KYC records</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPending}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          KYC records contain sensitive identity information. Access is restricted to authorized personnel only.
          PAN numbers are masked in this view. Handle all data with care.
        </p>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Reg. ID</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">PAN (masked)</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">KYC Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : clients.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">
                  No KYC records pending review
                </td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.fullName}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.registrationId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.panMasked || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge color="amber">{c.kycStatus?.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onClick={() => { setSelected(c); setDecision(''); setReason('') }}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">KYC Review — {selected.fullName}</h2>
            <div className="space-y-2 text-xs mb-5 bg-gray-800/40 rounded-xl p-4">
              <div className="flex justify-between"><span className="text-gray-500">Reg. ID</span><span className="font-mono text-emerald-400">{selected.registrationId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white">{selected.fullName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span className="text-white">{selected.mobile}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">City/State</span><span className="text-white">{selected.city}, {selected.state}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">PAN (masked)</span><span className="font-mono text-gray-400">{selected.panMasked || '—'}</span></div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Decision</label>
              <div className="flex gap-3">
                {['in_review', 'verified', 'rejected'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDecision(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      decision === d
                        ? d === 'verified' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : d === 'rejected' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'border-gray-700 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {d.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {decision === 'rejected' && (
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1.5">Rejection Reason *</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
              <Button size="sm" loading={submitting} onClick={handleSubmit} className="flex-1">Submit Decision</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
