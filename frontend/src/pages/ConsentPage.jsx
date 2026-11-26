import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Lock, ShieldCheck, Check, ArrowRight, ArrowLeft,
  AlertCircle, Loader2, Upload, FileCheck
} from 'lucide-react'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import Button from '../components/ui/Button.jsx'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

export default function ConsentPage() {
  const navigate = useNavigate()
  const { selectedPlan, dealData, token, clientUser, user } = useTrading()
  const [termsDoc, setTermsDoc] = useState(null)
  const [privacyDoc, setPrivacyDoc] = useState(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [expandTerms, setExpandTerms] = useState(false)
  const [expandPrivacy, setExpandPrivacy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // KYC document files
  const [aadhaarFile, setAadhaarFile]   = useState(null)
  const [panFile, setPanFile]           = useState(null)
  const [passbookFile, setPassbookFile] = useState(null)
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState('')

  useEffect(() => {
    if (!selectedPlan || !dealData) {
      navigate('/plans', { replace: true })
      return
    }

    Promise.all([
      api.legal.get('terms-and-conditions'),
      api.legal.get('privacy-policy'),
    ])
      .then(([tRes, pRes]) => {
        setTermsDoc(tRes.data.document)
        setPrivacyDoc(pRes.data.document)
      })
      .catch((err) => {
        setFetchError(err.message || 'Could not load legal documents')
      })
      .finally(() => setLoading(false))
  }, [selectedPlan, dealData])

  const canProceed = termsChecked && privacyChecked

  const handleProceed = async () => {
    if (!canProceed) return

    const hasFiles = aadhaarFile || panFile || passbookFile
    const clientId = clientUser?.id || user?.id

    if (hasFiles && clientId && token) {
      setUploading(true)
      setUploadError('')
      try {
        const fd = new FormData()
        if (aadhaarFile)  fd.append('aadhaarImage',  aadhaarFile)
        if (panFile)      fd.append('panImage',      panFile)
        if (passbookFile) fd.append('passbookImage', passbookFile)

        const BASE = import.meta.env.VITE_API_URL || '/api/v1'
        const upRes = await fetch(`${BASE}/clients/${clientId}/kyc-documents`, {
          method: 'POST',
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!upRes.ok) {
          const j = await upRes.json().catch(() => ({}))
          console.warn('KYC upload note:', j.message)
        }
      } catch (upErr) {
        console.warn('KYC upload network error:', upErr.message)
      } finally {
        setUploading(false)
      }
    }

    navigate('/payment')
  }

  if (!selectedPlan || !dealData) return null

  return (
    <div className="min-h-screen bg-white">
      <StepIndicator currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] uppercase tracking-wider mb-3 shadow-xs">
            Corporate Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
            Terms &amp; Consent Verification
          </h1>
          <p className="text-[#475569] text-sm">
            Please review and confirm your acceptance to finalize your subscription with Javitri Trading Service Pvt. Ltd.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
            <p className="text-sm text-[#64748b]">Loading agreement terms…</p>
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-700">{fetchError}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Order Summary Reminder */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-5 shadow-xs">
              <p className="text-xs text-[#64748b] font-bold uppercase tracking-wider mb-2">Subscription Summary</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-extrabold text-[#0f172a]">{selectedPlan.name} Plan</p>
                  <p className="text-xs text-[#64748b]">Monthly investment schedule · Verified deal</p>
                </div>
                {dealData?.totalAmount && (
                  <span className="text-2xl font-extrabold text-[#2563eb]">
                    ₹{dealData.totalAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Terms & Conditions Box */}
            <div className={`border rounded-3xl overflow-hidden transition-all duration-200 ${
              termsChecked ? 'border-[#2563eb] bg-[#eff6ff]/50 shadow-xs' : 'border-[#e2e8f0] bg-white'
            }`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setTermsChecked(!termsChecked)}
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                      termsChecked ? 'bg-[#2563eb] border-[#2563eb]' : 'border-[#cbd5e1] hover:border-[#94a3b8]'
                    }`}
                    aria-checked={termsChecked}
                    role="checkbox"
                    aria-label="Accept Terms and Conditions"
                  >
                    {termsChecked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#2563eb]" />
                        <span className="text-sm font-extrabold text-[#0f172a]">Terms &amp; Operational Agreement</span>
                        {termsDoc && (
                          <span className="text-xs font-mono text-[#64748b]">v{termsDoc.version}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandTerms(!expandTerms)}
                        className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                      >
                        {expandTerms ? 'Collapse' : 'Read Full Terms'}
                      </button>
                    </div>
                    <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                      I have read, understood, and agreed to the operational guidelines and schedule (Monday to Friday) of Javitri Trading Service Private Limited (CIN: U66190GJ2026PTC183862).
                    </p>
                  </div>
                </div>

                {expandTerms && termsDoc && (
                  <div className="mt-4 ml-9 border-t border-[#e2e8f0] pt-4 space-y-4 max-h-64 overflow-y-auto pr-2">
                    {termsDoc.content?.map((section) => (
                      <div key={section.id} className="p-3 bg-white border border-[#e2e8f0] rounded-xl">
                        <p className="text-xs font-bold text-[#0f172a] mb-1">{section.title}</p>
                        <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Policy Box */}
            <div className={`border rounded-3xl overflow-hidden transition-all duration-200 ${
              privacyChecked ? 'border-[#2563eb] bg-[#eff6ff]/50 shadow-xs' : 'border-[#e2e8f0] bg-white'
            }`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setPrivacyChecked(!privacyChecked)}
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                      privacyChecked ? 'bg-[#2563eb] border-[#2563eb]' : 'border-[#cbd5e1] hover:border-[#94a3b8]'
                    }`}
                    aria-checked={privacyChecked}
                    role="checkbox"
                    aria-label="Accept Privacy Policy"
                  >
                    {privacyChecked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#2563eb]" />
                        <span className="text-sm font-extrabold text-[#0f172a]">Privacy &amp; Data Safeguards</span>
                        {privacyDoc && (
                          <span className="text-xs font-mono text-[#64748b]">v{privacyDoc.version}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandPrivacy(!expandPrivacy)}
                        className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                      >
                        {expandPrivacy ? 'Collapse' : 'Read Full Policy'}
                      </button>
                    </div>
                    <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                      I consent to the secure collection and processing of my KYC and contact data under statutory IT Act and Digital Personal Data Protection provisions.
                    </p>
                  </div>
                </div>

                {expandPrivacy && privacyDoc && (
                  <div className="mt-4 ml-9 border-t border-[#e2e8f0] pt-4 space-y-4 max-h-64 overflow-y-auto pr-2">
                    {privacyDoc.content?.map((section) => (
                      <div key={section.id} className="p-3 bg-white border border-[#e2e8f0] rounded-xl">
                        <p className="text-xs font-bold text-[#0f172a] mb-1">{section.title}</p>
                        <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trail Info */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex gap-3 text-xs text-[#64748b]">
              <ShieldCheck className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Statutory Compliance:</strong> Your acceptance timestamp, document versions, and account ID are logged in immutable audit records for regulatory reporting.
              </p>
            </div>

            {/* KYC Document Upload (Optional) */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[#2563eb]" />
                  <h3 className="text-sm font-extrabold text-[#0f172a]">Upload KYC Verification Documents</h3>
                </div>
                <span className="text-xs font-semibold text-[#64748b]">Optional right now</span>
              </div>
              <p className="text-xs text-[#64748b]">
                You can upload copies of your Aadhaar, PAN card, or bank passbook now or after completing payment.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Aadhaar Card', file: aadhaarFile, setFile: setAadhaarFile },
                  { label: 'PAN Card',     file: panFile,     setFile: setPanFile     },
                  { label: 'Bank Passbook',file: passbookFile,setFile: setPassbookFile },
                ].map(({ label, file, setFile }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#0f172a] w-28 shrink-0">{label}</span>
                    {file ? (
                      <div className="flex flex-1 items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
                        <FileCheck className="h-3.5 w-3.5 text-[#2563eb] shrink-0" />
                        <span className="text-xs font-semibold text-[#2563eb] truncate flex-1">{file.name}</span>
                        <button type="button" onClick={() => setFile(null)} className="text-xs font-bold text-red-500 ml-1 cursor-pointer">✕</button>
                      </div>
                    ) : (
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] hover:border-[#2563eb] transition-colors">
                          <Upload className="h-3.5 w-3.5 text-[#64748b]" />
                          <span className="text-xs font-semibold text-[#475569]">Select {label}</span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setUploadError('') } }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" size="lg" onClick={() => navigate('/deal-summary')}>
                <ArrowLeft className="h-4 w-4" /> Back to Deal Summary
              </Button>
              <Button
                size="lg"
                onClick={handleProceed}
                disabled={!canProceed || uploading}
                className="flex-1 font-bold bg-[#2563eb] hover:bg-[#1d4ed8] !text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-white" /> Uploading Documents…</>
                ) : (
                  <>Accept Terms &amp; Proceed to Payment <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>

            {!canProceed && (termsChecked || privacyChecked) && (
              <p className="text-xs font-semibold text-amber-700 text-center">
                Please check both checkboxes to continue.
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
