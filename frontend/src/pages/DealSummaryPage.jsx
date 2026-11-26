import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Receipt, Info } from 'lucide-react'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

function SummaryRow({ label, value, highlight = false, className = '' }) {
  return (
    <div className={`flex items-center justify-between py-2 text-sm ${className}`}>
      <span className="text-[#475569]">{label}</span>
      <span className={highlight ? 'font-bold text-[#0f172a]' : 'font-medium text-[#1e293b]'}>
        {value}
      </span>
    </div>
  )
}

export default function DealSummaryPage() {
  const navigate = useNavigate()
  const { selectedPlan, dealData, setDealData, promoApplied, setPromoApplied, token } = useTrading()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/plans', { replace: true })
      return
    }

    if (token) {
      fetchPreview(promoApplied)
    }
  }, [selectedPlan, token])

  const fetchPreview = async (promoCode) => {
    setLoadingPreview(true)
    setPreviewError('')
    try {
      const res = await api.deals.preview({
        planId: selectedPlan.id,
        promoCode: promoCode || undefined,
      }, token)
      setDealData(res.data)
    } catch (err) {
      setPreviewError(err.message || 'Could not calculate order summary')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoError('')
    try {
      const res = await api.deals.preview({
        planId: selectedPlan.id,
        promoCode: promoInput.trim().toUpperCase(),
      }, token)
      setDealData(res.data)
      setPromoApplied(promoInput.trim().toUpperCase())
      setPromoInput('')
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code')
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(null)
    setPromoError('')
    fetchPreview(null)
  }

  const handleContinue = () => {
    navigate('/consent')
  }

  if (!selectedPlan) return null

  const breakdown = dealData

  return (
    <div className="min-h-screen bg-white">
      <StepIndicator currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] uppercase tracking-wider mb-3 shadow-xs">
            Step 3 of 4
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
            Review Your Order Summary
          </h1>
          <p className="text-[#475569] text-sm">
            All prices and taxes are calculated on our secure server before payment authorization.
          </p>
        </div>

        <div className="space-y-6">

          {/* Plan Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-[#0f172a]">{selectedPlan.name}</h2>
                  {selectedPlan.badge && <Badge color="blue">{selectedPlan.badge}</Badge>}
                </div>
                <p className="text-xs text-[#64748b]">Monthly subscription plan · Auto-renews</p>
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
              >
                Change Plan
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {(selectedPlan.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="h-4 w-4 text-[#2563eb] shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#2563eb]" /> Promotional Code
            </h3>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#2563eb]">{promoApplied} Applied</p>
                  {breakdown && <p className="text-xs text-[#64748b]">-₹{breakdown.discount} discount deducted</p>}
                </div>
                <button onClick={handleRemovePromo} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Enter discount code"
                  className="flex-1 rounded-xl bg-white border border-[#cbd5e1] px-4 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none"
                />
                <Button variant="secondary" size="md" onClick={handleApplyPromo} disabled={loadingPreview}>
                  Apply Code
                </Button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-600 font-medium mt-2">{promoError}</p>}
          </div>

          {/* Bill Breakdown */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#2563eb]" /> Billing Breakdown
            </h3>

            {loadingPreview ? (
              <div className="flex items-center justify-center py-8 gap-2 text-[#64748b]">
                <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
                <span className="text-sm">Calculating statutory taxes…</span>
              </div>
            ) : previewError ? (
              <p className="text-sm text-red-600 text-center py-4">{previewError}</p>
            ) : breakdown ? (
              <div className="divide-y divide-[#f1f5f9]">
                <SummaryRow label="Base Subscription Fee" value={`₹${breakdown.baseAmount?.toLocaleString('en-IN')}`} />
                <SummaryRow label="Onboarding & Platform Fee" value={breakdown.platformFee > 0 ? `₹${breakdown.platformFee}` : 'FREE (Waived)'} />
                {breakdown.discount > 0 && (
                  <SummaryRow label={`Discount Applied (${promoApplied})`} value={`-₹${breakdown.discount}`} />
                )}
                <SummaryRow label="GST (18% Statutory)" value={`₹${breakdown.gst?.toFixed(2)}`} />
                <div className="pt-4 flex items-baseline justify-between">
                  <span className="text-base font-bold text-[#0f172a]">Total Payable Amount</span>
                  <span className="text-2xl font-extrabold text-[#2563eb]">₹{breakdown.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#64748b] text-center py-4">Please log in to calculate price.</p>
            )}
          </div>

          {/* Satisfaction Notice */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 flex gap-3 text-xs text-[#2563eb]">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Operational Cycle:</strong> All investment simulations and market mentoring sessions run Monday to Friday (5 sessions per week, ~22 sessions per month).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="secondary" size="lg" onClick={() => navigate('/plans')}>
              <ArrowLeft className="h-4 w-4" /> Change Plan
            </Button>
            <Button size="lg" onClick={handleContinue} className="flex-1 font-bold bg-[#2563eb] hover:bg-[#1d4ed8] !text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]" disabled={!breakdown || loadingPreview}>
              <span>Review Terms &amp; Consent</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
