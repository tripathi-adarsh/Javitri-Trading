import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock, CreditCard, Smartphone, Building2, Wallet,
  ArrowLeft, ShieldCheck, Info, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import { PAYMENT_METHODS, BANK_OPTIONS } from '../data/sampleData.js'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

// ─── Validation schemas per method ───────────────────────────────────────────
const schemas = {
  upi: z.object({
    upiId: z.string().regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, 'Enter a valid UPI ID (e.g. name@upi)'),
  }),
  card: z.object({
    cardNumber: z.string().transform(v => v.replace(/\s+/g, '')).pipe(
      z.string().length(16, 'Card number must be 16 digits').regex(/^\d+$/)
    ),
    cardHolder: z.string().min(3, 'Enter cardholder name'),
    expiry: z.string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format')
      .refine(val => {
        const [mm, yy] = val.split('/')
        return new Date(2000 + parseInt(yy), parseInt(mm) - 1, 1) > new Date()
      }, 'Card has expired'),
    cvv: z.string().length(3, 'CVV must be 3 digits').regex(/^\d+$/),
  }),
  netbanking: z.object({
    bank: z.string().min(1, 'Please select your bank'),
  }),
  wallet: z.object({
    walletPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  }),
}

const methodIcons = { upi: Smartphone, card: CreditCard, netbanking: Building2, wallet: Wallet }

