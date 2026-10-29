import React, { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, UserX, UserCheck, Eye } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'
import CreateEmployeeModal from '../../components/admin/CreateEmployeeModal.jsx'

export default function EmployeesPage() {
  const { token } = useTrading()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('status', filter)
      const res = await api.admin.employees.list(token, params.toString())
      setEmployees(res.data.employees)
      setTotalPages(res.data.pagination.pages)
    } catch { /* handled by error display */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmployees() }, [page, filter])

  const handleToggleStatus = async (emp) => {
    setActionLoading(emp.id)
    try {
      await api.admin.employees.setStatus(emp.id, !emp.isActive, token)
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, isActive: !e.isActive } : e))
    } catch { /* show toast in production */ }
    finally { setActionLoading(null) }
  }

  const filtered = employees.filter(e =>
    !search ||
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage employee accounts and access</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, code…"
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="secondary" size="sm" onClick={fetchEmployees}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">
                    No employees found
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{emp.fullName}</p>
                    {emp.department && <p className="text-xs text-gray-500">{emp.department}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">{emp.employeeCode}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-300">{emp.email}</p>
                    <p className="text-xs text-gray-500">{emp.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={emp.isActive ? 'emerald' : 'red'}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={emp.isActive ? 'danger' : 'outline'}
                        loading={actionLoading === emp.id}
                        onClick={() => handleToggleStatus(emp)}
                        title={emp.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {emp.isActive
                          ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                          : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                        }
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
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
