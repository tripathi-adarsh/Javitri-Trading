import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Shield, Brain, BookOpen, Monitor,
  TrendingUp, BarChart2, Users, ArrowRight, MessageSquare,
  AlertCircle, CheckCircle2, Lightbulb
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'

const LEARNING_MODULES = [
  {
    icon: Users,
    title: 'Mentoring & Guidance for Beginners',
    desc: 'Structured one-on-one and cohort sessions for newcomers. Build conceptual clarity and learn how institutional investors navigate modern exchange mechanisms.',
    badge: 'Beginner',
  },
  {
    icon: BookOpen,
    title: 'Market Structure & Order Types',
    desc: 'Essential foundations: order books, market vs. limit orders, stop-loss trigger mechanics, margin requirements, settlement cycles (T+1), and clearing corporations.',
    badge: 'Foundations',
  },
  {
    icon: Shield,
    title: 'Capital Preservation & Risk Management',
    desc: 'The bedrock of professional trading: portfolio position sizing, max-drawdown rules, value-at-risk concepts, stop-loss discipline, and defensive capital buffers.',
    badge: 'Core Risk',
  },
  {
    icon: Brain,
    title: 'Trading Psychology & Discipline',
    desc: 'Navigating behavioral biases: fear of missing out (FOMO), revenge trading, confirmation bias, and establishing an emotion-free execution routine.',
    badge: 'Psychology',
  },
  {
    icon: GraduationCap,
    title: 'Demat & Broker Platform Mastery',
    desc: 'Practical walkthroughs on utilizing charting software, placing advanced conditional bracket orders, analyzing contract notes, and tracking holdings.',
    badge: 'Practical',
  },
  {
    icon: Monitor,
    title: 'Live Market Observation Sessions',
    desc: 'Interactive guided market hours analysis. Observe opening momentum, price action around support/resistance pivots, and macroeconomic reaction in real-time.',
    badge: 'Live Analysis',
  },
  {
    icon: TrendingUp,
    title: 'Derivatives & Hedging Strategies',
    desc: 'Advanced conceptual education on equity index options, call/put parity, implied volatility (IV), Greeks (Delta, Theta, Gamma), and protective collars.',
    badge: 'Advanced',
  },
  {
    icon: BarChart2,
    title: 'Technical & Statistical Charting',
    desc: 'In-depth pattern recognition: trendlines, multi-timeframe moving average crossovers, RSI divergences, volume profiles, and candlestick reversal setups.',
    badge: 'Technical',
  },
]

const HIGHLIGHTS = [
  'Zero prior market experience required to start',
  'Self-paced learning with direct mentor feedback',
  'Strict focus on risk management over speculation',
  'Comprehensive coverage of equity, derivatives, and commodities',
  'Practical case studies using live Indian exchange data',
]

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] uppercase tracking-wider mb-4 shadow-xs">
            <GraduationCap className="h-4 w-4" /> Structured Curriculum
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Stock Market Learning Academy
          </h1>
          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Gain the technical competence, analytical discipline, and risk-management principles required to navigate the Indian financial markets with confidence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Notice */}
        <div className="mb-12 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
          <p>
            <strong>Educational Notice:</strong> All programs, tutorials, and chart breakdowns provided by Javitri Trading Service Pvt. Ltd. are strictly intended for educational and literacy purposes. Completing modules does not guarantee trading profits. Capital is subject to market risks.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {LEARNING_MODULES.map(({ icon: Icon, title, desc, badge }) => (
            <div
              key={title}
              className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#2563eb] hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563eb] group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f8fafc] text-[#334155] border border-[#e2e8f0]">
                    {badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0f172a] mb-2 group-hover:text-[#2563eb] transition-colors">{title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Features Strip */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#f8fafc] border border-[#e2e8f0] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Why Learn With Us</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-2 mb-4">
                Practical, Mentor-Guided Education
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Avoid the common pitfalls of novice traders. We emphasize systematic rules, verified market mechanics, and real-world trade simulations.
              </p>
              <div className="space-y-2.5">
                {HIGHLIGHTS.map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-[#1e293b] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#2563eb] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#cbd5e1] space-y-4 shadow-sm">
              <h3 className="text-base font-extrabold text-[#0f172a]">Enquire for Next Learning Batch</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                New interactive mentorship cohorts begin every Monday. Register your interest to receive syllabus and session timings.
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <Link to="/contact">
                  <Button size="md" variant="primary" className="w-full">
                    Enroll for Learning Program <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="md" variant="secondary" className="w-full text-[#2563eb] border-[#bfdbfe] hover:bg-[#eff6ff]">
                    <MessageSquare className="h-4 w-4 text-[#2563eb]" /> WhatsApp Enquiry
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  )
}
