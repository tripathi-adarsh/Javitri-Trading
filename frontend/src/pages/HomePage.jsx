import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, BookOpen,
  TrendingUp, BadgeCheck, MessageSquare, GraduationCap,
  Briefcase, BarChart2, Users, Shield, ChevronRight, Star, ClipboardList, Quote
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import PlanEnquiryModal from '../components/PlanEnquiryModal.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'

/* Reusable Telegram SVG icon */
const TelegramIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const PLANS = [
  { slug: 'plan-1',  name: 'Plan 1',  deal: '₹10,000',    daily: '₹200',      dealAmountINR: 10000 },
  { slug: 'plan-2',  name: 'Plan 2',  deal: '₹30,000',    daily: '₹700',      dealAmountINR: 30000 },
  { slug: 'plan-3',  name: 'Plan 3',  deal: '₹50,000',    daily: '₹1,200',    dealAmountINR: 50000 },
  { slug: 'plan-4',  name: 'Plan 4',  deal: '₹1,00,000',  daily: '₹2,500',    dealAmountINR: 100000 },
  { slug: 'plan-5',  name: 'Plan 5',  deal: '₹3,00,000',  daily: '₹8,000',    dealAmountINR: 300000 },
  { slug: 'plan-6',  name: 'Plan 6',  deal: '₹5,00,000',  daily: '₹13,500',   dealAmountINR: 500000 },
  { slug: 'plan-7',  name: 'Plan 7',  deal: '₹10,00,000', daily: '₹30,000',   dealAmountINR: 1000000 },
  { slug: 'plan-8',  name: 'Plan 8',  deal: '₹15,00,000', daily: '₹40,000',   dealAmountINR: 1500000 },
  { slug: 'plan-9',  name: 'Plan 9',  deal: '₹20,00,000', daily: '₹55,000',   dealAmountINR: 2000000 },
  { slug: 'plan-10', name: 'Plan 10', deal: '₹50,00,000', daily: '₹1,30,000', dealAmountINR: 5000000 },
]

const SERVICES_PREVIEW = [
  { icon: BookOpen,      title: 'Stock Market Learning',      desc: 'Beginner-to-intermediate stock market education.' },
  { icon: GraduationCap, title: 'Demat Account Assistance',   desc: 'Step-by-step guidance to open your Demat account.' },
  { icon: BarChart2,     title: 'Market Analysis Education',  desc: 'Technical and fundamental analysis training.' },
  { icon: TrendingUp,    title: 'Options & Equity Education', desc: 'Understand derivatives and equity investing.' },
  { icon: Users,         title: 'Mentoring & Support',        desc: 'Dedicated mentors available for beginners.' },
  { icon: Briefcase,     title: 'Daily Trading Insights',     desc: 'Educational daily market insights and tips.' },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Transparent',     desc: 'All plan terms and conditions are disclosed before any commitment.' },
  { icon: BookOpen,    title: 'Education First', desc: 'We focus on building genuine market knowledge for every learner.' },
  { icon: BadgeCheck,  title: 'Trustworthy',     desc: 'A registered company committed to honest, ethical practice.' },
]

const REVIEWS = [
  {
    name: 'Ramesh Verma',
    location: 'Lucknow, UP',
    rating: 5,
    text: 'Bahut accha platform hai. Mujhe stock market ke baare mein bilkul bhi jaankari nahi thi, inke saath seekh ke confidence badha. Team bahut helpful hai.',
    date: 'October 2026',
  },
  {
    name: 'Priya Sharma',
    location: 'Kanpur, UP',
    rating: 5,
    text: 'Javitri Trading Service ka support system excellent hai. Beginners ke liye best platform. Har cheez clearly explain ki jaati hai.',
    date: 'September 2026',
  },
  {
    name: 'Amit Kushwaha',
    location: 'Fatehpur, UP',
    rating: 5,
    text: 'Very trustworthy company. Plans ki poori jankari dete hain pehle, koi hidden terms nahi. Mujhe inke saath bahut accha experience raha.',
    date: 'October 2026',
  },
  {
    name: 'Sunita Yadav',
    location: 'Allahabad, UP',
    rating: 5,
    text: 'Stock market mein invest karna seekha inki help se. Demat account kholwane mein bhi guide kiya. Genuinely helpful team.',
    date: 'September 2026',
  },
  {
    name: 'Deepak Gupta',
    location: 'Varanasi, UP',
    rating: 4,
    text: 'Good experience overall. Team promptly responds on WhatsApp. Market analysis training is very useful for beginners like me.',
    date: 'August 2026',
  },
  {
    name: 'Kavita Singh',
    location: 'Agra, UP',
    rating: 5,
    text: 'Startup India registered company hai, isliye trust kiya. Sab kuch transparent hai. Investment plans ke baare mein acchi jaankari di.',
    date: 'October 2026',
  },
]

