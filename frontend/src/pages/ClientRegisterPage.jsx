import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Mail, Phone, MapPin, CreditCard,
  ArrowRight, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import { api } from '../utils/api.js'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
].map(s => ({ value: s, label: s }))

const schema = z.object({
  fullName:    z.string().min(2, 'Full name required').max(200),
  mobile:      z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email:       z.string().email('Valid email required'),
  addressLine: z.string().max(500).optional().or(z.literal('')),
  city:        z.string().min(2, 'City required'),
  state:       z.string().min(1, 'State required'),
  postalCode:  z.string().regex(/^\d{6}$/, '6-digit PIN code required'),
  clientType:  z.enum(['individual', 'business']).default('individual'),
  pan:         z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. ABCDE1234F)')
                 .optional().or(z.literal('')),
})

export default function ClientRegisterPage() {
  const { token } = useParams()

  const [linkInfo, setLinkInfo]     = useState(null)
  const [validating, setValidating] = useState(true)
  const [linkError, setLinkError]   = useState('')
  const [submitted, setSubmitted]   = useState(null)
  const [apiError, setApiError]     = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { clientType: 'individual' },
  })

  useEffect(() => {
    if (!token) { setLinkError('No registration token provided.'); setValidating(false); return }
    api.public.validateToken(token)
      .then(res => setLinkInfo(res.data))
      .catch(err => setLinkError(err.message || 'This registration link is invalid or expired.'))
      .finally(() => setValidating(false))
  }, [token])

  const onSubmit = async (data) => {
    setApiError('')
    try {
      const res = await api.public.registerClient({
        ...data,
        pan: data.pan?.toUpperCase() || undefined,
        registrationToken: token,
      })
      setSubmitted(res.data)
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
    }
  }

  // ── Loading state ──────────────────────────────────────────────────
  if (validating) return (
    <div className="min-h-screen flex items-center justify-center gap-3" style={{ color: '#64748b' }}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Validating registration link…</span>
    </div>
  )

  // ── Invalid link ──────────────────────────────────────────────────
  if (linkError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-14 w-14 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <AlertCircle className="h-7 w-7" style={{ color: '#f87171' }} />
      </div>
      <h1 className="text-xl font-bold" style={{ color: '#fff' }}>Link Invalid or Expired</h1>
      <p className="text-sm max-w-md" style={{ color: '#94a3b8' }}>{linkError}</p>
      <p className="text-xs" style={{ color: '#475569' }}>
        Contact the employee who shared this link to get a new one.
      </p>
    </div>
  )

  // ── Success ────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="h-16 w-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(26,102,69,0.15)', border: '1px solid rgba(26,102,69,0.4)' }}>
        <CheckCircle2 className="h-8 w-8" style={{ color: '#4ade80' }} />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>Registration Submitted!</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Your details have been submitted. Our team will review and contact you shortly.
        </p>
      </div>
      <div className="rounded-2xl p-5 w-full max-w-sm text-left"
        style={{ background: 'rgba(13,31,87,0.5)', border: '1px solid rgba(200,152,58,0.2)' }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Registration Details</p>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: '#64748b' }}>Registration ID</span>
          <span className="font-mono font-bold" style={{ color: '#c8983a' }}>{submitted.registrationId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#64748b' }}>Status</span>
          <span style={{ color: '#4ade80' }} className="capitalize">{submitted.status?.replace('_', ' ')}</span>
        </div>
      </div>
      <p className="text-xs" style={{ color: '#475569' }}>
        Save your Registration ID for future reference and support queries.
      </p>
    </div>
  )

  // ── Registration form ─────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#0a0f1e' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-2xl p-3 shadow-xl inline-block">
              <img src="/logo.jpeg" alt="Javitri Trading Service" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#fff' }}>
            Client Registration
          </h1>
          {linkInfo ? (
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              You were invited by{' '}
              <span style={{ color: '#fff', fontWeight: 600 }}>{linkInfo.employeeFirstName}</span>
              {' '}
              <span className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(200,152,58,0.1)', color: '#c8983a', border: '1px solid rgba(200,152,58,0.25)' }}>
                {linkInfo.employeeCode}
              </span>
            </p>
          ) : (
            <p className="text-sm" style={{ color: '#64748b' }}>
              Please fill in your details below
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-2xl p-6 sm:p-8 space-y-7"
            style={{ background: 'rgba(13,31,87,0.3)', border: '1px solid rgba(200,152,58,0.2)' }}>

            {/* ── Personal Information ─────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: '#c8983a' }}>
                <User className="h-4 w-4" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Full Name" name="fullName"
                    placeholder="Rahul Kumar Sharma"
                    required register={register} error={errors.fullName?.message}
                  />
                </div>
                <Input
                  label="Mobile Number" name="mobile" type="tel"
                  placeholder="9876543210"
                  required register={register} error={errors.mobile?.message}
                  icon={<Phone className="h-4 w-4" />}
                  hint="10-digit Indian mobile number"
                />
                <Input
                  label="Email Address" name="email" type="email"
                  placeholder="rahul@example.com"
                  required register={register} error={errors.email?.message}
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
            </section>

            {/* ── Address ──────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: '#c8983a' }}>
                <MapPin className="h-4 w-4" /> Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line" name="addressLine"
                    placeholder="House / Flat No., Street, Area"
                    register={register} error={errors.addressLine?.message}
                  />
                </div>
                <Input
                  label="City" name="city" placeholder="Surat"
                  required register={register} error={errors.city?.message}
                />
                <Select
                  label="State" name="state"
                  options={INDIAN_STATES}
                  required register={register} error={errors.state?.message}
                />
                <Input
                  label="PIN Code" name="postalCode" placeholder="395006"
                  required register={register} error={errors.postalCode?.message}
                  hint="6-digit PIN code"
                />
                <Select
                  label="Client Type" name="clientType"
                  options={[
                    { value: 'individual', label: 'Individual' },
                    { value: 'business',   label: 'Business' },
                  ]}
                  register={register} error={errors.clientType?.message}
                />
              </div>
            </section>

            {/* ── KYC (PAN only — no bank details) ─────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2"
                style={{ color: '#c8983a' }}>
                <CreditCard className="h-4 w-4" /> KYC Information
              </h2>
              <p className="text-xs mb-4" style={{ color: '#475569' }}>
                PAN is optional at this stage and will be verified by our admin team.
              </p>
              <div className="sm:max-w-xs">
                <Input
                  label="PAN Number (optional)"
                  name="pan"
                  placeholder="ABCDE1234F"
                  register={register}
                  error={errors.pan?.message}
                  hint="Format: ABCDE1234F"
                  icon={<CreditCard className="h-4 w-4" />}
                />
              </div>
            </section>

            {/* ── Data notice ───────────────────────────────────────── */}
            <div className="rounded-xl p-4 text-xs leading-relaxed"
              style={{ background: 'rgba(13,31,87,0.5)', border: '1px solid rgba(13,31,87,0.8)', color: '#64748b' }}>
              <strong style={{ color: '#94a3b8' }}>Data Notice:</strong> Your information is collected
              for client registration and KYC purposes only, and is handled in accordance with our
              Privacy Policy. PAN and sensitive details are stored securely.
            </div>

            {/* ── Error ─────────────────────────────────────────────── */}
            {apiError && (
              <div className="flex gap-2 rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                <p className="text-sm" style={{ color: '#f87171' }}>{apiError}</p>
              </div>
            )}

            {/* ── Submit ────────────────────────────────────────────── */}
            <Button
              type="submit" size="lg" loading={isSubmitting} className="w-full"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Submit Registration <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: '#334155' }}>
          JAVITRI TRADING SERVICE PRIVATE LIMITED · CIN: U66190GJ2026PTC183862
        </p>
      </div>
    </div>
  )
}
