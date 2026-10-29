import React, { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const DECISION_COLOR = {
  AWAITING_REVIEW: 'amber',
  APPROVED:        'emerald',
  REJECTED:        'red',
}

export default function PaymentsPage() {
  const { token } = useTrading()
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('AWAITING_REVIEW')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState(null)
  const [rejReason, setRejReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('decision', filter)
      const res = await api.admin.paymentReviews.list(token, params.toString())
      setReviews(res.data.reviews)
      setTotalPages(res.data.pagination.pages)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReviews() }, [page, filter])

  const handleDecision = async (id, decision) => {
    if (decision === 'REJECTED' && !rejReason.trim()) {
      alert('Please provide a rejection reason.')
      return
    }
    setSubmitting(true)
    try {
      await api.admin.paymentReviews.decide(id, { decision, rejectionReason: rejReason }, token)
      setSelected(null)
      setRejReason('')
      fetchReviews()
    } catch (err) {
      alert(err.message || 'Failed to submit decision')
    } finally { setSubmitting(false) }
  }

  const fmt = (paise) => paise != null ? `₹${(paise / 100).toLocaleString('en-IN')}` : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Payment Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve or reject verified payments</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Critical notice */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          <span className="font-semibold">Important:</span> You can only approve payments where the
          gateway status is <code className="bg-gray-800 px-1 rounded">captured</code>.
          Admin approval is a business review — it does NOT replace gateway verification.
          Rejecting a collected payment requires following the approved refund policy.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-800 pb-3">
        {['AWAITING_REVIEW', 'APPROVED', 'REJECTED', 'all'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Gateway Ref</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Gateway Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Decision</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500 text-sm">
                  {filter === 'AWAITING_REVIEW' ? 'No payments awaiting review' : 'No records found'}
                </td></tr>
              ) : reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white text-xs">{r.clientName || '—'}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.registrationId || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{r.planName || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-white text-xs">{fmt(r.amountPaise)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {r.gatewayPaymentRef ? r.gatewayPaymentRef.slice(0, 16) + '…' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={r.gatewayVerifyStatus === 'captured' ? 'emerald' : r.gatewayVerifyStatus === 'failed' ? 'red' : 'amber'}>
                      {r.gatewayVerifyStatus || 'pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={DECISION_COLOR[r.decision] || 'gray'}>
                      {r.decision?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {r.decision === 'AWAITING_REVIEW' && (
                      <Button size="sm" variant="secondary" onClick={() => { setSelected(r); setRejReason('') }}>
                        <Eye className="h-3.5 w-3.5" /> Review
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

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Review Payment</h2>

            <div className="space-y-3 text-sm mb-5">
              <Row label="Client"          value={selected.clientName} />
              <Row label="Registration ID" value={selected.registrationId} mono />
              <Row label="Plan"            value={selected.planName} />
              <Row label="Amount"          value={fmt(selected.amountPaise)} />
              <Row label="Gateway Ref"     value={selected.gatewayPaymentRef} mono small />
              <Row label="Gateway Status"  value={
                <Badge color={selected.gatewayVerifyStatus === 'captured' ? 'emerald' : 'amber'}>
                  {selected.gatewayVerifyStatus}
                </Badge>
              } />
              <Row label="Verified At"     value={selected.verifiedAt ? new Date(selected.verifiedAt).toLocaleString('en-IN') : '—'} />
              <Row label="Employee"        value={selected.employeeCode || '—'} mono />
            </div>

            {selected.gatewayVerifyStatus !== 'captured' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">
                  Cannot approve — gateway status is not 'captured'. Only captured payments can be approved.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1.5">
                Rejection Reason <span className="text-gray-600">(required if rejecting)</span>
              </label>
              <textarea
                value={rejReason}
                onChange={e => setRejReason(e.target.value)}
                rows={2}
                placeholder="Reason for rejection…"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
              <Button
                variant="danger"
                size="sm"
                loading={submitting}
                onClick={() => handleDecision(selected.id, 'REJECTED')}
                className="flex-1"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                loading={submitting}
                disabled={selected.gatewayVerifyStatus !== 'captured'}
                onClick={() => handleDecision(selected.id, 'APPROVED')}
                className="flex-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono = false, small = false }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className={`text-right ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-sm'} text-gray-200 break-all`}>
        {value || '—'}
      </span>
    </div>
  )
}
