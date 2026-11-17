import React, { useEffect, useState } from 'react'
import { RefreshCw, Wallet, Calendar, User, TrendingUp, FileText } from 'lucide-react'
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f0f4f8' }}>Daily Payout Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7090a8' }}>
            Track all daily payouts — by date, client, and plan request
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchReport}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Date filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-end">
        <div>
          <label className="block text-xs mb-1" style={{ color: '#7090a8' }}>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.5)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: '#7090a8' }}>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.5)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
        </div>
        <Button size="sm" onClick={fetchReport}>Apply Filter</Button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBox icon={Wallet} label="Total Payout Amount" value={fmt(report?.totalAmount || 0)} color="#4ade80" />
        <StatBox icon={FileText} label="Total Entries" value={report?.totalEntries || 0} color="#d4a843" />
        <StatBox icon={Calendar} label="Daily Dates" value={report?.byDate?.length || 0} color="#60a5fa" />
        <StatBox icon={User} label="Clients Paid" value={report?.byClient?.length || 0} color="#a78bfa" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { val: 'overview', label: 'Overview' },
          { val: 'byDate',   label: 'By Date' },
          { val: 'byClient', label: 'By Client' },
          { val: 'byPlan',   label: 'By Plan Request' },
          { val: 'recent',   label: 'Recent Entries' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === val ? 'rgba(212,168,67,0.2)' : 'rgba(22,46,110,0.3)',
              border: tab === val ? '1px solid rgba(212,168,67,0.5)' : '1px solid rgba(212,168,67,0.15)',
              color: tab === val ? '#d4a843' : '#7090a8',
              cursor: 'pointer',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(212,168,67,0.06)' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#d4a843' }}>Monthly Summary</h3>
                {report?.byMonth?.length > 0 ? (
                  <div className="space-y-1.5">
                    {report.byMonth.map(m => (
                      <div key={m.month} className="flex items-center justify-between px-4 py-2 rounded-lg"
                        style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.1)' }}>
                        <span className="text-sm" style={{ color: '#9ab0c4' }}>{m.month}</span>
                        <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>{fmt(m.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: '#506070' }}>No payout data available.</p>
                )}
              </div>
            </div>
          )}

          {/* By Date */}
          {tab === 'byDate' && (
            <div className="space-y-1.5">
              {report?.byDate?.length > 0 ? report.byDate.map(d => (
                <div key={d.date} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: '#7090a8' }} />
                    <span className="text-sm" style={{ color: '#dde8f5' }}>{d.date}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>{fmt(d.amount)}</span>
                </div>
              )) : <p className="text-xs" style={{ color: '#506070' }}>No payout data.</p>}
            </div>
          )}

          {/* By Client */}
          {tab === 'byClient' && (
            <div className="space-y-1.5">
              {report?.byClient?.length > 0 ? report.byClient.map(c => (
                <div key={c.clientId} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <User size={14} style={{ color: '#7090a8' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#dde8f5' }}>{c.clientName}</p>
                      <p className="text-xs font-mono" style={{ color: '#d4a843' }}>{c.registrationId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>{fmt(c.totalAmount)}</p>
                    <p className="text-xs" style={{ color: '#506070' }}>{c.count} entries</p>
                  </div>
                </div>
              )) : <p className="text-xs" style={{ color: '#506070' }}>No payout data.</p>}
            </div>
          )}

          {/* By Plan Request */}
          {tab === 'byPlan' && (
            <div className="space-y-1.5">
              {report?.byPlanRequest?.length > 0 ? report.byPlanRequest.map(p => (
                <div key={p.requestNumber} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <TrendingUp size={14} style={{ color: '#7090a8' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#dde8f5' }}>{p.planName}</p>
                      <p className="text-xs" style={{ color: '#506070' }}>{p.clientName} · <span className="font-mono" style={{ color: '#d4a843' }}>{p.requestNumber}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>{fmt(p.totalAmount)}</p>
                    <p className="text-xs" style={{ color: '#506070' }}>{p.count} entries</p>
                  </div>
                </div>
              )) : <p className="text-xs" style={{ color: '#506070' }}>No payout data.</p>}
            </div>
          )}

          {/* Recent Entries */}
          {tab === 'recent' && (
            <div className="space-y-1.5">
              {report?.recentPayouts?.length > 0 ? report.recentPayouts.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <Wallet size={14} style={{ color: '#7090a8' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#dde8f5' }}>{p.clientName}</p>
                      <p className="text-xs" style={{ color: '#506070' }}>
                        {p.payoutDate} · {p.planName} · <span className="font-mono" style={{ color: '#d4a843' }}>{p.requestNumber}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>{fmt(p.amount)}</p>
                    {p.paymentMethod && (
                      <p className="text-xs" style={{ color: '#506070' }}>{p.paymentMethod.replace('_', ' ')}</p>
                    )}
                    {p.transactionRef && (
                      <p className="text-[10px] font-mono" style={{ color: '#506070' }}>{p.transactionRef}</p>
                    )}
                  </div>
                </div>
              )) : <p className="text-xs" style={{ color: '#506070' }}>No recent payouts.</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.15)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <p className="text-xs" style={{ color: '#7090a8' }}>{label}</p>
      </div>
      <p className="text-lg font-bold" style={{ color: '#f0f4f8' }}>{value}</p>
    </div>
  )
}
