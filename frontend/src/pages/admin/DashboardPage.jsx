import React, { useEffect, useState } from 'react'
import {
  Users, UserCheck, FileSearch, TrendingUp, CheckCircle2,
  XCircle, Clock, Wallet, MessageSquare, RefreshCw,
  ArrowRight, Shield, AlertCircle, ChevronRight, Activity, Calendar
} from 'lucide-react'
import StatCard from '../../components/ui/StatCard.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { token, user } = useTrading()
  const [stats,          setStats]          = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [refreshing,     setRefreshing]     = useState(false)
  const [error,          setError]          = useState('')

  const isEmployee = user?.role === 'employee'

  const fetchData = async () => {
    if (!token) return
    setError('')
    try {
      const statsRes = await api.admin.stats(token)
      setStats(statsRes.data || null)

      // Also fetch recent plan requests for dynamic table
      try {
        const reqsRes = await api.admin.planRequests.list(token, 'limit=5')
        setRecentRequests(reqsRes.data?.requests || reqsRes.data || [])
      } catch {
        // Non-critical if requests list fails
      }
    } catch {
      setError('Could not load dashboard statistics. Please check your network connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // Calculations for Payment Distribution Chart
  const successP = Number(stats?.successPayments || 0)
  const pendingP = Number(stats?.pendingPayments || 0)
  const failedP  = Number(stats?.failedPayments || 0)
  const totalP   = successP + pendingP + failedP || 1 // Avoid divide by zero

  const successPercent = Math.round((successP / totalP) * 100)
  const pendingPercent = Math.round((pendingP / totalP) * 100)
  const failedPercent  = Math.max(0, 100 - successPercent - pendingPercent)

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 royal-gold-line" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="gold-badge">
              Live Operations
            </span>
            <span className="text-xs text-[#64748b] flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-[#1d4ed8]" /> {todayFormatted}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b1e3f] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Welcome back, <span className="text-[#0b1e3f] font-bold">{user?.first_name} {user?.last_name}</span>. Here is the operational summary for Javitri Trading Service Pvt. Ltd.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#cbd5e1] bg-white text-xs font-extrabold text-[#0b1e3f] hover:border-[#1d4ed8] hover:bg-[#f8fafc] shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#1d4ed8] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Notice</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Top Summary Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-[#0b1e3f] uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#1d4ed8]" /> Key Performance Metrics
          </h2>
          <span className="text-xs font-semibold text-[#64748b]">Real-Time Database Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard icon={UserCheck}    label="Total Clients"       value={stats?.totalClients}      color="teal"    loading={loading} subtitle="Registered" />
          <StatCard icon={TrendingUp}   label="Total Plan Requests" value={stats?.totalPlanRequests} color="blue"    loading={loading} subtitle="Subscribed" />
          <StatCard icon={CheckCircle2} label="Payment Success"     value={stats?.successPayments}   color="emerald" loading={loading} subtitle="Settled" />
          <StatCard icon={Clock}        label="Pending Payment"     value={stats?.pendingPayments}   color="amber"   loading={loading} subtitle="Awaiting" />
          <StatCard icon={XCircle}      label="Payment Failed"      value={stats?.failedPayments}    color="red"     loading={loading} subtitle="Declined" />
          <StatCard icon={FileSearch}   label="Pending KYC"         value={stats?.pendingKyc}        color="amber"   loading={loading} subtitle="Requires Review" />
          <StatCard icon={Wallet}       label="Daily Payouts"       value={stats?.totalDailyPayouts} color="emerald" loading={loading} subtitle="Disbursed" />
          <StatCard icon={Clock}        label="Client Pay Requests" value={stats?.pendingClientPaymentRequests} color="amber" loading={loading} subtitle="Pending Approval" />
          {!isEmployee && (
            <StatCard icon={Users}      label="Active Employees"    value={stats?.activeEmployees}   color="blue"    loading={loading} subtitle="Staff" />
          )}
          {!isEmployee && (
            <StatCard icon={MessageSquare} label="New Messages"     value={stats?.newContactMessages} color="violet" loading={loading} subtitle="Enquiries" />
          )}
        </div>
      </div>

      {/* ── Charts & Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Payment Distribution Donut / Progress Chart */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">Payment Status Ratio</h3>
              <span className="text-xs font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {stats?.totalPlanRequests || 0} Total Orders
              </span>
            </div>

            {/* SVG Donut Visual */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  {/* Success slice */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#059669" strokeWidth="3.5"
                    strokeDasharray={`${successPercent} ${100 - successPercent}`}
                    strokeDashoffset="0" strokeLinecap="round" />
                  {/* Pending slice */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d97706" strokeWidth="3.5"
                    strokeDasharray={`${pendingPercent} ${100 - pendingPercent}`}
                    strokeDashoffset={`-${successPercent}`} strokeLinecap="round" />
                  {/* Failed slice */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#dc2626" strokeWidth="3.5"
                    strokeDasharray={`${failedPercent} ${100 - failedPercent}`}
                    strokeDashoffset={`-${successPercent + pendingPercent}`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-[#0f172a]">{successPercent}%</span>
                  <p className="text-[10px] text-[#64748b] font-bold uppercase">Success</p>
                </div>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#059669]" />
                  <span className="font-semibold text-[#334155]">Successful Payments</span>
                </div>
                <span className="font-bold text-[#0f172a]">{successP} ({successPercent}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#d97706]" />
                  <span className="font-semibold text-[#334155]">Pending Approvals</span>
                </div>
                <span className="font-bold text-[#0f172a]">{pendingP} ({pendingPercent}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#dc2626]" />
                  <span className="font-semibold text-[#334155]">Failed / Rejected</span>
                </div>
                <span className="font-bold text-[#0f172a]">{failedP} ({failedPercent}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
            <Link to="/admin/plan-requests" className="text-xs font-bold text-[#1d4ed8] hover:text-[#0b1e3f] hover:underline flex items-center justify-between">
              <span>View All Transactions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Operations Breakdown Bar Chart */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-sm font-black text-[#0b1e3f] uppercase tracking-wider">Operational Pipeline</h3>
              <span className="text-xs font-semibold text-[#64748b]">Current Workload</span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#334155]">Clients Enrolled</span>
                  <span className="text-[#0b1e3f] font-bold">{stats?.totalClients || 0}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1d4ed8] rounded-full" style={{ width: `${Math.min(100, ((stats?.totalClients || 0) / 50) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#334155]">Active Subscriptions</span>
                  <span className="text-[#0b1e3f] font-bold">{stats?.successPayments || 0}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#059669] rounded-full" style={{ width: `${Math.min(100, ((stats?.successPayments || 0) / Math.max(1, stats?.totalPlanRequests || 1)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#334155]">Pending KYC Documents</span>
                  <span className="text-[#d97706] font-bold">{stats?.pendingKyc || 0}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d97706] rounded-full" style={{ width: `${Math.min(100, ((stats?.pendingKyc || 0) / Math.max(1, stats?.totalClients || 1)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#334155]">Daily Payout Cycles Disbursed</span>
                  <span className="text-[#0b1e3f] font-bold">{stats?.totalDailyPayouts || 0}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0b1e3f] rounded-full" style={{ width: `${Math.min(100, ((stats?.totalDailyPayouts || 0) / 100) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
            <Link to="/admin/kyc-review" className="text-xs font-bold text-[#1d4ed8] hover:text-[#0b1e3f] hover:underline flex items-center justify-between">
              <span>Review Pending KYC Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 3. System Health & Compliance Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-sm font-black text-[#0b1e3f] uppercase tracking-wider">Compliance & Security</h3>
              <Shield className="h-4 w-4 text-[#1d4ed8]" />
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0b1e3f]">Payment Gateway Verified</p>
                  <p className="text-[11px] text-[#64748b]">Razorpay webhook & signature validation active.</p>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0b1e3f]">Audit Logging Enforced</p>
                  <p className="text-[11px] text-[#64748b]">All financial transactions & KYC changes are logged.</p>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0b1e3f]">CIN & GST Compliance</p>
                  <p className="text-[11px] text-[#64748b]">Registered: U66190GJ2026PTC183862 | 09AAHCJ6166E1ZD</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
            <Link to="/admin/audit-logs" className="text-xs font-bold text-[#1d4ed8] hover:text-[#0b1e3f] hover:underline flex items-center justify-between">
              <span>View Audit Logs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Plan Requests Table ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#0b1e3f] tracking-tight">Recent Client Plan Requests</h2>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">Latest investment enrollments and payment submissions</p>
          </div>
          <Link
            to="/admin/plan-requests"
            className="text-xs font-bold text-[#1d4ed8] hover:text-[#0b1e3f] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#64748b]">
            <TrendingUp className="h-8 w-8 text-[#94a3b8] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#0b1e3f]">No recent plan requests available</p>
            <p className="text-xs text-[#94a3b8] mt-1">New requests submitted from the public site will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#0b1e3f] font-black uppercase tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-3.5 px-6">Client / Investor</th>
                  <th className="py-3.5 px-6">Selected Plan</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Payment Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {recentRequests.map((req) => {
                  const statusColors = {
                    success: 'bg-emerald-50 text-[#059669] border-emerald-200',
                    pending: 'gold-badge',
                    failed:  'bg-red-50 text-[#dc2626] border-red-200',
                  }
                  const pillClass = statusColors[req.payment_status] || 'bg-gray-100 text-gray-700 border-gray-200'

                  return (
                    <tr key={req.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-black text-[#0b1e3f] text-sm">{req.client_name || req.Client?.full_name || 'Client'}</p>
                        <p className="text-[11px] text-[#64748b]">{req.client_phone || req.client_email || '—'}</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0b1e3f]">
                        {req.plan_name || req.deal_plan_name || 'Plan'}
                      </td>
                      <td className="py-4 px-6 text-[#64748b] font-medium">
                        {req.duration_months ? `${req.duration_months} Months` : '1 Month'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${pillClass}`}>
                          {req.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#64748b]">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/admin/plan-requests`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1d4ed8] hover:text-[#0b1e3f] hover:underline"
                        >
                          Manage <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Administrative Actions ── */}
      <div>
        <h2 className="text-sm font-black text-[#0b1e3f] uppercase tracking-wider mb-4">
          Administrative Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            to="/admin/plan-requests"
            title="Plan Requests & Settlements"
            desc="Manage client investment requests, verify payment status, and track daily payout logs."
            color="blue"
            icon={TrendingUp}
          />
          <QuickAction
            to="/admin/payment-requests"
            title="Client Payment Requests"
            desc="Review and process payout or deposit requests submitted by clients from their portal."
            color="amber"
            icon={Wallet}
          />
          <QuickAction
            to="/admin/payout-reports"
            title="Daily Payout Reports"
            desc="Track daily payout disbursements by date, investor, and financial cycle."
            color="emerald"
            icon={Wallet}
          />
          <QuickAction
            to="/admin/clients"
            title="Client Accounts & KYC"
            desc="Browse client registry, inspect uploaded PAN/Aadhaar/Cheques, and update status."
            color="teal"
            icon={UserCheck}
          />
          <QuickAction
            to="/admin/kyc-review"
            title="KYC Document Verification"
            desc="Review submitted identity documents and apply regulatory approval decisions."
            color="amber"
            icon={FileSearch}
          />
          {!isEmployee && (
            <QuickAction
              to="/admin/employees"
              title="Employee Management"
              desc="Create, manage, and configure role authorizations for operations staff."
              color="blue"
              icon={Users}
            />
          )}
          {!isEmployee && (
            <QuickAction
              to="/admin/contact-messages"
              title="Enquiries & Messages"
              desc="View incoming corporate messages from the public contact form."
              color="violet"
              icon={MessageSquare}
            />
          )}
          {!isEmployee && (
            <QuickAction
              to="/admin/plans"
              title="Investment Plans Setup"
              desc="Configure and publish investment plans and compliance parameters."
              color="emerald"
              icon={TrendingUp}
            />
          )}
        </div>
      </div>

    </div>
  )
}

function QuickAction({ to, title, desc, color, icon: Icon }) {
  const colors = {
    blue:    { icon: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', hborder: '#1d4ed8' },
    emerald: { icon: '#059669', bg: '#ecfdf5', border: '#d1fae5', hborder: '#059669' },
    teal:    { icon: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1', hborder: '#0d9488' },
    amber:   { icon: '#b45309', bg: '#fffbeb', border: '#fde68a', hborder: '#b45309' },
    violet:  { icon: '#0b1e3f', bg: '#f8fafc', border: '#e2e8f0', hborder: '#0b1e3f' },
  }
  const c = colors[color] || colors.blue

  return (
    <Link
      to={to}
      className="group block p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#1d4ed8] transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon className="h-5 w-5" style={{ color: c.icon }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[#0b1e3f] group-hover:text-[#1d4ed8] transition-colors">
            {title}
          </p>
          <p className="text-xs text-[#64748b] mt-1 leading-relaxed font-medium">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  )
}
