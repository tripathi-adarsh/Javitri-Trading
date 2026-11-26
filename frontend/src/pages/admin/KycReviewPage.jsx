import { useEffect, useState } from 'react'
import { RefreshCw, Eye, CheckCircle2, AlertCircle, FileSearch, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/* ── Full-screen image lightbox ── */
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
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
        <div className="hidden items-center justify-center py-16 rounded-2xl bg-white border border-red-200">
          <p className="text-sm font-semibold text-red-600">Cannot display — file may be a PDF or corrupted.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Single document view button ── */
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

export default function KycReviewPage() {
  const { token } = useTrading()
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail,   setDetail]   = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [decision, setDecision] = useState('')
  const [reason,   setReason]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitErr, setSubmitErr] = useState('')

  const fetchPending = async () => {
    setLoading(true)
    try {
      const [submittedRes, inReviewRes] = await Promise.all([
        api.admin.clients.list(token, 'status=kyc_submitted&pageSize=50'),
        api.admin.clients.list(token, 'status=active&pageSize=50'),
      ])
      const all = [
        ...(submittedRes.data?.clients || []),
        ...(inReviewRes.data?.clients || []).filter(c => c.kycStatus === 'in_review'),
      ]
      setClients(all)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPending() }, [])

  const openReview = async (c) => {
    setSelected(c)
    setDecision('')
    setReason('')
    setDetail(null)
    setSubmitMsg('')
    setSubmitErr('')
    setDetailLoading(true)
    try {
      const res = await api.admin.clients.get(c.id, token)
      setDetail(res.data.client)
    } catch { setDetail(null) }
    finally { setDetailLoading(false) }
  }

  const handleSubmit = async () => {
    if (!decision) { setSubmitErr('Please select a decision.'); return }
    if (decision === 'rejected' && !reason.trim()) { setSubmitErr('Rejection reason is required.'); return }
    setSubmitting(true)
    setSubmitErr('')
    setSubmitMsg('')
    try {
      await api.admin.clients.updateKyc(selected.id, { status: decision, rejectionReason: reason }, token)
      setSubmitMsg(`KYC ${decision === 'in_review' ? 'marked as In Review' : decision} successfully`)
      setTimeout(() => {
        setSelected(null)
        setDetail(null)
        fetchPending()
      }, 1200)
    } catch (err) {
      setSubmitErr(err.message || 'Failed to submit decision.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">KYC Document Verification Queue</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Review submitted investor identity credentials — approve, reject, or request verification review
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchPending}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Clients table */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#475569] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-6">Client / Investor</th>
                <th className="py-3.5 px-6">Reg. ID</th>
                <th className="py-3.5 px-6">PAN Number</th>
                <th className="py-3.5 px-6">KYC Status</th>
                <th className="py-3.5 px-6">Submission Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#64748b]">
                    <ShieldCheck className="h-8 w-8 text-[#059669] mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[#0f172a]">No KYC records pending review</p>
                    <p className="text-xs text-[#94a3b8] mt-1">All submitted client documents have been evaluated.</p>
                  </td>
                </tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-[#0f172a] text-sm">{c.fullName}</p>
                    <p className="text-[11px] text-[#64748b]">{c.email}</p>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs font-bold text-[#059669]">{c.registrationId}</td>
                  <td className="py-4 px-6 font-mono text-xs text-[#334155] font-semibold">{c.panMasked || '—'}</td>
                  <td className="py-4 px-6">
                    <Badge color={c.kycStatus === 'submitted' ? 'amber' : c.kycStatus === 'in_review' ? 'blue' : 'gray'}>
                      {c.kycStatus?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-[#64748b]">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button size="sm" onClick={() => openReview(c)}>
                      Review Documents
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative z-10 w-full max-w-lg bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl p-6"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}>

            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0f172a]">KYC Verification Review</h2>
                <p className="text-xs text-[#64748b] font-medium">{selected.fullName}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setDetail(null) }}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Basic info */}
            <div className="space-y-2 text-xs mb-5 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <InfoRow label="Registration ID" value={<span className="font-mono font-bold text-[#059669]">{selected.registrationId}</span>} />
              <InfoRow label="Full Name"       value={selected.fullName} />
              <InfoRow label="Mobile Phone"    value={selected.mobile} />
              <InfoRow label="City & State"    value={`${selected.city || ''}, ${selected.state || ''}`} />
              <InfoRow label="PAN Card"        value={<span className="font-mono font-bold text-[#0f172a]">{selected.panMasked || '—'}</span>} />
              {detail?.kyc?.nominee_name && (
                <InfoRow label="Nominee Info"  value={`${detail.kyc.nominee_name}${detail.kyc.nominee_relation ? ` (${detail.kyc.nominee_relation})` : ''}`} />
              )}
            </div>

            {/* Documents section */}
            <div className="mb-5 bg-white p-4 rounded-xl border border-[#e2e8f0]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">Submitted Credentials</p>
              {detailLoading ? (
                <div className="flex items-center gap-2 text-xs text-[#64748b] py-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#059669]" /> Loading document links…
                </div>
              ) : detail?.kyc ? (
                <div className="space-y-0 divide-y divide-[#f1f5f9]">
                  {[
                    { key: 'hasAadhaarImage',     docType: 'aadhaar',       label: 'Aadhaar Card (Front)' },
                    { key: 'hasAadhaarBackImage',  docType: 'aadhaar-back',  label: 'Aadhaar Card (Back)'  },
                    { key: 'hasPanImage',          docType: 'pan',           label: 'PAN Card'             },
                    { key: 'hasPassbookImage',     docType: 'passbook',      label: 'Bank Passbook / Cheque' },
                  ].map(({ key, docType, label }) => (
                    <div key={docType} className="flex items-center justify-between py-2.5">
                      <span className="text-xs font-semibold text-[#475569]">{label}</span>
                      {detail.kyc[key]
                        ? <DocButton clientId={selected.id} docType={docType} label={`View ${label}`} token={token} />
                        : <span className="text-xs text-[#94a3b8] italic">Not uploaded</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94a3b8] italic py-1">Could not load document preview data.</p>
              )}
            </div>

            {/* Decision buttons */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2">Select Decision</label>
              <div className="flex gap-2">
                {[
                  { val: 'verified',  label: '✓ Verify & Approve', active: 'bg-[#059669] text-white border-[#059669]' },
                  { val: 'in_review', label: '⟳ Mark In-Review',  active: 'bg-blue-600 text-white border-blue-600' },
                  { val: 'rejected',  label: '✗ Reject',          active: 'bg-red-600 text-white border-red-600' },
                ].map(({ val, label, active }) => (
                  <button key={val} onClick={() => setDecision(val)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      decision === val ? active : 'bg-white border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {decision === 'rejected' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-red-600 mb-1.5">Rejection Reason *</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                  placeholder="Explain reason for rejecting (e.g. blurry image, mismatched name)..."
                  className="w-full px-3.5 py-2 bg-white border border-red-300 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-red-500 resize-none" />
              </div>
            )}

            {submitErr && (
              <p className="text-xs text-red-700 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 font-semibold">{submitErr}</p>
            )}
            {submitMsg && (
              <p className="text-xs text-[#059669] mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-semibold">✓ {submitMsg}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={() => { setSelected(null); setDetail(null) }} className="flex-1">
                Cancel
              </Button>
              <Button size="md" loading={submitting} onClick={handleSubmit} className="flex-1"
                disabled={!decision}>
                Submit Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-[#64748b] font-semibold">{label}</span>
      <span className="text-[#0f172a] font-medium text-right">{value}</span>
    </div>
  )
}
