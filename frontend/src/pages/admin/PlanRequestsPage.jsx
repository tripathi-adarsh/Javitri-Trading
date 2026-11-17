import React, { useEffect, useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Plus, CheckCircle2, XCircle, Clock, TrendingUp, Wallet } from 'lucide-react'
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
      setErr(e.message || 'Failed to save payout')
    } finally { setSaving(false) }
  }

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(14,26,53,0.6)', border: '1px solid rgba(212,168,67,0.15)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d4a843' }}>
          Daily Payouts
        </p>
        <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>
          Total paid: {fmt(total)}
        </span>
      </div>

      {/* Add payout row */}
      <div className="space-y-2 mb-3">
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.6)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="w-28 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.6)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.6)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }}>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={txRef} onChange={e => setTxRef(e.target.value)}
            placeholder="Transaction Reference (optional)"
            className="flex-1 min-w-[120px] rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.6)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 min-w-[100px] rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.6)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Plus size={12} /> {saving ? 'Saving…' : 'Mark Paid'}
          </button>
        </div>
      </div>

      {err && <p className="text-xs mb-2" style={{ color: '#f87171' }}>{err}</p>}

      {/* Payout list */}
      {loading ? (
        <p className="text-xs" style={{ color: '#506070' }}>Loading…</p>
      ) : payouts.length === 0 ? (
        <p className="text-xs" style={{ color: '#506070' }}>No payout records yet.</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {payouts.map(p => (
            <div key={p.id} className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg"
              style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.1)' }}>
              <div className="flex items-center gap-2">
                <span style={{ color: '#9ab0c4' }}>{p.payout_date}</span>
                {p.payment_method && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,168,67,0.1)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.2)' }}>
                    {p.payment_method.replace('_', ' ')}
                  </span>
                )}
              </div>
              <span className="font-semibold" style={{ color: '#4ade80' }}>{fmt(p.amount)}</span>
              {p.transaction_reference && <span className="text-[10px] font-mono" style={{ color: '#506070' }}>{p.transaction_reference}</span>}
              {p.notes && <span style={{ color: '#506070' }}>{p.notes}</span>}
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
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.2)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setOpen(v => !v)}
        style={{ borderBottom: open ? '1px solid rgba(212,168,67,0.12)' : 'none' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: '#f0f4f8' }}>{r.clientName}</p>
            <p className="text-xs truncate" style={{ color: '#7090a8' }}>
              {r.clientMobile} · {r.registrationId}
              {r.requestNumber && <span className="font-mono ml-2" style={{ color: '#d4a843' }}>{r.requestNumber}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(212,168,67,0.1)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)' }}>
            {r.planName}
          </span>
          <Badge color={PAY_COLOR[r.paymentStatus]}>{r.paymentStatus}</Badge>
          {open ? <ChevronUp size={14} style={{ color: '#506070' }} /> : <ChevronDown size={14} style={{ color: '#506070' }} />}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="px-4 py-4 space-y-4">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Request #</span><span className="font-mono" style={{ color: '#d4a843' }}>{r.requestNumber || r.id.slice(0, 8)}</span></div>
            <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Deal Amount</span><span style={{ color: '#f0f4f8' }}>{fmt(r.dealAmount)}</span></div>
            <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Daily Amount</span><span style={{ color: '#4ade80' }}>{fmt(r.dailyAmount)}</span></div>
            <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Status</span><Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge></div>
            <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Submitted</span><span style={{ color: '#f0f4f8' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span></div>
            {r.nomineeInfo && <div className="col-span-2 flex justify-between"><span style={{ color: '#7090a8' }}>Nominee</span><span style={{ color: '#f0f4f8' }}>{r.nomineeInfo}</span></div>}
            <div className="col-span-2 flex justify-between">
              <span style={{ color: '#7090a8' }}>Assigned Employee</span>
              <span style={{ color: '#d4a843' }}>{r.assignedEmployeeCode || '—'} {r.assignedEmployeeName ? `(${r.assignedEmployeeName})` : ''}</span>
            </div>
          </div>

          {/* Admin: reassign employee */}
          {isAdmin && (
            <div className="flex gap-2 items-center">
              <select value={empId} onChange={e => setEmpId(e.target.value)}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.3)', color: '#dde8f5' }}>
                <option value="">— Unassign —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id} style={{ background: '#111f3d' }}>
                    {e.employeeCode} — {e.fullName}
                  </option>
                ))}
              </select>
              <button onClick={assignEmp} disabled={assigning}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                style={{ background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)', cursor: 'pointer' }}>
                {assigning ? '…' : 'Assign'}
              </button>
            </div>
          )}

          {/* Payment status */}
          {r.paymentStatus === 'pending' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d4a843' }}>Mark Payment</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: '#7090a8' }}>Payment Amount (₹)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.2)', color: '#dde8f5' }} />
                </div>
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: '#7090a8' }}>Transaction / Reference ID</label>
                  <input value={txId} onChange={e => setTxId(e.target.value)}
                    placeholder="Transaction ID"
                    className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.2)', color: '#dde8f5' }} />
                </div>
              </div>
              <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                placeholder="Payment notes (optional)"
                className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.2)', color: '#dde8f5' }} />
              <div className="flex gap-2">
                <button onClick={() => markPayment('success')} disabled={marking}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', cursor: 'pointer' }}>
                  <CheckCircle2 size={12} /> Payment Success
                </button>
                <button onClick={() => markPayment('failed')} disabled={marking}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer' }}>
                  <XCircle size={12} /> Payment Failed
                </button>
              </div>
            </div>
          )}

          {r.paymentStatus === 'success' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                <span className="text-xs" style={{ color: '#4ade80' }}>
                  Payment confirmed {r.paymentMarkedAt ? `on ${new Date(r.paymentMarkedAt).toLocaleDateString('en-IN')}` : ''}
                </span>
              </div>
              {(r.paymentAmount || r.transactionId) && (
                <div className="grid grid-cols-2 gap-2 text-xs mb-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  {r.paymentAmount && (
                    <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Amount</span><span style={{ color: '#f0f4f8' }}>{fmt(r.paymentAmount)}</span></div>
                  )}
                  {r.transactionId && (
                    <div className="flex justify-between"><span style={{ color: '#7090a8' }}>Txn ID</span><span className="font-mono" style={{ color: '#dde8f5' }}>{r.transactionId}</span></div>
                  )}
                </div>
              )}
              {/* Daily payout tracking */}
              <PayoutPanel requestId={r.id} dailyAmount={r.dailyAmount} token={token} />
            </div>
          )}

          {r.paymentStatus === 'failed' && (
            <div className="flex items-center gap-2">
              <XCircle size={14} style={{ color: '#f87171' }} />
              <span className="text-xs" style={{ color: '#f87171' }}>Payment failed</span>
              <button onClick={() => markPayment('pending')} disabled={marking}
                className="ml-2 text-xs underline" style={{ color: '#7090a8', background: 'none', border: 'none', cursor: 'pointer' }}>
                Reset to pending
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
      setTotalPages(res.data.pagination.pages)
      setTotal(res.data.pagination.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [page, filter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f0f4f8' }}>Plan Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7090a8' }}>
            {total} total — client requests, payment tracking, daily payouts
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { val: 'all',     label: 'All' },
          { val: 'pending', label: '⏳ Pending Payment', icon: Clock },
          { val: 'success', label: '✓ Payment Done' },
          { val: 'failed',  label: '✗ Failed' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === val ? 'rgba(212,168,67,0.2)' : 'rgba(22,46,110,0.3)',
              border: filter === val ? '1px solid rgba(212,168,67,0.5)' : '1px solid rgba(212,168,67,0.15)',
              color: filter === val ? '#d4a843' : '#7090a8',
              cursor: 'pointer',
            }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(212,168,67,0.06)' }} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#506070' }}>
          <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No plan requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <RequestCard key={r.id} r={r} token={token} onUpdate={fetchRequests} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-xs" style={{ color: '#506070' }}>Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
