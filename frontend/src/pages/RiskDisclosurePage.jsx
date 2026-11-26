import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert, AlertTriangle, TrendingDown, Info,
  BookOpen, Scale, ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const DISCLOSURES = [
  {
    icon: TrendingDown,
    title: 'Stock Market Investments Involve Financial Risk',
    content: `Investing in or trading securities in the Indian stock market involves substantial financial risk. The market valuation of holdings fluctuates constantly, and participants may experience a partial or total loss of principal invested. No strategy guarantees immunity from systemic market drawdowns.`,
    level: 'high',
  },
  {
    icon: AlertTriangle,
    title: 'Illustrative Figures Are Not Guaranteed Returns',
    content: `All figures described as "proposed daily figures", "illustrative estimations", or "associated plan values" on this website represent mathematical examples for educational context only. They are not legal promises, guaranteed yields, or assured income. Actual trading results depend on real-world execution, market liquidity, and binding bilateral agreements.`,
    level: 'high',
  },
  {
    icon: ShieldAlert,
    title: 'Derivatives & Leverage Involve Substantial Volatility',
    content: `Exchange-traded derivatives including equity stock options, index futures, and commodities utilize leverage, which multiplies potential exposure. Losses can mount rapidly. Derivative trading is suitable only for experienced participants with adequate risk capital.`,
    level: 'high',
  },
  {
    icon: Info,
    title: 'Past Performance Does Not Predict Future Outcomes',
    content: `Any historical trade logs, backtest case studies, or chart examples presented during educational seminars demonstrate past technical behavior. Past price movements do not establish, project, or guarantee future market trends or returns.`,
    level: 'medium',
  },
  {
    icon: CheckCircle2,
    title: 'Thorough Due Diligence Required Prior to Commitment',
    content: `Before participating in any plan or executing any financial transaction, clients must thoroughly read and agree to all contractual terms, fee structures, and withdrawal conditions. Do not allocate capital that you cannot afford to risk. Seek certified independent financial counsel where appropriate.`,
    level: 'medium',
  },
  {
    icon: BookOpen,
    title: 'Education Does Not Eliminate Inherent Market Uncertainty',
    content: `Completing training modules, mastering technical chart indicators, or participating in mentor briefings provides knowledge and discipline; it does not eliminate the inherent volatility of financial markets.`,
    level: 'medium',
  },
  {
    icon: Scale,
    title: 'Regulatory Verification & Advisory Standards',
    content: `Javitri Trading Service Pvt. Ltd. operates as a corporate financial education and business guidance company. Specialized activities (such as SEBI-registered portfolio management or depository brokerage) require separate statutory licenses. Clients are encouraged to verify regulatory mandates directly with SEBI or relevant regulatory bodies.`,
    level: 'medium',
  },
]

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-red-700 uppercase tracking-wider mb-4">
            <ShieldAlert className="h-4 w-4" /> Statutory Compliance
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Risk Disclosure Statement
          </h1>
          <p className="text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Please review this mandatory Risk Disclosure Statement carefully before exploring any investment plan, utilizing educational materials, or entering into agreements with Javitri Trading Service Pvt. Ltd.
          </p>
        </div>
      </section>

      {/* Main Disclosure Cards */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {DISCLOSURES.map(({ icon: Icon, title, content, level }) => {
          const isHigh = level === 'high'
          return (
            <div
              key={title}
              className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                isHigh
                  ? 'bg-red-50/40 border-red-200'
                  : 'bg-white border-[#e2e8f0] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isHigh ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-[#059669]'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">{title}</h2>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]'
                    }`}>
                      {isHigh ? 'High Risk Factor' : 'Important Notice'}
                    </span>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed pt-1">
                    {content}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Bottom Actions */}
        <div className="pt-8 text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/terms">
            <Button size="lg" variant="secondary">
              Review Terms &amp; Conditions <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/plans">
            <Button size="lg" variant="primary">
              View Available Plans <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
