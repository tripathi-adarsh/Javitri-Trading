import React, { useEffect, useRef, useState } from 'react'
import {
  Search, RefreshCw, Eye, X, CreditCard, Building2, User, UserCheck,
  Upload, FileImage, Loader2, AlertCircle, ChevronRight, CheckCircle2
} from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const KYC_COLOR    = { not_started: 'gray', submitted: 'amber', in_review: 'blue', verified: 'emerald', rejected: 'red' }
const CLIENT_COLOR = { pending_kyc: 'amber', kyc_submitted: 'blue', active: 'emerald', rejected: 'red', inactive: 'gray' }

/* ── Full-screen image lightbox ─────────────────────────────────────────── */
function ImageLightbox({ src, label, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">{label}</p>
          <button onClick={onClose}
            className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer">
            Close ✕
          </button>
        </div>
        <img src={src} alt={label}
          className="w-full rounded-2xl object-contain shadow-2xl"
          style={{ maxHeight: '75vh', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div className="hidden items-center justify-center py-16 rounded-2xl bg-white border border-red-200">
          <p className="text-sm font-semibold text-red-600">Cannot preview — file may be a PDF or corrupted.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Single document view button ────────────────────────────────────────── */
function DocButton({ clientId, docType, label, token }) {
  const [lightbox, setLightbox] = useState(false)
  const imgUrl = `${BASE_URL}/clients/${clientId}/kyc-documents/${docType}?token=${encodeURIComponent(token || '')}`

  return (
    <>
      <button onClick={() => setLightbox(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
        <Eye className="h-3.5 w-3.5" /> {label}
      </button>
      {lightbox && <ImageLightbox src={imgUrl} label={label} onClose={() => setLightbox(false)} />}
    </>
  )
}

/* ── Admin document upload widget ───────────────────────────────────────── */
function AdminDocUpload({ clientId, token, onUploaded }) {
  const aadhaarRef      = useRef()
  const aadhaarBackRef  = useRef()
  const panRef          = useRef()
  const passRef         = useRef()
  const [files, setFiles]       = useState({ aadhaar: null, aadhaarBack: null, pan: null, passbook: null })
  const [uploading, setUploading] = useState(false)
  const [error, setError]        = useState('')
  const [done, setDone]          = useState(false)

  const hasAny = !!(files.aadhaar || files.aadhaarBack || files.pan || files.passbook)

  const pick = (key, file) => {
    if (!file) return
    setFiles(prev => ({ ...prev, [key]: file }))
    setError('')
  }

  const handleUpload = async () => {
    if (!hasAny) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      if (files.aadhaar)      fd.append('aadhaarImage',      files.aadhaar,      files.aadhaar.name)
      if (files.aadhaarBack)  fd.append('aadhaarBackImage',  files.aadhaarBack,  files.aadhaarBack.name)
      if (files.pan)          fd.append('panImage',          files.pan,          files.pan.name)
      if (files.passbook)     fd.append('passbookImage',     files.passbook,     files.passbook.name)

      const res = await fetch(`${BASE_URL}/clients/${clientId}/kyc-documents`, {
        method: 'POST',
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`)
      setDone(true)
      setFiles({ aadhaar: null, aadhaarBack: null, pan: null, passbook: null })
      onUploaded()
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (done) return (
    <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200">
      <CheckCircle2 className="h-4 w-4 text-[#059669]" />
      <span className="text-xs font-bold text-[#059669]">Documents uploaded successfully</span>
      <button onClick={() => setDone(false)} className="text-xs font-semibold underline text-[#64748b] ml-auto cursor-pointer">Upload more</button>
    </div>
  )

  return (
    <div className="space-y-3 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
      {[
        { key: 'aadhaar',      label: 'Aadhaar Card (Front)', ref: aadhaarRef },
        { key: 'aadhaarBack',  label: 'Aadhaar Card (Back)',  ref: aadhaarBackRef },
        { key: 'pan',          label: 'PAN Card',              ref: panRef },
        { key: 'passbook',     label: 'Bank Passbook / Cheque', ref: passRef },
      ].map(({ key, label, ref }) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[#475569]">{label}</span>
          <div className="flex items-center gap-2">
            {files[key] ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                <FileImage className="h-3 w-3 text-[#059669]" />
                <span className="text-xs max-w-[120px] truncate font-semibold text-[#059669]">{files[key].name}</span>
                <button onClick={() => setFiles(p => ({ ...p, [key]: null }))}
                  className="ml-1 text-red-600 hover:text-red-700 font-bold cursor-pointer">✕</button>
              </div>
            ) : (
              <button onClick={() => ref.current?.click()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] cursor-pointer transition-colors">
                <Upload className="h-3 w-3" /> Select File
              </button>
            )}
            <input ref={ref} type="file" className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => { pick(key, e.target.files?.[0]); e.target.value = '' }}
            />
          </div>
        </div>
      ))}

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading || !hasAny}
        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white cursor-pointer shadow-xs">
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Upload Selected Documents</>}
      </button>
    </div>
  )
}

/* ── Detail Drawer ─────────────────────────────────────────────────────── */
function ClientDrawer({ client, onClose, token, onKycUpdate, userRole }) {
  const [detail,   setDetail]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)
  const [kycNote,  setKycNote]  = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const [employees,   setEmployees]  = useState([])
  const [assignEmpId, setAssignEmpId] = useState('')
  const [assigning,   setAssigning]  = useState(false)

  const isAdmin = ['admin', 'super_admin'].includes(userRole)

  const loadDetail = () => {
    setLoading(true)
    api.admin.clients.get(client.id, token)
      .then(r => setDetail(r.data.client))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (client) loadDetail() }, [client])

  useEffect(() => {
    if (!isAdmin) return
    api.admin.employees.list(token, 'pageSize=100')
      .then(r => setEmployees(r.data?.employees || []))
      .catch(() => {})
  }, [token, isAdmin])

  const updateKyc = async (status) => {
    if (status === 'rejected' && !kycNote.trim()) { alert('Please enter a rejection reason.'); return }
    setUpdating(true)
    try {
      await api.admin.clients.updateKyc(client.id, { status, rejectionReason: kycNote }, token)
      onKycUpdate()
      onClose()
    } catch (e) { alert(e.message || 'Update failed') }
    finally { setUpdating(false) }
  }

  const assignToEmployee = async () => {
    setAssigning(true)
    try {
      await api.admin.clients.assign(client.id, { employeeId: assignEmpId || null }, token)
      onKycUpdate()
      onClose()
    } catch (e) { alert(e.message || 'Assign failed') }
    finally { setAssigning(false) }
  }

  if (!client) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto bg-white border-l border-[#e2e8f0] shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10 bg-white border-b border-[#e2e8f0]">
          <div>
            <h3 className="text-lg font-extrabold text-[#0f172a]">{client.fullName}</h3>
            <p className="text-xs font-mono font-bold text-[#059669] mt-0.5">{client.registrationId}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0] transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-[#059669]" />
          </div>
        ) : detail ? (
          <div className="px-6 py-6 space-y-6">

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge color={CLIENT_COLOR[detail.status] || 'gray'}>Account: {detail.status?.replace(/_/g, ' ')}</Badge>
              <Badge color={KYC_COLOR[detail.kyc?.verification_status] || 'gray'}>
                KYC: {detail.kyc?.verification_status?.replace(/_/g, ' ') || 'not started'}
              </Badge>
            </div>

            {/* Personal Details */}
            <Section icon={User} title="Personal Details">
              <Row label="Full Name"  value={detail.full_name} />
              <Row label="Mobile"     value={<a href={`tel:${detail.mobile}`} className="text-[#059669] font-bold hover:underline">{detail.mobile}</a>} />
              <Row label="Email"      value={<a href={`mailto:${detail.email}`} className="text-[#059669] font-medium hover:underline break-all">{detail.email}</a>} />
              <Row label="City"       value={detail.city} />
              <Row label="State"      value={detail.state} />
              <Row label="PIN Code"   value={detail.postal_code} />
              <Row label="Registered" value={detail.created_at ? new Date(detail.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
            </Section>

            {/* KYC Details */}
            {detail.kyc && (
              <Section icon={CreditCard} title="KYC Verification">
                {detail.kyc.pan_masked && (
                  <Row label="PAN Number" value={<span className="font-mono font-bold text-[#0f172a]">{detail.kyc.pan_masked}</span>} />
                )}
                <Row label="KYC Status" value={<span className="capitalize font-bold">{detail.kyc.verification_status?.replace(/_/g, ' ')}</span>} />
                {detail.kyc.rejection_reason && (
                  <Row label="Rejection Reason" value={<span className="text-red-600 font-medium">{detail.kyc.rejection_reason}</span>} />
                )}
                {detail.kyc.verified_at && (
                  <Row label="Verified Date" value={new Date(detail.kyc.verified_at).toLocaleDateString('en-IN')} />
                )}

                {/* Document images */}
                <div className="pt-3 mt-1 border-t border-[#f1f5f9]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Uploaded Documents</p>
                    <button onClick={() => setShowUpload(v => !v)}
                      className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#059669] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
                      <Upload className="h-3 w-3" /> {showUpload ? 'Close' : 'Upload'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {detail.kyc.hasAadhaarImage
                      ? <DocButton clientId={detail.id} docType="aadhaar"      label="Aadhaar Front" token={token} />
                      : <span className="text-xs px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#94a3b8] font-medium">No Aadhaar Front</span>}
                    {detail.kyc.hasAadhaarBackImage
                      ? <DocButton clientId={detail.id} docType="aadhaar-back"  label="Aadhaar Back"  token={token} />
                      : <span className="text-xs px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#94a3b8] font-medium">No Aadhaar Back</span>}
                    {detail.kyc.hasPanImage
                      ? <DocButton clientId={detail.id} docType="pan"          label="PAN Card"     token={token} />
                      : <span className="text-xs px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#94a3b8] font-medium">No PAN Card</span>}
                    {detail.kyc.hasPassbookImage
                      ? <DocButton clientId={detail.id} docType="passbook"     label="Passbook"     token={token} />
                      : <span className="text-xs px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#94a3b8] font-medium">No Passbook</span>}
                  </div>

                  {showUpload && (
                    <div className="mt-3">
                      <p className="text-xs text-[#64748b] mb-2 font-medium">Upload replacement documents (JPEG, PNG, WebP, PDF):</p>
                      <AdminDocUpload
                        clientId={detail.id}
                        token={token}
                        onUploaded={() => { setShowUpload(false); loadDetail() }}
                      />
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Bank Accounts */}
            {detail.bankAccounts?.length > 0 && (
              <Section icon={Building2} title="Bank Account Details">
                {detail.bankAccounts.map((acc, i) => (
                  <div key={acc.id} className={i > 0 ? 'pt-3 border-t border-[#f1f5f9]' : ''}>
                    <Row label="Account Holder" value={acc.account_holder_name} />
                    <Row label="Bank Name"      value={acc.bank_name} />
                    <Row label="Account Number" value={<span className="font-mono font-bold">{acc.account_number_masked}</span>} />
                    <Row label="IFSC Code"       value={<span className="font-mono font-bold text-[#059669]">{acc.ifsc_code}</span>} />
                    <Row label="Status"          value={<span className="capitalize">{acc.verification_status}</span>} />
                  </div>
                ))}
              </Section>
            )}

            {/* Assigned Employee */}
            <Section icon={UserCheck} title="Assigned Account Manager">
              {detail.originatingEmployee ? (
                <>
                  <Row label="Staff Code" value={<span className="font-mono font-bold text-[#059669]">{detail.originatingEmployee.employee_code}</span>} />
                  {detail.originatingEmployee.user && (
                    <Row label="Staff Name" value={`${detail.originatingEmployee.user.first_name} ${detail.originatingEmployee.user.last_name}`} />
                  )}
                </>
              ) : (
                <p className="text-xs text-[#64748b] font-medium">Unassigned (Company direct client)</p>
              )}
            </Section>

            {/* Admin Assign / Reassign */}
            {isAdmin && (
              <div className="rounded-2xl p-4 bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                  Assign Account Manager
                </p>
                <select value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#059669]">
                  <option value="">— Unassign / Direct —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeCode} — {emp.fullName}
                    </option>
                  ))}
                </select>
                <button onClick={assignToEmployee} disabled={assigning}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 cursor-pointer shadow-xs">
                  {assigning ? 'Updating Assignment…' : 'Confirm Assignment'}
                </button>
              </div>
            )}

            {/* KYC decision panel */}
            {(detail.kyc?.verification_status === 'submitted' || detail.kyc?.verification_status === 'in_review') && (
              <div className="rounded-2xl p-5 bg-white border border-[#e2e8f0] shadow-sm space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">Apply KYC Decision</p>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">Rejection reason (required if rejecting):</label>
                  <textarea value={kycNote} onChange={e => setKycNote(e.target.value)}
                    rows={2} placeholder="Explain reason for rejecting documents…"
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs border border-[#cbd5e1] focus:outline-none focus:border-[#059669]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateKyc('verified')} disabled={updating}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 cursor-pointer">
                    ✓ Verify KYC
                  </button>
                  <button onClick={() => updateKyc('in_review')} disabled={updating}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 cursor-pointer">
                    ⟳ Mark In-Review
                  </button>
                  <button onClick={() => updateKyc('rejected')} disabled={updating}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 cursor-pointer">
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <p className="p-6 text-sm text-[#64748b]">Could not load client details.</p>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#e2e8f0]">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <Icon className="h-4 w-4 text-[#059669]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">{title}</p>
      </div>
      <div className="p-5 space-y-2.5">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-[#64748b] font-semibold">{label}</span>
      <span className="text-right text-[#0f172a] font-medium">{value || '—'}</span>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
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
      setClients(res.data.clients || [])
      setTotalPages(res.data.pagination.pages || 1)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClients() }, [page, filter])
  useEffect(() => {
    const id = setInterval(fetchClients, 30000)
    return () => clearInterval(id)
  }, [page, filter])

  const filtered = clients.filter(c =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.registrationId?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Client Accounts</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Browse all registered investors — click any row to review identity docs & KYC status
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchClients}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name, email, reg. ID, mobile…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#059669]" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#059669] cursor-pointer">
          <option value="all">All Account Statuses</option>
          <option value="pending_kyc">Pending KYC</option>
          <option value="kyc_submitted">KYC Submitted</option>
          <option value="active">Active Accounts</option>
          <option value="rejected">Rejected Accounts</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Client / Investor</th>
                <th className="py-3.5 px-6">Reg. ID</th>
                <th className="py-3.5 px-6">Account Manager</th>
                <th className="py-3.5 px-6">KYC Status</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Registration Date</th>
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
                    No clients matching search filter
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  onClick={() => setSelected(c)}>
                  <td className="py-4 px-6">
                    <p className="font-bold text-[#0f172a] text-sm">{c.fullName}</p>
                    <p className="text-[11px] text-[#64748b]">{c.email}</p>
                    <p className="text-[11px] text-[#64748b]">{c.mobile}</p>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#059669] text-xs">{c.registrationId}</td>
                  <td className="py-4 px-6">
                    {c.employeeCode ? (
                      <div>
                        <p className="font-mono text-xs font-bold text-[#059669]">{c.employeeCode}</p>
                        <p className="text-[11px] text-[#64748b]">{c.employeeName}</p>
                      </div>
                    ) : (
                      <span className="text-[#94a3b8]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={KYC_COLOR[c.kycStatus] || 'gray'}>
                      {c.kycStatus?.replace(/_/g, ' ') || 'not started'}
                    </Badge>
                    {c.panMasked && <p className="text-[11px] font-mono text-[#64748b] mt-0.5">{c.panMasked}</p>}
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={CLIENT_COLOR[c.status] || 'gray'}>{c.status?.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-4 px-6 text-[#64748b]">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={e => { e.stopPropagation(); setSelected(c) }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f8fafc] text-[#059669] border border-[#e2e8f0] hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </button>
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

      {selected && (
        <ClientDrawer
          client={selected}
          token={token}
          userRole={user?.role}
          onClose={() => setSelected(null)}
          onKycUpdate={fetchClients}
        />
      )}
    </div>
  )
}
