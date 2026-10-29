import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

export default function AuditLogsPage() {
  const { token } = useTrading()
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.admin.auditLogs.list(token, `page=${page}&pageSize=50`)
      setLogs(res.data.logs || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLogs() }, [page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Immutable record of all system actions</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchLogs}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actor</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No audit logs found</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{log.actor_user_id?.slice(0, 8) || 'system'}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-emerald-400">{log.action}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {log.entity_type && <span>{log.entity_type}: </span>}
                    {log.entity_id && <span className="font-mono">{log.entity_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono">{log.ip_address || '—'}</td>
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
