import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, UserX, UserCheck, Shield, Mail, Phone, Building } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'
import CreateEmployeeModal from '../../components/admin/CreateEmployeeModal.jsx'

export default function EmployeesPage() {
  const { token } = useTrading()
  const [employees, setEmployees]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [showCreate, setShowCreate]     = useState(false)
  const [page, setPage]                 = useState(1)
  const [totalPages, setTotalPages]     = useState(1)
  const [total, setTotal]               = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError]               = useState('')
  const [actionMsg, setActionMsg]       = useState('')

  const fetchEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('status', filter)
      const res = await api.admin.employees.list(token, params.toString())
      setEmployees(res.data.employees || [])
      setTotalPages(res.data.pagination.pages || 1)
      setTotal(res.data.pagination.total || 0)
    } catch (e) {
      setError(e.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [page, filter])

  const handleToggleStatus = async (emp) => {
    const newStatus = !emp.isActive
    setActionLoading(emp.id)
    setActionMsg('')
    try {
      await api.admin.employees.setStatus(emp.id, newStatus, token)
      setActionMsg(`Employee account ${newStatus ? 'activated' : 'deactivated'} successfully`)
      await fetchEmployees()
    } catch (e) {
      setError(e.message || 'Failed to update employee status')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = employees.filter(e =>
    !search ||
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Employee Directory</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            {total} registered personnel · Manage staff access, credentials and roles
          </p>
        </div>
        <Button size="md" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add New Employee
        </Button>
      </div>

      {error && (
        <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
          ⚠ {error}
        </div>
      )}
      {actionMsg && (
        <div className="px-5 py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-[#059669]">
          ✓ {actionMsg}
        </div>
      )}

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, employee code…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
          />
        </div>
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#059669] cursor-pointer"
        >
          <option value="all">All Employment Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <Button variant="secondary" size="md" onClick={() => fetchEmployees()}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Staff Code</th>
                <th className="py-3.5 px-6">Contact Info</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#64748b]">
                    No employees matching search criteria
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-[#0f172a] text-sm">{emp.fullName}</p>
                    <p className="text-[11px] text-[#64748b]">{emp.city || 'India'}</p>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#059669] text-xs">
                    {emp.employeeCode}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[#0f172a] font-medium">{emp.email}</p>
                    <p className="text-[11px] text-[#64748b]">{emp.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-[#334155] font-semibold">
                    {emp.department || 'Operations'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      emp.isActive
                        ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                        : 'bg-red-50 text-[#dc2626] border-red-200'
                    }`}>
                      {emp.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#64748b]">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      size="sm"
                      variant={emp.isActive ? 'danger' : 'outline'}
                      loading={actionLoading === emp.id}
                      onClick={() => handleToggleStatus(emp)}
                    >
                      {emp.isActive
                        ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                        : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                      }
                    </Button>
                  </td>
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

      {showCreate && (
        <CreateEmployeeModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchEmployees() }}
        />
      )}
    </div>
  )
}
