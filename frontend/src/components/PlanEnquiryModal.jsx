import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Upload, User, Building2, FileText, Users, Download, Share2, Copy, Check, KeyRound, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../utils/api.js'
import { PlanRequestPdf, generatePlanRequestPdfBlob } from './PlanRequestPdf.jsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/* ── Fallback plan data in case API is unreachable ── */
const FALLBACK_PLANS = [
  { slug: 'plan-1',  name: 'Plan 1',  deal: '₹10,000',    daily: '₹200',      dealAmountINR: 10000, proposedDailyINR: 200 },
  { slug: 'plan-2',  name: 'Plan 2',  deal: '₹30,000',    daily: '₹700',      dealAmountINR: 30000, proposedDailyINR: 700 },
  { slug: 'plan-3',  name: 'Plan 3',  deal: '₹50,000',    daily: '₹1,200',    dealAmountINR: 50000, proposedDailyINR: 1200 },
  { slug: 'plan-4',  name: 'Plan 4',  deal: '₹1,00,000',  daily: '₹2,500',    dealAmountINR: 100000, proposedDailyINR: 2500 },
  { slug: 'plan-5',  name: 'Plan 5',  deal: '₹3,00,000',  daily: '₹8,000',    dealAmountINR: 300000, proposedDailyINR: 8000 },
  { slug: 'plan-6',  name: 'Plan 6',  deal: '₹5,00,000',  daily: '₹13,500',   dealAmountINR: 500000, proposedDailyINR: 13500 },
  { slug: 'plan-7',  name: 'Plan 7',  deal: '₹10,00,000', daily: '₹30,000',   dealAmountINR: 1000000, proposedDailyINR: 30000 },
  { slug: 'plan-8',  name: 'Plan 8',  deal: '₹15,00,000', daily: '₹40,000',   dealAmountINR: 1500000, proposedDailyINR: 40000 },
  { slug: 'plan-9',  name: 'Plan 9',  deal: '₹20,00,000', daily: '₹55,000',   dealAmountINR: 2000000, proposedDailyINR: 55000 },
  { slug: 'plan-10', name: 'Plan 10', deal: '₹50,00,000', daily: '₹1,30,000', dealAmountINR: 5000000, proposedDailyINR: 130000 },
]

const schema = z.object({
  fullName:  z.string().min(2, 'Full name required').max(200),
  mobile:    z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email:     z.string().email('Valid email required'),
  aadhaar:   z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  pan:       z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)').optional().or(z.literal('')),
  city:       z.string().min(2, 'City required').optional().or(z.literal('')),
  state:      z.string().min(2, 'State required').optional().or(z.literal('')),
  postalCode: z.string().regex(/^\d{6}$/, '6-digit PIN required').optional().or(z.literal('')),
  nomineeName:     z.string().min(2, 'Nominee name required').max(200).optional().or(z.literal('')),
  nomineeRelation: z.string().min(2, 'Relationship required').optional().or(z.literal('')),
  nomineeMobile:   z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required').optional().or(z.literal('')),
  accountHolderName: z.string().min(2, 'Account holder name required').optional().or(z.literal('')),
  bankName:          z.string().min(2, 'Bank name required').optional().or(z.literal('')),
  accountNumber:     z.string().min(8, 'Account number required').max(20).optional().or(z.literal('')),
  ifscCode:          z.string().optional().or(z.literal('')),
})

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wide">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function TextInput({ register, name, placeholder, type = 'text', error, className = '', onChange, onBlur, ...rest }) {
  const reg = register(name)
  return (
    <input
      type={type}
      placeholder={placeholder}
      {...reg}
      {...rest}
      onChange={(e) => {
        if (onChange) onChange(e)
        reg.onChange(e)
      }}
      onBlur={(e) => {
        if (onBlur) onBlur(e)
        reg.onBlur(e)
      }}
      className={`w-full rounded-xl px-4 py-2.5 text-sm bg-white border border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 focus:outline-none transition-all ${
        error ? 'border-red-500' : ''
      } ${className}`}
    />
  )
}

