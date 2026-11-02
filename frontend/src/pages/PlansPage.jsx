import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, ArrowRight, ShieldAlert, ClipboardList } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import PlanEnquiryModal from '../components/PlanEnquiryModal.jsx'
import { api } from '../utils/api.js'

/* ── Static plan data ── */
const STATIC_PLANS = [
  { slug: 'plan-1',  name: 'Plan 1',  dealAmountINR: 10000,   proposedDailyINR: 200,    period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-2',  name: 'Plan 2',  dealAmountINR: 30000,   proposedDailyINR: 700, period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-3',  name: 'Plan 3',  dealAmountINR: 50000,   proposedDailyINR: 1200, period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-4',  name: 'Plan 4',  dealAmountINR: 100000,  proposedDailyINR: 2500,period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-5',  name: 'Plan 5',  dealAmountINR: 300000,  proposedDailyINR: 8000 ,period: '90 trading days (Mon–Fri)'},
  { slug: 'plan-6',  name: 'Plan 6',  dealAmountINR: 500000,  proposedDailyINR: 13500,period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-7',  name: 'Plan 7',  dealAmountINR: 1000000, proposedDailyINR: 30000,period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-8',  name: 'Plan 8',  dealAmountINR: 1500000, proposedDailyINR: 40000,period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-9',  name: 'Plan 9',  dealAmountINR: 2000000, proposedDailyINR: 55000,period: '90 trading days (Mon–Fri)' },
  { slug: 'plan-10', name: 'Plan 10', dealAmountINR: 5000000, proposedDailyINR: 130000,period: '90 trading days (Mon–Fri)' },
]

function fmt(n) {
  if (n == null) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

/* enrich plan with modal-compatible fields */
function enrichPlan(plan) {
  return {
    ...plan,
    deal:  fmt(plan.dealAmountINR),
    daily: fmt(plan.proposedDailyINR || plan.associatedValueINR),
  }
}

function PlanCard({ plan, onEnquire }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 cursor-pointer group"
      style={{
        background: 'linear-gradient(145deg, rgba(15,36,96,0.6) 0%, rgba(8,15,32,0.8) 100%)',
        border: '1px solid rgba(212,168,67,0.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.18)'; e.currentTarget.style.transform = 'none' }}
      onClick={() => onEnquire(plan)}
    >
      {/* Top line */}
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)' }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)' }}>
            {plan.name}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            Active
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8099b0' }}>Investment</p>
          <p className="text-2xl font-extrabold" style={{ color: '#f5f8fc' }}>{fmt(plan.dealAmountINR)}</p>
        </div>
        <div className="gold-line" />
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8099b0' }}>Proposed Daily *</p>
          <p className="text-xl font-bold" style={{ color: '#4ade80' }}>
            {fmt(plan.proposedDailyINR || plan.associatedValueINR)}
          </p>
          {plan.period && <p className="text-[10px] mt-0.5" style={{ color: '#5e7285' }}>{plan.period}</p>}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEnquire(plan) }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff', border: 'none',
            boxShadow: '0 3px 12px rgba(212,168,67,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <ClipboardList className="h-4 w-4" />
          Register for This Plan
        </button>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans]       = useState(STATIC_PLANS)
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    api.plans.list()
      .then(res => {
        const apiPlans = res.data?.plans || []
        if (apiPlans.length > 0) setPlans(apiPlans)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleEnquire = (plan) => {
    setSelectedPlan(enrichPlan(plan))
    setModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen py-12 px-4" style={{ background: '#080f22' }}>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,168,67,0.12)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.25)' }}>
              Investment Plans
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-3" style={{ color: '#f5f8fc' }}>
              Our <span className="gradient-text">Investment Plans</span>
            </h1>
            <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: '#9ab0c4' }}>
              Ten investment plans with proposed daily figures — Monday to Friday schedule.
              Click any plan card to register your interest.
            </p>
          </div>

          {/* Plans grid */}
          {loading ? (
            <div className="flex justify-center py-16" style={{ color: '#9ab0c4' }}>
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading plans…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {plans.map((plan, i) => (
                <PlanCard key={plan.slug || plan.name} plan={plan} onEnquire={handleEnquire} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/contact">
              <Button size="lg"
                style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', border: 'none', color: '#fff' }}>
                Contact Us for More Information <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Plan Enquiry Modal */}
      <PlanEnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={selectedPlan}
      />
    </>
  )
}
