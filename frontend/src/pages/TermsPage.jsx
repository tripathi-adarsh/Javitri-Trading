import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, Calendar, ArrowLeft, ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const COMPANY = {
  name:    'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  cin:     'U66190GJ2026PTC183862',
  address: 'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
  email:   'info@javitritrading.com',
  phone:   '+91 9022487800',
}

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `These Terms & Conditions govern the use of the website and the information provided by JAVITRI TRADING SERVICE PRIVATE LIMITED ("Company", "we", "our" or "us").

Registered Office: ${COMPANY.address}

By accessing this website, users agree to comply with these terms and all applicable laws of India. If you do not agree with any part of these terms, please discontinue use of this website immediately.

The Company's focus is on stock market education, investment guidance, trading learning support, and advisory services to help individuals understand financial markets and make informed decisions.`,
  },
  {
    id: 'plan-information',
    title: '2. Plan Information',
    content: `Details of any plan — including the amount payable, applicable charges, duration, payout calculation, eligibility requirements, and settlement procedure — must be provided in a written agreement before a customer makes any payment.

No plan should be offered or accepted unless the Company has verified that it is legally permitted to offer that product or service under applicable Indian laws and regulations.

All figures described as "proposed", "illustrative", or "associated value" on this website are provided for informational purposes only and do not constitute a guarantee, promise, or assured return of any kind. Customers must obtain and review the full written plan terms before committing to any plan.`,
  },
  {
    id: 'plan-duration',
    title: '3. Plan Duration',
    content: `Where legally authorised and agreed in writing, a plan may have a specified validity period of 90 days.

The commencement date, maturity date, and applicable settlement conditions must be clearly stated in the customer's signed agreement before any payment is made.

The 90-day period refers to active trading days (Monday to Friday), excluding weekends, public holidays, and any other non-trading days as specified in the written agreement. The total calendar duration may therefore differ from 90 calendar days.`,
  },
  {
    id: 'payout-schedule',
    title: '4. Payout Schedule',
    content: `Any applicable payout schedule — including the proposed Monday-to-Friday schedule and Saturday-Sunday non-payout days — must be clearly documented in the applicable written agreement.

The agreement must specify:
• How payouts are calculated
• The payment dates
• Applicable holidays and processing delays
• The treatment of unpaid or deferred amounts

A payout schedule must not be represented as a guaranteed return unless such representation is legally permitted and properly supported by the Company's verified product structure and applicable regulatory framework.`,
  },
  {
    id: 'early-withdrawal',
    title: '5. Early Withdrawal',
    content: `Where early withdrawal is permitted, the customer must submit a request through the Company's official process.

The applicable waiting period, eligibility conditions, deductions, payout adjustments, and expected processing time must be disclosed in writing before any payment is accepted.

Any adjustment of previously paid amounts against the principal must be explained with a clear written calculation and must comply with all applicable laws and regulatory requirements. Customers are advised to retain all documentation related to withdrawal requests.`,
  },
  {
    id: 'maturity-settlement',
    title: '6. Maturity and Principal Settlement',
    content: `The maturity date and the terms governing any principal settlement must be specified in the signed written agreement.

The agreement must explain:
• The settlement calculation method
• Payment method and timeline
• Applicable deductions
• Procedure for delayed or disputed payments

No statement concerning repayment of principal should be published or represented to a customer unless the Company has verified that the commitment is legally permitted and has an appropriate financial and contractual basis under applicable Indian law.`,
  },
  {
    id: 'risk-disclosure',
    title: '7. Risk Disclosure',
    content: `Trading and investment activities may involve financial risks, including the possible loss of capital. Returns may vary depending on the product, strategy, and applicable market conditions.

Key risk disclosures:
• Stock market investments are subject to market risk
• Options, forex, and commodity trading involve a high degree of risk
• Past performance, illustrative calculations, and projected returns do not establish future results
• The value of investments can go up as well as down

Customers should review all relevant disclosures and seek independent professional financial advice where appropriate before making any investment decision.

Please read our full Risk Disclosure Statement before participating in any plan.`,
  },
  {
    id: 'payments-receipts',
    title: '8. Payments and Receipts',
    content: `Customers should make payments only through payment methods officially verified and communicated by the Company.

A payment receipt and the relevant written agreement should be provided for each accepted payment. Customers should:
• Retain copies of all agreements
• Keep payment records and receipts
• Retain payout statements
• Keep records of any withdrawal requests

Do not make any payment based on verbal promises or through unofficial, unverified channels. The Company shall not be responsible for funds transferred outside officially communicated channels.

Important: Never share your bank OTP, PIN, internet banking password, or UPI PIN with any person claiming to represent the Company. We will never ask for these.`,
  },
  {
    id: 'privacy',
    title: '9. Customer Information and Privacy',
    content: `Personal information will be collected and processed only for disclosed, lawful purposes and in accordance with the Company's Privacy Policy and applicable data protection laws of India.

Data handling principles:
• Personal data is collected only with your knowledge and consent
• Data is used only for the stated purpose of responding to enquiries and providing services
• We do not sell or share your personal information with third parties for marketing purposes
• You may request access to or deletion of your personal data by contacting us

Sensitive identity and banking documents should be collected only where legally necessary, through an appropriate secure process. The Company will not request unnecessary sensitive financial credentials through this website or contact form.`,
  },
  {
    id: 'complaints',
    title: '10. Complaints and Dispute Resolution',
    content: `Customers may submit complaints through the Company's officially published contact details:

Phone: ${COMPANY.phone}
Email: ${COMPANY.email}
Address: ${COMPANY.address}

The Company will acknowledge complaints and handle them in accordance with applicable laws and regulatory requirements. Customers are encouraged to retain all relevant documentation when raising a complaint.

Nothing in these Terms & Conditions limits any rights or remedies available to a customer under applicable Indian law.`,
  },
  {
    id: 'amendments',
    title: '11. Amendments',
    content: `The Company may update these Terms & Conditions when necessary, subject to applicable legal requirements.

Material changes will be communicated through appropriate channels, including updates on this website. Users are advised to review these terms periodically.

Changes to these terms will not override any existing contractual rights or statutory rights that a customer may have under applicable law.`,
  },
  {
    id: 'governing-law',
    title: '12. Applicable Law',
    content: `These Terms & Conditions are subject to the applicable laws of India.

Any jurisdiction or dispute-resolution clause will be finalised after legal review and will be communicated in the applicable written agreement provided to each customer.

For all queries, contact us at:
${COMPANY.name}
${COMPANY.address}
Phone: ${COMPANY.phone}
Email: ${COMPANY.email}`,
  },
]

