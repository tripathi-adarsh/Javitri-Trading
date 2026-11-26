/**
 * Trading Calculations Module — Monday to Friday Trading Schedule
 * Company: Javitri Trading Service Pvt. Ltd.
 * 
 * Rules:
 * - Active Trading Days: Monday to Friday (5 sessions/week)
 * - Market Holidays: Saturday & Sunday (NSE/BSE standard non-trading days)
 * - Average Trading Sessions: 22 trading days per month (~66 per quarter / 264 per year)
 */

export const TRADING_DAYS_PER_WEEK = 5
export const TRADING_DAYS_PER_MONTH = 22

export const TRADING_PLANS = [
  {
    slug: 'plan-1',
    name: 'Plan 1',
    dealAmountINR: 10000,
    deal: '₹10,000',
    proposedDailyINR: 200,
    daily: '₹200',
    tagline: 'Entry Portfolio Guidance',
    category: 'Starter',
    features: [
      'Monday to Friday daily educational payout',
      'Daily morning market sentiment briefs',
      'Direct Demat account opening assistance',
      'Dedicated compliance documentation',
    ],
  },
  {
    slug: 'plan-2',
    name: 'Plan 2',
    dealAmountINR: 30000,
    deal: '₹30,000',
    proposedDailyINR: 700,
    daily: '₹700',
    tagline: 'Foundational Market Participant',
    category: 'Basic',
    features: [
      'Monday to Friday daily payout (₹700/day)',
      'Equity swing trading technical reports',
      'Weekly risk management mentorship',
      'Prompt WhatsApp & phone desk support',
    ],
  },
  {
    slug: 'plan-3',
    name: 'Plan 3',
    dealAmountINR: 50000,
    deal: '₹50,000',
    proposedDailyINR: 1200,
    daily: '₹1,200',
    tagline: 'Active Retail Portfolio',
    category: 'Growth',
    features: [
      'Monday to Friday daily payout (₹1,200/day)',
      'Sector rotation & index tracking guides',
      'Bi-weekly portfolio review calls',
      'Full legal stamp agreement copy',
    ],
  },
  {
    slug: 'plan-4',
    name: 'Plan 4',
    dealAmountINR: 100000,
    deal: '₹1,00,000',
    proposedDailyINR: 2500,
    daily: '₹2,500',
    tagline: 'Most Popular Institutional Tier',
    category: 'Popular',
    features: [
      'Monday to Friday daily payout (₹2,500/day)',
      'Derivatives & F&O hedging frameworks',
      'Personal account manager allocation',
      'Priority settlement reconciliation',
    ],
  },
  {
    slug: 'plan-5',
    name: 'Plan 5',
    dealAmountINR: 300000,
    deal: '₹3,00,000',
    proposedDailyINR: 8000,
    daily: '₹8,000',
    tagline: 'High-Net-Worth Advisory Tier',
    category: 'Advanced',
    features: [
      'Monday to Friday daily payout (₹8,000/day)',
      'Advanced options writing & theta strategies',
      'Monthly performance audit statements',
      'Direct senior advisor consulting line',
    ],
  },
  {
    slug: 'plan-6',
    name: 'Plan 6',
    dealAmountINR: 500000,
    deal: '₹5,00,000',
    proposedDailyINR: 13500,
    daily: '₹13,500',
    tagline: 'Institutional Scale Participant',
    category: 'Institutional',
    features: [
      'Monday to Friday daily payout (₹13,500/day)',
      'Multi-asset algorithmic research feed',
      'Customized risk-budgeting mandates',
      'Quarterly executive leadership review',
    ],
  },
  {
    slug: 'plan-7',
    name: 'Plan 7',
    dealAmountINR: 1000000,
    deal: '₹10,00,000',
    proposedDailyINR: 30000,
    daily: '₹30,000',
    tagline: 'Corporate Treasury Allocation',
    category: 'Elite',
    features: [
      'Monday to Friday daily payout (₹30,000/day)',
      'Corporate treasury cash-flow optimization',
      'Direct line to Managing Director',
      'Comprehensive institutional GST invoicing',
    ],
  },
  {
    slug: 'plan-8',
    name: 'Plan 8',
    dealAmountINR: 1500000,
    deal: '₹15,00,000',
    proposedDailyINR: 40000,
    daily: '₹40,000',
    tagline: 'Strategic Wealth Allocation',
    category: 'Corporate',
    features: [
      'Monday to Friday daily payout (₹40,000/day)',
      'Custom quantitative trading parameters',
      'Priority settlement audit trail',
      'Bespoke legal contract covenants',
    ],
  },
  {
    slug: 'plan-9',
    name: 'Plan 9',
    dealAmountINR: 2000000,
    deal: '₹20,00,000',
    proposedDailyINR: 55000,
    daily: '₹55,000',
    tagline: 'Enterprise Capital Mandate',
    category: 'Enterprise',
    features: [
      'Monday to Friday daily payout (₹55,000/day)',
      'Full institutional research desk access',
      'Direct access to senior trading desk',
      'Concierge onboarding & document dispatch',
    ],
  },
  {
    slug: 'plan-10',
    name: 'Plan 10',
    dealAmountINR: 5000000,
    deal: '₹50,00,000',
    proposedDailyINR: 130000,
    daily: '₹1,30,000',
    tagline: 'Premier Sovereign-Grade Portfolio',
    category: 'Sovereign',
    features: [
      'Monday to Friday daily payout (₹1,30,000/day)',
      'Complete VIP wealth guidance suite',
      'Board-level reporting and audit access',
      'Exclusive bespoke advisory structure',
    ],
  },
]

