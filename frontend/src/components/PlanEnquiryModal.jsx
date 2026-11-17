import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Upload, User, Phone, Mail, CreditCard, Building2, FileText, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../utils/api.js'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/* ── Plan data ── */
const ALL_PLANS = [
  { slug: 'plan-1',  name: 'Plan 1',  deal: '₹10,000',    daily: '₹200',      dealAmountINR: 10000 },
  { slug: 'plan-2',  name: 'Plan 2',  deal: '₹30,000',    daily: '₹700',      dealAmountINR: 30000 },
  { slug: 'plan-3',  name: 'Plan 3',  deal: '₹50,000',    daily: '₹1,200',    dealAmountINR: 50000 },
  { slug: 'plan-4',  name: 'Plan 4',  deal: '₹1,00,000',  daily: '₹2,500',    dealAmountINR: 100000 },
  { slug: 'plan-5',  name: 'Plan 5',  deal: '₹3,00,000',  daily: '₹8,000',    dealAmountINR: 300000 },
  { slug: 'plan-6',  name: 'Plan 6',  deal: '₹5,00,000',  daily: '₹13,500',   dealAmountINR: 500000 },
  { slug: 'plan-7',  name: 'Plan 7',  deal: '₹10,00,000', daily: '₹30,000',   dealAmountINR: 1000000 },
  { slug: 'plan-8',  name: 'Plan 8',  deal: '₹15,00,000', daily: '₹40,000',   dealAmountINR: 1500000 },
  { slug: 'plan-9',  name: 'Plan 9',  deal: '₹20,00,000', daily: '₹55,000',   dealAmountINR: 2000000 },
  { slug: 'plan-10', name: 'Plan 10', deal: '₹50,00,000', daily: '₹1,30,000', dealAmountINR: 5000000 },
]

/* ── Validation schema ──
   All fields except the core personal ones are optional at schema level.
   Step-by-step validation (trigger) enforces required fields per step.
   This prevents Zod blocking submit for existing clients who skip Bank/Nominee steps.
── */
const schema = z.object({
  // Personal — always required
  fullName:  z.string().min(2, 'Full name required').max(200),
  mobile:    z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email:     z.string().email('Valid email required'),
  aadhaar:   z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  pan:       z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)').optional().or(z.literal('')),
  // Address — required for new clients, optional for existing (skipped via trigger)
  city:       z.string().min(2, 'City required').optional().or(z.literal('')),
  state:      z.string().min(2, 'State required').optional().or(z.literal('')),
  postalCode: z.string().regex(/^\d{6}$/, '6-digit PIN required').optional().or(z.literal('')),
  // Nominee — only collected for new clients
  nomineeName:     z.string().min(2, 'Nominee name required').max(200).optional().or(z.literal('')),
  nomineeRelation: z.string().min(2, 'Relationship required').optional().or(z.literal('')),
  nomineeMobile:   z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required').optional().or(z.literal('')),
  // Bank — only collected for new clients
  accountHolderName: z.string().min(2, 'Account holder name required').optional().or(z.literal('')),
  bankName:          z.string().min(2, 'Bank name required').optional().or(z.literal('')),
  accountNumber:     z.string().min(8, 'Account number required').max(20).optional().or(z.literal('')),
  ifscCode:          z.string().optional().or(z.literal('')),
})

/* ── Field component ── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: '#9ab0c4' }}>
        {label}{required && <span style={{ color: '#d4a843' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs mt-1" style={{ color: '#f87171' }}>
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function TextInput({ register, name, placeholder, type = 'text', error, className = '', ...rest }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${className}`}
      style={{
        background: 'rgba(15,36,96,0.5)',
        border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(212,168,67,0.2)',
        color: '#f0f4f8',
      }}
      onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.6)'}
      onBlur={e  => e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(212,168,67,0.2)'}
      {...rest}
    />
  )
}

/* ── Steps ── */
const STEPS = ['Plan', 'Personal', 'Nominee', 'Bank', 'Documents', 'Submit']

