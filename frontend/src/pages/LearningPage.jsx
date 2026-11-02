import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Shield, Brain, BookOpen, Monitor,
  TrendingUp, BarChart2, Users, ArrowRight, MessageSquare,
  AlertCircle, CheckCircle2, Lightbulb
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'
const TG = ({ cls='h-4 w-4' }) => <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

const LEARNING_MODULES = [
  {
    icon: Users,
    title: 'Mentoring & Guidance for Beginners',
    desc: 'One-on-one and group mentoring sessions for individuals who are new to the stock market. Our mentors help you build a strong foundation and understand where to begin.',
    color: '#d4a843',
    bg: 'rgba(212,168,67,0.1)',
    border: 'rgba(212,168,67,0.25)',
  },
  {
    icon: BookOpen,
    title: 'Beginner Support',
    desc: 'Step-by-step educational support covering the basics — what a stock is, how exchanges work, how to read stock prices, and what happens when you buy or sell.',
    color: '#4ade80',
    bg: 'rgba(26,102,69,0.15)',
    border: 'rgba(26,102,69,0.35)',
  },
  {
    icon: Shield,
    title: 'Risk Management Education',
    desc: 'Learn how experienced traders manage risk through position sizing, stop-loss strategies, diversification principles, and protecting capital — all from an educational perspective.',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    icon: Brain,
    title: 'Trading Psychology',
    desc: 'Understand the mental and emotional side of trading — fear, greed, overconfidence, and discipline. Learn why trading psychology is just as important as technical skills.',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
  },
  {
    icon: GraduationCap,
    title: 'Demat Account Assistance',
    desc: 'Practical guidance on opening and operating a Demat account, understanding your account statement, and navigating your broker\'s platform with confidence.',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    icon: Monitor,
    title: 'Live Market Learning Support',
    desc: 'Learn by observing real market conditions with guided explanations. Understand how to read live price movements, interpret order books, and follow market sessions.',
    color: '#f472b6',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
  },
  {
    icon: TrendingUp,
    title: 'Trading Basics & Market Terminology',
    desc: 'A comprehensive glossary-style learning module covering all essential market terms — NIFTY, SENSEX, IPO, NSE, BSE, derivatives, lot size, circuit breaker, and much more.',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.25)',
  },
  {
    icon: BarChart2,
    title: 'Educational Market Analysis',
    desc: 'Learn how to analyse markets using technical and fundamental analysis tools. Covers chart patterns, moving averages, RSI, MACD, support/resistance levels, and earnings reports.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.25)',
  },
]

const HIGHLIGHTS = [
  'No prior experience required to begin',
  'Learn at your own pace with mentor support',
  'Focused on market understanding, not speculation',
  'Covers equity, options, commodity, and forex basics',
  'Risk awareness is built into every module',
]

export default function LearningPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(26,102,69,0.15)', border: '1px solid rgba(26,102,69,0.3)', color: '#4ade80' }}>
          <GraduationCap className="h-3.5 w-3.5" />
          Learning & Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: '#fff' }}>
          Start Your <span className="gradient-text-green">Learning Journey</span>
        </h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: '#b0c8dc' }}>
          Whether you are completely new to the stock market or looking to strengthen your foundation,
          Javitri Trading Service Pvt. Ltd. provides structured educational support to help you understand
          markets, manage risk, and build trading knowledge.
        </p>
      </section>

      {/* Important disclaimer */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="flex gap-3 rounded-xl p-4 text-xs"
          style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.2)', color: '#d4a94a' }}>
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
          <span>
            <strong>Educational Notice:</strong> All content provided under Learning Support is for educational
            purposes only. Completing any learning module or following educational market insights does <strong>not</strong> guarantee
            profits or positive trading outcomes. Markets involve risk and past learning or performance does not
            guarantee future results. Always understand the risks before trading with real money.
          </span>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(15,36,96,0.6) 0%, rgba(8,15,32,0.75) 100%)',
            border: '1px solid rgba(26,102,69,0.3)',
          }}>
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-5 w-5" style={{ color: '#4ade80' }} />
            <h2 className="text-base font-semibold" style={{ color: '#fff' }}>Why Learn with Us?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                <span className="text-sm" style={{ color: '#b0c8dc' }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* Learning Modules */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#fff' }}>
            Learning <span className="gradient-text-green">Modules</span>
          </h2>
          <p className="text-sm mt-2" style={{ color: '#9ab0c4' }}>
            Eight structured areas of learning to guide your stock market education.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {LEARNING_MODULES.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title}
              className="flex gap-4 rounded-2xl p-5 transition-all duration-200"
              style={{
                background: 'rgba(15,36,96,0.35)',
                border: '1px solid rgba(15,36,96,0.65)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(15,36,96,0.65)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#fff' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#9ab0c4' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1f57 0%, #112369 50%, #0d1f57 100%)',
            border: '1px solid rgba(26,102,69,0.35)',
          }}>
          <div className="absolute inset-x-0 top-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
          <GraduationCap className="h-12 w-12 mx-auto mb-4" style={{ color: '#4ade80', opacity: 0.7 }} />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#fff' }}>
            Start <span className="gradient-text-green">Learning Today</span>
          </h2>
          <p className="text-sm mb-7 max-w-md mx-auto" style={{ color: '#b0c8dc' }}>
            Contact us to enrol in our learning programmes or to get more information about
            how we can support your stock market education.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact">
              <Button size="lg"
                style={{ background: 'rgba(26,102,69,0.3)', border: '1px solid rgba(26,102,69,0.5)', color: '#4ade80' }}>
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
          <div className="absolute inset-x-0 bottom-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
        </div>
      </section>
    </div>
  )
}
