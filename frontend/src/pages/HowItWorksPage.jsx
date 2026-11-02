import React from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, UserCheck, BookOpen, ShieldCheck,
  BadgeCheck, ArrowRight, AlertCircle, GraduationCap,
  Phone, Mail
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'
const TG = ({ cls='h-4 w-4' }) => <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

const STEPS = [
  {
    number: '01',
    icon: Phone,
    title: 'Get in Touch',
    desc: 'Contact Javitri Trading Service Pvt. Ltd. directly by phone, email, or WhatsApp. A member of our team will respond during Monday to Friday business hours.',
    note: null,
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Initial Consultation',
    desc: 'We discuss your goals, experience level, and interest areas — whether that is stock market education, Demat account assistance, or learning about investment plans.',
    note: null,
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Select a Service or Plan',
    desc: 'Choose the educational service or investment plan that suits you after reviewing all applicable terms, conditions, and risk disclosures in full.',
    note: 'Do not commit to any plan or make any payment until you have fully read and understood all terms and the risk disclosure statement.',
  },
  {
    number: '04',
    icon: GraduationCap,
    title: 'Begin Learning or Onboarding',
    desc: 'Once all documentation and formalities are completed, your learning support or plan onboarding begins. Our team provides ongoing guidance throughout.',
    note: null,
  },
  {
    number: '05',
    icon: BadgeCheck,
    title: 'Ongoing Support',
    desc: 'Our team remains available to answer questions, provide market education updates, and support you through your investment and learning journey.',
    note: null,
  },
]

const FAQS = [
  {
    q: 'Are the proposed daily figures in the plans guaranteed?',
    a: 'No. All proposed daily figures are illustrative only. They are not guaranteed returns, assured profits, or income promises. Stock market investments involve risk and actual outcomes may differ significantly.',
  },
  {
    q: 'What does the Monday to Friday schedule mean?',
    a: 'The Monday to Friday schedule refers to the days on which trading activity and plan-related services are active, aligning with Indian stock market trading days. Weekends and public holidays are excluded.',
  },
  {
    q: 'Can I make a payment directly through this website?',
    a: 'Payment functionality is only available through verified, official channels after all compliance checks, terms, and approvals are complete. Never transfer funds based on verbal promises or outside official processes.',
  },
  {
    q: 'What educational services do you provide?',
    a: 'We provide stock market education, trading basics, Demat account assistance, options and equity learning, commodity and forex market education, risk management education, and trading psychology support.',
  },
  {
    q: 'Are your services SEBI-regulated?',
    a: 'Javitri Trading Service Pvt. Ltd. provides educational and advisory content. Any regulated activities (e.g., investment advisory, portfolio management) require specific SEBI or other regulatory registrations. Please verify applicable authorisations directly before relying on any regulated service.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1px solid ${open ? 'rgba(212,168,67,0.4)' : 'rgba(15,36,96,0.75)'}`, background: open ? 'rgba(212,168,67,0.04)' : 'rgba(15,36,96,0.35)' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-medium pr-4" style={{ color: open ? '#d4a843' : '#e2e8f0' }}>{q}</span>
        <span className="shrink-0 text-lg leading-none" style={{ color: '#d4a843' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <div className="h-px mb-3" style={{ background: 'rgba(212,168,67,0.2)' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#b0c8dc' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#d4a843' }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          Process
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: '#fff' }}>
          How It <span className="gradient-text">Works</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: '#b0c8dc' }}>
          Our process is simple, transparent, and designed to ensure you are fully informed
          at every step before making any decision.
        </p>
      </section>

      {/* Important notice */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="flex gap-3 rounded-xl p-4"
          style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#93c5fd' }}>
            <span className="font-semibold">Transparency First:</span> We do not make unsupported claims about
            guaranteed profits, risk-free investments, or assured daily income. All plan figures are
            illustrative. Please read the{' '}
            <Link to="/risk-disclosure" style={{ color: '#fbbf24', textDecoration: 'underline' }}>
              Risk Disclosure Statement
            </Link>
            {' '}before proceeding.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-7 top-8 bottom-8 w-px hidden sm:block"
            style={{ background: 'linear-gradient(to bottom, rgba(212,168,67,0.4), rgba(200,152,58,0.05))' }}
            aria-hidden="true" />

          <div className="space-y-5">
            {STEPS.map(({ number, icon: Icon, title, desc, note }) => (
              <div key={number} className="relative flex gap-4 sm:gap-6">
                {/* Step indicator */}
                <div className="shrink-0 z-10">
                  <div className="h-14 w-14 rounded-full flex flex-col items-center justify-center"
                    style={{ border: '2px solid rgba(212,168,67,0.4)', background: '#080f22' }}>
                    <Icon className="h-5 w-5" style={{ color: '#d4a843' }} />
                    <span className="text-[9px] font-bold leading-none mt-0.5" style={{ color: 'rgba(200,152,58,0.7)' }}>{number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="rounded-2xl p-5 transition-colors"
                    style={{ background: 'rgba(13,31,87,0.35)', border: '1px solid rgba(212,168,67,0.12)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.12)'}
                  >
                    <h3 className="text-base font-semibold mb-2" style={{ color: '#fff' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#b0c8dc' }}>{desc}</p>
                    {note && (
                      <div className="mt-3 flex gap-2 rounded-lg p-3"
                        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                        <p className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>{note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* FAQ section */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: '#fff' }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(faq => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-3" style={{ color: '#fff' }}>Have Questions?</h2>
        <p className="text-sm mb-6" style={{ color: '#b0c8dc' }}>
          Our team is available Monday to Friday. Reach out by phone, email, or WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact">
            <Button size="lg"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Contact Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.35)', color: '#25d366' }}>
              <MessageSquare className="h-4 w-4" />
              WhatsApp Us
            </Button>
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg"
              style={{ background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.35)', color: '#29a8e8' }}>
              <TG /> Telegram
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
