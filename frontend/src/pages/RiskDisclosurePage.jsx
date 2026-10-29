import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert, AlertTriangle, TrendingDown, Info,
  BookOpen, Scale, ArrowRight, CheckCircle2
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const DISCLOSURES = [
  {
    icon: TrendingDown,
    title: 'Stock Market Investments Involve Financial Risk',
    content: `Investing in or trading the stock market involves the risk of financial loss. The value of investments can go up or down, and investors may receive back less than they invested. There is no guarantee that any investment strategy will produce a profit.`,
    level: 'high',
  },
  {
    icon: AlertTriangle,
    title: 'Returns Are Not Guaranteed',
    content: `No plan, investment, or trading activity can guarantee returns. Any figures described as "proposed", "illustrative", or "associated value" on this website are not promises, guarantees, or representations of income or profit. Actual outcomes may vary significantly or result in a loss.`,
    level: 'high',
  },
  {
    icon: ShieldAlert,
    title: 'Options, Forex, and Commodity Trading Carry Substantial Risk',
    content: `Derivatives such as options, futures, and contracts in currency or commodity markets involve a high degree of risk. These instruments use leverage, which can amplify losses beyond the initial amount invested. These products are not suitable for all investors and may result in the loss of your entire capital.`,
    level: 'high',
  },
  {
    icon: Info,
    title: 'Past Performance Does Not Guarantee Future Results',
    content: `Any historical performance data, charts, example trades, or educational content showing past market behaviour is provided for educational purposes only. Past performance of any market, asset, or strategy is not an indicator or guarantee of future performance.`,
    level: 'medium',
  },
  {
    icon: CheckCircle2,
    title: 'Understand Terms and Risks Before Investing',
    content: `Before participating in any investment plan, scheme, or trading activity, users must carefully read and understand all applicable product terms, conditions, and risk disclosures. Do not invest money you cannot afford to lose. Seek independent professional financial advice if you are unsure about any decision.`,
    level: 'medium',
  },
  {
    icon: BookOpen,
    title: 'Educational Content Is Not a Guarantee of Profit',
    content: `Learning about the stock market, completing educational modules, following market analysis, or receiving trading tips does not guarantee that you will earn money from trading. Markets are complex and unpredictable. Education is a foundation, not a path to guaranteed success.`,
    level: 'medium',
  },
  {
    icon: Scale,
    title: 'Regulatory Registrations Must Be Verified',
    content: `Javitri Trading Service Pvt. Ltd. provides educational and advisory services. Regulated activities such as investment advisory, portfolio management, broking, or handling client funds require specific licences and registrations from SEBI or other applicable Indian regulatory bodies. Users are advised to verify any regulatory authorisations directly with the relevant authority (SEBI, RBI, IRDAI, etc.) before relying on any service that may require such authorisation.`,
    level: 'medium',
  },
]

const levelStyle = {
  high:   { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.25)',  iconColor: '#f87171', label: 'High Risk' },
  medium: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', iconColor: '#fbbf24', label: 'Important' },
}

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <ShieldAlert className="h-3.5 w-3.5" />
          Risk Disclosure
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: '#fff' }}>
          Risk <span style={{ color: '#f87171' }}>Disclosure</span> Statement
        </h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: '#b0c8dc' }}>
          Please read this Risk Disclosure Statement carefully before using any service, viewing any
          investment plan, or making any financial decision based on information provided by Javitri Trading Service Pvt. Ltd.
        </p>
      </section>

      {/* Disclosure points */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="space-y-4">
          {DISCLOSURES.map(({ icon: Icon, title, content, level }) => {
            const s = levelStyle[level]
            return (
              <div key={title}
                className="rounded-2xl p-5 sm:p-6 transition-all duration-200"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" style={{ color: s.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold" style={{ color: '#fff' }}>{title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.2)', color: s.iconColor }}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#b0c8dc' }}>{content}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="gold-line" />

      {/* General Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(15,36,96,0.35)', border: '1px solid rgba(15,36,96,0.65)' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#d4a843' }}>General Disclaimer</h2>
          <div className="space-y-3 text-xs leading-relaxed" style={{ color: '#9ab0c4' }}>
            <p>
              Javitri Trading Service Pvt. Ltd. is a trading education and guidance business. The content provided
              on this website — including investment plan descriptions, educational material, market analysis,
              and trading tips — is for informational and educational purposes only.
            </p>
            <p>
              Nothing on this website constitutes a regulated financial product, investment scheme, portfolio
              management service, or licensed investment advice unless explicitly stated and verified by the
              appropriate regulatory authority.
            </p>
            <p>
              All users are solely responsible for their own investment and trading decisions.
              Javitri Trading Service Pvt. Ltd. shall not be liable for any losses arising from trading decisions
              made based on content, tips, or information provided on this platform.
            </p>
            <p>
              This Risk Disclosure is subject to update. Users are advised to check this page periodically.
              Continued use of this website constitutes acceptance of these disclosures.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 text-center">
        <p className="text-sm mb-6" style={{ color: '#9ab0c4' }}>
          Have questions about our services or risk disclosures? Contact us directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact">
            <Button size="lg"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Contact Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/plans">
            <Button size="lg" variant="secondary">
              View Investment Plans
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
