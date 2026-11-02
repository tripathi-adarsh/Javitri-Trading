import React from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, BookOpen, BarChart2, MessageSquare, Users,
  Briefcase, Globe, Layers, Bell, PieChart, ArrowRight,
  AlertCircle, CheckCircle2
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'
const TG = ({ cls='h-4 w-4' }) => <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

const SERVICES = [
  {
    icon: Briefcase,
    title: 'Demat Account Opening Assistance',
    desc: 'Guidance through the process of opening a Demat account with a registered broker. We help you understand the documentation required and walk you through every step.',
    tag: 'Assistance',
  },
  {
    icon: Users,
    title: 'Advisor Support',
    desc: 'Access to market educators and support staff who can help you understand concepts, answer questions, and guide your learning journey in the stock market.',
    tag: 'Support',
  },
  {
    icon: CheckCircle2,
    title: 'Account Handling Guidance',
    desc: 'Educational support on how to manage your trading account, understand statements, and navigate your broker platform effectively.',
    tag: 'Guidance',
  },
  {
    icon: BookOpen,
    title: 'Stock Market Learning',
    desc: 'Comprehensive beginner-to-intermediate learning on how the stock market works — including market structure, indices, order types, and trading basics.',
    tag: 'Education',
  },
  {
    icon: Layers,
    title: 'Options Trading Education',
    desc: 'Structured learning modules on options contracts, key terminology (calls, puts, strike price, expiry), basic strategies, and risk awareness for options trading.',
    tag: 'Education',
  },
  {
    icon: TrendingUp,
    title: 'Equity Market Education',
    desc: 'Understanding how to read equity markets, analyse company fundamentals, interpret financial statements, and make informed decisions as a learning investor.',
    tag: 'Education',
  },
  {
    icon: BarChart2,
    title: 'Commodity Market Education',
    desc: 'Introduction to commodity trading including metals, energy, and agricultural products. Learn how commodity markets work, pricing factors, and associated risks.',
    tag: 'Education',
  },
  {
    icon: Globe,
    title: 'Forex Market Education',
    desc: 'Educational content on the foreign exchange market, currency pairs, how forex trading works, and the significant risks involved in forex and currency derivatives.',
    tag: 'Education',
  },
  {
    icon: PieChart,
    title: 'Stock Market Analysis',
    desc: 'Learn how to read charts, apply technical analysis tools, understand candlestick patterns, and develop analytical thinking for evaluating market movements.',
    tag: 'Analysis',
  },
  {
    icon: Bell,
    title: 'Daily Trading Insights and Tips',
    desc: 'Educational daily insights to help learners stay informed about market trends, news, and relevant developments — provided for learning purposes only.',
    tag: 'Insights',
  },
]

const tagColors = {
  Assistance: { bg: 'rgba(212,168,67,0.12)', color: '#d4a843', border: 'rgba(212,168,67,0.3)' },
  Support:    { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Guidance:   { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  Education:  { bg: 'rgba(26,102,69,0.15)',  color: '#4ade80', border: 'rgba(26,102,69,0.4)' },
  Analysis:   { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Insights:   { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#d4a843' }}>
          <Briefcase className="h-3.5 w-3.5" />
          What We Offer
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: '#fff' }}>
          Our <span className="gradient-text">Services</span>
        </h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: '#b0c8dc' }}>
          Javitri Trading Service Pvt. Ltd. provides stock market education, trading guidance, and learning support.
          Our services are focused on helping beginners and learners understand the market.
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(({ icon: Icon, title, desc, tag }) => {
            const tc = tagColors[tag] || tagColors.Education
            return (
              <div key={title}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,36,96,0.55) 0%, rgba(8,15,32,0.7) 100%)',
                  border: '1px solid rgba(212,168,67,0.15)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.15)'}
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#d4a843' }} />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#fff' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#9ab0c4' }}>{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#fff' }}>
          Ready to <span className="gradient-text">Get Started?</span>
        </h2>
        <p className="text-sm mb-7 max-w-md mx-auto" style={{ color: '#b0c8dc' }}>
          Reach out to us to learn more about our educational services or to begin your stock market learning journey.
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
