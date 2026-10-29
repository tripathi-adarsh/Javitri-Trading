import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">All client orders</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchOrders}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id?.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{o.clientName || o.userName || '—'}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{o.planName || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-white text-xs">{fmt(o.total_paise)}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[o.status] || 'gray'}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}
