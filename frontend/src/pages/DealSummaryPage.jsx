import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, CheckCircle2, ArrowRight, ArrowLeft, Info, Receipt, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

function SummaryRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${accent ? 'text-white font-semibold' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-sm font-medium ${accent ? 'text-emerald-400 text-base font-bold' : 'text-gray-200'}`}>{value}</span>
    </div>
  )
}

export default function DealSummaryPage() {
  const navigate = useNavigate()
  const { selectedPlan, token, setDealData } = useTrading()

  const [promoInput, setPromoInput]       = useState('')
  const [promoApplied, setPromoApplied]   = useState(null)
  const [promoError, setPromoError]       = useState('')
  const [breakdown, setBreakdown]         = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError]   = useState('')

  // Fetch server-side preview whenever plan or promo changes
  const fetchPreview = async (promoCode = null) => {
    if (!selectedPlan || !token) return
    setLoadingPreview(true)
    setPreviewError('')
    try {
      const res = await api.orders.preview(
        { planSlug: selectedPlan.slug, promoCode: promoCode || undefined },
        token
      )
      setBreakdown(res.data)
    } catch (err) {
      setPreviewError(err.message || 'Could not calculate order total.')
    } finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => { fetchPreview(promoApplied) }, [selectedPlan, token])

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoError('')
    setLoadingPreview(true)
    try {
      const res = await api.orders.preview({ planSlug: selectedPlan.slug, promoCode: code }, token)
      setBreakdown(res.data)
      setPromoApplied(code)
      setPromoInput('')
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code.')
      setPromoApplied(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(null)
    setPromoInput('')
    setPromoError('')
    fetchPreview(null)
  }

  const handleContinue = () => {
    if (!breakdown) return
    setDealData({ ...breakdown, promoApplied })
    navigate('/consent')
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">No plan selected.</p>
        <Button onClick={() => navigate('/plans')}>Choose a Plan</Button>
      </div>
    )
  }

  const planColor = selectedPlan.color === 'violet' ? 'violet' : selectedPlan.color === 'teal' ? 'teal' : 'emerald'

  return (
    <div className="min-h-screen">
      <StepIndicator currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Step 3 of 4</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Review Your <span className="gradient-text">Deal</span>
          </h1>
          <p className="text-gray-400 text-sm">Amounts are calculated on our server — cannot be tampered.</p>
        </div>

        <div className="space-y-4">
          {/* Plan */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 card-glow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{selectedPlan.name}</h2>
                  {selectedPlan.badge && <Badge color={planColor}>{selectedPlan.badge}</Badge>}
                </div>
                <p className="text-sm text-gray-400">Monthly subscription · Auto-renews</p>
              </div>
              <button onClick={() => navigate('/plans')} className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">
                Change plan
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(selectedPlan.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 card-glow">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-400" /> Promo Code
            </h3>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">{promoApplied} applied</p>
                  {breakdown && <p className="text-xs text-gray-400">-₹{breakdown.discount} discount</p>}
                </div>
                <button onClick={handleRemovePromo} className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <Button variant="outline" size="md" onClick={handleApplyPromo} disabled={loadingPreview}>Apply</Button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-400 mt-2">{promoError}</p>}
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" /> Sample codes: TRADE200, ELITE600, WELCOME100
            </p>
          </div>

          {/* Bill Breakdown — SERVER CALCULATED */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 card-glow">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-400" /> Bill Breakdown
              <span className="ml-auto text-xs text-gray-600 font-normal">Server-calculated</span>
            </h3>

            {loadingPreview ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Calculating…</span>
              </div>
            ) : previewError ? (
              <p className="text-sm text-red-400 text-center py-4">{previewError}</p>
            ) : breakdown ? (
              <div className="divide-y divide-gray-800">
                <SummaryRow label="Base subscription" value={`₹${breakdown.baseAmount?.toLocaleString('en-IN')}`} />
                <SummaryRow label="Platform fee" value={breakdown.platformFee > 0 ? `₹${breakdown.platformFee}` : 'FREE'} />
                {breakdown.discount > 0 && (
                  <SummaryRow label={`Discount${promoApplied ? ` (${promoApplied})` : ''}`} value={`-₹${breakdown.discount}`} />
                )}
                <SummaryRow label="GST (18%)" value={`₹${breakdown.gst?.toFixed(2)}`} />
                <div className="pt-3 flex items-baseline justify-between">
                  <span className="text-base font-bold text-white">Total Payable</span>
                  <span className="text-xl font-extrabold text-emerald-400">₹{breakdown.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Login required to view pricing.</p>
            )}
          </div>

          {/* Notice */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              You can cancel within 30 days of activation for a full refund, no questions asked.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" size="lg" onClick={() => navigate('/plans')}>
              <ArrowLeft className="h-4 w-4" /> Back to Plans
            </Button>
            <Button size="lg" onClick={handleContinue} className="flex-1" disabled={!breakdown || loadingPreview}>
              Review Terms & Pay <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
