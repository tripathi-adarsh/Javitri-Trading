import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, CreditCard, Calendar } from 'lucide-react'
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
      saveToken(res.data.accessToken)
      setUser(res.data.user)
      setClientData(data)
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

            {/* API Error */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <span className="font-semibold">Sample Data Notice:</span> This is a demo form. 
                No real account will be created. PAN and personal details entered here are not stored or verified.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Continue to Trading Plans →
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
