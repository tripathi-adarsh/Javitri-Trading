import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, ArrowRight } from 'lucide-react'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { api } from '../utils/api.js'
import { useTrading } from '../context/TradingContext.jsx'

const loginSchema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { saveToken, setUser } = useTrading()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError]         = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    setApiError('')
    try {
      const res  = await api.auth.login(data)
      const user = res.data.user

      if (!['admin', 'super_admin', 'employee'].includes(user.role)) {
        setApiError('This login is for admin and employee accounts only.')
        return
      }

      saveToken(res.data.accessToken)
      setUser(user)

      if (user.role === 'employee') {
        navigate('/admin/employee-dashboard')
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">

      {/* ── LEFT PANEL — Brand ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #071326 0%, #0b1e3f 40%, #1d4ed8 100%)' }}>

        {/* Top royal gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />

        <div className="relative z-10 flex flex-col items-center px-10 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 max-w-[280px] w-full">
            <img src="/logo.jpeg" alt="Javitri Trading Service"
              className="w-full h-auto object-contain max-h-[180px] mx-auto" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Javitri Trading Service</h2>
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold mb-3">Pvt. Ltd. · Established 2026</p>
          <p className="text-sm leading-relaxed max-w-xs mb-8 text-white/80 font-normal">
            Enterprise administration &amp; institutional compliance portal.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {['Client Management', 'KYC Verification', 'Plan Requests', 'Audited Operations'].map(item => (
              <span key={item} className="px-3.5 py-1 rounded-full text-xs font-semibold border border-amber-300/30 text-amber-200 bg-amber-400/10">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 royal-gold-line" />
      </div>

      {/* ── RIGHT PANEL — Login Form ──────────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center px-6 sm:px-12 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
          <img src="/logo.jpeg" alt="Javitri Trading Service"
            className="h-20 w-auto object-contain mx-auto" />
        </div>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-200">
                <Shield className="h-4 w-4 text-[#1d4ed8]" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-[#b45309]">
                Admin Portal
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#0b1e3f] mb-2 tracking-tight">Administrator Sign In</h1>
            <p className="text-sm text-[#64748b] font-medium">Access your enterprise dashboard and operational controls</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#e2e8f0] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 royal-gold-line" />
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              <Input
                label="Corporate Email Address"
                name="email"
                type="email"
                placeholder="admin@javitritrading.com"
                required
                register={register}
                error={errors.email?.message}
                icon={<Mail className="h-4 w-4 text-[#64748b]" />}
                autoComplete="username"
              />

              <Input
                label="Secure Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your security password"
                required
                register={register}
                error={errors.password?.message}
                icon={<Lock className="h-4 w-4 text-[#64748b]" />}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#64748b] hover:text-[#0f172a] transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {apiError && (
                <div className="flex gap-2.5 rounded-xl p-3.5 bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm text-red-700 font-medium">{apiError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-black transition-all bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] !text-white shadow-[0_4px_16px_rgba(29,78,216,0.35)] hover:shadow-[0_6px_22px_rgba(29,78,216,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer border border-[#1d4ed8]"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4 w-4 !text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                <span className="!text-white">Sign In to Dashboard</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4 !text-white" />}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6 text-[#94a3b8] font-medium">
            🔒 Authorized corporate personnel only · All IP sessions are logged & monitored
          </p>
        </div>
      </div>
    </div>
  )
}