const STEPS = ['Plan', 'Personal', 'Nominee', 'Bank', 'Documents', 'Submit']

export default function PlanEnquiryModal({ isOpen, onClose, initialPlan = null }) {
  const [step, setStep]               = useState(0)
  const [plansList, setPlansList]     = useState(FALLBACK_PLANS)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [isExisting, setIsExisting]   = useState(false)
  const [existingClientId, setExistingClientId] = useState(null)
  const [checkingClient, setCheckingClient] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [regId, setRegId]             = useState('')
  const [submittedSummary, setSubmittedSummary] = useState(null)
  const [pdfBusy, setPdfBusy]         = useState(false)
  const [copiedCreds, setCopiedCreds] = useState(false)
  const overlayRef = useRef(null)

  const [docs, setDocs] = useState({
    aadhaarFront: null,
    aadhaarBack:  null,
    pan:          null,
    bankProof:    null,
  })

  const [consentChecked, setConsentChecked] = useState(false)

  // Dynamically fetch all active plans from database
  useEffect(() => {
    let active = true
    api.plans.list()
      .then(res => {
        if (!active) return
        const raw = res?.data?.plans || res?.plans || res?.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          const formatted = raw.map(p => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            deal: `₹${Number(p.dealAmountINR || p.price || 0).toLocaleString('en-IN')}`,
            daily: `₹${Number(p.associatedValueINR || p.dailyReturn || 0).toLocaleString('en-IN')}`,
            dealAmountINR: Number(p.dealAmountINR || p.price || 0),
            proposedDailyINR: Number(p.associatedValueINR || p.dailyReturn || 0),
          })).sort((a, b) => a.dealAmountINR - b.dealAmountINR)
          setPlansList(formatted)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setStep(initialPlan ? 1 : 0)
      setSelectedPlan(initialPlan || plansList[0] || null)
      setSubmitting(false)
      setSubmitted(false)
      setIsExisting(false)
      setExistingClientId(null)
      setCheckingClient(false)
      setSubmitError('')
      setRegId('')
      setSubmittedSummary(null)
      setPdfBusy(false)
      setCopiedCreds(false)
      setDocs({ aadhaarFront: null, aadhaarBack: null, pan: null, bankProof: null })
      setConsentChecked(false)
      reset()
    }
  }, [isOpen, initialPlan])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const { register, handleSubmit, trigger, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    shouldUnregister: false,
  })

  if (!isOpen) return null

  const stepFields = {
    1: ['fullName', 'mobile', 'email', 'aadhaar', 'pan', 'city', 'state', 'postalCode'],
    2: ['nomineeName', 'nomineeRelation', 'nomineeMobile'],
    3: ['accountHolderName', 'bankName', 'accountNumber', 'ifscCode'],
    4: [],
    5: [],
  }

  const nextStep = async () => {
    if (step === 0) { if (!selectedPlan) return; setStep(1); return }

    if (step === 1) {
      const fields = stepFields[1]
      const ok = await trigger(fields)
      if (!ok) return
      setCheckingClient(true)
      try {
        const mobile = watch('mobile')
        const email  = watch('email')
        const res = await api.public.checkClient({ mobile, email })
        if (res.exists) {
          setIsExisting(true)
          setExistingClientId(res.data.clientId)
          setRegId(res.data.registrationId)
          setStep(5)
          return
        }
      } catch { /* network error */ }
      finally { setCheckingClient(false) }
      setStep(2)
      return
    }

    if (step === 2) {
      const fields = stepFields[2]
      const ok = await trigger(fields)
      if (!ok) return
      setStep(3)
      return
    }

    if (step === 3) {
      const fields = stepFields[3]
      const ok = await trigger(fields)
      if (!ok) return
      const ifsc = watch('ifscCode')?.trim().toUpperCase()
      if (!ifsc || ifsc.length !== 11 || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i.test(ifsc)) {
        setValue('ifscCode', ifsc || '', { shouldValidate: true })
        return
      }
      setStep(4)
      return
    }

    if (step === 4) {
      if (!docs.aadhaarFront || !docs.aadhaarBack || !docs.pan || !docs.bankProof) return
      setStep(5)
      return
    }

    const fields = stepFields[step] || []
    if (fields.length === 0) { setStep(s => s + 1); return }
    const ok = await trigger(fields)
    if (ok) setStep(s => s + 1)
  }

  const prevStep = () => {
    if (step === 5 && isExisting) {
      setStep(1)
      return
    }
    setStep(s => Math.max(0, s - 1))
  }

  const onInvalid = (formErrors) => {
    const entries = Object.entries(formErrors || {})
    if (entries.length > 0) {
      const [field, errObj] = entries[0]
      setSubmitError(`Please check "${field}": ${errObj?.message || 'Invalid value'}`)
    } else {
      setSubmitError('Please check all required fields and try again.')
    }
  }

  const onSubmit = async (data) => {
    if (!selectedPlan) { setSubmitError('Please select a plan'); return }
    if (!consentChecked) { setSubmitError('Please confirm the agreement to proceed.'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      if (isExisting && existingClientId) {
        const reqRes = await api.planRequests.create({
          clientId:    existingClientId,
          planSlug:    selectedPlan.slug,
          planName:    selectedPlan.name,
          dealAmount:  selectedPlan.dealAmountINR * 100,
          dailyAmount: selectedPlan.proposedDailyINR ? selectedPlan.proposedDailyINR * 100 : null,
        })
        setSubmittedSummary({
          regId,
          requestNumber: reqRes?.data?.requestNumber || '',
          plan: selectedPlan,
          clientName: data.fullName,
          mobile: data.mobile,
          email: data.email,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          nomineeName: data.nomineeName,
          nomineeRelation: data.nomineeRelation,
          bankName: data.bankName,
          credentials: reqRes?.data?.credentials || { email: data.email, password: null, isNewAccount: false },
          submittedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        })
        setSubmitted(true)
        return
      }

      const missing = []
      if (!data.city?.trim())               missing.push('City')
      if (!data.state?.trim())              missing.push('State')
      if (!data.postalCode?.trim())         missing.push('PIN Code')
      if (!data.nomineeName?.trim())        missing.push('Nominee Name')
      if (!data.nomineeRelation?.trim())    missing.push('Nominee Relationship')
      if (!data.nomineeMobile?.trim())      missing.push('Nominee Mobile')
      if (!data.bankName?.trim())           missing.push('Bank Name')
      if (!data.accountNumber?.trim())      missing.push('Account Number')
      if (!data.ifscCode?.trim())           missing.push('IFSC Code')
      if (missing.length) {
        setSubmitError(`Missing required fields: ${missing.join(', ')}`)
        setSubmitting(false)
        return
      }

      const payload = {
        fullName:             data.fullName,
        mobile:               data.mobile,
        email:                data.email,
        pan:                  data.pan || undefined,
        city:                 data.city,
        state:                data.state,
        postalCode:           data.postalCode,
        country:              'India',
        clientType:           'individual',
        accountHolderName:    data.accountHolderName,
        bankName:             data.bankName,
        accountNumber:        data.accountNumber,
        confirmAccountNumber: data.accountNumber,
        ifscCode:             data.ifscCode.trim().toUpperCase(),
        selectedPlanSlug:     selectedPlan.slug,
        selectedPlanName:     selectedPlan.name,
        intendedDealAmount:   selectedPlan.dealAmountINR,
        intendedDailyAmount:  selectedPlan.proposedDailyINR || null,
        nomineeName:          data.nomineeName || undefined,
        nomineeRelation:      data.nomineeRelation || undefined,
        nomineeMobile:        data.nomineeMobile || undefined,
        aadhaar:              data.aadhaar || undefined,
      }

      const res = await api.public.registerClient(payload)
      const clientId = res.data?.clientId
      const finalRegId = res.data?.registrationId || ''
      let requestNumber = res.data?.requestNumber || ''
      let credentials = res.data?.credentials || { email: data.email, password: null, isNewAccount: false }
      setRegId(finalRegId)

      const hasFiles = docs.aadhaarFront || docs.aadhaarBack || docs.pan || docs.bankProof
      if (hasFiles && clientId) {
        try {
          const fd = new FormData()
          if (docs.aadhaarFront) fd.append('aadhaarImage',     docs.aadhaarFront)
          if (docs.aadhaarBack)  fd.append('aadhaarBackImage', docs.aadhaarBack)
          if (docs.pan)          fd.append('panImage',         docs.pan)
          if (docs.bankProof)    fd.append('passbookImage',    docs.bankProof)
          await fetch(`${API_BASE}/clients/${clientId}/kyc-documents`, {
            method: 'POST', body: fd,
          })
        } catch (upErr) { console.warn('Document upload error:', upErr.message) }
      }

      // Only create plan request separately if registerClient returned an existing client without auto-creating it
      if (clientId && !requestNumber) {
        const reqRes = await api.planRequests.create({
          clientId,
          planSlug:    selectedPlan.slug,
          planName:    selectedPlan.name,
          dealAmount:  selectedPlan.dealAmountINR * 100,
          dailyAmount: selectedPlan.proposedDailyINR ? selectedPlan.proposedDailyINR * 100 : null,
        })
        requestNumber = reqRes?.data?.requestNumber || requestNumber
        if (reqRes?.data?.credentials) credentials = reqRes.data.credentials
      }

      setSubmittedSummary({
        regId: finalRegId,
        requestNumber,
        plan: selectedPlan,
        clientName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        nomineeName: data.nomineeName,
        nomineeRelation: data.nomineeRelation,
        bankName: data.bankName,
        credentials,
        submittedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!submittedSummary || pdfBusy) return
    setPdfBusy(true)
    try {
      await new Promise(r => setTimeout(r, 120))
      const { blob, filename } = await generatePlanRequestPdfBlob(submittedSummary.regId)
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
    } catch (e) {
      alert('PDF download could not be generated. Please try again.')
      console.error(e)
    } finally {
      setPdfBusy(false)
    }
  }

  const handleShareWhatsApp = async () => {
    if (!submittedSummary || pdfBusy) return
    setPdfBusy(true)
    try {
      await new Promise(r => setTimeout(r, 120))
      const { blob, filename } = await generatePlanRequestPdfBlob(submittedSummary.regId)
      const file = new File([blob], filename, { type: 'application/pdf' })

      const loginUrl = `${window.location.origin}/admin/login`
      const creds = submittedSummary.credentials
      const summaryLines = [
        `*Javitri Trading Service Pvt. Ltd.*`,
        `Plan Registration Confirmation`,
        ``,
        `*Client:* ${submittedSummary.clientName || 'Client'}`,
        `*Registration ID:* ${submittedSummary.regId || '—'}`,
        submittedSummary.requestNumber ? `*Request No:* ${submittedSummary.requestNumber}` : null,
        `*Selected Plan:* ${submittedSummary.plan?.name} (${submittedSummary.plan?.deal})`,
        `*Daily Estimate:* ${submittedSummary.plan?.daily} / day (Mon-Fri)`,
        ``,
        `*Client Portal Login:* ${loginUrl}`,
        `*Email:* ${creds?.email || submittedSummary.email}`,
        creds?.password ? `*Password:* ${creds.password}` : `*Password:* Use your existing portal password`,
        ``,
        `हमारी टीम आपसे 24 घंटे के अंदर संपर्क करेगी।`,
        `Support: +91 9022487800 | info@javitritrading.com`,
      ].filter(Boolean).join('\n')

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Javitri Plan Confirmation - ${submittedSummary.regId || ''}`,
          text: summaryLines,
        })
      } else {
        // Desktop fallback: download the PDF and open WhatsApp Web with pre-filled details
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 4000)

        window.open(`https://wa.me/?text=${encodeURIComponent(summaryLines)}`, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        alert('Could not share on WhatsApp. Please download the PDF instead.')
        console.error(e)
      }
    } finally {
      setPdfBusy(false)
    }
  }

  const handleCopyCreds = () => {
    const creds = submittedSummary?.credentials
    if (!creds?.email) return
    const txt = creds.password
      ? `Portal: ${window.location.origin}/admin/login\nEmail: ${creds.email}\nPassword: ${creds.password}`
      : `Portal: ${window.location.origin}/admin/login\nEmail: ${creds.email}`
    navigator.clipboard?.writeText(txt).then(() => {
      setCopiedCreds(true)
      setTimeout(() => setCopiedCreds(false), 2500)
    }).catch(() => {})
  }

  /* ── Success Screen ── */
  if (submitted) {
    const creds = submittedSummary?.credentials
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center bg-white border border-[#e2e8f0] shadow-2xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0b1e3f] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-blue-50 to-amber-50 border border-blue-200">
              <CheckCircle2 className="h-7 w-7 text-[#1d4ed8]" />
            </div>
            <h2 className="text-2xl font-black mb-1.5 text-[#0b1e3f]">Registration Submitted!</h2>
            <p className="text-sm font-bold mb-1.5 text-[#0b1e3f]">
              हमारी टीम आपसे 24 घंटे के अंदर संपर्क करेगी।
            </p>
            <p className="text-xs text-[#475569] mb-4 leading-relaxed">
              Our corporate support team will contact you within 24 business hours to confirm your plan registration and assist you with onboarding.
            </p>

            {/* Registration & Plan Summary Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-left">
              {regId && (
                <div className="px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-amber-200">
                  <p className="text-[10px] uppercase tracking-wider text-[#b45309] font-bold">Registration ID</p>
                  <p className="text-sm font-mono font-black text-[#1d4ed8]">{regId}</p>
                </div>
              )}
              {submittedSummary?.plan && (
                <div className="px-3.5 py-2.5 rounded-xl bg-[#eff6ff] border border-blue-200">
                  <p className="text-[10px] uppercase tracking-wider text-[#1d4ed8] font-bold">Requested Plan</p>
                  <p className="text-sm font-black text-[#0b1e3f]">
                    {submittedSummary.plan.name} · {submittedSummary.plan.deal}
                  </p>
                </div>
              )}
            </div>

            {/* Client Portal Credentials Box */}
            {creds?.email && (
              <div className="rounded-2xl p-4 mb-5 bg-gradient-to-br from-amber-50/80 via-white to-blue-50/50 border border-amber-300/80 text-left">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-[#b45309]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#92400e]">
                      Client Login Credentials
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCreds}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-amber-200 text-[#0b1e3f] hover:bg-amber-50 cursor-pointer"
                  >
                    {copiedCreds ? <><Check className="h-3 w-3 text-emerald-600" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[#64748b] font-semibold">Email</span>
                    <span className="font-bold text-[#0b1e3f] break-all">{creds.email}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[#64748b] font-semibold">Password</span>
                    <span className="font-mono font-black text-[#1d4ed8]">
                      {creds.password || 'Use your existing password'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#475569] font-medium">Login to request payments &amp; view plan status</span>
                  <Link
                    to="/admin/login"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-extrabold text-[#1d4ed8] hover:underline shrink-0"
                  >
                    <LogIn className="h-3.5 w-3.5" /> Login Now
                  </Link>
                </div>
              </div>
            )}

            {/* Two Primary Buttons: Share on WhatsApp & Download PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                disabled={pdfBusy}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-[#16a34a] hover:bg-[#15803d] !text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin !text-white" /> : <Share2 className="h-4 w-4 !text-white" />}
                <span className="!text-white">Share on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfBusy}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] !text-white shadow-[0_4px_14px_rgba(29,78,216,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin !text-white" /> : <Download className="h-4 w-4 !text-white" />}
                <span className="!text-white">Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Off-screen PDF Print DOM */}
        <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1, backgroundColor: '#ffffff' }}>
          <PlanRequestPdf data={submittedSummary} />
        </div>
      </>
    )
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top royal gold accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e2e8f0] bg-white shrink-0">
          <div>
            <h2 className="text-base font-black text-[#0b1e3f]">Plan Registration</h2>
            <p className="text-xs font-semibold text-[#b45309]">Javitri Trading Service Pvt. Ltd.</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0b1e3f] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] shrink-0">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  i < step
                    ? 'bg-[#1d4ed8] !text-white'
                    : i === step
                      ? 'bg-white border-2 border-[#1d4ed8] text-[#1d4ed8] font-black'
                      : 'bg-white border border-[#cbd5e1] text-[#94a3b8]'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] mt-0.5 hidden sm:block font-medium ${
                  i === step ? 'text-[#1d4ed8] font-bold' : 'text-[#64748b]'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? 'bg-[#1d4ed8]' : 'bg-[#e2e8f0]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* STEP 0: Select Plan */}
          {step === 0 && (
            <div>
              <p className="text-sm font-black text-[#0b1e3f] mb-3">Select Your Investment Plan</p>
              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {plansList.map(plan => {
                  const isSel = selectedPlan?.slug === plan.slug
                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`rounded-2xl p-3.5 text-left border transition-all cursor-pointer relative overflow-hidden ${
                        isSel
                          ? 'bg-[#eff6ff] border-[#1d4ed8] ring-2 ring-[#1d4ed8]/20 shadow-xs'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {isSel && <div className="absolute top-0 left-0 right-0 h-1 royal-gold-line" />}
                      <p className="text-xs font-bold text-[#64748b]">{plan.name}</p>
                      <p className="text-base font-black text-[#0b1e3f] mt-0.5">{plan.deal}</p>
                      <p className="text-xs font-black text-[#1d4ed8] mt-1">{plan.daily} / day* (Mon–Fri)</p>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] mt-3 text-center text-[#64748b]">
                * Proposed daily figures operate on a Monday to Friday schedule (5 trading sessions/week, ~22 days/month). Educational &amp; illustrative.
              </p>
              {!selectedPlan && (
                <p className="text-xs text-center mt-2 text-red-600 font-medium">Please select a plan to proceed</p>
              )}
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#e2e8f0]">
                <User className="h-4 w-4 text-[#2563eb]" />
                <p className="text-sm font-extrabold text-[#0f172a]">Personal Information</p>
              </div>
              {selectedPlan && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
                  <span className="text-xs font-bold text-[#2563eb]">Selected: {selectedPlan.name}</span>
                  <span className="text-xs font-extrabold text-[#0f172a]">{selectedPlan.deal}</span>
                </div>
              )}
              <Field label="Full Name" required error={errors.fullName?.message}>
                <TextInput register={register} name="fullName" placeholder="As per official Aadhaar / PAN" error={errors.fullName} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Mobile Number" required error={errors.mobile?.message}>
                  <TextInput register={register} name="mobile" type="tel" placeholder="10-digit mobile" error={errors.mobile} />
                </Field>
                <Field label="Email Address" required error={errors.email?.message}>
                  <TextInput register={register} name="email" type="email" placeholder="client@example.com" error={errors.email} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Aadhaar Number" error={errors.aadhaar?.message}>
                  <TextInput register={register} name="aadhaar" placeholder="12-digit Aadhaar number" error={errors.aadhaar}
                    onChange={e => { e.target.value = e.target.value.replace(/\s+/g, '') }} />
                </Field>
                <Field label="PAN Number" error={errors.pan?.message}>
                  <TextInput register={register} name="pan" placeholder="ABCDE1234F" error={errors.pan}
                    onChange={e => { e.target.value = e.target.value.toUpperCase().trim() }} />
                </Field>
              </div>
              <div className="pt-2 border-t border-[#e2e8f0]">
                <p className="text-xs font-bold text-[#64748b] mb-2 uppercase tracking-wide">Residential Address</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <Field label="City" required error={errors.city?.message}>
                      <TextInput register={register} name="city" placeholder="City" error={errors.city} />
                    </Field>
                  </div>
                  <Field label="State" required error={errors.state?.message}>
                    <TextInput register={register} name="state" placeholder="State" error={errors.state} />
                  </Field>
                  <Field label="PIN Code" required error={errors.postalCode?.message}>
                    <TextInput register={register} name="postalCode" placeholder="6-digit PIN" error={errors.postalCode} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Nominee Details */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#e2e8f0]">
                <Users className="h-4 w-4 text-[#2563eb]" />
                <p className="text-sm font-extrabold text-[#0f172a]">Nominee Information</p>
              </div>
              {isExisting && (
                <div className="rounded-xl px-3.5 py-2.5 bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-800">
                    ✓ You are recognized as an existing client (Reg ID: <strong className="font-mono">{regId}</strong>).
                  </p>
                </div>
              )}
              <Field label="Nominee Full Name" required error={errors.nomineeName?.message}>
                <TextInput register={register} name="nomineeName" placeholder="Nominee's full legal name" error={errors.nomineeName} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Relationship" required error={errors.nomineeRelation?.message}>
                  <TextInput register={register} name="nomineeRelation" placeholder="e.g. Spouse, Father, Mother" error={errors.nomineeRelation} />
                </Field>
                <Field label="Nominee Mobile" required error={errors.nomineeMobile?.message}>
                  <TextInput register={register} name="nomineeMobile" type="tel" placeholder="10-digit mobile" error={errors.nomineeMobile} />
                </Field>
              </div>
              <div className="rounded-xl p-3.5 bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569] leading-relaxed">
                ℹ The designated nominee will be authorized to receive any maturity or settlement benefits in accordance with the signed agreement and legal framework.
              </div>
            </div>
          )}

          {/* STEP 3: Bank Details */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#e2e8f0]">
                <Building2 className="h-4 w-4 text-[#2563eb]" />
                <p className="text-sm font-extrabold text-[#0f172a]">Settlement Bank Details</p>
              </div>
              <Field label="Account Holder Name" required error={errors.accountHolderName?.message}>
                <TextInput register={register} name="accountHolderName" placeholder="As per passbook / bank records" error={errors.accountHolderName} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Bank Name" required error={errors.bankName?.message}>
                  <TextInput register={register} name="bankName" placeholder="e.g. State Bank of India, HDFC" error={errors.bankName} />
                </Field>
                <Field label="IFSC Code" required error={errors.ifscCode?.message}>
                  <TextInput
                    register={register}
                    name="ifscCode"
                    placeholder="e.g. SBIN0001234"
                    error={errors.ifscCode}
                    onInput={e => { e.target.value = e.target.value.toUpperCase() }}
                    onBlur={e => setValue('ifscCode', e.target.value.trim().toUpperCase(), { shouldValidate: true })}
                  />
                </Field>
              </div>
              <Field label="Account Number" required error={errors.accountNumber?.message}>
                <TextInput register={register} name="accountNumber" placeholder="Primary account number" error={errors.accountNumber} />
              </Field>
              <div className="rounded-xl p-3 bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e40af] leading-relaxed">
                🔒 <strong>Privacy Assurance:</strong> Javitri Trading Service Pvt. Ltd. never asks for your Net Banking password, ATM PIN, UPI PIN, or OTP.
              </div>
            </div>
          )}

          {/* STEP 4: KYC Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#2563eb]" />
                  <p className="text-sm font-extrabold text-[#0f172a]">KYC Documents Verification</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#2563eb] font-bold border border-blue-200">
                  Mandatory
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Upload clear image or PDF copies for client verification. Maximum 5 MB per document.
              </p>

              {[
                { key: 'aadhaarFront', label: 'Aadhaar Card — Front', icon: '🪪' },
                { key: 'aadhaarBack',  label: 'Aadhaar Card — Back',  icon: '🪪' },
                { key: 'pan',          label: 'PAN Card',             icon: '📄' },
                { key: 'bankProof',    label: 'Bank Passbook / Cheque', icon: '🏦' },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-[#0f172a] mb-1.5 uppercase tracking-wide">
                    {icon} {label} <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`rounded-xl border transition-all ${
                      docs[key]
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-dashed border-[#cbd5e1] bg-[#f8fafc] hover:bg-white hover:border-[#2563eb]'
                    }`}
                  >
                    {docs[key] ? (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#2563eb]" />
                          <span className="text-xs font-semibold text-[#0f172a]">
                            {docs[key].name} ({(docs[key].size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocs(d => ({ ...d, [key]: null }))}
                          className="text-xs font-bold px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                        <Upload className="h-5 w-5 text-[#64748b] mb-1" />
                        <span className="text-xs font-semibold text-[#334155]">Upload Document (JPG, PNG, PDF)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file && file.size <= 5 * 1024 * 1024) {
                              setDocs(d => ({ ...d, [key]: file }))
                            } else if (file) {
                              alert('File size must be under 5 MB')
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}

              {!(docs.aadhaarFront && docs.aadhaarBack && docs.pan && docs.bankProof) && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠ All 4 verification documents are required to complete onboarding.
                </p>
              )}
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm font-extrabold text-[#0f172a]">Review &amp; Confirm Application</p>

              <div className="rounded-2xl p-4 bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5 text-xs">
                {isExisting && (
                  <div className="pb-2 mb-2 border-b border-[#e2e8f0]">
                    <p className="text-xs text-[#2563eb] font-bold">
                      ✓ Existing Client Plan Request (Client ID: {regId})
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                  <span className="text-[#64748b] font-medium">Selected Plan</span>
                  <span className="font-extrabold text-[#0f172a]">{selectedPlan ? `${selectedPlan.name} (${selectedPlan.deal})` : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                  <span className="text-[#64748b] font-medium">Client Full Name</span>
                  <span className="font-bold text-[#0f172a]">{watch('fullName') || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                  <span className="text-[#64748b] font-medium">Contact Mobile</span>
                  <span className="font-bold text-[#0f172a]">{watch('mobile') || '—'}</span>
                </div>
                {!isExisting && (
                  <>
                    <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b] font-medium">Email Address</span>
                      <span className="font-bold text-[#0f172a]">{watch('email') || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b] font-medium">Location</span>
                      <span className="font-bold text-[#0f172a]">{watch('city')}, {watch('state')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b] font-medium">Nominee</span>
                      <span className="font-bold text-[#0f172a]">{watch('nomineeName')} ({watch('nomineeRelation')})</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#64748b] font-medium">Settlement Bank</span>
                      <span className="font-bold text-[#0f172a]">{watch('bankName') || '—'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#e2e8f0]">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#2563eb] cursor-pointer shrink-0"
                />
                <label htmlFor="consent" className="text-xs text-[#334155] cursor-pointer leading-relaxed">
                  I confirm that all personal and financial details provided are accurate and true. I understand and agree that all plan operations follow a Monday to Friday operational cycle (~22 sessions/month) in compliance with corporate guidelines of Javitri Trading Service Pvt. Ltd.
                </label>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] shrink-0">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#334155] bg-white border-2 border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-[#f1f5f9] transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={checkingClient || (step === 0 && !selectedPlan) || (step === 4 && !(docs.aadhaarFront && docs.aadhaarBack && docs.pan && docs.bankProof))}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold !text-white bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#1e40af] hover:to-[#1d4ed8] disabled:opacity-50 transition-all shadow-[0_2px_8px_rgba(29,78,216,0.3)] cursor-pointer"
            >
              {checkingClient ? <Loader2 className="h-4 w-4 animate-spin !text-white" /> : <><span className="!text-white">Next Step</span> <ChevronRight className="h-4 w-4 !text-white" /></>}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit, onInvalid)}
              disabled={submitting || !consentChecked}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-extrabold !text-white btn-gold disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin !text-white" /> : <span className="!text-white">Confirm &amp; Submit Application</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
