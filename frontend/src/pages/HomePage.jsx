import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Award, Clock, ArrowRight, CheckCircle2,
  Calendar, ShieldCheck, Star, Activity, PhoneCall,
  MessageSquare, ChevronRight, Calculator, FileCheck, Users,
  BookOpen, Building, Sparkles, Quote, BadgeCheck, X, ZoomIn, Eye, MapPin, ClipboardList,
  RefreshCw, Car, HeartPulse, HeartHandshake, Send
} from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import PlanEnquiryModal from '../components/PlanEnquiryModal.jsx'
import {
  TRADING_PLANS,
  TENURE_OPTIONS,
  TRADING_DAYS_PER_WEEK,
  TRADING_DAYS_PER_MONTH,
  formatINR,
  calculateTradingProjections,
  parseFeatures
} from '../utils/tradingCalculations.js'
import { api } from '../utils/api.js'

const WHATSAPP_URL = 'https://wa.me/919022487800'

const CORPORATE_GALLERY = [
  { src: '/gallery/img1.jpeg' },
  { src: '/gallery/img2.jpeg' },
  { src: '/gallery/img3.jpeg' },
  { src: '/gallery/img4.jpeg' },
  { src: '/gallery/img6.jpeg' },
  { src: '/gallery/img7.jpeg' },
  { src: '/gallery/img8.jpeg' },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Absolute Compliance', desc: 'Registered private limited company (CIN: U66190GJ2026PTC183862, GST: 09AAHCJ6166E1ZD, DPIIT Recognized).' },
  { icon: Clock,       title: 'Monday to Friday Schedule', desc: 'Strict Monday-to-Friday trading calendar aligned with NSE/BSE market cycles. Payouts processed every trading day.' },
  { icon: BadgeCheck,  title: 'Documented Legal Agreements', desc: 'Every plan subscription is backed by formal documentation, zero hidden deductions, and complete statutory transparency.' },
]

const REVIEWS = [
  { name: 'Ramesh Verma',    location: 'Lucknow, UP',    rating: 5, text: 'Javitri Trading Service Pvt. Ltd. has given me the confidence to understand stock charts and trade safely. The team explained everything clearly in Hindi and English.', date: 'October 2026' },
  { name: 'Priya Sharma',    location: 'Kanpur, UP',     rating: 5, text: 'Outstanding customer support. As a beginner, I was hesitant, but their transparency and structured approach made a real difference.', date: 'September 2026' },
  { name: 'Amit Kushwaha',   location: 'Fatehpur, UP',   rating: 5, text: 'Very trustworthy organization. Complete documentation provided upfront. The proposed Monday to Friday daily figures were honoured punctually.', date: 'October 2026' },
  { name: 'Sunita Yadav',    location: 'Prayagraj, UP',  rating: 5, text: 'Learned disciplined investing and risk management. Guidance for opening a Demat account was smooth and completely hassle-free.', date: 'September 2026' },
  { name: 'Deepak Gupta',    location: 'Varanasi, UP',   rating: 5, text: 'Top-tier corporate responsiveness on WhatsApp and phone. The educational market webinars are practical and high quality.', date: 'August 2026' },
  { name: 'Kavita Singh',    location: 'Agra, UP',       rating: 5, text: 'Startup India recognized entity which gives immense peace of mind. Transparent terms and reliable team support throughout.', date: 'October 2026' },
]

const REVIEW_THEMES = [
  {
    topBorder: 'border-t-4 border-t-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    avatarBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(37,99,235,0.14)] hover:border-blue-300',
    tag: 'Verified Participant',
  },
  {
    topBorder: 'border-t-4 border-t-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    avatarBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(16,185,129,0.14)] hover:border-emerald-300',
    tag: 'Verified Participant',
  },
  {
    topBorder: 'border-t-4 border-t-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(245,158,11,0.14)] hover:border-amber-300',
    tag: 'Verified Participant',
  },
  {
    topBorder: 'border-t-4 border-t-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    avatarBg: 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(147,51,234,0.14)] hover:border-purple-300',
    tag: 'Verified Participant',
  },
  {
    topBorder: 'border-t-4 border-t-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(244,63,94,0.14)] hover:border-rose-300',
    tag: 'Verified Participant',
  },
  {
    topBorder: 'border-t-4 border-t-cyan-600',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    avatarBg: 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white',
    accentGlow: 'hover:shadow-[0_12px_30px_rgba(6,182,212,0.14)] hover:border-cyan-300',
    tag: 'Verified Participant',
  },
]

