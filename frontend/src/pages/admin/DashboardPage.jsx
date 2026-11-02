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
        <h1 className="text-xl font-bold" style={{ color:'#f0f4f8' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color:'#7090a8' }}>
          Welcome back, <span style={{ color:'#d4a843' }}>{user?.first_name}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>{error}</div>
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
      <div className="mt-8 rounded-xl p-4" style={{ background:'rgba(212,168,67,0.05)', border:'1px solid rgba(212,168,67,0.2)' }}>
        <p className="text-xs leading-relaxed" style={{ color:'rgba(212,168,67,0.8)' }}>
          <span className="font-semibold" style={{ color:'#d4a843' }}>Compliance Reminder:</span> All 10 deal plans are currently
          inactive (<code className="px-1 rounded text-[10px]" style={{ background:'rgba(212,168,67,0.1)', color:'#f0c060' }}>pending_review</code>). An authorized
          administrator must configure <code className="px-1 rounded text-[10px]" style={{ background:'rgba(212,168,67,0.1)', color:'#f0c060' }}>associated_value_type</code>{' '}
          for each plan and activate it only after legal authorization, approved terms, and compliance
          approval are confirmed. Do not activate plans or collect payments without these approvals.
        </p>
      </div>
    </div>
  )
}

function QuickAction({ to, title, desc, color, icon: Icon }) {
  const colors = {
    emerald: { border:'rgba(212,168,67,0.2)',  hborder:'rgba(212,168,67,0.45)',  icon:'#d4a843',  bg:'rgba(212,168,67,0.08)'  },
    teal:    { border:'rgba(34,197,94,0.2)',   hborder:'rgba(34,197,94,0.45)',   icon:'#4ade80',  bg:'rgba(34,197,94,0.08)'   },
    amber:   { border:'rgba(251,191,36,0.2)',  hborder:'rgba(251,191,36,0.45)',  icon:'#fbbf24',  bg:'rgba(251,191,36,0.08)'  },
    blue:    { border:'rgba(96,165,250,0.2)',  hborder:'rgba(96,165,250,0.45)',  icon:'#60a5fa',  bg:'rgba(96,165,250,0.08)'  },
    violet:  { border:'rgba(167,139,250,0.2)', hborder:'rgba(167,139,250,0.45)', icon:'#a78bfa',  bg:'rgba(167,139,250,0.08)' },
    red:     { border:'rgba(248,113,113,0.2)', hborder:'rgba(248,113,113,0.45)', icon:'#f87171',  bg:'rgba(248,113,113,0.08)' },
  }
  const c = colors[color] || colors.emerald
  return (
    <Link to={to}
      className="block p-4 rounded-xl transition-all group"
      style={{ background:'rgba(15,36,96,0.35)', border:`1px solid ${c.border}` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=c.hborder; e.currentTarget.style.background='rgba(15,36,96,0.55)'; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=c.border;  e.currentTarget.style.background='rgba(15,36,96,0.35)'; e.currentTarget.style.transform='none' }}>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:c.bg, border:`1px solid ${c.border}` }}>
          <Icon className="h-4 w-4" style={{ color:c.icon }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color:'#f0f4f8' }}>{title}</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color:'#7090a8' }}>{desc}</p>
        </div>
      </div>
    </Link>
  )
}
