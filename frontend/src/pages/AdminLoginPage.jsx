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
    <div className="min-h-screen flex bg-gray-950">

      {/* ── LEFT PANEL — Logo ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2057 50%, #0a1628 100%)',
        }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white" />
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full border border-white" />
        </div>

        {/* Gold accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent, #C8983A, transparent)' }} />

        <div className="relative z-10 flex flex-col items-center px-12">
          {/* Logo image — white background card for clean display */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10"
            style={{ maxWidth: '340px', width: '100%' }}>
            <img
              src="/logo.jpeg"
              alt="Javitri Trading Service"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '280px' }}
            />
          </div>

          {/* Tagline below logo */}
          <p className="text-center text-gray-300 text-sm leading-relaxed max-w-xs">
            Secure admin panel for managing employees, clients, plans and payments.
          </p>

          {/* Three feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Trading', 'Fixed Deposits', 'Wealth Growth'].map(item => (
              <span key={item}
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={{ borderColor: '#C8983A', color: '#C8983A', background: 'rgba(200,152,58,0.08)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent, #C8983A, transparent)' }} />
      </div>

      {/* ── RIGHT PANEL — Login Form ──────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-10 py-12">

        {/* Mobile logo (shown only on small screens) */}
        <div className="lg:hidden mb-8 bg-white rounded-2xl p-4 shadow-lg">
          <img src="/logo.jpeg" alt="Javitri Trading Service"
            className="h-24 w-auto object-contain mx-auto" />
        </div>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(200,152,58,0.15)', border: '1px solid rgba(200,152,58,0.3)' }}>
                <Shield className="h-4 w-4" style={{ color: '#C8983A' }} />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-sm">
              Sign in to your administrator account
            </p>
          </div>

          {/* Form card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  register={register}
                  error={errors.email?.message}
                  icon={<Mail className="h-4 w-4" />}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  register={register}
                  error={errors.password?.message}
                  icon={<Lock className="h-4 w-4" />}
                  autoComplete="current-password"
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
              </div>

              {/* Error */}
              {apiError && (
                <div className="flex gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-2"
                style={{ background: 'linear-gradient(135deg, #1a6645, #0d4a31)' }}
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-600 mt-5">
            Authorised personnel only · Access is logged and monitored
          </p>
        </div>
      </div>

    </div>
  )
}