function formatCard(v)   { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
function formatExpiry(v) { const d = v.replace(/\D/g,'').slice(0,4); return d.length>=3?`${d.slice(0,2)}/${d.slice(2)}`:d }

// ─── Load Razorpay script once ────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function PaymentPage() {
  const navigate  = useNavigate()
  const { selectedPlan, dealData, clientData, user, token, orderData, setOrderData, consentGiven } = useTrading()

  const [activeMethod, setActiveMethod] = useState('upi')
  const [cardNumber,   setCardNumber]   = useState('')
  const [expiry,       setExpiry]       = useState('')
  const [creating,     setCreating]     = useState(false)
  const [verifying,    setVerifying]    = useState(false)
  const [apiError,     setApiError]     = useState('')
  const [paySuccess,   setPaySuccess]   = useState(false)

  const totalAmount = dealData?.totalAmount || 0
  const planName    = selectedPlan?.name || 'Plan'

  // Guard: must have consent
  useEffect(() => {
    if (!consentGiven) navigate('/consent')
    if (!selectedPlan)  navigate('/plans')
    if (!token)         navigate('/register')
  }, [consentGiven, selectedPlan, token])

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schemas[activeMethod]),
    mode: 'onBlur',
  })

  const handleMethodChange = (id) => { setActiveMethod(id); reset(); setCardNumber(''); setExpiry('') }

  // ── 1. Create order on backend, then open Razorpay Checkout ─────────────────
  const onSubmit = async () => {
    setApiError('')
    setCreating(true)

    // Create idempotency key for this checkout attempt
    const idempotencyKey = `order-${user?.id || 'guest'}-${Date.now()}`

    let order
    try {
      const res = await api.orders.create({
        planSlug:              selectedPlan.slug,
        promoCode:             dealData?.promoApplied || undefined,
        idempotencyKey,
        termsConsentVersion:   dealData?.termsConsentVersion || '1.0.0-draft',
        privacyConsentVersion: dealData?.privacyConsentVersion || '1.0.0-draft',
      }, token)
      order = res.data
      setOrderData(order)
    } catch (err) {
      setApiError(err.message || 'Could not create order. Please try again.')
      setCreating(false)
      return
    }
    setCreating(false)

    // ── 2. Load Razorpay JS and open Checkout ──────────────────────────────────
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setApiError('Payment gateway could not load. Check your internet connection.')
      return
    }

    const options = {
      key:         order.razorpayKeyId,
      amount:      order.amount,                // in paise — from server, never frontend
      currency:    order.currency || 'INR',
      name:        'Javitri Trading Service Pvt. Ltd.',
      description: `${planName} — Monthly Subscription`,
      order_id:    order.razorpayOrderId,
      prefill: {
        name:    `${clientData?.firstName || user?.first_name || ''} ${clientData?.lastName || user?.last_name || ''}`.trim(),
        email:   clientData?.email || user?.email || '',
        contact: clientData?.phone || user?.phone || '',
      },
      notes: { planSlug: selectedPlan.slug },
      theme: { color: '#10b981' },

      // ── 3. On success — verify signature on backend BEFORE marking paid ────
      handler: async (response) => {
        setVerifying(true)
        try {
          await api.payments.verify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          }, token)
          setPaySuccess(true)
          setVerifying(false)
        } catch (err) {
          setApiError(`Payment received but verification failed: ${err.message}. Contact support with payment ID: ${response.razorpay_payment_id}`)
          setVerifying(false)
        }
      },

      modal: {
        ondismiss: () => { /* user closed modal — no action, order stays pending */ },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      setApiError(`Payment failed: ${response.error.description || 'Please try again.'}`)
    })
    rzp.open()
  }

  // ── Payment success screen ─────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-white font-semibold">Verifying payment signature…</p>
        <p className="text-sm text-gray-400">Please do not close this window.</p>
      </div>
    )
  }

  if (paySuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Verified!</h1>
          <p className="text-gray-400 text-sm max-w-sm">
            Your <span className="text-emerald-400 font-semibold">{planName}</span> subscription is now active.
            Check your email for confirmation.
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 w-full max-w-sm">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="text-white">{planName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Amount Paid</span><span className="text-emerald-400 font-bold">₹{totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Order ID</span><span className="text-gray-300 text-xs">{orderData?.orderId?.slice(0,16)}…</span></div>
          </div>
        </div>
        <Button size="lg" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <StepIndicator currentStep={4} />

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Step 4 of 4</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete <span className="gradient-text">Payment</span>
          </h1>
          <p className="text-gray-400 text-sm">Your order amount is calculated by our server — cannot be modified.</p>
        </div>

        {apiError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Method selector */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 card-glow">
              <h3 className="text-sm font-semibold text-white mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map(({ id, label }) => {
                  const Icon = methodIcons[id]
                  return (
                    <button key={id} type="button" onClick={() => handleMethodChange(id)}
                      aria-pressed={activeMethod === id}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                        ${activeMethod === id ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment detail form */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 card-glow">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {activeMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">UPI Payment</h3>
                    </div>
                    <Input label="UPI ID" name="upiId" placeholder="yourname@paytm" required
                      register={register} error={errors.upiId?.message}
                      hint="Supported: GPay, PhonePe, Paytm, BHIM, Amazon Pay" />
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-2 font-medium">Accepted UPI Apps</p>
                      <div className="flex flex-wrap gap-2">
                        {['GPay','PhonePe','Paytm','BHIM','Amazon Pay','Mobikwik'].map(a => (
                          <span key={a} className="px-3 py-1 rounded-full bg-gray-700 text-xs text-gray-300">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Debit / Credit Card</h3>
                    </div>
                    <Input label="Card Number" name="cardNumber" placeholder="1234 5678 9012 3456"
                      required register={register} error={errors.cardNumber?.message}
                      value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))}
                      icon={<CreditCard className="h-4 w-4" />} maxLength={19} />
                    <Input label="Cardholder Name" name="cardHolder" placeholder="RAHUL SHARMA"
                      required register={register} error={errors.cardHolder?.message} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiry" name="expiry" placeholder="MM/YY" required
                        register={register} error={errors.expiry?.message}
                        value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
                      <Input label="CVV" name="cvv" type="password" placeholder="•••"
                        required register={register} error={errors.cvv?.message} maxLength={3} hint="3-digit code" />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Card details encrypted via Razorpay — never stored on our servers.
                    </p>
                  </div>
                )}

                {activeMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Net Banking</h3>
                    </div>
                    <Select label="Select Your Bank" name="bank" required options={BANK_OPTIONS}
                      register={register} error={errors.bank?.message} />
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex gap-2">
                      <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-300/80">You will be redirected to your bank's secure login page.</p>
                    </div>
                  </div>
                )}

                {activeMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Mobile Wallet</h3>
                    </div>
                    <Input label="Registered Mobile Number" name="walletPhone" type="tel"
                      placeholder="9876543210" required register={register}
                      error={errors.walletPhone?.message}
                      hint="Mobile number linked to your wallet"
                      icon={<Smartphone className="h-4 w-4" />} />
                  </div>
                )}

                <div className="mt-6">
                  <Button type="submit" size="xl" loading={creating} className="w-full">
                    <Lock className="h-4 w-4" />
                    Pay ₹{totalAmount.toFixed(2)} via Razorpay
                  </Button>
                  <p className="text-xs text-gray-600 text-center mt-3">
                    By clicking Pay, you confirm your consent to our Terms & Privacy Policy already accepted.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-gray-600" /> 256-bit SSL</span>
                    <span className="h-3 w-px bg-gray-700" />
                    <span className="text-xs text-gray-500">PCI DSS</span>
                    <span className="h-3 w-px bg-gray-700" />
                    <span className="text-xs text-gray-500">RBI Approved</span>
                  </div>
                </div>
              </form>
            </div>

            <Button variant="ghost" size="md" onClick={() => navigate('/consent')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 card-glow space-y-4">
              <h3 className="text-sm font-semibold text-white">Order Summary</h3>
              <div className="border-b border-gray-800 pb-4">
                <p className="text-xs text-gray-500 mb-1">Plan</p>
                <p className="text-base font-bold text-white">{planName}</p>
                <p className="text-xs text-gray-400">Monthly · Auto-renews</p>
              </div>
              {(clientData || user) && (
                <div className="border-b border-gray-800 pb-4">
                  <p className="text-xs text-gray-500 mb-1">Paying As</p>
                  <p className="text-sm text-white font-medium">
                    {clientData?.firstName || user?.first_name} {clientData?.lastName || user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">{clientData?.email || user?.email}</p>
                </div>
              )}
              {dealData && (
                <div className="space-y-1.5 text-sm border-b border-gray-800 pb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{((dealData.baseAmount || 0) - (dealData.discount || 0) + (dealData.platformFee || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹{(dealData.gst || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-2xl font-extrabold text-emerald-400">₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-emerald-500/70 text-center">Amount verified by server</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
