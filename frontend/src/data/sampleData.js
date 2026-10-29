/**
 * UI constants for the payment page.
 * These define available payment method options and bank list shown in the checkout UI.
 */

// ─── Payment Methods (used in PaymentPage.jsx) ───────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI',                  icon: '₹',  description: 'Pay via any UPI app' },
  { id: 'card',       label: 'Debit / Credit Card',  icon: '💳', description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking',           icon: '🏦', description: 'All major banks supported' },
  { id: 'wallet',     label: 'Wallet',               icon: '👛', description: 'Paytm, PhonePe, Amazon Pay' },
]

export const BANK_OPTIONS = [
  { value: 'sbi',   label: 'State Bank of India' },
  { value: 'hdfc',  label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'axis',  label: 'Axis Bank' },
  { value: 'kotak', label: 'Kotak Mahindra Bank' },
  { value: 'pnb',   label: 'Punjab National Bank' },
  { value: 'bob',   label: 'Bank of Baroda' },
  { value: 'yes',   label: 'Yes Bank' },
]

/**
 * LEGACY / REFERENCE DATA — not imported anywhere in the live app.
 * Plans and deal data are fetched from the API at runtime.
 * Kept only as a reference for data structure.
 */

// ─── Sample Trading Plans (reference only) ───────────────────────────────────
export const TRADING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for beginners',
    price: 999,
    currency: 'INR',
    billingCycle: 'monthly',
    badge: null,
    color: 'teal',
    features: [
      'Access to Equity & F&O Markets',
      'Up to ₹2 Lakh trading limit',
      'Basic market analytics dashboard',
      'Email & chat support',
      '5 alerts per day',
      'Basic portfolio tracker',
    ],
    notIncluded: [
      'Derivatives & Commodity trading',
      'Advanced AI signals',
      'Dedicated relationship manager',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Trader',
    tagline: 'Most popular choice',
    price: 2499,
    currency: 'INR',
    billingCycle: 'monthly',
    badge: 'Most Popular',
    color: 'emerald',
    features: [
      'All Starter features',
      'Up to ₹10 Lakh trading limit',
      'Equity, F&O, Commodity & Currency',
      'Advanced charting tools (50+ indicators)',
      'AI-powered trade signals (15/day)',
      'Priority phone & chat support',
      'Real-time market news feed',
      'Risk management tools',
    ],
    notIncluded: [
      'Dedicated relationship manager',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'For professional traders',
    price: 5999,
    currency: 'INR',
    billingCycle: 'monthly',
    badge: 'Best Value',
    color: 'violet',
    features: [
      'All Pro Trader features',
      'Unlimited trading limit',
      'All asset classes incl. IPO & Bonds',
      'Unlimited AI trade signals',
      'Dedicated relationship manager',
      'Custom API access',
      'Advanced portfolio analytics',
      'Tax P&L reports',
      'Early access to new features',
    ],
    notIncluded: [],
  },
]
