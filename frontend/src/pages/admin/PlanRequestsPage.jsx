import React, { useEffect, useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Plus, CheckCircle2, XCircle, Clock, TrendingUp, Wallet, User, Calendar, CreditCard } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const PAY_COLOR = { pending: 'amber', success: 'emerald', failed: 'red' }
const STATUS_COLOR = { pending: 'amber', active: 'emerald', completed: 'blue', cancelled: 'red' }

function fmt(paise) {
  if (!paise) return '—'
  return '₹' + (Number(paise) / 100).toLocaleString('en-IN')
}

/* ── Daily Payout Panel ── */
function PayoutPanel({ requestId, dailyAmount, token }) {
  const [payouts, setPayouts]   = useState([])
  const [total,   setTotal]     = useState(0)
  const [loading, setLoading]   = useState(true)
  const [date,    setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [amount,  setAmount]    = useState(dailyAmount ? Math.round(Number(dailyAmount) / 100) : '')
  const [notes,   setNotes]     = useState('')
  const [txRef,   setTxRef]     = useState('')
  const [method,  setMethod]    = useState('bank_transfer')
  const [saving,  setSaving]    = useState(false)
  const [err,     setErr]       = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.admin.planRequests.getPayouts(requestId, token)
      setPayouts(res.data.payouts || [])
      setTotal(res.data.totalPaid || 0)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [requestId])

  const save = async () => {
    if (!date || !amount) { setErr('Date and amount are required.'); return }
    setSaving(true); setErr('')
    try {
      await api.admin.planRequests.addPayout(requestId, {
        payoutDate: date,
        amount:     Math.round(Number(amount) * 100),
        notes,
        transactionReference: txRef || undefined,
        paymentMethod: method,
      }, token)
      setNotes('')
      setTxRef('')
      load()
    } catch (e) {
      setErr(e.message || 'Failed to save payout record')
    } finally { setSaving(false) }
  }

  return (
    <div className="mt-4 rounded-xl p-4 bg-[#f8fafc] border border-[#e2e8f0]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
          Daily Payout Tracking
        </p>
        <span className="text-xs font-bold text-[#059669]">
          Cumulative Paid: {fmt(total)}
        </span>
      </div>

      {/* Add payout row */}
      <div className="space-y-2.5 mb-3 bg-white p-3.5 rounded-xl border border-[#e2e8f0]">
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="w-32 rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]">
            <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={txRef} onChange={e => setTxRef(e.target.value)}
            placeholder="Transaction UTR / Reference ID"
            className="flex-1 min-w-[140px] rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 min-w-[120px] rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 cursor-pointer shadow-xs">
            <Plus size={13} /> {saving ? 'Recording…' : 'Record Payout'}
          </button>
        </div>
      </div>

      {err && <p className="text-xs mb-2 text-red-600 font-semibold">{err}</p>}

      {/* Payout list */}
      {loading ? (
        <p className="text-xs text-[#64748b]">Loading payout history…</p>
      ) : payouts.length === 0 ? (
        <p className="text-xs text-[#64748b] italic">No payout records registered for this plan request.</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {payouts.map(p => (
            <div key={p.id} className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-white border border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0f172a]">{p.payout_date}</span>
                {p.payment_method && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                    {p.payment_method.replace('_', ' ')}
                  </span>
                )}
              </div>
              <span className="font-extrabold text-[#059669]">{fmt(p.amount)}</span>
              {p.transaction_reference && (
                <span className="text-[10px] font-mono font-semibold text-[#64748b]">{p.transaction_reference}</span>
              )}
              {p.notes && <span className="text-[#64748b] text-[11px] truncate max-w-[120px]">{p.notes}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Single request card ── */
function RequestCard({ r, token, onUpdate, isAdmin }) {
  const [open,       setOpen]       = useState(false)
  const [marking,    setMarking]    = useState(false)
  const [employees,  setEmployees]  = useState([])
  const [empId,      setEmpId]      = useState(r.assignedEmployeeId || '')
  const [assigning,  setAssigning]  = useState(false)
  const [payNotes,   setPayNotes]   = useState('')
  const [payAmount,  setPayAmount]  = useState(r.dealAmount ? Math.round(Number(r.dealAmount) / 100) : '')
  const [txId,       setTxId]       = useState(r.transactionId || '')

  useEffect(() => {
    if (!open || !isAdmin) return
    api.admin.employees.list(token, 'pageSize=100')
      .then(res => setEmployees(res.data?.employees || []))
      .catch(() => {})
  }, [open, isAdmin])

  const markPayment = async (status) => {
    setMarking(true)
    try {
      await api.admin.planRequests.markPayment(r.id, {
        paymentStatus: status,
        notes: payNotes,
        paymentAmount: payAmount ? Math.round(Number(payAmount) * 100) : undefined,
        transactionId: txId || undefined,
      }, token)
      onUpdate()
    } catch (e) { alert(e.message) }
    finally { setMarking(false) }
  }

  const assignEmp = async () => {
    setAssigning(true)
    try {
      await api.admin.planRequests.assign(r.id, { employeeId: empId || null }, token)
      onUpdate()
    } catch (e) { alert(e.message) }
    finally { setAssigning(false) }
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#e2e8f0] shadow-xs hover:border-[#cbd5e1] transition-all">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
        onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-sm text-[#0f172a] truncate">{r.clientName}</p>
              {r.requestNumber && (
                <span className="font-mono text-xs font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {r.requestNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">
              {r.clientMobile} · {r.registrationId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]">
            {r.planName}
          </span>
          <Badge color={PAY_COLOR[r.paymentStatus]}>{r.paymentStatus}</Badge>
          {open ? <ChevronUp size={16} className="text-[#64748b]" /> : <ChevronDown size={16} className="text-[#64748b]" />}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="px-6 py-5 border-t border-[#f1f5f9] space-y-5 bg-[#fafafa]">

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs bg-white p-4 rounded-xl border border-[#e2e8f0]">
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Request Identifier</span>
              <span className="font-mono font-bold text-[#0f172a]">{r.requestNumber || r.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Plan Investment Amount</span>
              <span className="font-extrabold text-[#0f172a]">{fmt(r.dealAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Estimated Daily Payout</span>
              <span className="font-extrabold text-[#059669]">{fmt(r.dailyAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Request Lifecycle</span>
              <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b] font-semibold">Date Submitted</span>
              <span className="text-[#0f172a] font-medium">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            {r.nomineeInfo && (
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] font-semibold">Nominee</span>
                <span className="text-[#0f172a] font-medium">{r.nomineeInfo}</span>
              </div>
            )}
            <div className="col-span-1 sm:col-span-2 flex justify-between py-1">
              <span className="text-[#64748b] font-semibold">Assigned Account Manager</span>
              <span className="font-bold text-[#059669]">
                {r.assignedEmployeeCode || '—'} {r.assignedEmployeeName ? `(${r.assignedEmployeeName})` : '(Direct)'}
              </span>
            </div>
          </div>

          {/* Admin: reassign employee */}
          {isAdmin && (
            <div className="flex gap-2 items-center bg-white p-3.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-xs font-bold text-[#475569] shrink-0">Reassign Staff:</span>
              <select value={empId} onChange={e => setEmpId(e.target.value)}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]">
                <option value="">— Unassigned (Company Direct) —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.employeeCode} — {e.fullName}
                  </option>
                ))}
              </select>
              <button onClick={assignEmp} disabled={assigning}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 cursor-pointer">
                {assigning ? '…' : 'Assign'}
              </button>
            </div>
          )}

          {/* Payment status action */}
          {r.paymentStatus === 'pending' && (
            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#e2e8f0]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                Update Payment Status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">Received Amount (₹)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    placeholder="Amount in Rupees"
                    className="w-full rounded-lg px-3 py-2 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">Transaction / Reference ID</label>
                  <input value={txId} onChange={e => setTxId(e.target.value)}
                    placeholder="Razorpay ID or Bank UTR"
                    className="w-full rounded-lg px-3 py-2 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
                </div>
              </div>
              <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                placeholder="Payment settlement notes (optional)"
                className="w-full rounded-lg px-3 py-2 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
              <div className="flex gap-3 pt-1">
                <button onClick={() => markPayment('success')} disabled={marking}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 cursor-pointer shadow-xs">
                  <CheckCircle2 size={14} /> Confirm Payment (Success)
                </button>
                <button onClick={() => markPayment('failed')} disabled={marking}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 cursor-pointer">
                  <XCircle size={14} /> Mark Payment Failed
                </button>
              </div>
            </div>
          )}

          {r.paymentStatus === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 size={16} className="text-[#059669]" />
                <span className="text-xs font-bold text-[#059669]">
                  Payment Verified {r.paymentMarkedAt ? `on ${new Date(r.paymentMarkedAt).toLocaleDateString('en-IN')}` : ''}
                </span>
                {r.transactionId && (
                  <span className="font-mono text-xs text-[#0f172a] ml-auto font-bold">
                    Ref: {r.transactionId}
                  </span>
                )}
              </div>
              {/* Daily payout tracking panel */}
              <PayoutPanel requestId={r.id} dailyAmount={r.dailyAmount} token={token} />
            </div>
          )}

          {r.paymentStatus === 'failed' && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
              <XCircle size={16} className="text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-700">Payment failed or declined</span>
              <button onClick={() => markPayment('pending')} disabled={marking}
                className="ml-auto text-xs font-bold underline text-[#64748b] hover:text-[#0f172a] cursor-pointer">
                Reset to Pending
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */
export default function PlanRequestsPage() {
  const { token, user } = useTrading()
  const [requests,    setRequests]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)

  const isAdmin = ['admin', 'super_admin'].includes(user?.role)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('paymentStatus', filter)
      const res = await api.admin.planRequests.list(token, params.toString())
      setRequests(res.data.requests || [])
      setTotalPages(res.data.pagination.pages || 1)
      setTotal(res.data.pagination.total || 0)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [page, filter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Plan Requests</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            {total} total subscriptions · Payment settlement verification and daily returns management
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchRequests}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white p-2.5 rounded-2xl border border-[#e2e8f0] shadow-xs flex-wrap">
        {[
          { val: 'all',     label: 'All Requests' },
          { val: 'pending', label: '⏳ Pending Payment' },
          { val: 'success', label: '✓ Payment Confirmed' },
          { val: 'failed',  label: '✗ Payment Failed' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => { setFilter(val); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === val
                ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white border border-[#e2e8f0] animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center shadow-xs">
          <TrendingUp size={36} className="mx-auto mb-3 text-[#94a3b8] opacity-50" />
          <p className="text-base font-bold text-[#0f172a]">No plan requests in this category</p>
          <p className="text-xs text-[#64748b] mt-1">Client plan requests will appear here as they sign up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <RequestCard key={r.id} r={r} token={token} onUpdate={fetchRequests} isAdmin={isAdmin} />
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
