import React, { useEffect, useState } from 'react'
import {
  RefreshCw, ArrowRight, ClipboardList, CheckCircle2,
  Calculator, ShieldCheck, Calendar, Info, TrendingUp, Sparkles, Building2
} from 'lucide-react'
import PlanEnquiryModal from '../components/PlanEnquiryModal.jsx'
import { api } from '../utils/api.js'
import { useLang } from '../context/LanguageContext.jsx'
import {
  TRADING_PLANS,
  TENURE_OPTIONS,
  TRADING_DAYS_PER_WEEK,
  TRADING_DAYS_PER_MONTH,
  formatINR,
  calculateTradingProjections,
  parseFeatures
} from '../utils/tradingCalculations.js'

function enrichPlan(plan) {
  const daily = Number(plan.proposedDailyINR || plan.associatedValueINR || 0)
  return {
    ...plan,
    deal: formatINR(plan.dealAmountINR),
    daily: formatINR(daily),
    features: parseFeatures(plan.features),
  }
}

export default function PlansPage() {
  const { t, lang } = useLang()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.plans.list()
      .then(res => {
        const apiPlans = res.data?.plans || []
        if (Array.isArray(apiPlans) && apiPlans.length > 0) {
          // Format plans directly from database
          const formatted = apiPlans.map((ap, i) => {
            const dealAmount = Number(ap.dealAmountINR || (ap.deal_amount_paise ? ap.deal_amount_paise / 100 : 0)) || 10000
            const daily = Number(ap.proposedDailyINR || ap.associatedValueINR || (ap.associated_value_paise ? ap.associated_value_paise / 100 : 0)) || 200
            const features = parseFeatures(ap.features)

            return {
              id: ap.id,
              slug: ap.slug || `plan-${i + 1}`,
              name: ap.name || `Plan ${i + 1}`,
              dealAmountINR: dealAmount,
              deal: formatINR(dealAmount),
              proposedDailyINR: daily,
              daily: formatINR(daily),
              tagline: ap.tagline || 'Structured Investment Plan',
              category: ap.badge || 'Standard',
              features: features.length > 0 ? features : [
                'Monday to Friday daily payout',
                'Comprehensive market insights',
                'Dedicated compliance documentation'
              ],
            }
          })

          // Sort plans by deal amount ascending
          formatted.sort((a, b) => a.dealAmountINR - b.dealAmountINR)
          setPlans(formatted)
        } else {
          // Fallback if DB empty
          setPlans(TRADING_PLANS)
        }
      })
      .catch(() => {
        // Fallback gracefully on network error
        setPlans(TRADING_PLANS)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleEnquire = (plan) => {
    if (!plan) return
    setSelectedPlan(enrichPlan(plan))
    setModalOpen(true)
  }

  const activePlanList = plans.length > 0 ? plans : TRADING_PLANS

  return (
    <>
      <div className="min-h-screen bg-white">

        {/* ── Page Header ── */}
        <section className="bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-white border-b border-[#e2e8f0] py-14 sm:py-18 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black text-[#0b1e3f] tracking-tight mb-4">
              {t('plans_heading')}
            </h1>
            <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto leading-relaxed">
              {t('plans_subheading')}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-xs font-bold text-[#0b1e3f] shadow-xs flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1d4ed8] animate-pulse" />
                <span>5 {lang === 'hi' ? 'सत्र प्रति सप्ताह (सोम–शुक्र)' : 'Sessions / Week (Mon–Fri)'}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-xs font-bold text-[#0b1e3f] shadow-xs">
                <span>~22 {lang === 'hi' ? 'ट्रेडिंग दिन प्रति माह' : 'Trading Days / Month'}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-xs font-bold text-[#0b1e3f] shadow-xs">
                <span>{lang === 'hi' ? 'शनि एवं रवि बाजार अवकाश' : 'Weekends: Sat & Sun Closed'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── All Active Investment Plans from Database (Luxury Card Design) ── */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0b1e3f] tracking-tight mb-2">Available Investment Plans</h2>
            <p className="text-sm text-[#475569] max-w-xl mx-auto">
              Choose from all active plans configured in our database. Every plan operates on our transparent Monday to Friday framework.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
              <RefreshCw className="h-8 w-8 animate-spin text-[#1d4ed8] mb-3" />
              <p className="text-sm font-bold text-[#0b1e3f]">Loading plans from database…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {activePlanList.map((plan) => {
                const daily = Number(plan.proposedDailyINR || plan.associatedValueINR || 0)
                const weekly = daily * TRADING_DAYS_PER_WEEK
                const monthly = daily * TRADING_DAYS_PER_MONTH
                const featuresList = parseFeatures(plan.features)

                return (
                  <div
                    key={plan.slug || plan.name}
                    onClick={() => handleEnquire(plan)}
                    className="plan-card bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm hover:border-[#1d4ed8] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />

                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black px-3 py-1 rounded-full gold-badge">
                          {plan.name}
                        </span>
                      </div>

                      {/* Principal Amount */}
                      <div className="mb-4">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Investment Amount</p>
                        <p className="text-2xl font-black text-[#0b1e3f] mt-0.5">{formatINR(plan.dealAmountINR)}</p>
                        {plan.tagline && (
                          <p className="text-xs text-[#b45309] font-bold mt-1">{plan.tagline}</p>
                        )}
                      </div>

                      {/* Highlighted Return Box */}
                      <div className="bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 rounded-2xl p-4 border border-blue-100 my-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#475569] font-medium">Daily:</span>
                          <span className="font-black text-[#1d4ed8] text-sm">{formatINR(daily)} / day</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#475569] font-medium">Weekly:</span>
                          <span className="font-bold text-[#0b1e3f]">{formatINR(weekly)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                          <span className="text-[#475569] font-medium">Monthly:</span>
                          <span className="font-black text-[#b45309]">{formatINR(monthly)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleEnquire(plan) }}
                      className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] !text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <ClipboardList className="h-4 w-4 !text-white" />
                      <span className="!text-white">Register for {plan.name}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Schedule Comparison Matrix ── */}
          <div className="mt-12 sm:mt-16 bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-xs">
            <div className="p-5 sm:p-8 bg-[#f8fafc] border-b border-[#e2e8f0]">
              <h3 className="text-base sm:text-lg font-black text-[#0b1e3f]">Complete Schedule Comparison Matrix</h3>
              <p className="text-xs text-[#64748b] mt-0.5">Quick reference across all investment plans</p>
            </div>

            {/* Mobile Card Matrix */}
            <div className="sm:hidden divide-y divide-[#e2e8f0]">
              {activePlanList.map((p) => {
                const d = Number(p.proposedDailyINR || p.associatedValueINR || 0)
                const w = d * TRADING_DAYS_PER_WEEK
                const m = d * TRADING_DAYS_PER_MONTH
                return (
                  <div key={p.slug || p.name} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#1d4ed8]">{p.name}</p>
                      <p className="text-base font-black text-[#0b1e3f]">{formatINR(p.dealAmountINR)}</p>
                      <p className="text-[11px] text-[#475569] font-semibold mt-0.5">
                        Daily: <strong className="text-[#1d4ed8]">{formatINR(d)}</strong> · Monthly: <strong className="text-[#b45309]">{formatINR(m)}</strong>
                      </p>
                      <p className="text-[10px] text-[#64748b]">Weekly: {formatINR(w)} · Mon–Fri</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEnquire(p)}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#1d4ed8] !text-white shrink-0 cursor-pointer"
                    >
                      Register
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table Matrix */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-white text-[#0b1e3f] uppercase font-black text-[10px] tracking-wider">
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6">Principal Amount</th>
                    <th className="py-4 px-6">Daily</th>
                    <th className="py-4 px-6">Weekly</th>
                    <th className="py-4 px-6">Monthly</th>
                    <th className="py-4 px-6">Schedule</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {activePlanList.map((p) => {
                    const d = Number(p.proposedDailyINR || p.associatedValueINR || 0)
                    const w = d * TRADING_DAYS_PER_WEEK
                    const m = d * TRADING_DAYS_PER_MONTH

                    return (
                      <tr key={p.slug || p.name} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#0b1e3f]">{p.name}</td>
                        <td className="py-4 px-6 font-black text-[#0b1e3f]">{formatINR(p.dealAmountINR)}</td>
                        <td className="py-4 px-6 font-black text-[#1d4ed8]">{formatINR(d)}</td>
                        <td className="py-4 px-6 font-bold text-[#0b1e3f]">{formatINR(w)}</td>
                        <td className="py-4 px-6 font-bold text-[#b45309]">{formatINR(m)}</td>
                        <td className="py-4 px-6 text-[#64748b]">Mon–Fri (5 days)</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleEnquire(p)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1d4ed8] hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                          >
                            Register
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Clean Notice (No Terms/Policy links as requested) */}
          <div className="mt-14 p-6 sm:p-7 rounded-3xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569] leading-relaxed max-w-4xl mx-auto space-y-2 text-center">
            <p className="font-extrabold text-[#0f172a]">
              Javitri Trading Service Pvt. Ltd. · Operating Schedule
            </p>
            <p>
              All calculations displayed are illustrative figures based strictly on the standard Monday to Friday stock exchange trading cycle (5 sessions per week, ~22 sessions per month).
            </p>
          </div>
        </section>

      </div>

      <PlanEnquiryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedPlan(null) }}
        initialPlan={selectedPlan}
      />
    </>
  )
}
