import React, { useEffect, useState } from 'react'
import { RefreshCw, Wallet, Calendar, User, TrendingUp, FileText, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

function fmt(paise) {
  if (!paise) return '₹0'
  return '₹' + (Number(paise) / 100).toLocaleString('en-IN')
}

export default function PayoutReportsPage() {
  const { token } = useTrading()
  const [report,   setReport]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState('overview')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (startDate) qs.set('startDate', startDate)
      if (endDate)   qs.set('endDate', endDate)
      const res = await api.admin.planRequests.payoutReport(token, qs.toString())
      setReport(res.data)
    } catch (e) {
      setError(e.message || 'Failed to load payout report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Daily Payout Reports</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Audit and track daily investor returns by date, client account, and plan cycle
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchReport}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Date filters */}
      <div className="flex gap-4 p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex-wrap items-end">
        <div>
          <label className="block text-xs font-bold text-[#475569] mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="rounded-xl px-3.5 py-2 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#475569] mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="rounded-xl px-3.5 py-2 text-xs bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]" />
        </div>
        <Button size="md" onClick={fetchReport}>Apply Filter</Button>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm font-semibold bg-red-50 border border-red-200 text-red-700">
          ⚠ {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox icon={Wallet} label="Total Payout Amount" value={fmt(report?.totalAmount || 0)} color="#059669" />
        <StatBox icon={FileText} label="Total Disbursals" value={report?.totalEntries || 0} color="#1a3c8f" />
        <StatBox icon={Calendar} label="Active Cycles" value={report?.byDate?.length || 0} color="#0891b2" />
        <StatBox icon={User} label="Clients Benefited" value={report?.byClient?.length || 0} color="#7c3aed" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs flex-wrap">
        {[
          { val: 'overview', label: 'Overview' },
          { val: 'byDate',   label: 'By Date' },
          { val: 'byClient', label: 'By Client' },
          { val: 'byPlan',   label: 'By Plan Request' },
          { val: 'recent',   label: 'Recent Payout Records' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === val
                ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] border border-transparent'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-[#f1f5f9] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">Monthly Settlement Aggregate</h3>
                {report?.byMonth?.length > 0 ? (
                  <div className="space-y-2">
                    {report.byMonth.map(m => (
                      <div key={m.month} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                        <span className="text-sm font-bold text-[#0f172a]">{m.month}</span>
                        <span className="text-base font-extrabold text-[#059669]">{fmt(m.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#64748b] py-6 text-center">No payout data available for the selected period.</p>
                )}
              </div>
            )}

            {/* By Date */}
            {tab === 'byDate' && (
              <div className="space-y-2">
                {report?.byDate?.length > 0 ? report.byDate.map(d => (
                  <div key={d.date} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-[#059669]" />
                      <span className="text-sm font-bold text-[#0f172a]">{d.date}</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#059669]">{fmt(d.amount)}</span>
                  </div>
                )) : <p className="text-sm text-[#64748b] py-6 text-center">No date records found.</p>}
              </div>
            )}

            {/* By Client */}
            {tab === 'byClient' && (
              <div className="space-y-2">
                {report?.byClient?.length > 0 ? report.byClient.map(c => (
                  <div key={c.clientId} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-[#1a3c8f]" />
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{c.clientName}</p>
                        <p className="text-xs font-mono text-[#059669] font-bold">{c.registrationId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#059669]">{fmt(c.totalAmount)}</p>
                      <p className="text-xs text-[#64748b] font-medium">{c.count} disbarments</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-[#64748b] py-6 text-center">No client records found.</p>}
              </div>
            )}

            {/* By Plan Request */}
            {tab === 'byPlan' && (
              <div className="space-y-2">
                {report?.byPlanRequest?.length > 0 ? report.byPlanRequest.map(p => (
                  <div key={p.requestNumber} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={16} className="text-[#0891b2]" />
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{p.planName}</p>
                        <p className="text-xs text-[#64748b] font-medium">{p.clientName} · <span className="font-mono font-bold text-[#059669]">{p.requestNumber}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#059669]">{fmt(p.totalAmount)}</p>
                      <p className="text-xs text-[#64748b] font-medium">{p.count} cycles</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-[#64748b] py-6 text-center">No plan records found.</p>}
              </div>
            )}

            {/* Recent Entries */}
            {tab === 'recent' && (
              <div className="space-y-2">
                {report?.recentPayouts?.length > 0 ? report.recentPayouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-3">
                      <Wallet size={16} className="text-[#059669]" />
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{p.clientName}</p>
                        <p className="text-xs text-[#64748b] font-medium">
                          {p.payoutDate} · {p.planName} · <span className="font-mono font-bold text-[#059669]">{p.requestNumber}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#059669]">{fmt(p.amount)}</p>
                      {p.paymentMethod && (
                        <p className="text-[11px] text-[#64748b] font-semibold">{p.paymentMethod.replace('_', ' ')}</p>
                      )}
                      {p.transactionRef && (
                        <p className="text-[10px] font-mono font-bold text-[#64748b]">{p.transactionRef}</p>
                      )}
                    </div>
                  </div>
                )) : <p className="text-sm text-[#64748b] py-6 text-center">No recent payouts.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} style={{ color }} />
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-[#0f172a] tracking-tight">{value}</p>
    </div>
  )
}
