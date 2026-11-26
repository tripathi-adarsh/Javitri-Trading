import React, { useEffect, useState } from 'react'
import { RefreshCw, ShoppingCart } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const STATUS_COLOR = {
  created:  'gray',
  pending:  'amber',
  paid:     'emerald',
  failed:   'red',
  refunded: 'blue',
}

export default function OrdersPage() {
  const { token } = useTrading()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.admin.orders.list(token, `page=${page}&pageSize=20`)
      setOrders(res.data.orders || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [page])

  const fmt = (paise) => paise != null ? `₹${(paise / 100).toLocaleString('en-IN')}` : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Client Orders</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">Direct system-generated payment orders and invoices</p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchOrders}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Client / User</th>
                <th className="py-3.5 px-6">Plan Name</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Order Status</th>
                <th className="py-3.5 px-6">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-[#64748b]">
                    <ShoppingCart className="h-8 w-8 text-[#94a3b8] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-[#0f172a]">No orders registered</p>
                  </td>
                </tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-xs text-[#059669]">{o.id?.slice(0, 10)}…</td>
                  <td className="py-4 px-6 font-semibold text-[#0f172a] text-xs">{o.clientName || o.userName || '—'}</td>
                  <td className="py-4 px-6 text-[#475569] font-medium text-xs">{o.planName || '—'}</td>
                  <td className="py-4 px-6 font-extrabold text-[#0f172a] text-xs">{fmt(o.total_paise)}</td>
                  <td className="py-4 px-6"><Badge color={STATUS_COLOR[o.status] || 'gray'}>{o.status}</Badge></td>
                  <td className="py-4 px-6 text-[#64748b] text-xs font-medium">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
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
    </div>
  )
}
