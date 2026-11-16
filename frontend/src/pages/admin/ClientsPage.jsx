import React, { useEffect, useRef, useState } from 'react'
import { Search, RefreshCw, Eye, X, CreditCard, Building2, User, UserCheck, Upload, FileImage, Loader2, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const KYC_COLOR    = { not_started:'gray', submitted:'amber', in_review:'blue', verified:'emerald', rejected:'red' }
const CLIENT_COLOR = { pending_kyc:'amber', kyc_submitted:'blue', active:'emerald', rejected:'red', inactive:'gray' }
const PANEL_BG = '#111f3d'
const BORDER   = 'rgba(212,168,67,0.2)'

/* ── Full-screen image lightbox ─────────────────────────────────────────── */
function ImageLightbox({ src, label, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>{label}</p>
          <button onClick={onClose}
            className="text-xs px-4 py-1.5 rounded-lg font-medium"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>
            Close ✕
          </button>
        </div>
        <img src={src} alt={label}
          className="w-full rounded-xl object-contain"
          style={{ maxHeight: '75vh', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div className="hidden items-center justify-center py-16 rounded-xl"
          style={{ background: '#1e293b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>Cannot display — file may be a PDF or is corrupted.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Single document view button ────────────────────────────────────────── */
function DocButton({ clientId, docType, label, token }) {
  const [lightbox, setLightbox] = useState(false)
  // Build URL with token in query param so <img> can load it
  const imgUrl = `${BASE_URL}/clients/${clientId}/kyc-documents/${docType}?token=${encodeURIComponent(token || '')}`

  return (
    <>
      <button onClick={() => setLightbox(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
        <Eye className="h-3 w-3" />{label}
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
    <div className="flex items-center gap-2 py-2">
      <span className="text-xs" style={{ color: '#4ade80' }}>✓ Documents uploaded successfully</span>
      <button onClick={() => setDone(false)} className="text-xs underline" style={{ color: '#7090a8' }}>Upload more</button>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* File pickers — all 4 */}
      {[
        { key: 'aadhaar',      label: 'Aadhaar Card (Front)', ref: aadhaarRef },
        { key: 'aadhaarBack',  label: 'Aadhaar Card (Back)',  ref: aadhaarBackRef },
        { key: 'pan',          label: 'PAN Card',              ref: panRef },
        { key: 'passbook',     label: 'Bank Passbook',         ref: passRef },
      ].map(({ key, label, ref }) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="text-xs" style={{ color: '#9ab0c4' }}>{label}</span>
          <div className="flex items-center gap-2">
            {files[key] ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
                <FileImage className="h-3 w-3" style={{ color: '#4ade80' }} />
                <span className="text-xs max-w-[100px] truncate" style={{ color: '#4ade80' }}>{files[key].name}</span>
                <button onClick={() => setFiles(p => ({ ...p, [key]: null }))}
                  className="ml-1" style={{ color: '#f87171' }}>✕</button>
              </div>
            ) : (
              <button onClick={() => ref.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)', color: '#d4a843' }}>
                <Upload className="h-3 w-3" /> Choose
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
        <div className="flex gap-2 p-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading || !hasAny}
        className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
        {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading…</> : <><Upload className="h-3.5 w-3.5" />Upload Selected Documents</>}
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
    if (status === 'rejected' && !kycNote.trim()) { alert('Rejection reason required.'); return }
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
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto"
        style={{ background: PANEL_BG, borderLeft: `1px solid ${BORDER}` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: PANEL_BG, borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#f0f4f8' }}>{client.fullName}</h3>
            <p className="text-xs font-mono" style={{ color: '#d4a843' }}>{client.registrationId}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <X className="h-4 w-4" style={{ color: '#9ab0c4' }} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ color: '#506070' }} />
          </div>
        ) : detail ? (
          <div className="px-6 py-5 space-y-5">

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge color={CLIENT_COLOR[detail.status] || 'gray'}>{detail.status?.replace(/_/g, ' ')}</Badge>
              <Badge color={KYC_COLOR[detail.kyc?.verification_status] || 'gray'}>
                KYC: {detail.kyc?.verification_status?.replace(/_/g, ' ') || 'not started'}
              </Badge>
            </div>

            {/* Personal */}
            <Section icon={User} title="Personal Details">
              <Row label="Full Name"  value={detail.full_name} />
              <Row label="Mobile"     value={<a href={`tel:${detail.mobile}`} className="hover:underline" style={{ color: '#d4a843' }}>{detail.mobile}</a>} />
              <Row label="Email"      value={<a href={`mailto:${detail.email}`} className="hover:underline break-all" style={{ color: '#d4a843' }}>{detail.email}</a>} />
              <Row label="City"       value={detail.city} />
              <Row label="State"      value={detail.state} />
              <Row label="PIN Code"   value={detail.postal_code} />
              <Row label="Registered" value={detail.created_at ? new Date(detail.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
            </Section>

            {/* KYC */}
            {detail.kyc && (
              <Section icon={CreditCard} title="KYC Documents">
                {detail.kyc.pan_masked && (
                  <Row label="PAN" value={<span className="font-mono">{detail.kyc.pan_masked}</span>} />
                )}
                <Row label="KYC Status" value={detail.kyc.verification_status?.replace(/_/g, ' ')} />
                {detail.kyc.rejection_reason && (
                  <Row label="Rejection Reason" value={<span style={{ color: '#f87171' }}>{detail.kyc.rejection_reason}</span>} />
                )}
                {detail.kyc.verified_at && (
                  <Row label="Verified At" value={new Date(detail.kyc.verified_at).toLocaleDateString('en-IN')} />
                )}

                {/* ── Document images ── */}
                <div className="pt-3 mt-1 border-t" style={{ borderColor: 'rgba(212,168,67,0.12)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7090a8' }}>Uploaded Documents</p>
                    <button onClick={() => setShowUpload(v => !v)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', color: '#d4a843' }}>
                      <Upload className="h-3 w-3" />{showUpload ? 'Cancel' : 'Upload'}
                    </button>
                  </div>

                  {/* View buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {detail.kyc.hasAadhaarImage
                      ? <DocButton clientId={detail.id} docType="aadhaar"      label="Aadhaar Front" token={token} />
                      : <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: '#3d5060' }}>No Aadhaar Front</span>}
                    {detail.kyc.hasAadhaarBackImage
                      ? <DocButton clientId={detail.id} docType="aadhaar-back"  label="Aadhaar Back"  token={token} />
                      : <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: '#3d5060' }}>No Aadhaar Back</span>}
                    {detail.kyc.hasPanImage
                      ? <DocButton clientId={detail.id} docType="pan"          label="PAN Card"     token={token} />
                      : <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: '#3d5060' }}>No PAN Card</span>}
                    {detail.kyc.hasPassbookImage
                      ? <DocButton clientId={detail.id} docType="passbook"     label="Passbook"     token={token} />
                      : <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: '#3d5060' }}>No Passbook</span>}
                  </div>

                  {/* Admin upload panel */}
                  {showUpload && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(14,26,53,0.6)', border: '1px solid rgba(212,168,67,0.15)' }}>
                      <p className="text-xs mb-3" style={{ color: '#9ab0c4' }}>Upload / replace documents (JPEG, PNG, WebP, PDF, max 5 MB each)</p>
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

            {/* Bank */}
            {detail.bankAccounts?.length > 0 && (
              <Section icon={Building2} title="Bank Details">
                {detail.bankAccounts.map((acc, i) => (
                  <div key={acc.id} className={i > 0 ? 'pt-3 border-t' : ''} style={{ borderColor: 'rgba(212,168,67,0.1)' }}>
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
                  <Row label="Employee Code" value={<span className="font-mono" style={{ color: '#d4a843' }}>{detail.originatingEmployee.employee_code}</span>} />
                  {detail.originatingEmployee.user && (
                    <Row label="Name" value={`${detail.originatingEmployee.user.first_name} ${detail.originatingEmployee.user.last_name}`} />
                  )}
                </>
              ) : (
                <p className="text-xs" style={{ color: '#7090a8' }}>Not assigned to any employee</p>
              )}
            </Section>

            {/* Assign / Reassign (admin only) */}
            {isAdmin && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(22,46,110,0.4)', border: '1px solid rgba(212,168,67,0.25)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d4a843' }}>
                  Assign / Reassign Employee
                </p>
                <select value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.3)', color: '#dde8f5' }}>
                  <option value="">— Unassign —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} style={{ background: '#111f3d' }}>
                      {emp.employeeCode} — {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
                <button onClick={assignToEmployee} disabled={assigning}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
                  {assigning ? 'Assigning…' : 'Confirm Assignment'}
                </button>
              </div>
            )}

            {/* KYC decision (submitted or in_review) */}
            {(detail.kyc?.verification_status === 'submitted' || detail.kyc?.verification_status === 'in_review') && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(22,46,110,0.4)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d4a843' }}>Update KYC Status</p>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#9ab0c4' }}>Rejection reason (required if rejecting)</label>
                  <textarea value={kycNote} onChange={e => setKycNote(e.target.value)}
                    rows={2} placeholder="Enter reason for rejection…"
                    className="w-full rounded-lg px-3 py-2 text-xs resize-none focus:outline-none"
                    style={{ background: 'rgba(14,26,53,0.8)', border: '1px solid rgba(212,168,67,0.2)', color: '#dde8f5' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateKyc('verified')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}>
                    ✓ Verify KYC
                  </button>
                  <button onClick={() => updateKyc('in_review')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa' }}>
                    ⟳ In Review
                  </button>
                  <button onClick={() => updateKyc('rejected')} disabled={updating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <p className="p-6 text-sm" style={{ color: '#7090a8' }}>Could not load client details.</p>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,168,67,0.18)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: 'rgba(212,168,67,0.07)', borderBottom: '1px solid rgba(212,168,67,0.12)' }}>
        <Icon className="h-3.5 w-3.5" style={{ color: '#d4a843' }} />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d4a843' }}>{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span style={{ color: '#7090a8' }}>{label}</span>
      <span className="text-right" style={{ color: '#dde8f5' }}>{value || '—'}</span>
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
      setClients(res.data.clients)
      setTotalPages(res.data.pagination.pages)
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
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f0f4f8' }}>Clients</h1>
            <p className="text-sm mt-0.5" style={{ color: '#7090a8' }}>All registered clients — click a row to view details & documents</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchClients}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#506070' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, reg. ID, mobile…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: 'rgba(22,46,110,0.5)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5' }} />
          </div>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'rgba(22,46,110,0.5)', border: '1px solid rgba(212,168,67,0.25)', color: '#dde8f5', cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
            <option value="pending_kyc">Pending KYC</option>
            <option value="kyc_submitted">KYC Submitted</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(22,46,110,0.35)', border: '1px solid rgba(212,168,67,0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,168,67,0.18)' }}>
                  {['Client', 'Reg. ID', 'Employee', 'KYC', 'Status', 'Registered', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: '#9ab0c4' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(212,168,67,0.08)' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: '#506070' }}>No clients found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(212,168,67,0.08)' }}
                    onClick={() => setSelected(c)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,67,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: '#f0f4f8' }}>{c.fullName}</p>
                      <p className="text-xs" style={{ color: '#7090a8' }}>{c.email}</p>
                      <p className="text-xs" style={{ color: '#506070' }}>{c.mobile}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#d4a843' }}>{c.registrationId}</td>
                    <td className="px-4 py-3">
                      {c.employeeCode
                        ? <><p className="font-mono text-xs" style={{ color: '#4ade80' }}>{c.employeeCode}</p>
                          <p className="text-xs" style={{ color: '#7090a8' }}>{c.employeeName}</p></>
                        : <span className="text-xs" style={{ color: '#506070' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={KYC_COLOR[c.kycStatus] || 'gray'}>
                        {c.kycStatus?.replace(/_/g, ' ') || 'not started'}
                      </Badge>
                      {c.panMasked && <p className="text-xs font-mono mt-0.5" style={{ color: '#7090a8' }}>{c.panMasked}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={CLIENT_COLOR[c.status] || 'gray'}>{c.status?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#7090a8' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); setSelected(c) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', color: '#d4a843' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,67,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,168,67,0.1)'}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(212,168,67,0.15)' }}>
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-xs" style={{ color: '#7090a8' }}>Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
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
    </>
  )
}
