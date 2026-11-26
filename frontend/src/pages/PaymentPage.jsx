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
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-10 w-10 text-[#059669] animate-spin" />
        <p className="text-[#0f172a] font-bold text-lg">Verifying payment signature…</p>
        <p className="text-sm text-[#64748b]">Please do not close or refresh this window.</p>
      </div>
    )
  }

  if (paySuccess) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6 px-4">
        <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-[#059669]" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2">Payment Verified!</h1>
          <p className="text-[#475569] text-sm max-w-sm">
            Your <span className="text-[#059669] font-bold">{planName}</span> subscription is now active.
            Check your email for confirmation.
          </p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full max-w-sm shadow-sm">
          <p className="text-xs text-[#64748b] font-bold mb-3 uppercase tracking-wider">Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#64748b]">Plan</span><span className="text-[#0f172a] font-bold">{planName}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Amount Paid</span><span className="text-[#059669] font-extrabold">₹{totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Order ID</span><span className="text-[#334155] font-mono text-xs">{orderData?.orderId?.slice(0,16)}…</span></div>
          </div>
        </div>
        <Button size="lg" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <StepIndicator currentStep={4} />

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-2">Step 4 of 4</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
            Complete <span className="text-[#059669]">Payment</span>
          </h1>
          <p className="text-[#64748b] text-sm font-medium">Your order amount is calculated by our server — verified and tamper-proof.</p>
        </div>

        {apiError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Method selector */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#0f172a] mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map(({ id, label }) => {
                  const Icon = methodIcons[id]
                  return (
                    <button key={id} type="button" onClick={() => handleMethodChange(id)}
                      aria-pressed={activeMethod === id}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#059669]/30
                        ${activeMethod === id
                          ? 'border-[#059669] bg-emerald-50 text-[#059669] shadow-sm font-semibold'
                          : 'border-[#e2e8f0] text-[#64748b] bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a]'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment detail form */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {activeMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-[#059669]" />
                      <h3 className="text-sm font-bold text-[#0f172a]">UPI Payment</h3>
                    </div>
                    <Input label="UPI ID" name="upiId" placeholder="yourname@paytm" required
                      register={register} error={errors.upiId?.message}
                      hint="Supported: GPay, PhonePe, Paytm, BHIM, Amazon Pay" />
                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                      <p className="text-xs text-[#475569] mb-2 font-semibold">Accepted UPI Apps</p>
                      <div className="flex flex-wrap gap-2">
                        {['GPay','PhonePe','Paytm','BHIM','Amazon Pay','Mobikwik'].map(a => (
                          <span key={a} className="px-3 py-1 rounded-full bg-white border border-[#cbd5e1] text-xs font-medium text-[#334155]">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-[#059669]" />
                      <h3 className="text-sm font-bold text-[#0f172a]">Debit / Credit Card</h3>
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
                    <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium">
                      <Lock className="h-3.5 w-3.5 text-[#059669]" /> Card details encrypted via Razorpay — never stored on our servers.
                    </p>
                  </div>
                )}

                {activeMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-[#059669]" />
                      <h3 className="text-sm font-bold text-[#0f172a]">Net Banking</h3>
                    </div>
                    <Select label="Select Your Bank" name="bank" required options={BANK_OPTIONS}
                      register={register} error={errors.bank?.message} />
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-2.5">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 font-medium">You will be redirected to your bank's secure authorization page.</p>
                    </div>
                  </div>
                )}

                {activeMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-[#059669]" />
                      <h3 className="text-sm font-bold text-[#0f172a]">Mobile Wallet</h3>
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
                  <p className="text-xs text-[#64748b] text-center mt-3 font-medium">
                    By clicking Pay, you confirm your consent to our Terms & Privacy Policy already accepted.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-xs text-[#64748b] font-medium flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#059669]" /> 256-bit SSL</span>
                    <span className="h-3 w-px bg-[#cbd5e1]" />
                    <span className="text-xs text-[#64748b] font-medium">PCI DSS Compliant</span>
                    <span className="h-3 w-px bg-[#cbd5e1]" />
                    <span className="text-xs text-[#64748b] font-medium">RBI Approved</span>
                  </div>
                </div>
              </form>
            </div>

            <Button variant="ghost" size="md" onClick={() => navigate('/consent')}>
              <ArrowLeft className="h-4 w-4" /> Back to Consent
            </Button>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#0f172a] border-b border-[#f1f5f9] pb-3">Order Summary</h3>
              <div className="border-b border-[#f1f5f9] pb-4">
                <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1">Selected Plan</p>
                <p className="text-lg font-extrabold text-[#0f172a]">{planName}</p>
                <p className="text-xs text-[#059669] font-medium mt-0.5">Monthly Subscription · Auto-renews</p>
              </div>
              {(clientData || user) && (
                <div className="border-b border-[#f1f5f9] pb-4">
                  <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1">Paying As</p>
                  <p className="text-sm text-[#0f172a] font-bold">
                    {clientData?.firstName || user?.first_name} {clientData?.lastName || user?.last_name}
                  </p>
                  <p className="text-xs text-[#64748b] mt-0.5">{clientData?.email || user?.email}</p>
                </div>
              )}
              {dealData && (
                <div className="space-y-2 text-sm border-b border-[#f1f5f9] pb-4">
                  <div className="flex justify-between text-[#64748b]">
                    <span>Subtotal</span>
                    <span className="text-[#0f172a] font-medium">₹{((dealData.baseAmount || 0) - (dealData.discount || 0) + (dealData.platformFee || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>GST (18%)</span>
                    <span className="text-[#0f172a] font-medium">₹{(dealData.gst || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-bold text-[#0f172a]">Total Payable</span>
                <span className="text-2xl font-extrabold text-[#059669]">₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#64748b] text-center font-medium bg-[#f8fafc] py-2 rounded-lg border border-[#e2e8f0]">
                ✓ Amount cryptographically signed by server
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
