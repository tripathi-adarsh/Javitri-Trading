import React, { useEffect, useState } from 'react'
import { RefreshCw, Shield, FileText } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Immutable regulatory compliance record of all administrative actions and security events
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchLogs}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Timestamp (IST)</th>
                <th className="py-3.5 px-6">Actor ID</th>
                <th className="py-3.5 px-6">Action Performed</th>
                <th className="py-3.5 px-6">Target Entity</th>
                <th className="py-3.5 px-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3.5 px-6">
                        <div className="h-3.5 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-[#64748b]">
                    <FileText className="h-8 w-8 text-[#94a3b8] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-[#0f172a]">No audit log entries recorded yet</p>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-3.5 px-6 text-[#64748b] whitespace-nowrap font-medium">
                    {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[#475569] font-semibold">
                    {log.actor_user_id?.slice(0, 8) || 'SYSTEM'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-mono text-xs font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-[#475569]">
                    {log.entity_type && <span className="font-semibold text-[#0f172a]">{log.entity_type}: </span>}
                    {log.entity_id && <span className="font-mono text-xs">{log.entity_id.slice(0, 8)}</span>}
                  </td>
                  <td className="py-3.5 px-6 text-[#64748b] font-mono text-xs">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-xs font-bold text-[#64748b]">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