function AccordionItem({ section, isOpen, onToggle }) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.1)'}`,
        background: isOpen ? 'rgba(212,168,67,0.04)' : 'rgba(15,36,96,0.3)',
      }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors focus:outline-none"
      >
        <span className="text-sm font-semibold pr-4"
          style={{ color: isOpen ? '#d4a843' : '#e2e8f0' }}>
          {section.title}
        </span>
        {isOpen
          ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: '#d4a843' }} />
          : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#8099b0' }} />
        }
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          <div className="h-px mb-4" style={{ background: 'rgba(212,168,67,0.25)' }} />
          <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#b0c8dc' }}>
            {section.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TermsPage() {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState('introduction')
  const [expandAll, setExpandAll] = useState(false)

  const toggle = (id) => {
    if (expandAll) {
      setExpandAll(false)
      setOpenSection(id)
    } else {
      setOpenSection(openSection === id ? null : id)
    }
  }

  const isOpen = (id) => expandAll || openSection === id

  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: '#8099b0' }}
          onMouseEnter={e => e.currentTarget.style.color = '#b0c8dc'}
          onMouseLeave={e => e.currentTarget.style.color = '#8099b0'}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)' }}>
            <Scale className="h-6 w-6" style={{ color: '#d4a843' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#fff' }}>Terms &amp; Conditions</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#8099b0' }}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Last updated: October 2026
              </span>
              <span>{COMPANY.name}</span>
            </div>
          </div>
        </div>

        {/* Company identification */}
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(15,36,96,0.55)', border: '1px solid rgba(212,168,67,0.2)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#d4a843' }}>Registered Company</p>
          <p className="text-sm font-bold mb-1" style={{ color: '#fff' }}>{COMPANY.name}</p>
          <p className="text-xs font-mono font-semibold mb-1" style={{ color: '#f0c060' }}>CIN: {COMPANY.cin}</p>
          <p className="text-xs" style={{ color: '#9ab0c4' }}>Registered Office: {COMPANY.address}</p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#b0c8dc' }}>
            Please read these Terms &amp; Conditions carefully before using this website or any services offered by the Company.
            By accessing this website you agree to be bound by these terms. These terms cover the use of investment plans,
            educational content, learning and advisory services, and all other services provided.
          </p>
        </div>

        {/* Expand / collapse */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setExpandAll(!expandAll); setOpenSection(null) }}
            className="text-xs transition-colors"
            style={{ color: '#d4a843', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            {expandAll ? 'Collapse all sections' : 'Expand all sections'}
          </button>
        </div>

        {/* Accordion */}
        <div className="space-y-2.5 mb-10">
          {SECTIONS.map((section) => (
            <AccordionItem
              key={section.id}
              section={section}
              isOpen={isOpen(section.id)}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(15,36,96,0.35)', border: '1px solid rgba(15,36,96,0.75)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#8099b0' }}>
            These Terms &amp; Conditions are governed by applicable laws of India. Any jurisdiction or dispute-resolution
            clause will be finalised after legal review and communicated in the applicable written customer agreement.
            For queries contact{' '}
            <a href={`mailto:${COMPANY.email}`} style={{ color: '#b0c8dc' }}>{COMPANY.email}</a>
            {' '}or call{' '}
            <a href={`tel:${COMPANY.phone}`} style={{ color: '#b0c8dc' }}>{COMPANY.phone}</a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/risk-disclosure">
            <Button variant="secondary" size="md">Risk Disclosure</Button>
          </Link>
          <Link to="/contact">
            <Button size="md"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