function SectionLabel({ color = 'gold', children }) {
  const s = color === 'green'
    ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }
    : { background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.38)', color: '#d4a843' }
  return (
    <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full" style={s}>
      {children}
    </span>
  )
}

export default function HomePage() {
  const [modalOpen, setModalOpen]   = useState(false)
  const [activePlan, setActivePlan] = useState(null)

  const openModal = (plan) => { setActivePlan(plan); setModalOpen(true) }

  return (
    <>
      <div className="min-h-screen">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(ellipse, rgba(20,60,160,0.45) 0%, rgba(15,40,120,0.2) 40%, transparent 70%)' }} />
            <div className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)' }} />
          </div>

          <div className="max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-16 sm:pb-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Logo */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[400px]">
                  <div className="absolute inset-0 rounded-3xl blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 70%)' }} />
                  <div className="relative rounded-3xl p-1 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.3), rgba(212,168,67,0.05))' }}>
                    <div className="bg-white rounded-[22px] p-4 sm:p-6">
                      <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd."
                        className="w-full h-auto object-contain" style={{ maxHeight: '220px' }} />
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
                    ✓ Est. 2026
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
                  style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.38)', color: '#d4a843' }}>
                  <Shield className="h-3.5 w-3.5" />
                  Javitri Trading Service Pvt. Ltd.
                </div>
                <h1 className="font-extrabold leading-[1.15] mb-4"
                  style={{ fontSize: 'clamp(1.75rem,5vw,3.25rem)', color: '#f8fafc' }}>
                  Learn the <span className="gradient-text">Stock Market</span>
                  <br />with Confidence
                </h1>
                <p className="text-base leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0" style={{ color: '#c0cdd8' }}>
                  Stock market education, trading guidance, market analysis, and beginner
                  learning support. Serving learners across India.
                </p>
                <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                  {['Stock Market Education', 'Trading Guidance', 'Market Analysis', 'Beginner Support'].map(s => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link to="/services" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full"
                      style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', border: 'none', color: '#fff',
                        boxShadow: '0 4px 20px rgba(212,168,67,0.35)' }}>
                      Explore Our Services <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full"
                      style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.4)', color: '#25d366' }}>
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                  <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full"
                      style={{ background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.35)', color: '#29a8e8' }}>
                      <TelegramIcon className="h-4 w-4" />
                      Telegram
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── SERVICES PREVIEW ─────────────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.018)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <SectionLabel>What We Offer</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-3">
                Our <span className="gradient-text">Services</span>
              </h2>
              <p className="text-base max-w-lg mx-auto" style={{ color: '#9aaabb' }}>
                Educational and guidance services to help you understand and navigate the stock market.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {SERVICES_PREVIEW.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card-gold rounded-2xl p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#d4a843' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#f0f4f8' }}>{title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#9aaabb' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/services">
                <Button variant="secondary" size="md">View All Services <ChevronRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── INVESTMENT PLANS ─────────────────────────────────────────── */}
        <section style={{ background: 'rgba(15,36,96,0.12)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <SectionLabel>Investment Plans</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-3">
                Our <span className="gradient-text">Plans</span>
              </h2>
              <p className="text-base max-w-lg mx-auto" style={{ color: '#9aaabb' }}>
                Ten plans with proposed daily figures for the Monday–Friday schedule.
                <strong style={{ color: '#d4a843' }}> Click any plan to register.</strong>
              </p>
            </div>

            {/* Plans grid — each card is clickable */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
              {PLANS.map((plan, i) => (
                <button
                  key={plan.slug}
                  type="button"
                  onClick={() => openModal(plan)}
                  className="plan-card rounded-2xl p-4 text-center group cursor-pointer w-full"
                  title={`Register for ${plan.name}`}
                >
                  <div className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[11px] font-bold mb-3"
                    style={{ background: 'rgba(212,168,67,0.18)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.35)' }}>
                    {i + 1}
                  </div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#8899aa' }}>{plan.name}</p>
                  <p className="text-sm font-extrabold mb-2" style={{ color: '#f8fafc' }}>{plan.deal}</p>
                  <div className="gold-line my-2 mx-auto" style={{ width: '32px' }} />
                  <p className="text-sm font-bold" style={{ color: '#4ade80' }}>{plan.daily}</p>
                  <p className="text-[10px] mt-1" style={{ color: '#5e7285' }}>Proposed Daily*</p>
                  {/* Hover overlay */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(212,168,67,0.2)', color: '#d4a843' }}>
                      <ClipboardList className="h-3 w-3" /> Register
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center gap-3 flex flex-col sm:flex-row justify-center">
              <Link to="/plans">
                <Button variant="secondary" size="md">
                  View Full Plan Details <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <button type="button" onClick={() => openModal(null)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff',
                  boxShadow: '0 3px 12px rgba(212,168,67,0.3)' }}>
                <ClipboardList className="h-4 w-4" /> Register for a Plan
              </button>
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── LEARNING SUPPORT ─────────────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.018)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel color="green">Learning Support</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
                  Build Your <span className="gradient-text-green">Market Knowledge</span>
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: '#9aaabb' }}>
                  From trading basics to advanced market analysis, our structured learning
                  helps beginners navigate stock markets confidently.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    'Beginner-friendly mentoring sessions',
                    'Risk management education',
                    'Trading psychology & discipline',
                    'Live market learning support',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}>
                        <Star className="h-2.5 w-2.5" style={{ color: '#4ade80' }} />
                      </div>
                      <span className="text-sm" style={{ color: '#c0cdd8' }}>{item}</span>
                    </div>
                  ))}
                </div>
                {/* <Link to="/learning"> */}
                  <Button size="lg"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.45)', color: '#4ade80' }}>
                    <GraduationCap className="h-4 w-4" />
                    Start Learning Today <ArrowRight className="h-4 w-4" />
                  </Button>
                {/* </Link> */}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: BookOpen,      label: 'Trading Basics & Terminology' },
                  { icon: Shield,        label: 'Risk Management' },
                  { icon: BarChart2,     label: 'Market Analysis' },
                  { icon: GraduationCap, label: 'Demat Account Help' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="card-glow rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#4ade80' }} />
                    </div>
                    <p className="text-xs font-semibold" style={{ color: '#d1dae6' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── VALUES ───────────────────────────────────────────────────── */}
        <section style={{ background: 'rgba(15,36,96,0.15)' }}>
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card-gold rounded-2xl p-6 flex gap-4">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#4ade80' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5" style={{ color: '#f0f4f8' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#9aaabb' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── GOOGLE REVIEWS ───────────────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.018)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <SectionLabel color="gold">Client Reviews</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-2">
                What Our <span className="gradient-text">Clients Say</span>
              </h2>
              {/* Google rating summary */}
              <div className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full"
                style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)' }}>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f0c060' }} />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: '#f0c060' }}>4.9</span>
                <span className="text-xs" style={{ color: '#9aaabb' }}>on Google · 6 reviews</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {REVIEWS.map((review) => (
                <div key={review.name} className="card-gold rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff' }}>
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>{review.name}</p>
                        <p className="text-[11px]" style={{ color: '#7090a8' }}>{review.location}</p>
                      </div>
                    </div>
                    <Quote className="h-5 w-5 shrink-0 mt-1" style={{ color: 'rgba(212,168,67,0.3)' }} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? 'fill-current' : ''}`}
                        style={{ color: i <= review.rating ? '#f0c060' : '#334' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#c0cdd8' }}>
                    "{review.text}"
                  </p>
                  <p className="text-[11px]" style={{ color: '#506070' }}>{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="gold-line" />

        {/* ── CTA BANNER ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f2460 0%, #162d7a 50%, #0f2460 100%)',
              border: '1px solid rgba(212,168,67,0.35)',
              boxShadow: '0 8px 48px rgba(15,36,96,0.5), inset 0 1px 0 rgba(212,168,67,0.15)',
            }}>
            <div className="absolute inset-x-0 top-0 gold-line" />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 70%)' }} />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto relative z-10" style={{ color: '#b8c9da' }}>
              Register for a plan or contact Javitri Trading Service Pvt. Ltd. to learn
              more about our educational services and investment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
              <button type="button" onClick={() => openModal(null)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-base font-semibold transition-all w-full sm:w-auto"
                style={{ background: 'linear-gradient(135deg,#d4a843,#a07020)', color: '#fff',
                  boxShadow: '0 4px 20px rgba(212,168,67,0.4)' }}>
                <ClipboardList className="h-5 w-5" /> Register for a Plan
              </button>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full"
                  style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.45)', color: '#25d366',
                    fontSize: '1rem', padding: '0.875rem 2rem' }}>
                  <MessageSquare className="h-5 w-5" /> WhatsApp
                </Button>
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full"
                  style={{ background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.4)', color: '#29a8e8',
                    fontSize: '1rem', padding: '0.875rem 2rem' }}>
                  <TelegramIcon className="h-5 w-5" /> Telegram
                </Button>
              </a>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full"
                  style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                  Contact Us <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="absolute inset-x-0 bottom-0 gold-line" />
          </div>
        </section>
      </div>

      {/* Plan Registration Modal */}
      <PlanEnquiryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setActivePlan(null) }}
        initialPlan={activePlan}
      />
    </>
  )
}
