import React, { useEffect, useState } from 'react'
import { RefreshCw, AlertCircle, Eye } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/* ── Full-screen image lightbox ── */
function ImageLightbox({ src, label, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">{label}</p>
          <button onClick={onClose}
            className="text-xs px-4 py-1.5 rounded-lg font-medium"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>
            Close ✕
          </button>
        </div>
        <img src={src} alt={label}
          className="w-full rounded-xl object-contain"
          style={{ maxHeight: '75vh', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
        <div className="hidden items-center justify-center py-16 rounded-xl"
          style={{ background: '#1e293b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>Cannot display — file may be a PDF or is corrupted.</p>
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
        <Eye className="h-3 w-3" />{label}
      </button>
      {lightbox && <ImageLightbox src={imgUrl} label={label} onClose={() => setLightbox(false)} />}
    </>
  )
}

export default function KycReviewPage() {
  const { token } = useTrading()
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)   // row data from list
  const [detail,   setDetail]   = useState(null)   // full client from getClient
  const [detailLoading, setDetailLoading] = useState(false)
  const [decision, setDecision] = useState('')
  const [reason,   setReason]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await api.admin.clients.list(token, 'status=kyc_submitted&pageSize=50')
      setClients(res.data.clients)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPending() }, [])

  const openReview = async (c) => {
    setSelected(c)
    setDecision('')
    setReason('')
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await api.admin.clients.get(c.id, token)
      setDetail(res.data.client)
    } catch { setDetail(null) }
    finally { setDetailLoading(false) }
  }

  const handleSubmit = async () => {
    if (!decision) { alert('Please select a decision.'); return }
    if (decision === 'rejected' && !reason.trim()) { alert('Rejection reason is required.'); return }
    setSubmitting(true)
    try {
      await api.admin.clients.updateKyc(selected.id, { status: decision, rejectionReason: reason }, token)
      setSelected(null)
      setDetail(null)
      fetchPending()
    } catch (err) {
      alert(err.message || 'Failed to submit decision.')
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">KYC Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review submitted KYC records and uploaded documents</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPending}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          KYC records contain sensitive identity information. Access is restricted to authorized personnel.
          PAN numbers are masked. Click <strong>Review</strong> on any row to view uploaded documents.
        </p>
      </div>

      {/* Clients table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                {['Client', 'Reg. ID', 'PAN (masked)', 'KYC Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : clients.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">
                  No KYC records pending review
                </td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.fullName}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.registrationId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.panMasked || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge color="amber">{c.kycStatus?.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onClick={() => openReview(c)}>Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setSelected(null); setDetail(null) }} />
          <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}>

            <h2 className="text-base font-semibold text-white mb-4">KYC Review — {selected.fullName}</h2>

            {/* Basic info */}
            <div className="space-y-2 text-xs mb-5 bg-gray-800/40 rounded-xl p-4">
              <InfoRow label="Reg. ID"    value={<span className="font-mono text-emerald-400">{selected.registrationId}</span>} />
              <InfoRow label="Name"       value={selected.fullName} />
              <InfoRow label="Mobile"     value={selected.mobile} />
              <InfoRow label="City/State" value={`${selected.city}, ${selected.state}`} />
              <InfoRow label="PAN"        value={<span className="font-mono text-gray-400">{selected.panMasked || '—'}</span>} />
            </div>

            {/* Documents section */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">KYC Documents</p>
              {detailLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading documents…
                </div>
              ) : detail?.kyc ? (
                <div className="space-y-0 divide-y divide-gray-800">
                  {[
                    { key: 'hasAadhaarImage',     docType: 'aadhaar',       label: 'Aadhaar Card (Front)' },
                    { key: 'hasAadhaarBackImage',  docType: 'aadhaar-back',  label: 'Aadhaar Card (Back)'  },
                    { key: 'hasPanImage',          docType: 'pan',           label: 'PAN Card'             },
                    { key: 'hasPassbookImage',     docType: 'passbook',      label: 'Bank Passbook'        },
                  ].map(({ key, docType, label }) => (
                    <div key={docType} className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-gray-400">{label}</span>
                      {detail.kyc[key]
                        ? <DocButton clientId={selected.id} docType={docType} label={`View ${label}`} token={token} />
                        : <span className="text-xs text-gray-600 italic">Not uploaded</span>}
                    </div>
                  ))}
                  {!detail.kyc.hasAadhaarImage && !detail.kyc.hasAadhaarBackImage && !detail.kyc.hasPanImage && !detail.kyc.hasPassbookImage && (
                    <p className="text-xs pt-2" style={{ color: '#d97706' }}>
                      ⚠ Client has not uploaded any documents yet.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic py-1">Could not load document info.</p>
              )}
            </div>

            {/* Decision buttons */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Decision</label>
              <div className="flex gap-2">
                {[
                  { val: 'in_review', label: 'In Review', active: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
                  { val: 'verified',  label: 'Verify',    active: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
                  { val: 'rejected',  label: 'Reject',    active: 'bg-red-500/20 border-red-500/50 text-red-400' },
                ].map(({ val, label, active }) => (
                  <button key={val} onClick={() => setDecision(val)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${decision === val ? active : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {decision === 'rejected' && (
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1.5">Rejection Reason *</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setSelected(null); setDetail(null) }} className="flex-1">
                Cancel
              </Button>
              <Button size="sm" loading={submitting} onClick={handleSubmit} className="flex-1">
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
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  )
}
