import React, { useEffect, useState } from 'react'
import { Search, RefreshCw, Eye, X, Phone, Mail, MapPin, CreditCard, Building2, User, ClipboardList, UserCheck } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const KYC_COLOR    = { not_started:'gray', submitted:'amber', in_review:'blue', verified:'emerald', rejected:'red' }
const CLIENT_COLOR = { pending_kyc:'amber', kyc_submitted:'blue', active:'emerald', rejected:'red', inactive:'gray' }

const PANEL_BG = '#111f3d'
const BORDER   = 'rgba(212,168,67,0.2)'

/* ── Detail Drawer ── */
function ClientDrawer({ client, onClose, token, onKycUpdate, userRole }) {
  const [detail,   setDetail]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)
  const [kycNote,  setKycNote]  = useState('')

  /* Assign state */
  const [employees,    setEmployees]    = useState([])
  const [assignEmpId,  setAssignEmpId]  = useState('')
  const [assigning,    setAssigning]    = useState(false)

  const isAdmin = ['admin', 'super_admin'].includes(userRole)

  useEffect(() => {
    if (!client) return
    setLoading(true)
    api.admin.clients.get(client.id, token)
      .then(r => setDetail(r.data.client))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [client, token])

  /* Load employees for assign dropdown */
  useEffect(() => {
    if (!isAdmin) return
    api.admin.employees.list(token, 'pageSize=100')
      .then(r => setEmployees(r.data?.employees || []))
      .catch(() => {})
  }, [token, isAdmin])

  const updateKyc = async (status) => {
    if (status === 'rejected' && !kycNote.trim()) {
      alert('Please provide a rejection reason.')
      return
    }
    setUpdating(true)
    try {
      await api.admin.clients.updateKyc(client.id, { status, rejectionReason: kycNote }, token)
      onKycUpdate(); onClose()
    } catch (e) { alert(e.message || 'Update failed') }
    finally { setUpdating(false) }
  }

  const assignToEmployee = async () => {
    setAssigning(true)
    try {
      await api.admin.clients.assign(client.id, { employeeId: assignEmpId || null }, token)
      onKycUpdate(); onClose()
    } catch (e) { alert(e.message || 'Assign failed') }
    finally { setAssigning(false) }
  }

  if (!client) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto"
        style={{ background: PANEL_BG, borderLeft: `1px solid ${BORDER}` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: PANEL_BG, borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <h3 className="text-base font-bold" style={{ color:'#f0f4f8' }}>{client.fullName}</h3>
            <p className="text-xs font-mono" style={{ color:'#d4a843' }}>{client.registrationId}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background:'rgba(255,255,255,0.06)' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
            <X className="h-4 w-4" style={{ color:'#9ab0c4' }} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ color:'#506070' }} />
          </div>
        ) : detail ? (
          <div className="px-6 py-5 space-y-5">

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge color={CLIENT_COLOR[detail.status]||'gray'}>{detail.status?.replace('_',' ')}</Badge>
              <Badge color={KYC_COLOR[detail.kyc?.verification_status]||'gray'}>
                KYC: {detail.kyc?.verification_status?.replace('_',' ')||'not started'}
              </Badge>
            </div>

            {/* Personal */}
            <Section icon={User} title="Personal Details">
              <Row label="Full Name"  value={detail.full_name} />
              <Row label="Mobile"     value={<a href={`tel:${detail.mobile}`} className="hover:underline" style={{color:'#d4a843'}}>{detail.mobile}</a>} />
              <Row label="Email"      value={<a href={`mailto:${detail.email}`} className="hover:underline break-all" style={{color:'#d4a843'}}>{detail.email}</a>} />
              <Row label="City"       value={detail.city} />
              <Row label="State"      value={detail.state} />
              <Row label="PIN Code"   value={detail.postal_code} />
              <Row label="Registered" value={detail.created_at ? new Date(detail.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'} />
            </Section>

            {/* KYC */}
            {detail.kyc && (
              <Section icon={CreditCard} title="KYC Details">
                {detail.kyc.pan_masked && <Row label="PAN" value={<span className="font-mono">{detail.kyc.pan_masked}</span>} />}
                <Row label="KYC Status" value={detail.kyc.verification_status?.replace('_',' ')} />
                {detail.kyc.rejection_reason && (
                  <Row label="Rejection Reason" value={<span style={{color:'#f87171'}}>{detail.kyc.rejection_reason}</span>} />
                )}
                {detail.kyc.verified_at && (
                  <Row label="Verified At" value={new Date(detail.kyc.verified_at).toLocaleDateString('en-IN')} />
                )}
              </Section>
            )}

            {/* Bank */}
            {detail.bankAccounts?.length > 0 && (
              <Section icon={Building2} title="Bank Details">
                {detail.bankAccounts.map((acc,i) => (
                  <div key={acc.id} className={i>0?'pt-3 border-t':''} style={{borderColor:'rgba(212,168,67,0.1)'}}>
                    <Row label="Account Holder" value={acc.account_holder_name} />
                    <Row label="Bank"           value={acc.bank_name} />
                    <Row label="Account No."    value={<span className="font-mono">{acc.account_number_masked}</span>} />
                    <Row label="IFSC"            value={<span className="font-mono">{acc.ifsc_code}</span>} />
                    <Row label="Verified"        value={acc.verification_status} />
                  </div>
                ))}
              </Section>
            )}

            {/* Assigned employee */}
            <Section icon={UserCheck} title="Assigned Employee">
              {detail.originatingEmployee ? (
                <>
                  <Row label="Employee Code" value={<span className="font-mono" style={{color:'#d4a843'}}>{detail.originatingEmployee.employee_code}</span>} />
                  {detail.originatingEmployee.user && (
                    <Row label="Name" value={`${detail.originatingEmployee.user.first_name} ${detail.originatingEmployee.user.last_name}`} />
                  )}
                </>
              ) : (
                <p className="text-xs" style={{color:'#7090a8'}}>Not assigned to any employee</p>
              )}
            </Section>

            {/* ── ASSIGN TO EMPLOYEE (admin only) ── */}
            {isAdmin && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background:'rgba(22,46,110,0.4)', border:'1px solid rgba(212,168,67,0.25)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'#d4a843'}}>
                  <UserCheck className="inline h-3.5 w-3.5 mr-1" />
                  Assign / Reassign Employee
                </p>
                <select
                  value={assignEmpId}
                  onChange={e => setAssignEmpId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background:'rgba(14,26,53,0.8)', border:'1px solid rgba(212,168,67,0.3)', color:'#dde8f5' }}>
                  <option value="">— Unassign (no employee) —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} style={{background:'#111f3d'}}>
                      {emp.employeeCode} — {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={assignToEmployee}
                  disabled={assigning}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#d4a843,#a07020)', color:'#fff' }}>
                  {assigning ? 'Assigning…' : 'Confirm Assignment'}
                </button>
              </div>
            )}

            {/* KYC actions */}
            {(detail.kyc?.verification_status === 'submitted' || detail.kyc?.verification_status === 'in_review') && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background:'rgba(22,46,110,0.4)', border:'1px solid rgba(212,168,67,0.2)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'#d4a843'}}>Update KYC Status</p>
                <div>
                  <label className="block text-xs mb-1" style={{color:'#9ab0c4'}}>Rejection reason (if rejecting)</label>
                  <textarea
                    value={kycNote} onChange={e => setKycNote(e.target.value)}
                    rows={2} placeholder="Enter reason for rejection…"
                    className="w-full rounded-lg px-3 py-2 text-xs resize-none focus:outline-none"
                    style={{ background:'rgba(14,26,53,0.8)', border:'1px solid rgba(212,168,67,0.2)', color:'#dde8f5' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>updateKyc('verified')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.4)', color:'#4ade80' }}>
                    ✓ Verify KYC
                  </button>
                  <button onClick={()=>updateKyc('in_review')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.35)', color:'#60a5fa' }}>
                    ⟳ In Review
                  </button>
                  <button onClick={()=>updateKyc('rejected')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171' }}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <p className="p-6 text-sm" style={{color:'#7090a8'}}>Could not load client details.</p>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(212,168,67,0.18)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{ background:'rgba(212,168,67,0.07)', borderBottom:'1px solid rgba(212,168,67,0.12)' }}>
        <Icon className="h-3.5 w-3.5" style={{color:'#d4a843'}} />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'#d4a843'}}>{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span style={{color:'#7090a8'}}>{label}</span>
      <span className="text-right" style={{color:'#dde8f5'}}>{value || '—'}</span>
    </div>
  )
}

/* ── Main Page ── */
export default function ClientsPage() {
  const { token, user } = useTrading()
  const [clients,    setClients]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected,   setSelected]   = useState(null)

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, pageSize: 20 })
      if (filter !== 'all') params.set('status', filter)
      const res = await api.admin.clients.list(token, params.toString())
      setClients(res.data.clients)
      setTotalPages(res.data.pagination.pages)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClients() }, [page, filter])

  const filtered = clients.filter(c =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.registrationId?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search)
  )

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{color:'#f0f4f8'}}>Clients</h1>
            <p className="text-sm mt-0.5" style={{color:'#7090a8'}}>All registered clients — click a row to view details</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'#506070'}} />
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by name, email, reg. ID, mobile…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background:'rgba(22,46,110,0.5)', border:'1px solid rgba(212,168,67,0.25)', color:'#dde8f5' }}
            />
          </div>
          <select
            value={filter} onChange={e=>{setFilter(e.target.value);setPage(1)}}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background:'rgba(22,46,110,0.5)', border:'1px solid rgba(212,168,67,0.25)', color:'#dde8f5', cursor:'pointer' }}>
            <option value="all">All Statuses</option>
            <option value="pending_kyc">Pending KYC</option>
            <option value="kyc_submitted">KYC Submitted</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchClients}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background:'rgba(22,46,110,0.35)', border:'1px solid rgba(212,168,67,0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(212,168,67,0.18)' }}>
                  {['Client','Reg. ID','Employee','KYC','Status','Registered','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left"
                      style={{color:'#9ab0c4'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:5}).map((_,i) => (
                    <tr key={i}>{Array.from({length:7}).map((_,j)=>(
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{background:'rgba(212,168,67,0.08)'}} />
                      </td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{color:'#506070'}}>No clients found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom:'1px solid rgba(212,168,67,0.08)' }}
                    onClick={() => setSelected(c)}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(212,168,67,0.05)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{color:'#f0f4f8'}}>{c.fullName}</p>
                      <p className="text-xs" style={{color:'#7090a8'}}>{c.email}</p>
                      <p className="text-xs" style={{color:'#506070'}}>{c.mobile}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{color:'#d4a843'}}>{c.registrationId}</td>
                    <td className="px-4 py-3">
                      {c.employeeCode
                        ? <><p className="font-mono text-xs" style={{color:'#4ade80'}}>{c.employeeCode}</p>
                            <p className="text-xs" style={{color:'#7090a8'}}>{c.employeeName}</p></>
                        : <span className="text-xs" style={{color:'#506070'}}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={KYC_COLOR[c.kycStatus]||'gray'}>
                        {c.kycStatus?.replace('_',' ')||'not started'}
                      </Badge>
                      {c.panMasked && <p className="text-xs font-mono mt-0.5" style={{color:'#7090a8'}}>{c.panMasked}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={CLIENT_COLOR[c.status]||'gray'}>{c.status?.replace('_',' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{color:'#7090a8'}}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e=>{e.stopPropagation();setSelected(c)}}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.25)', color:'#d4a843' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(212,168,67,0.2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(212,168,67,0.1)'}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{borderTop:'1px solid rgba(212,168,67,0.15)'}}>
              <Button variant="secondary" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button>
              <span className="text-xs" style={{color:'#7090a8'}}>Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ClientDrawer
          client={selected}
          token={token}
          userRole={user?.role}
          onClose={()=>setSelected(null)}
          onKycUpdate={fetchClients}
        />
      )}
    </>
  )
}