export const TENURE_OPTIONS = [
  { value: 1,  label: '1 Month',           tradingDays: 22,  months: 1,  desc: '22 Trading Days (Mon–Fri)' },
  { value: 2,  label: '2 Months',          tradingDays: 44,  months: 2,  desc: '44 Trading Days (Mon–Fri)' },
  { value: 3,  label: '3 Months (Quarter)',tradingDays: 66,  months: 3,  desc: '66 Trading Days (Mon–Fri)' },
  { value: 6,  label: '6 Months',          tradingDays: 132, months: 6,  desc: '132 Trading Days (Mon–Fri)' },
  { value: 12, label: '1 Year (Annual)',   tradingDays: 264, months: 12, desc: '264 Trading Days (Mon–Fri)' },
]

export function parseFeatures(features) {
  let list = []
  if (Array.isArray(features)) list = features
  else if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features)
      if (Array.isArray(parsed)) list = parsed
      else list = [features]
    } catch {
      list = [features]
    }
  }

  // Filter out 'As per approved terms' and 'Deal Amount: ...' as explicitly requested
  const filtered = list.filter(f => {
    if (!f || typeof f !== 'string') return false
    const lower = f.toLowerCase()
    if (lower.includes('approved terms')) return false
    if (lower.includes('deal amount')) return false
    return true
  })

  if (filtered.length > 0) return filtered

  return [
    'Monday to Friday daily payout cycle',
    'Comprehensive market insights & guidance',
    'Dedicated formal legal documentation'
  ]
}

export function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0'
  return '₹' + Math.round(val).toLocaleString('en-IN')
}

/**
 * Calculate returns based exclusively on Monday to Friday trading sessions.
 */
export function calculateTradingProjections(dealAmountINR, proposedDailyINR, months = 3) {
  const tenure = TENURE_OPTIONS.find(t => t.months === months) || TENURE_OPTIONS[2]
  const tradingDays = tenure.tradingDays

  const principal = Number(dealAmountINR) || 0
  const dailyPayout = Number(proposedDailyINR) || 0
  const weeklyPayout = dailyPayout * TRADING_DAYS_PER_WEEK // 5 days (Mon–Fri)
  const monthlyPayout = dailyPayout * TRADING_DAYS_PER_MONTH // 22 days (Mon–Fri)
  const totalPeriodPayout = dailyPayout * tradingDays

  const netGain = totalPeriodPayout
  const monthlyRoi = principal > 0 ? ((monthlyPayout / principal) * 100).toFixed(1) : '0.0'
  const totalRoi = principal > 0 ? ((totalPeriodPayout / principal) * 100).toFixed(1) : '0.0'

  return {
    principal,
    principalFormatted: formatINR(principal),
    dailyPayout,
    dailyPayoutFormatted: formatINR(dailyPayout),
    weeklyPayout,
    weeklyPayoutFormatted: formatINR(weeklyPayout),
    monthlyPayout,
    monthlyPayoutFormatted: formatINR(monthlyPayout),
    totalPeriodPayout,
    totalPeriodPayoutFormatted: formatINR(totalPeriodPayout),
    netGain,
    netGainFormatted: formatINR(netGain),
    tradingDays,
    tenureLabel: tenure.label,
    tenureDesc: tenure.desc,
    monthlyRoi,
    totalRoi,
  }
}
