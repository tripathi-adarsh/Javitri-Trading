import React, { useEffect, useState } from 'react'
import {
  Users, UserCheck, Link2, FileSearch,
  ShoppingCart, CreditCard, CheckCircle2, XCircle, Clock
} from 'lucide-react'
import StatCard from '../../components/ui/StatCard.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { token, user } = useTrading()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!token) return
    api.admin.stats(token)
      .then(res => setStats(res.data))
      .catch(() => setError('Could not load statistics.'))
      .finally(() => setLoading(false))
  }, [token])

  const isEmployee = user?.role === 'employee'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, <span className="text-gray-300">{user?.first_name}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400">{error}</div>
      )}

      {!isEmployee && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}        label="Total Employees"       value={stats?.totalEmployees}  color="blue"    loading={loading} />
          <StatCard icon={Users}        label="Active Employees"      value={stats?.activeEmployees} color="emerald" loading={loading} />
          <StatCard icon={UserCheck}    label="Total Clients"         value={stats?.totalClients}    color="teal"    loading={loading} />
          <StatCard icon={FileSearch}   label="Pending KYC"           value={stats?.pendingKyc}      color="amber"   loading={loading} />
          <StatCard icon={Link2}        label="Active Links"          value={stats?.activeLinks}     color="violet"  loading={loading} />
          <StatCard icon={ShoppingCart} label="Total Orders"          value={stats?.totalOrders}     color="blue"    loading={loading} />
          <StatCard icon={Clock}        label="Awaiting Review"       value={stats?.awaitingReview}  color="amber"   loading={loading} />
          <StatCard icon={CheckCircle2} label="Approved Payments"     value={stats?.approved}        color="emerald" loading={loading} />
          <StatCard icon={XCircle}      label="Rejected Payments"     value={stats?.rejected}        color="red"     loading={loading} />
        </div>
      )}

      {isEmployee && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={UserCheck} label="My Clients"    value={stats?.totalClients}  color="teal"    loading={loading} />
          <StatCard icon={Link2}     label="Active Links"  value={stats?.activeLinks}   color="emerald" loading={loading} />
          <StatCard icon={FileSearch}label="Pending KYC"   value={stats?.pendingKyc}    color="amber"   loading={loading} />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickAction
          to="/admin/registration-links"
          title="Generate Registration Link"
          desc="Create a new client registration link to share via WhatsApp or email."
          color="emerald"
          icon={Link2}
        />
        <QuickAction
          to="/admin/clients"
          title="View Clients"
          desc="Browse client registrations and check their KYC and order status."
          color="teal"
          icon={UserCheck}
        />
        {!isEmployee && (
          <QuickAction
            to="/admin/payments"
            title="Review Payments"
            desc="Approve or reject verified payment records awaiting admin review."
            color="amber"
            icon={CreditCard}
          />
        )}
        {!isEmployee && (
          <QuickAction
            to="/admin/employees"
            title="Manage Employees"
            desc="Create and manage employee accounts and their access."
            color="blue"
            icon={Users}
          />
        )}
        {!isEmployee && (
          <QuickAction
            to="/admin/plans"
            title="Manage Plans"
            desc="Configure deal plans, activate them after compliance review."
            color="violet"
            icon={ShoppingCart}
          />
        )}
        {!isEmployee && (
          <QuickAction
            to="/admin/kyc-review"
            title="KYC Review"
            desc="Review submitted KYC documents and update verification status."
            color="red"
            icon={FileSearch}
          />
        )}
      </div>

      {/* Compliance reminder */}
      <div className="mt-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-semibold">Compliance Reminder:</span> All 10 deal plans are currently
          inactive (<code className="bg-gray-800 px-1 rounded">pending_review</code>). An authorized
          administrator must configure <code className="bg-gray-800 px-1 rounded">associated_value_type</code>{' '}
          for each plan and activate it only after legal authorization, approved terms, and compliance
          approval are confirmed. Do not activate plans or collect payments without these approvals.
        </p>
      </div>
    </div>
  )
}

function QuickAction({ to, title, desc, color, icon: Icon }) {
  const colors = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400',
    teal:    'border-teal-500/20 hover:border-teal-500/40 text-teal-400',
    amber:   'border-amber-500/20 hover:border-amber-500/40 text-amber-400',
    blue:    'border-blue-500/20 hover:border-blue-500/40 text-blue-400',
    violet:  'border-violet-500/20 hover:border-violet-500/40 text-violet-400',
    red:     'border-red-500/20 hover:border-red-500/40 text-red-400',
  }
  return (
    <Link
      to={to}
      className={`block p-4 rounded-xl border bg-gray-900/40 hover:bg-gray-900/70 transition-all group ${colors[color]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white group-hover:text-white">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  )
}
