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
    <div className="min-h-screen">
      <StepIndicator currentStep={1} />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Open Your <span className="gradient-text">Trading Account</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Fill in your details below. All fields marked with <span className="text-emerald-400">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 card-glow space-y-8">

            {/* Personal Information */}
            <section>
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                  hint="Required for KYC verification"
                  icon={<CreditCard className="h-4 w-4" />}
                  className="uppercase"
                />
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                        className="text-gray-400 hover:text-gray-200 transition-colors"
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
                              i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Strength: <span className="text-gray-300">{passwordStrength.label}</span>
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
                        className="text-gray-400 hover:text-gray-200 transition-colors"
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
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                KYC Documents
              </h2>
              <p className="text-xs text-gray-500 mb-4">Aadhaar, PAN Card, Bank Passbook. JPEG/PNG/PDF, max 5MB each.</p>
              <div className="space-y-3">

                {/* Aadhaar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Aadhaar Card *</span>
                  {aadhaarFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-400 flex-1 truncate">{aadhaarFile.name}</span>
                      <button type="button" onClick={() => setAadhaarFile(null)} className="text-red-400 text-xs ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-dashed border-gray-700 hover:border-emerald-500/50 transition-colors">
                        <Upload className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Choose Aadhaar</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setAadhaarFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

                {/* PAN */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">PAN Card *</span>
                  {panFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-400 flex-1 truncate">{panFile.name}</span>
                      <button type="button" onClick={() => setPanFile(null)} className="text-red-400 text-xs ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-dashed border-gray-700 hover:border-emerald-500/50 transition-colors">
                        <Upload className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Choose PAN Card</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setPanFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

                {/* Passbook */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Bank Passbook</span>
                  {passbookFile ? (
                    <div className="flex flex-1 items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-400 flex-1 truncate">{passbookFile.name}</span>
                      <button type="button" onClick={() => setPassbookFile(null)} className="text-red-400 text-xs ml-1">✕</button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-dashed border-gray-700 hover:border-emerald-500/50 transition-colors">
                        <Upload className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">Choose Passbook</span>
                      </div>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => { if (e.target.files?.[0]) setPassbookFile(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

              </div>
              {uploadStatus === 'uploading' && <p className="text-xs text-blue-400 mt-2">⏳ Uploading documents...</p>}
              {uploadStatus === 'done'      && <p className="text-xs text-emerald-400 mt-2">✓ Documents uploaded!</p>}
              {uploadStatus === 'failed'    && <p className="text-xs text-amber-400 mt-2">⚠ Upload failed — aap baad mein upload kar sakte ho.</p>}
            </section>

            {/* API Error */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting || uploadStatus === 'uploading'}
              className="w-full"
            >
              {uploadStatus === 'uploading' ? 'Uploading Documents…' : 'Continue to Trading Plans →'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/plans" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            View Plans
          </Link>
        </p>
      </div>
    </div>
  )
}
