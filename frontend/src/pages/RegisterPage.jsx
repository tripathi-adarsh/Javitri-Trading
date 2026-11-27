import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, CreditCard, Calendar, Upload, FileCheck } from 'lucide-react'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  dob: z.string().refine((val) => {
    const d = new Date(val)
    const today = new Date()
    const age = today.getFullYear() - d.getFullYear()
    return !isNaN(d.getTime()) && age >= 18
  }, 'You must be at least 18 years old'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN (e.g. ABCDE1234F)'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'Please select your state'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
  annualIncome: z.string().min(1, 'Please select annual income range'),
  tradingExperience: z.string().min(1, 'Please select your experience level'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const STATE_OPTIONS = [
  { value: 'mh', label: 'Maharashtra' },
  { value: 'dl', label: 'Delhi' },
  { value: 'ka', label: 'Karnataka' },
  { value: 'tn', label: 'Tamil Nadu' },
  { value: 'gj', label: 'Gujarat' },
  { value: 'wb', label: 'West Bengal' },
  { value: 'rj', label: 'Rajasthan' },
  { value: 'up', label: 'Uttar Pradesh' },
  { value: 'ts', label: 'Telangana' },
  { value: 'hr', label: 'Haryana' },
]

const INCOME_OPTIONS = [
  { value: 'below_1l', label: 'Below ₹1 Lakh' },
  { value: '1l_5l', label: '₹1 Lakh – ₹5 Lakh' },
  { value: '5l_10l', label: '₹5 Lakh – ₹10 Lakh' },
  { value: '10l_25l', label: '₹10 Lakh – ₹25 Lakh' },
  { value: 'above_25l', label: 'Above ₹25 Lakh' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner (< 1 year)' },
  { value: 'intermediate', label: 'Intermediate (1–3 years)' },
  { value: 'experienced', label: 'Experienced (3–7 years)' },
  { value: 'expert', label: 'Expert (7+ years)' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setClientData, saveToken, setUser } = useTrading()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── KYC document files — stored in a plain object ref to avoid React re-render issues
  const [aadhaarFile,  setAadhaarFile]  = useState(null)
  const [panFile,      setPanFile]      = useState(null)
  const [passbookFile, setPassbookFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const password = watch('password', '')

  const passwordStrength = (() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (password.length >= 12) score++
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-teal-500' }
    return { score, label: 'Strong', color: 'bg-emerald-500' }
  })()

  const onSubmit = async (data) => {
    setApiError('')
    try {
      const res = await api.auth.register(data)
      const accessToken = res.data.accessToken

      saveToken(accessToken)
      setUser(res.data.user)
      setClientData(data)

      // ── Upload KYC documents immediately with the fresh token ──────────────
      const hasFiles = aadhaarFile || panFile || passbookFile
      if (hasFiles) {
        setUploadStatus('uploading')
        try {
          const fd = new FormData()
          if (aadhaarFile)  fd.append('aadhaarImage',  aadhaarFile)
          if (panFile)      fd.append('panImage',      panFile)
          if (passbookFile) fd.append('passbookImage', passbookFile)

          const upRes = await fetch('/api/v1/users/kyc-documents', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: fd,
          })
          if (!upRes.ok) {
            const j = await upRes.json().catch(() => ({}))
            throw new Error(j.message || `Upload failed (${upRes.status})`)
          }
          setUploadStatus('done')
        } catch (upErr) {
          setUploadStatus('failed')
          // Don't block navigation — user can retry later
          console.warn('KYC upload failed:', upErr.message)
        }
      }

      navigate('/plans')
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <StepIndicator currentStep={1} />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#059669] uppercase tracking-wider mb-3">
            Step 1 of 4
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
            Open Your Trading Account
          </h1>
          <p className="text-[#475569] text-sm">
            Fill in your details below. All fields marked with <span className="text-red-500 font-bold">*</span> are required for statutory KYC verification.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">

            {/* Personal Information */}
            <section>
              <h2 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                <User className="h-4 w-4" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Rahul"
                  required
                  register={register}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Sharma"
                  required
                  register={register}
                  error={errors.lastName?.message}
                />
                <Input
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  required
                  register={register}
                  error={errors.dob?.message}
                  hint="You must be 18+ years old"
                />
                <Input
                  label="PAN Number"
                  name="pan"
                  placeholder="ABCDE1234F"
                  required
                  register={register}
                  error={errors.pan?.message}
                  hint="Required for statutory KYC"
                  icon={<CreditCard className="h-4 w-4" />}
                  className="uppercase"
                />
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h2 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                <Mail className="h-4 w-4" />
                Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="rahul.sharma@example.com"
                  required
                  register={register}
                  error={errors.email?.message}
                  icon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  register={register}
                  error={errors.phone?.message}
                  icon={<Phone className="h-4 w-4" />}
                  hint="10-digit Indian mobile number"
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="Mumbai"
                  required
                  register={register}
                  error={errors.city?.message}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Select
                  label="State"
                  name="state"
                  required
                  options={STATE_OPTIONS}
                  register={register}
                  error={errors.state?.message}
                />
              </div>
            </section>

            {/* Trading Profile */}
            <section>
              <h2 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                <Calendar className="h-4 w-4" />
                Trading Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Annual Income"
                  name="annualIncome"
                  required
                  options={INCOME_OPTIONS}
                  register={register}
                  error={errors.annualIncome?.message}
                />
                <Select
                  label="Trading Experience"
                  name="tradingExperience"
                  required
                  options={EXPERIENCE_OPTIONS}
                  register={register}
                  error={errors.tradingExperience?.message}
                />
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                <Lock className="h-4 w-4" />
                Account Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 sm:max-w-md">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    required
                    register={register}
                    error={errors.password?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength.score ? passwordStrength.color : 'bg-[#e2e8f0]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#64748b]">
                        Strength: <span className="font-semibold text-[#0f172a]">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 sm:max-w-md">
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    required
                    register={register}
                    error={errors.confirmPassword?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>
              </div>
            </section>

            {/* KYC Documents */}
            <section>
              <h2 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-1 flex items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                <Upload className="h-4 w-4" />
                KYC Documents
              </h2>
              <p className="text-xs text-[#64748b] mb-4">Aadhaar, PAN Card, Bank Passbook. JPEG/PNG/PDF, max 5MB each.</p>
              <div className="space-y-3">

                {/* Aadhaar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#0f172a] w-28 shrink-0">Aadhaar Card *</span>
                  {aadhaarFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <FileCheck className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                      <span className="text-xs font-semibold text-[#059669] flex-1 truncate">{aadhaarFile.name}</span>
                      <button type="button" onClick={() => setAadhaarFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] hover:border-[#059669] transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#64748b]" />
                        <span className="text-xs font-semibold text-[#475569]">Upload Aadhaar Document</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setAadhaarFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

                {/* PAN */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#0f172a] w-28 shrink-0">PAN Card *</span>
                  {panFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <FileCheck className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                      <span className="text-xs font-semibold text-[#059669] flex-1 truncate">{panFile.name}</span>
                      <button type="button" onClick={() => setPanFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] hover:border-[#059669] transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#64748b]" />
                        <span className="text-xs font-semibold text-[#475569]">Upload PAN Card</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setPanFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

                {/* Passbook */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#0f172a] w-28 shrink-0">Bank Passbook</span>
                  {passbookFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <FileCheck className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                      <span className="text-xs font-semibold text-[#059669] flex-1 truncate">{passbookFile.name}</span>
                      <button type="button" onClick={() => setPassbookFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] hover:border-[#059669] transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#64748b]" />
                        <span className="text-xs font-semibold text-[#475569]">Upload Passbook / Statement</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setPassbookFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

              </div>
              {uploadStatus === 'uploading' && <p className="text-xs text-blue-600 font-semibold mt-2">⏳ Uploading documents...</p>}
              {uploadStatus === 'done'      && <p className="text-xs text-[#059669] font-bold mt-2">✓ Documents verified & uploaded!</p>}
              {uploadStatus === 'failed'    && <p className="text-xs text-amber-700 font-semibold mt-2">⚠ Upload deferred — you may upload documents in the next step.</p>}
            </section>

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting || uploadStatus === 'uploading'}
              className="w-full font-bold bg-[#059669] hover:bg-[#047857]"
            >
              {uploadStatus === 'uploading' ? 'Uploading Documents…' : 'Continue to Trading Plans →'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-[#64748b] mt-6">
          Already registered?{' '}
          <Link to="/plans" className="text-[#059669] hover:underline font-bold transition-colors">
            View Available Plans
          </Link>
        </p>
      </div>
    </div>
  )
}