export default function PlanEnquiryModal({ isOpen, onClose, initialPlan = null }) {
  const [step, setStep]               = useState(0)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [isExisting, setIsExisting]   = useState(false)
  const [existingClientId, setExistingClientId] = useState(null)
  const [checkingClient, setCheckingClient] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [regId, setRegId]             = useState('')
  const overlayRef = useRef(null)

  /* Document upload state */
  const [docs, setDocs] = useState({
    aadhaarFront: null,
    aadhaarBack:  null,
    pan:          null,
    bankProof:    null,
  })

  const [consentChecked, setConsentChecked] = useState(false)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(initialPlan ? 1 : 0)
      setSelectedPlan(initialPlan)
      setSubmitting(false)
      setSubmitted(false)
      setIsExisting(false)
      setExistingClientId(null)
      setCheckingClient(false)
      setSubmitError('')
      setRegId('')
      setDocs({ aadhaarFront: null, aadhaarBack: null, pan: null, bankProof: null })
      setConsentChecked(false)
      reset()
    }
  }, [isOpen, initialPlan])

  // Close on Escape
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

  /* ── Step validation fields ── */
  const stepFields = {
    1: ['fullName', 'mobile', 'email', 'city', 'state', 'postalCode'],
    2: ['nomineeName', 'nomineeRelation', 'nomineeMobile'],
    3: ['accountHolderName', 'bankName', 'accountNumber', 'ifscCode'],
    4: [],   // Documents — optional
    5: [],   // Consent — handled via local state
  }

  const nextStep = async () => {
    if (step === 0) { if (!selectedPlan) return; setStep(1); return }

    // Step 1 — Personal details: validate then check if client already exists
    if (step === 1) {
      const fields = stepFields[1]
      const ok = await trigger(fields)
      if (!ok) return
      // Check existing client
      setCheckingClient(true)
      try {
        const mobile = watch('mobile')
        const email  = watch('email')
        const res = await api.public.checkClient({ mobile, email })
        if (res.exists) {
          // Existing client — skip Nominee/Bank/Docs, go straight to Submit
          setIsExisting(true)
          setExistingClientId(res.data.clientId)
          setRegId(res.data.registrationId)
          setStep(5)   // jump directly to Review & Submit
          return
        }
      } catch { /* network error — continue normally */ }
      finally { setCheckingClient(false) }
      setStep(2)
      return
    }

    // Step 2 — Nominee: only reached for new clients
    if (step === 2) {
      const fields = stepFields[2]
      const ok = await trigger(fields)
      if (!ok) return
      setStep(3)
      return
    }

    // Step 3 — Bank: validate fields + IFSC format
    if (step === 3) {
      const fields = stepFields[3]
      const ok = await trigger(fields)
      if (!ok) return
      // Extra IFSC format check
      const ifsc = watch('ifscCode')?.trim().toUpperCase()
      if (!ifsc || ifsc.length !== 11 || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i.test(ifsc)) {
        setValue('ifscCode', ifsc || '', { shouldValidate: true })
        return
      }
      setStep(4)
      return
    }

    // Step 4 — documents mandatory check
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
      setStep(1)   // existing client: back from Submit goes to Personal
      return
    }
    setStep(s => Math.max(0, s - 1))
  }

  const onSubmit = async (data) => {
    if (!selectedPlan) { setSubmitError('Please select a plan'); return }
    if (!consentChecked) { setSubmitError('Please agree to the Terms & Conditions to proceed.'); return }
    setSubmitting(true)
    setSubmitError('')
    try {

      // ── Existing client: create only a new plan request ─────────────────
      if (isExisting && existingClientId) {
        await api.planRequests.create({
          clientId:    existingClientId,
          planSlug:    selectedPlan.slug,
          planName:    selectedPlan.name,
          dealAmount:  selectedPlan.dealAmountINR * 100,
          dailyAmount: selectedPlan.proposedDailyINR ? selectedPlan.proposedDailyINR * 100 : null,
        })
        setSubmitted(true)
        return
      }

      // ── New client: full registration ─────────────────────────────────────
      // Validate required fields that are optional in schema
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
        // Nominee details as separate fields — backend saves to ClientKYC
        nomineeName:          data.nomineeName || undefined,
        nomineeRelation:      data.nomineeRelation || undefined,
        nomineeMobile:        data.nomineeMobile || undefined,
        aadhaar:              data.aadhaar || undefined,
      }

      const res = await api.public.registerClient(payload)
      const clientId = res.data?.clientId

      setRegId(res.data?.registrationId || '')

      // ── Upload documents ────────────────────────────────────────────────
      const hasFiles = docs.aadhaarFront || docs.aadhaarBack || docs.pan || docs.bankProof
      if (hasFiles && clientId) {
        try {
          const fd = new FormData()
          if (docs.aadhaarFront) fd.append('aadhaarImage',     docs.aadhaarFront)
          if (docs.aadhaarBack)  fd.append('aadhaarBackImage', docs.aadhaarBack)
          if (docs.pan)          fd.append('panImage',         docs.pan)
          if (docs.bankProof)    fd.append('passbookImage',    docs.bankProof)
          const upRes = await fetch(`${API_BASE}/clients/${clientId}/kyc-documents`, {
            method: 'POST', body: fd,
          })
          if (!upRes.ok) {
            const j = await upRes.json().catch(() => ({}))
            console.warn('Document upload failed:', j.message || upRes.status)
          }
        } catch (upErr) { console.warn('Document upload error:', upErr.message) }
      }

      // ── Create plan request (nominee already saved during registerClient) ─
      if (clientId) {
        try {
          await api.planRequests.create({
            clientId,
            planSlug:    selectedPlan.slug,
            planName:    selectedPlan.name,
            dealAmount:  selectedPlan.dealAmountINR * 100,
            dailyAmount: selectedPlan.proposedDailyINR ? selectedPlan.proposedDailyINR * 100 : null,
          })
        } catch (e) { console.warn('Plan request create failed:', e.message) }
      }

      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const GOLD = '#d4a843'
  const CARD_BG = 'rgba(15,36,96,0.45)'
  const CARD_BORDER = 'rgba(212,168,67,0.2)'

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <div className="relative w-full max-w-md rounded-3xl p-8 text-center"
          style={{ background: 'linear-gradient(145deg,#0c1a40,#080f22)', border: '1px solid rgba(212,168,67,0.3)' }}
          onClick={e => e.stopPropagation()}>
          <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#4ade80' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#f5f8fc' }}>Registration Submitted!</h2>
          {regId && (
            <div className="inline-block px-4 py-2 rounded-xl mb-3"
              style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)' }}>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#9ab0c4' }}>Registration ID</p>
              <p className="text-base font-mono font-bold" style={{ color: GOLD }}>{regId}</p>
            </div>
          )}
          <p className="text-sm mb-3" style={{ color: '#f0f4f8', fontWeight: '600' }}>
            🎉 हमारी टीम आपसे 24 घंटे के अंदर संपर्क करेगी।
          </p>
          <p className="text-sm mb-4" style={{ color: '#9ab0c4' }}>
            Our team will contact you within 24 hours to confirm your registration and guide you through the next steps.
          </p>
          <p className="text-xs mb-6 px-3 py-2 rounded-xl"
            style={{ color: '#7090a8', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
            📌 Please save your Registration ID for future reference.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0c1a40,#080f22)', border: '1px solid rgba(212,168,67,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(212,168,67,0.15)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#f5f8fc' }}>Plan Registration</h2>
            <p className="text-xs mt-0.5" style={{ color: '#7090a8' }}>Javitri Trading Service Pvt. Ltd.</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            aria-label="Close modal">
            <X className="h-4 w-4" style={{ color: '#9ab0c4' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(15,36,96,0.6)' }}>
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: i < step ? 'rgba(34,197,94,0.3)' : i === step ? 'rgba(212,168,67,0.25)' : 'rgba(15,36,96,0.5)',
                    border: i < step ? '1px solid rgba(34,197,94,0.5)' : i === step ? `1px solid ${GOLD}` : '1px solid rgba(212,168,67,0.15)',
                    color: i < step ? '#4ade80' : i === step ? GOLD : '#5e7285',
                  }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-[9px] mt-0.5 hidden sm:block"
                  style={{ color: i === step ? GOLD : '#5e7285' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px"
                  style={{ background: i < step ? 'rgba(34,197,94,0.3)' : 'rgba(212,168,67,0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── STEP 0: Choose Plan ── */}
          {step === 0 && (
            <div>
              <p className="text-sm font-semibold mb-4" style={{ color: '#f0f4f8' }}>
                Select a Plan
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ALL_PLANS.map(plan => (
                  <button
                    key={plan.slug}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className="rounded-xl p-3 text-left transition-all"
                    style={{
                      background: selectedPlan?.slug === plan.slug ? 'rgba(212,168,67,0.15)' : CARD_BG,
                      border: selectedPlan?.slug === plan.slug ? `2px solid ${GOLD}` : `1px solid ${CARD_BORDER}`,
                    }}>
                    <p className="text-xs font-semibold" style={{ color: '#f0f4f8' }}>{plan.name}</p>
                    <p className="text-base font-extrabold" style={{ color: '#f5f8fc' }}>{plan.deal}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>{plan.daily}/day*</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-3 text-center" style={{ color: '#5e7285' }}>
                * Proposed daily figures are illustrative only. Not guaranteed returns.
              </p>
              {!selectedPlan && (
                <p className="text-xs text-center mt-2" style={{ color: '#f87171' }}>Please select a plan to continue</p>
              )}
            </div>
          )}

          {/* ── STEP 1: Personal Details ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" style={{ color: GOLD }} />
                <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>Personal Details</p>
              </div>
              {selectedPlan && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-2"
                  style={{ background: 'rgba(212,168,67,0.08)', border: `1px solid rgba(212,168,67,0.2)` }}>
                  <span className="text-xs font-semibold" style={{ color: GOLD }}>Selected: {selectedPlan.name}</span>
                  <span className="text-xs font-bold" style={{ color: '#f5f8fc' }}>{selectedPlan.deal}</span>
                </div>
              )}
              <Field label="Full Name" required error={errors.fullName?.message}>
                <TextInput register={register} name="fullName" placeholder="As per Aadhaar card" error={errors.fullName} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mobile Number" required error={errors.mobile?.message}>
                  <TextInput register={register} name="mobile" type="tel" placeholder="10-digit mobile" error={errors.mobile} />
                </Field>
                <Field label="Email ID" required error={errors.email?.message}>
                  <TextInput register={register} name="email" type="email" placeholder="your@email.com" error={errors.email} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Aadhaar Number" error={errors.aadhaar?.message}>
                  <TextInput register={register} name="aadhaar" placeholder="12 digits" error={errors.aadhaar} />
                </Field>
                <Field label="PAN Number" error={errors.pan?.message}>
                  <TextInput register={register} name="pan" placeholder="ABCDE1234F" error={errors.pan}
                    onChange={e => e.target.value = e.target.value.toUpperCase()} />
                </Field>
              </div>
              <div className="border-t pt-3" style={{ borderColor: 'rgba(212,168,67,0.1)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#7090a8' }}>Address</p>
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
                    <TextInput register={register} name="postalCode" placeholder="6 digits" error={errors.postalCode} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Nominee Details ── */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" style={{ color: GOLD }} />
                <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>Nominee Details</p>
              </div>
              {isExisting && (
                <div className="rounded-xl px-3 py-2.5 mb-2"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <p className="text-xs" style={{ color: '#93c5fd' }}>
                    ✓ You are already registered (ID: <span className="font-mono font-bold">{regId}</span>).
                    A new plan request will be created for your account.
                  </p>
                </div>
              )}
              <Field label="Nominee Full Name" required error={errors.nomineeName?.message}>
                <TextInput register={register} name="nomineeName" placeholder="Nominee's full name" error={errors.nomineeName} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Relationship" required error={errors.nomineeRelation?.message}>
                  <TextInput register={register} name="nomineeRelation" placeholder="e.g. Spouse, Father" error={errors.nomineeRelation} />
                </Field>
                <Field label="Nominee Mobile" required error={errors.nomineeMobile?.message}>
                  <TextInput register={register} name="nomineeMobile" type="tel" placeholder="10-digit mobile" error={errors.nomineeMobile} />
                </Field>
              </div>
              <div className="rounded-xl p-3 mt-2"
                style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#8aa4ba' }}>
                  The nominee will be the person entitled to receive any settlements or benefits
                  in case of the primary account holder's absence.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Bank Details ── */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" style={{ color: GOLD }} />
                <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>Bank Details</p>
              </div>
              <Field label="Account Holder Name" required error={errors.accountHolderName?.message}>
                <TextInput register={register} name="accountHolderName" placeholder="As per bank records" error={errors.accountHolderName} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bank Name" required error={errors.bankName?.message}>
                  <TextInput register={register} name="bankName" placeholder="e.g. State Bank of India" error={errors.bankName} />
                </Field>
                <Field label="IFSC Code" required error={errors.ifscCode?.message}>
                  <TextInput
                    register={register}
                    name="ifscCode"
                    placeholder="e.g. SBIN0001234"
                    error={errors.ifscCode}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    onInput={e => { e.target.value = e.target.value.toUpperCase() }}
                    onBlur={e => setValue('ifscCode', e.target.value.trim().toUpperCase(), { shouldValidate: true })}
                  />
                </Field>
              </div>
              <Field label="Account Number" required error={errors.accountNumber?.message}>
                <TextInput register={register} name="accountNumber" placeholder="Bank account number" error={errors.accountNumber} />
              </Field>
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>
                  <strong>Security notice:</strong> We will never ask for your internet banking password, UPI PIN, CVV, or OTP.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Documents ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4" style={{ color: GOLD }} />
                <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>KYC Documents</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>Required</span>
              </div>
              <p className="text-xs" style={{ color: '#7090a8' }}>
                Clear photo ya scan upload karo. Max 5 MB each.
              </p>

              {[
                { key: 'aadhaarFront', label: 'Aadhaar Card — Front Side',   icon: '🪪' },
                { key: 'aadhaarBack',  label: 'Aadhaar Card — Back Side',    icon: '🪪' },
                { key: 'pan',          label: 'PAN Card',                     icon: '📄' },
                { key: 'bankProof',    label: 'Bank Passbook / Cheque Book (front page)', icon: '🏦' },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#9ab0c4' }}>
                    {icon} {label} *
                  </label>
                  <div
                    className="relative rounded-xl overflow-hidden transition-all"
                    style={{
                      border: docs[key] ? '2px solid rgba(34,197,94,0.5)' : '1.5px dashed rgba(212,168,67,0.35)',
                      background: docs[key] ? 'rgba(34,197,94,0.06)' : 'rgba(15,36,96,0.3)',
                    }}>
                    {docs[key] ? (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" style={{ color: '#4ade80' }} />
                          <span className="text-xs font-medium" style={{ color: '#4ade80' }}>
                            {docs[key].name} ({(docs[key].size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => setDocs(d => ({ ...d, [key]: null }))}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-5 cursor-pointer" style={{ display: 'flex' }}>
                        <Upload className="h-6 w-6 mb-1.5" style={{ color: 'rgba(212,168,67,0.5)' }} />
                        <span className="text-xs" style={{ color: '#7090a8' }}>Click to upload (JPG, PNG, PDF)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          style={{ display: 'none' }}
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

              {/* Show warning if not all docs selected */}
              {!(docs.aadhaarFront && docs.aadhaarBack && docs.pan && docs.bankProof) && (
                <p className="text-xs" style={{ color: '#f87171' }}>
                  ⚠ All documents are mandatory. — {[
                    !docs.aadhaarFront && 'Aadhaar Front',
                    !docs.aadhaarBack  && 'Aadhaar Back',
                    !docs.pan          && 'PAN Card',
                    !docs.bankProof    && 'Bank Proof',
                  ].filter(Boolean).join(', ')} are remains.
                </p>
              )}
            </div>
          )}

          {/* ── STEP 5: Review & Submit ── */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>
                Review & Submit
              </p>

              {/* Summary */}
              <div className="rounded-xl p-4 space-y-3 text-xs"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>

                {/* Existing client notice inside summary */}
                {isExisting && (
                  <div className="pb-2 mb-1" style={{ borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
                    <p className="text-xs" style={{ color: '#93c5fd' }}>
                      ✓ Aap pehle se registered hain — yeh ek naya plan request hoga.
                    </p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#d4a843' }}>Reg. ID: {regId}</p>
                  </div>
                )}

                <div className="flex justify-between gap-2">
                  <span style={{ color: '#7090a8' }}>Selected Plan</span>
                  <span className="text-right font-semibold" style={{ color: '#d4a843' }}>
                    {selectedPlan ? `${selectedPlan.name} — ${selectedPlan.deal}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span style={{ color: '#7090a8' }}>Name</span>
                  <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('fullName') || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span style={{ color: '#7090a8' }}>Mobile</span>
                  <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('mobile') || '—'}</span>
                </div>
                {!isExisting && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: '#7090a8' }}>Email</span>
                      <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('email') || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: '#7090a8' }}>City / State</span>
                      <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('city')}, {watch('state')} – {watch('postalCode')}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: '#7090a8' }}>Nominee</span>
                      <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('nomineeName')} ({watch('nomineeRelation')})</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: '#7090a8' }}>Bank</span>
                      <span className="text-right font-medium" style={{ color: '#d0e0ee' }}>{watch('bankName') || '—'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded cursor-pointer shrink-0"
                  style={{ accentColor: '#d4a843' }}
                />
                <label htmlFor="consent" className="text-xs cursor-pointer leading-relaxed" style={{ color: '#9ab0c4' }}>
                  I have read and understood the Risk Disclosure. I agree to the Terms & Conditions of Javitri Trading Service Pvt. Ltd.
                  (CIN: U66190GJ2026PTC183862) and consent to my information being processed for plan registration.
                </label>
              </div>
              {!consentChecked && submitError?.includes('Terms') && (
                <p className="text-xs" style={{ color: '#f87171' }}>
                  <AlertCircle className="h-3 w-3 inline mr-1" />You must agree to proceed
                </p>
              )}

              {submitError && (
                <div className="rounded-xl p-3 flex gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <p className="text-xs" style={{ color: '#fca5a5' }}>{submitError}</p>
                </div>
              )}
            </div>
          )}

        </form>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(212,168,67,0.12)' }}>
          {/* Back / Cancel */}
          <button
            type="button"
            onClick={step === 0 ? onClose : prevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ab0c4' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            {step === 0 ? <><X className="h-4 w-4" />Cancel</> : <><ChevronLeft className="h-4 w-4" />Back</>}
          </button>

          <div className="flex items-center gap-2">
            {/* Step dots */}
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all"
                style={{ width: i === step ? '20px' : '6px', background: i === step ? GOLD : 'rgba(212,168,67,0.2)' }} />
            ))}
          </div>

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={(step === 0 && !selectedPlan) || checkingClient ||
                (step === 4 && (!docs.aadhaarFront || !docs.aadhaarBack || !docs.pan || !docs.bankProof))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {checkingClient
                ? <><Loader2 className="h-4 w-4 animate-spin" />Checking…</>
                : <>Continue <ChevronRight className="h-4 w-4" /></>
              }
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                : <><CheckCircle2 className="h-4 w-4" />Submit Registration</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
