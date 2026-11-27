import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, UserCheck, BookOpen, ShieldCheck,
  BadgeCheck, ArrowRight, AlertCircle, GraduationCap,
  Phone, Mail, ChevronDown, CheckCircle2, Calendar, FileText, Landmark
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'

const STEPS = [
  {
    number: '01',
    icon: Phone,
    title: 'Initial Consultation & Guidance',
    desc: 'Reach out to Javitri Trading Service Pvt. Ltd. via phone, website form, or WhatsApp. Our compliance advisors will discuss your trading background, financial goals, risk tolerance, and suitable learning or investment plans.',
    note: null,
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Statutory Verification & KYC Processing',
    desc: 'Complete standard identity verification by submitting Aadhaar, PAN card, and verified bank passbook/cancelled cheque details. We ensure 100% compliance with Indian corporate and financial regulations.',
    note: null,
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Select Investment Plan (Monday–Friday)',
    desc: 'Choose from our structured corporate investment plans or specialized educational modules after thoroughly evaluating all parameters, illustrative daily figures, and tenure options (22 to 264 trading days).',
    note: 'Important: All figures are calculated on standard Monday to Friday working cycles (5 trading sessions/week, ~22 sessions/month). Please review our statutory Risk Disclosure Statement prior to entering into any commitment.',
  },
  {
    number: '04',
    icon: GraduationCap,
    title: 'Formal Agreement & Onboarding Credentials',
    desc: 'Receive your formal written service agreement stamped under corporate authority, unique client identification credentials, and dedicated mentor allotment. Access live morning sentiment briefs and technical analysis frameworks.',
    note: null,
  },
  {
    number: '05',
    icon: BadgeCheck,
    title: 'Punctual Payouts & Continuous Support',
    desc: 'Follow your scheduled Monday through Friday cycle with transparent tracking. Daily associated payouts are reconciled and logged with verified transaction proofs. Our client relations desk is always on standby.',
    note: null,
  },
]

const FAQS = [
  {
    q: 'How does the Monday to Friday trading schedule work?',
    a: 'All our investment plans and educational programs strictly mirror the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE) trading calendars. Active trading sessions take place Monday through Friday (5 days per week, averaging ~22 trading days per month). Saturdays, Sundays, and official national exchange holidays are non-trading days where markets remain closed.',
  },
  {
    q: 'Are the proposed daily figures in the plans guaranteed?',
    a: 'No. All proposed daily figures are illustrative, educational projections. They are not guaranteed returns or fixed income promises. Stock markets involve financial risk, and actual results depend on market conditions, risk management, and formal contractual covenants.',
  },
  {
    q: 'What is the required documentation for client KYC verification?',
    a: 'Every client must provide a valid government-issued Aadhaar card (both front and back), PAN card, cancelled cheque or bank passbook copy showing IFSC and account number, and verified contact information to fulfill statutory compliance under Indian laws.',
  },
  {
    q: 'How are daily Monday-to-Friday payouts tracked and credited?',
    a: 'Daily payouts are logged in the secure corporate administration portal. Clients receive verified statement receipts, payout reconciliations, and direct bank transfer references for complete financial auditing.',
  },
  {
    q: 'What legal documentation is provided upon registration?',
    a: 'Every registered client receives a formal corporate service agreement executed under the authority of JAVITRI TRADING SERVICE PRIVATE LIMITED, complete with CIN, GSTIN, registered office address, and authorized executive seal.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden transition-all shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors cursor-pointer"
      >
        <span className="text-base font-bold text-[#0f172a]">{q}</span>
        <ChevronDown
          className="h-5 w-5 text-[#64748b] transition-transform duration-200 shrink-0 ml-4"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-[#f1f5f9]">
          {a}
        </div>
      )}
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#059669] uppercase tracking-wider mb-4 shadow-xs">
            <ShieldCheck className="h-4 w-4" /> Transparent 5-Step Corporate Workflow
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            How It Works
          </h1>
          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Our structured onboarding and operational process at <strong>Javitri Trading Service Pvt. Ltd.</strong> is completely documented from consultation to Monday-to-Friday schedule execution.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a] shadow-xs flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#059669]" />
              <span>5 Trading Days / Week (Mon–Fri)</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0f172a] shadow-xs flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-[#1a3c8f]" />
              <span>Full Statutory Documentation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Advisory Warning */}
        <div className="mb-12 p-5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3.5 shadow-xs">
          <AlertCircle className="h-5 w-5 text-[#1a3c8f] shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>Transparency Commitment:</strong> Javitri Trading Service Pvt. Ltd. never makes speculative guarantees or promises of effortless profits. All figures and projections follow strict Monday-to-Friday trading session schedules. Please review our full{' '}
            <Link to="/risk-disclosure" className="font-bold underline text-[#1a3c8f]">
              Risk Disclosure Statement
            </Link>{' '}
            before making any financial decision.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-6">
          {STEPS.map(({ number, icon: Icon, title, desc, note }) => (
            <div
              key={number}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#cbd5e1] hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                <Icon className="h-6 w-6 text-[#059669]" />
                <span className="text-[10px] font-extrabold text-[#059669] mt-0.5">{number}</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-[#0f172a]">{title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{desc}</p>
                {note && (
                  <p className="text-xs font-semibold text-[#b45309] bg-[#fffbeb] p-3.5 rounded-2xl border border-[#fde68a] mt-3 leading-relaxed">
                    ℹ {note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mid-page CTA */}
        <div className="mt-12 text-center">
          <Link to="/plans">
            <Button size="lg" variant="primary">
              View All 10 Corporate Plans <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Interactive FAQs */}
      <section className="py-16 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-1">Operational &amp; Schedule Details</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-[#0f172a]">Have Further Questions?</h2>
          <p className="text-base text-[#475569] max-w-xl mx-auto leading-relaxed">
            Our compliance desk is available Monday to Friday from 09:00 to 18:00 IST to assist you with registration queries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="primary">
                Contact Advisory Team <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="text-[#059669] border-[#bbf7d0]">
                <MessageSquare className="h-4 w-4 text-[#059669]" /> WhatsApp Support Desk
              </Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