export default function HomePage() {
  const { t, lang } = useLang()
  const { marketStatus, nifty, bankNifty } = useMarket()
  const [modalOpen, setModalOpen]         = useState(false)
  const [activePlan, setActivePlan]       = useState(null)
  const [lightboxImg, setLightboxImg]     = useState(null)

  // Dynamic Plans from Database
  const [dbPlans, setDbPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    setLoadingPlans(true)
    api.plans.list()
      .then(res => {
        const apiPlans = res.data?.plans || []
        if (Array.isArray(apiPlans) && apiPlans.length > 0) {
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
          formatted.sort((a, b) => a.dealAmountINR - b.dealAmountINR)
          setDbPlans(formatted)
        } else {
          setDbPlans(TRADING_PLANS)
        }
      })
      .catch(() => setDbPlans(TRADING_PLANS))
      .finally(() => setLoadingPlans(false))
  }, [])

  const openModal = (plan) => { setActivePlan(plan); setModalOpen(true) }

  const plansList = dbPlans.length > 0 ? dbPlans : TRADING_PLANS

  return (
    <div className="bg-white">

      {/* ── 1. HERO SECTION WITH INSTITUTIONAL FINANCIAL CARD ──────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-[#e2e8f0] pt-6 pb-12 sm:pt-8 sm:pb-14 lg:pt-8 lg:pb-14">
        {/* Subtle luxury ambient glows */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-5">

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b1e3f] tracking-tight leading-[1.18]">
                {lang === 'hi' ? (
                  <>
                    निवेश, वित्तीय मार्गदर्शन <br />
                    <span className="bg-gradient-to-r from-[#0b1e3f] via-[#1d4ed8] to-[#2563eb] bg-clip-text text-transparent">
                      एवं बीमा समाधान
                    </span>
                  </>
                ) : (
                  <>
                    Investment, Financial Guidance <br />
                    <span className="bg-gradient-to-r from-[#0b1e3f] via-[#1d4ed8] to-[#2563eb] bg-clip-text text-transparent">
                      &amp; Insurance Solutions.
                    </span>
                  </>
                )}
              </h1>

              {/* Value Proposition Subtitle */}
              <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t('hero_sub')}
              </p>

              {/* Quick Service Highlights */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
                <Link to="/plans" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 border border-blue-200 text-[#1d4ed8] hover:bg-blue-100 transition-colors">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('hero_badge_plans')}</span>
                </Link>
                <Link to="/services" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 border border-amber-200 text-[#b45309] hover:bg-amber-100 transition-colors">
                  <Car className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('hero_badge_auto')}</span>
                </Link>
                <Link to="/services" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors">
                  <HeartPulse className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('hero_badge_health')}</span>
                </Link>
                <Link to="/services" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 transition-colors">
                  <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('hero_badge_vivah')}</span>
                </Link>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-3">
                <a
                  href="#plans"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] hover:from-[#92400e] hover:to-[#d97706] !text-white shadow-[0_4px_16px_rgba(180,83,9,0.35)] hover:shadow-[0_6px_22px_rgba(180,83,9,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-600 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4 shrink-0 !text-white" />
                  <span className="!text-white">{t('hero_cta_calc')}</span>
                </a>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm bg-white border-2 border-[#cbd5e1] hover:border-[#0b1e3f] text-[#0b1e3f] hover:bg-[#f8fafc] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <span>{t('hero_cta_services')}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1d4ed8]" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm bg-[#eff6ff] border-2 border-[#bfdbfe] hover:border-[#93c5fd] text-[#1d4ed8] hover:bg-[#dbeafe] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 shrink-0 text-[#1d4ed8]" />
                  <span>{t('hero_cta_contact')}</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Institutional Financial Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">

                {/* Main Card */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-5 sm:p-6 space-y-3.5 relative overflow-hidden">
                  {/* Top luxury corporate accent: Midnight + Sapphire + Champagne Gold */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0b1e3f] via-[#1d4ed8] to-[#d4af37]" />

                  {/* Header: Company Logo & Identity */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center shrink-0">
                        <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd." className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0b1e3f] leading-tight">Javitri Trading Service Pvt. Ltd.</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#1d4ed8]">Startup India (DIPP291171)</p>
                      </div>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} title={marketStatus.statusText} />
                  </div>

                  {/* Live Simulation Market Ticker Widget */}
                  <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-[#e2e8f0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-[#1d4ed8]" /> Benchmark Indices
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          marketStatus.isOpen
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-xs'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {marketStatus.statusText}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                      <div className="p-2.5 bg-white rounded-xl border border-[#e2e8f0]">
                        <p className="text-[10px] font-bold text-[#64748b]">NIFTY 50</p>
                        <p className="text-sm sm:text-base font-black text-[#0b1e3f] font-mono leading-tight">
                          {nifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[10px] font-bold mt-0.5 ${nifty.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {nifty.change >= 0 ? '+' : ''}{nifty.change.toFixed(2)} ({nifty.percent >= 0 ? '+' : ''}{nifty.percent.toFixed(2)}%)
                        </p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-[#e2e8f0]">
                        <p className="text-[10px] font-bold text-[#64748b]">BANK NIFTY</p>
                        <p className="text-sm sm:text-base font-black text-[#0b1e3f] font-mono leading-tight">
                          {bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[10px] font-bold mt-0.5 ${bankNifty.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {bankNifty.change >= 0 ? '+' : ''}{bankNifty.change.toFixed(2)} ({bankNifty.percent >= 0 ? '+' : ''}{bankNifty.percent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monday to Friday Trading Days Visual Badge */}
                  <div className="rounded-2xl p-3 bg-gradient-to-br from-blue-50/70 to-amber-50/30 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#0b1e3f]">Weekly Trading Cycle</span>
                      <span className="text-[11px] font-black text-[#1d4ed8]">5 Days / Week</span>
                    </div>
                    {/* Weekday boxes */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
                      {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
                        <div key={idx} className="py-2 rounded-xl bg-gradient-to-b from-[#1d4ed8] to-[#1e40af] text-white shadow-xs">
                          <span className="block text-[11px] font-black">{day}</span>
                          <span className="block text-[9px] font-normal opacity-90">Payout</span>
                        </div>
                      ))}
                      {['S', 'S'].map((day, idx) => (
                        <div key={idx} className="py-2 rounded-xl bg-[#e2e8f0] text-[#94a3b8]">
                          <span className="block text-[11px] font-bold">{day}</span>
                          <span className="block text-[9px] font-normal">Off</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#334155] text-center font-medium pt-1">
                      ✓ Daily payouts credited every Monday to Friday directly to verified bank account.
                    </p>
                  </div>

                  {/* Trust Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs text-[#64748b] border-t border-[#f1f5f9]">
                    <span className="flex items-center gap-1 font-bold text-[#0b1e3f]">
                      <ShieldCheck className="h-4 w-4 text-[#d97706]" /> MCA Verified
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#0b1e3f]">
                      <CheckCircle2 className="h-4 w-4 text-[#1d4ed8]" /> GST Compliant
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#0b1e3f]">
                      <Award className="h-4 w-4 text-[#d97706]" /> Startup India
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP & CREDENTIALS ────────────────────────────────── */}
      <section className="py-8 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-[#0f172a]">100%</p>
              <p className="text-xs font-bold text-[#475569] mt-1 uppercase tracking-wider">{lang === 'hi' ? 'वैधानिक पारदर्शिता' : 'Statutory Transparency'}</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-[#2563eb]">Mon–Fri</p>
              <p className="text-xs font-bold text-[#475569] mt-1 uppercase tracking-wider">{lang === 'hi' ? 'दैनिक पेआउट शेड्यूल' : 'Scheduled Daily Returns'}</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-[#0f172a]">22 Days</p>
              <p className="text-xs font-bold text-[#475569] mt-1 uppercase tracking-wider">{lang === 'hi' ? 'मासिक ट्रेडिंग दिवस' : 'Monthly Trading Sessions'}</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-[#2563eb]">24 Hours</p>
              <p className="text-xs font-bold text-[#475569] mt-1 uppercase tracking-wider">{lang === 'hi' ? 'त्वरित सपोर्ट रिस्पांस' : 'Support Response'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. AVAILABLE PLANS SHOWCASE (Dynamic Database Plans & Luxury Card Design) ── */}
      <section id="plans" className="py-20 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1e3f] tracking-tight mb-4">
              {t('plans_heading')}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              {t('plans_subheading')}
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
              <RefreshCw className="h-8 w-8 animate-spin text-[#1d4ed8] mb-3" />
              <p className="text-sm font-bold text-[#0b1e3f]">{t('plans_loading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {plansList.slice(0, 4).map((plan, i) => {
                const daily = Number(plan.proposedDailyINR || plan.associatedValueINR || 0)
                const monthlyEst = daily * 22
                const weeklyEst = daily * 5
                const featuresList = parseFeatures(plan.features)

                return (
                  <div
                    key={plan.slug || i}
                    onClick={() => openModal(plan)}
                    className="plan-card p-6 bg-white border border-[#e2e8f0] rounded-3xl flex flex-col justify-between cursor-pointer group hover:border-[#1d4ed8] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Top tri-color gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />

                    <div>
                      <div className="mb-3">
                        <span className="text-xs font-black text-[#1d4ed8]">
                          {plan.name}
                        </span>
                        <p className="text-2xl font-black text-[#0b1e3f] mt-1">{plan.deal}</p>
                        {plan.tagline && (
                          <p className="text-xs text-[#b45309] mt-0.5 font-bold">{plan.tagline}</p>
                        )}
                      </div>

                      {/* Return Box */}
                      <div className="my-4 p-4 bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 rounded-2xl border border-blue-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#475569] font-medium">{t('plans_daily_label')}</span>
                          <span className="font-black text-[#1d4ed8] text-sm">{formatINR(daily)} / {lang === 'hi' ? 'दिन' : 'day'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#475569] font-medium">{t('plans_weekly_label')}</span>
                          <span className="font-bold text-[#0b1e3f]">{formatINR(weeklyEst)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                          <span className="text-[#475569] font-medium">{t('plans_monthly_label')}</span>
                          <span className="font-black text-[#b45309]">{formatINR(monthlyEst)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f1f5f9]">
                      <span className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] !text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all flex items-center justify-center gap-2">
                        <span className="!text-white">{lang === 'hi' ? `${plan.name} चुनें` : `Register for ${plan.name}`}</span>
                        <ArrowRight className="h-3.5 w-3.5 !text-white" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/plans"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-[#0b1e3f] via-[#1d4ed8] to-[#2563eb] hover:from-[#08152c] hover:to-[#1e40af] !text-white shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span className="!text-white font-extrabold text-base">{t('plans_explore_all') || 'Explore All Investment Plans'}</span>
              <ArrowRight className="h-4 w-4 !text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. CORPORATE FACILITIES & INFRASTRUCTURE GALLERY ── */}
      <section className="py-20 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1e3f] tracking-tight mb-4">
              {t('gallery_heading')}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              {t('gallery_subheading')}
            </p>
          </div>

          {/* Photo Grid - Clean 3-image preview with Zoom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORPORATE_GALLERY.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImg(img)}
                className="group relative rounded-3xl overflow-hidden bg-white border border-[#e2e8f0] shadow-sm hover:border-[#1d4ed8] hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[16/10]"
              >
                <img
                  src={img.src}
                  alt="Corporate Facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Sleek Zoom Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="!text-white text-xs font-black flex items-center gap-1.5 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-md">
                    <ZoomIn className="h-4 w-4 text-blue-300 shrink-0" /> {t('gallery_zoom')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View All Facilities in About Us button */}
          <div className="text-center mt-10">
            <Link
              to="/about#gallery"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm bg-white border-2 border-[#cbd5e1] hover:border-[#1d4ed8] text-[#0b1e3f] hover:bg-[#f8fafc] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>{lang === 'hi' ? 'सभी तस्वीरें देखें (अबाउट पेज)' : 'View All Facilities Photos in About Us'}</span>
              <ArrowRight className="h-4 w-4 text-[#1d4ed8]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lightbox Modal (Clean Photo-Only View) ── */}
      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#e2e8f0] flex items-center justify-end bg-white">
              <button
                type="button"
                onClick={() => setLightboxImg(null)}
                className="h-9 w-9 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0b1e3f] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative bg-slate-950 flex items-center justify-center p-2">
              <img
                src={lightboxImg.src}
                alt="Corporate Facility"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 5. INSTITUTIONAL ETHOS / VALUES ── */}
      <section className="py-20 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1e3f] tracking-tight mb-4">
              {t('ethos_heading')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#1d4ed8] hover:shadow-lg transition-all">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50/40 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] mb-5 shadow-xs">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0b1e3f] mb-2">{t('pillar1_title')}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{t('pillar1_desc')}</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#1d4ed8] hover:shadow-lg transition-all">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50/40 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] mb-5 shadow-xs">
                <HeartPulse className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0b1e3f] mb-2">{t('pillar2_title')}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{t('pillar2_desc')}</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#1d4ed8] hover:shadow-lg transition-all">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50/40 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] mb-5 shadow-xs">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0b1e3f] mb-2">{t('pillar3_title')}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{t('pillar3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. REVIEWS & TESTIMONIALS (Kept in Original Text as Instructed) ── */}
      <section className="py-20 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1e3f] tracking-tight mb-4">
              {lang === 'hi' ? 'पंजीकृत प्रतिभागियों के अनुभव एवं समीक्षाएं' : 'Feedback from Registered Participants'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => {
              const theme = REVIEW_THEMES[i % REVIEW_THEMES.length]
              return (
                <div
                  key={i}
                  className={`p-7 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm ${theme.topBorder} ${theme.accentGlow} transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-full ${theme.avatarBg} font-black text-sm flex items-center justify-center shadow-xs shrink-0`}>
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0b1e3f]">{review.name}</p>
                          <p className="text-[11px] text-[#64748b] font-semibold">{review.location}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${theme.badge} shrink-0`}>
                        {theme.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                      ))}
                    </div>

                    <p className="text-sm text-[#334155] leading-relaxed italic">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#f1f5f9] text-[11px] text-[#64748b]">
                    <span className="font-semibold">{review.date}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> 100% Genuine
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 8. CALL TO ACTION BANNER ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-14 text-center bg-gradient-to-br from-slate-50 via-white to-amber-50/20 border-2 border-[#e2e8f0] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />

            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1e3f] mb-4 tracking-tight">
              {t('cta_title')}
            </h2>
            <p className="text-base text-[#475569] max-w-xl mx-auto mb-8 leading-relaxed">
              {t('cta_desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <button
                type="button"
                onClick={() => openModal(null)}
                className="btn-gold px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ClipboardList className="h-5 w-5 !text-white" />
                <span className="!text-white">{t('cta_register')}</span>
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm bg-white border-2 border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#eff6ff] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-[#1d4ed8]" />
                <span>{t('cta_whatsapp')}</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm bg-white border-2 border-[#cbd5e1] hover:border-[#1d4ed8] text-[#0b1e3f] hover:bg-[#f8fafc] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span>{t('cta_contact')}</span>
                <ArrowRight className="h-4 w-4 text-[#1d4ed8]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Enquiry Modal */}
      <PlanEnquiryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setActivePlan(null) }}
        initialPlan={activePlan}
      />
    </div>
  )
}
