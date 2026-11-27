import React, { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Eye, ShieldCheck, CreditCard } from 'lucide-react'
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
      setReviews(res.data.reviews || [])
      setTotalPages(res.data.pagination?.pages || 1)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Payment Verification Review</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Review and approve captured gateway payments or reject invalid transactions
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchReviews}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Critical notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4.5 flex gap-3.5 items-start">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed font-medium">
          <strong className="font-bold">Compliance Guideline:</strong> You can only approve payments where the gateway status is verified as <code className="bg-white border border-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">captured</code>. Business review ensures compliance; rejecting collected transactions requires initiated refund processing.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 p-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs flex-wrap">
        {['AWAITING_REVIEW', 'APPROVED', 'REJECTED', 'all'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === f
                ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            {f === 'all' ? 'All Reviews' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Client / User</th>
                <th className="py-3.5 px-6">Plan Name</th>
                <th className="py-3.5 px-6">Captured Amount</th>
                <th className="py-3.5 px-6">Gateway Payment Ref</th>
                <th className="py-3.5 px-6">Gateway Status</th>
                <th className="py-3.5 px-6">Review Decision</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-[#64748b]">
                    <ShieldCheck className="h-8 w-8 text-[#059669] mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[#0f172a]">
                      {filter === 'AWAITING_REVIEW' ? 'No payments awaiting manual review' : 'No records found'}
                    </p>
                  </td>
                </tr>
              ) : reviews.map(r => (
                <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-[#0f172a] text-sm">{r.clientName || '—'}</p>
                    <p className="text-[11px] text-[#64748b] font-mono">{r.registrationId || '—'}</p>
                  </td>
                  <td className="py-4 px-6 text-[#334155] font-semibold text-xs">{r.planName || '—'}</td>
                  <td className="py-4 px-6 font-extrabold text-[#059669] text-xs">{fmt(r.amountPaise)}</td>
                  <td className="py-4 px-6 font-mono text-xs text-[#64748b]">
                    {r.gatewayPaymentRef ? r.gatewayPaymentRef.slice(0, 16) + '…' : '—'}
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={r.gatewayVerifyStatus === 'captured' ? 'emerald' : r.gatewayVerifyStatus === 'failed' ? 'red' : 'amber'}>
                      {r.gatewayVerifyStatus || 'pending'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={DECISION_COLOR[r.decision] || 'gray'}>
                      {r.decision?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {r.decision === 'AWAITING_REVIEW' && (
                      <Button size="sm" onClick={() => { setSelected(r); setRejReason('') }}>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs font-bold text-[#64748b]">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative z-10 w-full max-w-md bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-extrabold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">Payment Compliance Review</h2>

            <div className="space-y-2.5 text-xs mb-5 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <Row label="Investor Client" value={selected.clientName} />
              <Row label="Registration ID" value={selected.registrationId} mono />
              <Row label="Plan Subscribed" value={selected.planName} />
              <Row label="Order Amount"    value={<strong className="text-[#059669] font-extrabold">{fmt(selected.amountPaise)}</strong>} />
              <Row label="Gateway Ref"     value={selected.gatewayPaymentRef} mono small />
              <Row label="Gateway Status"  value={
                <Badge color={selected.gatewayVerifyStatus === 'captured' ? 'emerald' : 'amber'}>
                  {selected.gatewayVerifyStatus}
                </Badge>
              } />
              <Row label="Verified Date"   value={selected.verifiedAt ? new Date(selected.verifiedAt).toLocaleString('en-IN') : '—'} />
            </div>

            {selected.gatewayVerifyStatus !== 'captured' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs text-red-700 font-semibold">
                  Only captured payments can be approved. Gateway status is currently unconfirmed.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                Rejection Reason (required if rejecting)
              </label>
              <textarea
                value={rejReason}
                onChange={e => setRejReason(e.target.value)}
                rows={2}
                placeholder="Reason for rejecting transaction..."
                className="w-full px-3.5 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#059669] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
              <Button
                variant="danger"
                size="md"
                loading={submitting}
                onClick={() => handleDecision(selected.id, 'REJECTED')}
                className="flex-1"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
              <Button
                size="md"
                loading={submitting}
                disabled={selected.gatewayVerifyStatus !== 'captured'}
                onClick={() => handleDecision(selected.id, 'APPROVED')}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
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
      <span className="text-[#64748b] text-xs font-semibold shrink-0">{label}</span>
      <span className={`text-right ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-xs'} text-[#0f172a] font-medium break-all`}>
        {value || '—'}
      </span>
    </div>
  )
}
