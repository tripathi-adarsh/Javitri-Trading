import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Wallet, TrendingUp, Clock, CheckCircle2, XCircle,
  RefreshCw, LogOut, Send, KeyRound, Building2,
  Calendar, ChevronDown, ChevronUp, AlertCircle, Plus, MessageSquareWarning
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import { api } from '../utils/api.js'
import { useTrading } from '../context/TradingContext.jsx'

function fmtINR(paise) {
  const n = Number(paise || 0) / 100
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

const PLAN_PAY_BADGE = { pending: 'amber', approved: 'blue', paid: 'emerald', rejected: 'red' }
const KYC_BADGE = { not_started: 'gray', submitted: 'amber', in_review: 'blue', verified: 'emerald', rejected: 'red' }

function RequestProgress({ status }) {
  if (status === 'rejected') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-extrabold text-red-700">
        <XCircle className="h-3.5 w-3.5" /> Rejected
      </div>
    )
  }

  const stepIdx = status === 'paid' ? 3 : status === 'approved' ? 2 : 1
  const steps = [
    { n: 1, label: 'Requested' },
    { n: 2, label: 'Approved' },
    { n: 3, label: 'Paid' },
  ]

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {steps.map((s, idx) => {
        const done = stepIdx >= s.n
        const active = stepIdx === s.n
        return (
          <React.Fragment key={s.n}>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
              done
                ? s.n === 3
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : active
                    ? 'bg-blue-50 text-[#1d4ed8] border-blue-200'
                    : 'bg-slate-100 text-[#0b1e3f] border-slate-200'
                : 'bg-white text-[#94a3b8] border-[#e2e8f0]'
            }`}>
              {done ? '✓' : s.n} {s.label}
            </span>
            {idx < steps.length - 1 && (
              <span className={`text-[10px] font-bold ${stepIdx > s.n ? 'text-[#1d4ed8]' : 'text-[#cbd5e1]'}`}>→</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function ClientDashboardPage() {
  const navigate = useNavigate()
  const { token, user, logout } = useTrading()

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [expandedPlan, setExpandedPlan] = useState(null)

  // Daily Payout Request Form State
  const [planRequestId, setPlanRequestId]     = useState('')
  const [paymentMode, setPaymentMode]         = useState('bank_transfer')
  const [clientReference, setClientReference] = useState('')
  const [clientNotes, setClientNotes]         = useState('')
  const [customAmountINR, setCustomAmountINR] = useState('')
  const [submittingReq, setSubmittingReq]     = useState(false)
  const [reqFeedback, setReqFeedback]         = useState({ type: '', msg: '' })

  // Payment Not Received / Issue Message State
  const [activeIssueId, setActiveIssueId]   = useState(null)
  const [issueMsgText, setIssueMsgText]     = useState('')
  const [sendingIssue, setSendingIssue]     = useState(false)

  // Change Password State
  const [showPwdForm, setShowPwdForm]         = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [pwdBusy, setPwdBusy]                 = useState(false)
  const [pwdFeedback, setPwdFeedback]         = useState({ type: '', msg: '' })

  const loadProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await api.clientPortal.profile(token)
      setData(res.data)
      const fetchedPlans = res.data?.plans || []
      if (fetchedPlans.length > 0) {
        setPlanRequestId(prev => (prev && fetchedPlans.some(p => p.id === prev) ? prev : fetchedPlans[0].id))
      }
    } catch (err) {
      setError(err.message || 'Could not load your profile details.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const client = data?.client
  const summary = data?.summary || {}
  const plans = data?.plans || []
  const paymentRequests = data?.paymentRequests || []
  const todayDate = data?.todayDate || new Date().toISOString().slice(0, 10)

  const selectedPlan = plans.find(p => p.id === planRequestId) || plans[0] || null
  const planDailyRupees = selectedPlan?.dailyAmountPaise ? Math.round(selectedPlan.dailyAmountPaise / 100) : 0
  const todayExistingRequest = selectedPlan
    ? paymentRequests.find(r => r.planRequestId === selectedPlan.id && r.payoutDate === todayDate && r.status !== 'rejected')
    : null

  const handleLogout = async () => {
    try { await api.auth.logout(token) } catch { /* ignore */ }
    logout()
    navigate('/admin/login')
  }

  const handlePaymentRequestSubmit = async (e) => {
    e.preventDefault()
    setReqFeedback({ type: '', msg: '' })
    if (!selectedPlan) {
      setReqFeedback({ type: 'error', msg: 'No plan found on your profile.' })
      return
    }
    const amtToSend = planDailyRupees > 0 ? planDailyRupees : Number(customAmountINR)
    if (!Number.isFinite(amtToSend) || amtToSend <= 0) {
      setReqFeedback({ type: 'error', msg: 'Please enter a valid payout amount in ₹.' })
      return
    }

    setSubmittingReq(true)
    try {
      const res = await api.clientPortal.createPaymentRequest({
        planRequestId: selectedPlan.id,
        requestType: 'payout_request',
        amountINR: amtToSend,
        paymentMode,
        clientReference: clientReference || undefined,
        clientNotes: clientNotes || undefined,
      }, token)
      setReqFeedback({
        type: 'success',
        msg: `Request ${res.data?.paymentRequest?.requestNumber || ''} sent! Admin will approve and mark it Paid once transferred.`,
      })
      setClientReference('')
      setClientNotes('')
      setCustomAmountINR('')
      loadProfile()
    } catch (err) {
      setReqFeedback({ type: 'error', msg: err.message || 'Could not send payment request.' })
    } finally {
      setSubmittingReq(false)
    }
  }

  const openIssueBox = (pr) => {
    if (activeIssueId === pr.id) {
      setActiveIssueId(null)
      return
    }
    setActiveIssueId(pr.id)
    setIssueMsgText(
      `Maine ${pr.requestNumber} (${fmtDate(pr.payoutDate)}, ${fmtINR(pr.amountPaise)}) ka payout request kiya tha, abhi tak payment receive nahi hua hai. Kripya check karein.`
    )
  }

  const handleSendIssueMessage = async (e, reqId) => {
    e.preventDefault()
    if (!issueMsgText.trim()) return
    setSendingIssue(true)
    try {
      await api.clientPortal.reportIssue(reqId, { message: issueMsgText.trim() }, token)
      setActiveIssueId(null)
      setIssueMsgText('')
      loadProfile()
    } catch (err) {
      alert(err.message || 'Could not send message to Admin.')
    } finally {
      setSendingIssue(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwdFeedback({ type: '', msg: '' })
    setPwdBusy(true)
    try {
      await api.auth.changePassword({ currentPassword, newPassword }, token)
      setPwdFeedback({ type: 'success', msg: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setShowPwdForm(false), 1500)
    } catch (err) {
      setPwdFeedback({
        type: 'error',
        msg: err.errors?.[0]?.message || err.message || 'Password update failed.',
      })
    } finally {
      setPwdBusy(false)
    }
  }

  const totalReceivedCombinedPaise = Number(
    summary.totalCombinedPayoutPaise ?? (Number(summary.totalPayoutReceivedPaise || 0) + Number(summary.totalPaymentRequestsPaidPaise || 0))
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Profile Header */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b1e3f] to-[#1d4ed8] text-white flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
                {(client?.fullName || user?.first_name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0b1e3f] tracking-tight">
                    {client?.fullName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Client Profile'}
                  </h1>
                  {client?.registrationId && (
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d4ed8] border border-blue-200">
                      {client.registrationId}
                    </span>
                  )}
                  {client?.kycStatus && (
                    <Badge color={KYC_BADGE[client.kycStatus] || 'gray'}>
                      KYC: {client.kycStatus.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#64748b] font-medium mt-1">
                  {client?.email || user?.email} · {client?.mobile || user?.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={loadProfile}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-[#f8fafc] border border-[#cbd5e1] text-[#0b1e3f] hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} /> <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPwdForm(v => !v)}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-50 border border-amber-200 text-[#92400e] hover:bg-amber-100 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Password</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" /> <span>Logout</span>
              </button>
            </div>
          </div>

          {showPwdForm && (
            <form onSubmit={handlePasswordChange} className="mt-5 pt-5 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full rounded-xl px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">New Password (8+ chars, A-Z, 0-9, symbol)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  className="w-full rounded-xl px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pwdBusy}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#1d4ed8] !text-white hover:bg-[#1e40af] cursor-pointer disabled:opacity-50"
                >
                  {pwdBusy ? 'Updating…' : 'Update Password'}
                </button>
              </div>
              {pwdFeedback.msg && (
                <p className={`sm:col-span-3 text-xs font-bold ${pwdFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {pwdFeedback.msg}
                </p>
              )}
            </form>
          )}
        </div>

        {error && (
          <div className="rounded-2xl p-4 bg-red-50 border border-red-200 flex items-center gap-3 text-sm font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={TrendingUp}
            label="My Total Plans"
            value={summary.totalPlans ?? 0}
            sub={`${summary.activePlans ?? 0} Active`}
            color="blue"
          />
          <SummaryCard
            icon={Building2}
            label="Total Plan Value"
            value={fmtINR(summary.totalDealAmountPaise)}
            sub={`Confirmed: ${fmtINR(summary.totalPlanPaidPaise)}`}
            color="navy"
          />
          <SummaryCard
            icon={Wallet}
            label="Total Payout Received"
            value={fmtINR(totalReceivedCombinedPaise)}
            sub="Synced across all payouts"
            color="emerald"
          />
          <SummaryCard
            icon={Clock}
            label="Pending Requests"
            value={summary.pendingPaymentRequestsCount ?? 0}
            sub={`Amount: ${fmtINR(summary.pendingPaymentRequestsPaise)}`}
            color="amber"
          />
        </div>

        {/* Main 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Request Today's Payout Form + Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f1f5f9]">
                <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Send className="h-4 w-4 text-[#1d4ed8]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#0b1e3f]">Request Daily Payout</h2>
                  <p className="text-[11px] text-[#64748b]">Auto-filled from your active plan</p>
                </div>
              </div>

              {plans.length === 0 ? (
                <div className="text-xs text-[#64748b] py-4 text-center">
                  Payout request bhejne ke liye pehle koi plan register karein.{' '}
                  <Link to="/plans" className="font-bold text-[#1d4ed8] hover:underline">Explore Plans →</Link>
                </div>
              ) : (
                <form onSubmit={handlePaymentRequestSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Your Selected Plan *</label>
                    <select
                      value={selectedPlan?.id || ''}
                      onChange={e => setPlanRequestId(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.planName} — Daily {fmtINR(p.dailyAmountPaise)} ({p.requestNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Plan Payout (₹)</label>
                      {planDailyRupees > 0 ? (
                        <input
                          type="text"
                          readOnly
                          value={`₹${planDailyRupees.toLocaleString('en-IN')}`}
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-black !bg-[#f8fafc] !text-[#1d4ed8] cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="number"
                          min="1"
                          required
                          value={customAmountINR}
                          onChange={e => setCustomAmountINR(e.target.value)}
                          placeholder="Amount in ₹"
                          className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Request Date (Today)</label>
                      <input
                        type="text"
                        readOnly
                        value={fmtDate(todayDate)}
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold !bg-[#f8fafc] !text-[#0b1e3f] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Receive Mode</label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                    >
                      <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  {paymentMode === 'bank_transfer' && client?.bankAccounts?.[0] && (
                    <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[11px] text-[#334155]">
                      <p className="font-bold text-[#0b1e3f]">Registered Bank Account:</p>
                      <p>{client.bankAccounts[0].bankName} · <span className="font-mono font-bold">{client.bankAccounts[0].accountNumberMasked}</span></p>
                      <p className="font-mono text-[#1d4ed8]">IFSC: {client.bankAccounts[0].ifscCode}</p>
                    </div>
                  )}

                  {paymentMode === 'upi' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Your UPI ID (Optional)</label>
                      <input
                        type="text"
                        value={clientReference}
                        onChange={e => setClientReference(e.target.value)}
                        placeholder="e.g. yourname@upi"
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">Note for Admin (Optional)</label>
                    <textarea
                      rows={2}
                      value={clientNotes}
                      onChange={e => setClientNotes(e.target.value)}
                      placeholder="Any message for Admin…"
                      className="w-full rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  {todayExistingRequest && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#92400e] space-y-1">
                      <p className="font-extrabold">
                        ✓ Aaj ki payout request ({todayExistingRequest.requestNumber}) already submitted hai.
                      </p>
                      <p className="text-[11px]">
                        Current Status: <strong className="uppercase">{todayExistingRequest.status}</strong> — Agar payment abhi tak nahi mila hai toh niche request ke paas &ldquo;Payment Not Received&rdquo; message bhej sakte hain.
                      </p>
                    </div>
                  )}

                  {reqFeedback.msg && (
                    <div className={`p-3 rounded-xl text-xs font-bold border ${
                      reqFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {reqFeedback.msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReq || Boolean(todayExistingRequest)}
                    className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#1e40af] hover:to-[#1d4ed8] !text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5 !text-white" />
                    <span className="!text-white">
                      {submittingReq
                        ? 'Submitting Request…'
                        : todayExistingRequest
                          ? `Requested Today (${todayExistingRequest.status})`
                          : `Request Today's Payout (${fmtINR(planDailyRupees * 100 || Number(customAmountINR || 0) * 100)})`}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Client Profile Details Card */}
            {client && (
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                  <User className="h-4 w-4 text-[#1d4ed8]" />
                  <h2 className="text-sm font-black text-[#0b1e3f]">Profile &amp; Bank Details</h2>
                </div>
                <div className="space-y-2 text-xs">
                  <ProfileRow label="Full Name" value={client.fullName} />
                  <ProfileRow label="Mobile" value={client.mobile} />
                  <ProfileRow label="Email" value={client.email} />
                  <ProfileRow label="Location" value={`${client.city}, ${client.state} – ${client.postalCode}`} />
                  {client.panMasked && <ProfileRow label="PAN" value={<span className="font-mono font-bold">{client.panMasked}</span>} />}
                  {client.nomineeName && (
                    <ProfileRow label="Nominee" value={`${client.nomineeName} (${client.nomineeRelation || 'Nominee'})`} />
                  )}
                  {client.bankAccounts?.[0] && (
                    <>
                      <div className="pt-2 border-t border-[#f1f5f9]" />
                      <ProfileRow label="Bank" value={client.bankAccounts[0].bankName} />
                      <ProfileRow label="Account" value={<span className="font-mono font-bold">{client.bankAccounts[0].accountNumberMasked}</span>} />
                      <ProfileRow label="IFSC" value={<span className="font-mono font-bold text-[#1d4ed8]">{client.bankAccounts[0].ifscCode}</span>} />
                    </>
                  )}
                  {client.accountManager && (
                    <>
                      <div className="pt-2 border-t border-[#f1f5f9]" />
                      <ProfileRow label="Account Manager" value={`${client.accountManager.name} (${client.accountManager.code})`} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Payout Requests Tracker + My Plans */}
          <div className="lg:col-span-2 space-y-6">

            {/* My Payout Requests Sent to Admin */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs">
              <div className="mb-4 pb-3 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-[#0b1e3f]">My Payout Requests &amp; Live Status</h2>
                  <p className="text-xs text-[#64748b]">
                    Requested → Admin Approved → Paid · Agar payment nahi aaya ho toh Admin ko direct message karein
                  </p>
                </div>
                {summary.openIssuesCount > 0 && (
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#92400e]">
                    {summary.openIssuesCount} Open Query
                  </span>
                )}
              </div>

              {paymentRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748b]">
                  Abhi tak koi payout request nahi bheji gayi hai. Left side se aaj ki payout request submit karein.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRequests.map(pr => (
                    <div key={pr.id} className="rounded-2xl border border-[#e2e8f0] p-4 bg-[#fcfcfd] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#1d4ed8]">{pr.requestNumber}</span>
                            <span className="text-xs font-black text-[#0b1e3f]">{pr.planName || 'Plan'}</span>
                            <span className="text-[11px] font-bold text-[#64748b] bg-white px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                              Date: {fmtDate(pr.payoutDate)}
                            </span>
                            {pr.hasOpenIssue && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                Query Sent to Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#475569] mt-1">
                            Requested: <strong className="text-[#0b1e3f]">{fmtINR(pr.amountPaise)}</strong>
                            {' · '}Mode: <span className="uppercase font-semibold">{pr.paymentMode.replace('_', ' ')}</span>
                            {pr.status === 'paid' && (
                              <>
                                {' · '}Paid: <strong className="text-emerald-700">{fmtINR(pr.approvedAmountPaise ?? pr.amountPaise)}</strong>
                              </>
                            )}
                          </p>
                        </div>

                        <RequestProgress status={pr.status} />
                      </div>

                      {/* Admin UTR / Notes if present */}
                      {(pr.adminTransactionRef || pr.adminNotes) && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div>
                            {pr.adminNotes && <span className="font-semibold text-[#0b1e3f]">{pr.adminNotes}</span>}
                          </div>
                          {pr.adminTransactionRef && (
                            <span className="font-mono font-bold text-emerald-800">UTR / Ref: {pr.adminTransactionRef}</span>
                          )}
                        </div>
                      )}

                      {/* Message Thread if any */}
                      {pr.issueMessages?.length > 0 && (
                        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-[#e2e8f0]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Payment Queries &amp; Replies</p>
                          {pr.issueMessages.map((m, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-lg text-xs ${
                                m.sender === 'admin'
                                  ? 'bg-blue-50 border border-blue-200 text-[#0b1e3f]'
                                  : 'bg-amber-50 border border-amber-200 text-[#78350f]'
                              }`}
                            >
                              <div className="flex justify-between text-[10px] font-bold mb-0.5">
                                <span>{m.sender === 'admin' ? `Admin (${m.senderName})` : 'You'}</span>
                                <span className="text-[#64748b]">
                                  {m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p>{m.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action bar: Payment Not Received? */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-[#64748b]">
                          {pr.status === 'pending' && 'Admin approval ke baad payout process hoga.'}
                          {pr.status === 'approved' && 'Admin ne approve kar diya hai, payment transfer process me hai.'}
                          {pr.status === 'paid' && 'Admin ne Paid mark kar diya hai.'}
                          {pr.status === 'rejected' && 'Request reject ki gayi hai — Admin notes dekhein.'}
                        </span>

                        {pr.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => openIssueBox(pr)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-50 text-[#92400e] border border-amber-200 hover:bg-amber-100 cursor-pointer"
                          >
                            <MessageSquareWarning className="h-3.5 w-3.5" />
                            {activeIssueId === pr.id ? 'Close' : 'Payment Nahi Aaya? Message Admin'}
                          </button>
                        )}
                      </div>

                      {activeIssueId === pr.id && (
                        <form onSubmit={(e) => handleSendIssueMessage(e, pr.id)} className="pt-2 border-t border-[#e2e8f0] space-y-2">
                          <textarea
                            rows={2}
                            required
                            value={issueMsgText}
                            onChange={e => setIssueMsgText(e.target.value)}
                            placeholder="Likhein ki payment abhi tak receive nahi hua..."
                            className="w-full rounded-xl px-3 py-2 text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveIssueId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#cbd5e1] text-[#475569] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={sendingIssue}
                              className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-[#b45309] !text-white hover:bg-[#92400e] cursor-pointer disabled:opacity-50"
                            >
                              {sendingIssue ? 'Sending…' : 'Send Query to Admin'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Plans & Synced Daily Payout History */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h2 className="text-base font-black text-[#0b1e3f]">My Investment Plans &amp; Payout Ledger</h2>
                  <p className="text-xs text-[#64748b]">Sabhi plans aur har date ka confirmed payout record</p>
                </div>
                <Link
                  to="/plans"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-[#1d4ed8] border border-blue-200 hover:bg-blue-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Request New Plan
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-[#f1f5f9] animate-pulse" />)}
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#64748b]">
                  No plan requests found yet. <Link to="/plans" className="text-[#1d4ed8] font-bold hover:underline">Explore plans →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map(plan => {
                    const isOpen = expandedPlan === plan.id
                    return (
                      <div key={plan.id} className="rounded-2xl border border-[#e2e8f0] overflow-hidden">
                        <div
                          onClick={() => setExpandedPlan(isOpen ? null : plan.id)}
                          className="p-4 bg-[#f8fafc] hover:bg-blue-50/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-[#0b1e3f]">{plan.planName}</span>
                              {plan.requestNumber && (
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#cbd5e1] text-[#1d4ed8]">
                                  {plan.requestNumber}
                                </span>
                              )}
                              <Badge color={PLAN_PAY_BADGE[plan.paymentStatus] || 'gray'}>
                                Plan Payment: {plan.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#64748b] mt-1">
                              Plan Value: <strong className="text-[#0b1e3f]">{fmtINR(plan.dealAmountPaise)}</strong>
                              {' · '}Daily Payout: <strong className="text-[#1d4ed8]">{fmtINR(plan.dailyAmountPaise)}</strong>
                              {' · '}Total Payout Paid: <strong className="text-emerald-700">{fmtINR(plan.totalPayoutReceivedPaise)}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="text-[11px] font-bold text-[#64748b]">
                              {plan.payoutCount} payout{plan.payoutCount === 1 ? '' : 's'}
                            </span>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-[#64748b]" /> : <ChevronDown className="h-4 w-4 text-[#64748b]" />}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="p-4 bg-white border-t border-[#e2e8f0] space-y-3 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                              <div>
                                <p className="text-[10px] text-[#64748b] uppercase font-bold">Plan Status</p>
                                <p className="font-bold capitalize text-[#0b1e3f]">{plan.status}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#64748b] uppercase font-bold">Confirmed Investment</p>
                                <p className="font-bold text-emerald-700">
                                  {plan.paymentStatus === 'success' ? fmtINR(plan.paymentAmountPaise || plan.dealAmountPaise) : 'Pending'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#64748b] uppercase font-bold">Transaction Ref</p>
                                <p className="font-mono font-bold text-[#0b1e3f]">{plan.transactionId || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#64748b] uppercase font-bold">Total Payouts Paid</p>
                                <p className="font-extrabold text-[#1d4ed8]">{fmtINR(plan.totalPayoutReceivedPaise)}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
                                Daily Payout Ledger
                              </p>
                              {plan.payouts?.length > 0 ? (
                                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                  {plan.payouts.map(po => (
                                    <div key={po.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-[#1d4ed8]" />
                                        <span className="font-bold text-[#0b1e3f]">{fmtDate(po.payoutDate)}</span>
                                        {po.paymentMethod && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#cbd5e1] font-semibold uppercase">
                                            {po.paymentMethod.replace('_', ' ')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {po.transactionReference && (
                                          <span className="font-mono text-[11px] text-[#64748b]">UTR: {po.transactionReference}</span>
                                        )}
                                        <span className="font-extrabold text-emerald-700">{fmtINR(po.amountPaise)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-[#94a3b8] italic">No daily payouts settled yet.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const styles = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'text-[#1d4ed8]' },
    navy:    { bg: 'bg-slate-100',  border: 'border-slate-200',   icon: 'text-[#0b1e3f]' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-[#059669]' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-[#b45309]' },
  }[color] || { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-[#1d4ed8]' }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748b] leading-tight">{label}</span>
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center border shrink-0 ${styles.bg} ${styles.border}`}>
          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${styles.icon}`} />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-black text-[#0b1e3f] tracking-tight truncate">{value}</p>
      {sub && <p className="text-[10px] sm:text-[11px] text-[#64748b] font-semibold mt-1 truncate">{sub}</p>}
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-[#f8fafc]">
      <span className="text-[#64748b] font-semibold">{label}</span>
      <span className="text-right text-[#0b1e3f] font-bold break-all">{value || '—'}</span>
    </div>
  )
}
