import React, { useEffect, useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Wallet, MessageSquareWarning, Send } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const STATUS_BADGE = {
  pending:  'amber',
  approved: 'blue',
  paid:     'emerald',
  rejected: 'red',
}

function fmtINR(paise) {
  if (paise === null || paise === undefined) return '—'
  return `₹${(Number(paise) / 100).toLocaleString('en-IN')}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function PaymentRequestCard({ r, token, onUpdate }) {
  const [open, setOpen]       = useState(Boolean(r.hasOpenIssue))
  const [saving, setSaving]   = useState(false)
  const [amt, setAmt]         = useState(r.approvedAmountPaise ? Math.round(r.approvedAmountPaise / 100) : Math.round(r.amountPaise / 100))
  const [txRef, setTxRef]     = useState(r.adminTransactionRef || '')
  const [notes, setNotes]     = useState(r.adminNotes || '')
  const [replyText, setReplyText] = useState('')

  const updateStatus = async (status) => {
    if (status === 'rejected' && !notes.trim()) {
      alert('Please enter a reason in Admin Notes before rejecting.')
      return
    }
    setSaving(true)
    try {
      await api.admin.paymentRequests.updateStatus(r.id, {
        status,
        approvedAmountINR: amt !== '' ? Number(amt) : undefined,
        adminTransactionRef: txRef || undefined,
        adminNotes: notes || undefined,
        replyMessage: replyText.trim() || undefined,
        resolveIssue: status === 'paid' || Boolean(replyText.trim()),
      }, token)
      setReplyText('')
      onUpdate()
    } catch (e) {
      alert(e.message || 'Could not update payment request')
    } finally {
      setSaving(false)
    }
  }

  const sendReplyOnly = async () => {
    if (!replyText.trim()) return
    setSaving(true)
    try {
      await api.admin.paymentRequests.updateStatus(r.id, {
        replyMessage: replyText.trim(),
        resolveIssue: true,
      }, token)
      setReplyText('')
      onUpdate()
    } catch (e) {
      alert(e.message || 'Could not send reply')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-2xl overflow-hidden bg-white border shadow-xs transition-all ${
      r.hasOpenIssue ? 'border-amber-400 ring-2 ring-amber-200/60' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
    }`}>
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-sm text-[#0f172a] truncate">{r.clientName}</p>
            <span className="font-mono text-xs font-bold text-[#1d4ed8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {r.requestNumber}
            </span>
            {r.payoutDate && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#334155]">
                Date: {fmtDate(r.payoutDate)}
              </span>
            )}
            {r.hasOpenIssue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                <MessageSquareWarning size={12} /> Client Query: Payment Not Received
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748b] font-medium mt-0.5">
            {r.registrationId} · {r.clientMobile} · {r.planName || 'Plan'} {r.planRequestNumber ? `(${r.planRequestNumber})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right">
            <p className="text-sm font-black text-[#0b1e3f]">{fmtINR(r.amountPaise)}</p>
            <p className="text-[10px] text-[#64748b] uppercase font-bold">{r.paymentMode.replace('_', ' ')}</p>
          </div>
          <Badge color={STATUS_BADGE[r.status] || 'gray'}>{r.status}</Badge>
          {open ? <ChevronUp size={16} className="text-[#64748b]" /> : <ChevronDown size={16} className="text-[#64748b]" />}
        </div>
      </div>

      {open && (
        <div className="px-6 py-5 border-t border-[#f1f5f9] space-y-4 bg-[#fafafa]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs bg-white p-4 rounded-xl border border-[#e2e8f0]">
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Client Email</span>
              <span className="font-bold text-[#0f172a]">{r.clientEmail}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Plan &amp; Request No.</span>
              <span className="font-bold text-[#0f172a]">
                {r.planName ? `${r.planName} (${r.planRequestNumber || ''})` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Payout Date</span>
              <span className="font-bold text-[#0b1e3f]">{fmtDate(r.payoutDate)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Requested Amount</span>
              <span className="font-extrabold text-[#1d4ed8]">{fmtINR(r.amountPaise)}</span>
            </div>
            {r.bankInfo && (
              <div className="col-span-1 sm:col-span-2 flex flex-wrap justify-between gap-2 py-2 px-3 rounded-lg bg-blue-50/70 border border-blue-200 mt-1">
                <span className="font-bold text-[#0b1e3f]">
                  Bank: {r.bankInfo.bankName} ({r.bankInfo.accountHolderName})
                </span>
                <span className="font-mono font-bold text-[#1d4ed8]">
                  A/C: {r.bankInfo.accountNumberMasked} · IFSC: {r.bankInfo.ifscCode}
                </span>
              </div>
            )}
            {r.clientReference && (
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] font-semibold">Client UPI / Ref</span>
                <span className="font-mono font-bold text-[#0f172a]">{r.clientReference}</span>
              </div>
            )}
            {r.clientNotes && (
              <div className="col-span-1 sm:col-span-2 py-1">
                <span className="text-[#64748b] font-semibold block mb-0.5">Client Notes</span>
                <p className="text-[#0f172a] bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">{r.clientNotes}</p>
              </div>
            )}
          </div>

          {/* Client / Admin Issue Thread */}
          {(r.issueMessages?.length > 0 || r.hasOpenIssue) && (
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#92400e] flex items-center gap-1.5">
                  <MessageSquareWarning size={14} /> Client Payment Query Thread
                </span>
                {r.hasOpenIssue && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Open Issue
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {r.issueMessages?.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg text-xs border ${
                    m.sender === 'admin'
                      ? 'bg-blue-50 border-blue-200 text-[#0b1e3f]'
                      : 'bg-white border-amber-200 text-[#78350f]'
                  }`}>
                    <div className="flex justify-between text-[10px] font-bold mb-0.5">
                      <span>{m.sender === 'admin' ? `Admin (${m.senderName})` : `Client (${m.senderName})`}</span>
                      <span className="text-[#64748b]">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p>{m.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Reply to client query (e.g. Payment transferred via NEFT UTR...)…"
                  className="flex-1 rounded-lg px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={sendReplyOnly}
                  disabled={saving || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#0b1e3f] !text-white hover:bg-[#1d4ed8] disabled:opacity-50 cursor-pointer"
                >
                  <Send size={12} className="!text-white" /> <span className="!text-white">Send Reply</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Process Panel */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
              Approve / Send Payout &amp; Mark Paid (Auto-syncs Daily Payout Ledger)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Approved / Paid Amount (₹)</label>
                <input
                  type="number"
                  value={amt}
                  onChange={e => setAmt(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Admin UTR / Transaction Reference</label>
                <input
                  value={txRef}
                  onChange={e => setTxRef(e.target.value)}
                  placeholder="Enter NEFT / IMPS / UPI UTR"
                  className="w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">Admin Notes / Remarks (visible to client)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Payment settlement remarks or rejection reason"
                className="w-full rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => updateStatus('approved')}
                disabled={saving}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-50 text-[#1d4ed8] border border-blue-200 hover:bg-blue-100 disabled:opacity-50 cursor-pointer"
              >
                <Clock size={14} /> Approve Request
              </button>
              <button
                type="button"
                onClick={() => updateStatus('paid')}
                disabled={saving}
                className="flex-1 min-w-[160px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#1e40af] !text-white disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={14} className="!text-white" /> <span className="!text-white">Mark Paid &amp; Sync Payout</span>
              </button>
              <button
                type="button"
                onClick={() => updateStatus('rejected')}
                disabled={saving}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentRequestsPage() {
  const { token } = useTrading()
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [openIssuesTotal, setOpenIssuesTotal] = useState(0)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter === 'open_issue') {
        params.set('openIssue', 'true')
      } else if (filter !== 'all') {
        params.set('status', filter)
      }
      const res = await api.admin.paymentRequests.list(token, params.toString())
      setRequests(res.data?.requests || [])
      setOpenIssuesTotal(res.data?.openIssuesTotal || 0)
      setTotalPages(res.data?.pagination?.pages || 1)
      setTotal(res.data?.pagination?.total || 0)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [page, filter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Client Payout &amp; Payment Requests</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            {total} requests · Approve, transfer &amp; mark Paid (automatically syncs Daily Payout Reports)
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchRequests}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-2 bg-white p-2.5 rounded-2xl border border-[#e2e8f0] shadow-xs flex-wrap">
        {[
          { val: 'all',        label: 'All Requests' },
          { val: 'pending',    label: '⏳ Pending Approval' },
          { val: 'approved',   label: '✓ Approved' },
          { val: 'paid',       label: '₹ Paid' },
          { val: 'rejected',   label: '✗ Rejected' },
          { val: 'open_issue', label: `⚠ Open Client Queries (${openIssuesTotal})` },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => { setFilter(val); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === val
                ? val === 'open_issue'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-blue-50 text-[#1d4ed8] border border-blue-200 shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-white border border-[#e2e8f0] animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center shadow-xs">
          <Wallet size={36} className="mx-auto mb-3 text-[#94a3b8] opacity-50" />
          <p className="text-base font-bold text-[#0f172a]">No payment requests in this category</p>
          <p className="text-xs text-[#64748b] mt-1">Client daily payout requests and queries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <PaymentRequestCard key={r.id} r={r} token={token} onUpdate={fetchRequests} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-xs font-bold text-[#64748b]">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
