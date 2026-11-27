import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, Calendar, ArrowLeft, ShieldAlert, ChevronDown, ChevronRight, Building2, CheckCircle2 } from 'lucide-react'
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
    title: '1. Introduction & Acceptance of Terms',
    content: `These Terms & Conditions govern the access and use of the corporate platform, services, and educational resources provided by JAVITRI TRADING SERVICE PRIVATE LIMITED ("Company", "we", "our" or "us").

Registered Office: ${COMPANY.address}
CIN: ${COMPANY.cin}

By visiting or utilizing this website, users formally agree to adhere to these terms and all applicable statutory laws of India. If you do not accept these terms in full, please discontinue use of this website immediately.

The Company operates primarily in financial markets literacy, investor guidance, and structured deal administration to help clients understand capital markets and execute informed strategies.`,
  },
  {
    id: 'plan-information',
    title: '2. Plan Documentation & Disclosure Standards',
    content: `All operational parameters of any investment plan—including required principal, schedule of proposed daily figures, tenure, eligibility conditions, and settlement timelines—are formally established in a binding bilateral agreement prior to processing any financial commitment.

No plan may be offered or contracted unless verified to be fully compliant under applicable Indian laws and regulatory frameworks.

All figures termed "proposed daily figures", "illustrative calculations", or "associated values" displayed on this website are educational references and do not represent guaranteed income or promised returns.`,
  },
  {
    id: 'plan-duration',
    title: '3. Plan Duration & Trading Day Mechanics',
    content: `Where legally executed and agreed in writing, a standard plan cycle spans a term of 90 active trading days.

The official commencement date, schedule milestones, and maturity settlement date are clearly defined in each customer's signed contract before onboarding.

The 90-day term pertains exclusively to official exchange trading sessions (Monday through Friday), excluding weekends, exchange clearing holidays, and official national holidays as codified in the agreement.`,
  },
  {
    id: 'payout-schedule',
    title: '4. Daily Payout Protocol & Verification',
    content: `Any agreed daily associated figure—including the active Monday-to-Friday schedule and non-disbursement weekend intervals—is executed strictly per the terms of the signed agreement.

The agreement specifies:
• Calculation methodology for daily figures
• Bank account disbursement channels
• Processing buffers during banking holidays
• Treatment of deferred or delayed banking cycles

Payout structures are never represented as assured market returns unless supported by verified underlying structures and appropriate regulatory authorization.`,
  },
  {
    id: 'early-withdrawal',
    title: '5. Early Withdrawal & Premature Settlement',
    content: `Where early withdrawal is permissible under the agreed investment plan, the client must submit a formal written request through official corporate channels.

The applicable notice period, eligibility criteria, administrative deductions, and payout adjustments are documented in writing before any transaction is initiated.

Any adjustment of prior disbursements against principal is computed transparently with full auditing provided to the customer.`,
  },
  {
    id: 'maturity-settlement',
    title: '6. Maturity Settlement & Principal Resolution',
    content: `The definitive maturity date and conditions governing the final return or reinvestment of principal are specified in the executed agreement.

The contract outlines:
• Net settlement calculation
• Electronic bank transfer procedures (NEFT/RTGS/IMPS)
• Statutory tax deductions if applicable (TDS/GST)
• Dispute escalation protocol

All statements regarding capital return comply strictly with Indian contractual law.`,
  },
  {
    id: 'risk-disclosure',
    title: '7. Capital Market Risk Acknowledgement',
    content: `Securities and derivatives trading carry substantial market risk including potential capital volatility.

Key disclosures:
• Equities and index derivatives fluctuate based on macroeconomic and liquidity factors
• Leverage amplifies both gains and losses
• Past illustrative performance does not guarantee future results
• Clients should evaluate their financial risk tolerance independently`,
  },
  {
    id: 'payments-receipts',
    title: '8. Official Payment Channels & Invoicing',
    content: `Payments must only be remitted through officially verified banking channels (corporate bank account or integrated authorized payment gateway).

An official GST tax invoice and digital payment receipt are issued for every verified transaction. Clients should retain copies of all payment acknowledgements.`,
  },
  {
    id: 'customer-verification',
    title: '9. KYC Verification & Anti-Fraud Compliance',
    content: `Every client must complete Know Your Customer (KYC) verification by submitting authentic government-issued identity documents (Aadhaar, PAN, and Bank Account Proof).

Providing fraudulent or third-party documentation will result in immediate termination of account services and referral to regulatory authorities.`,
  },
  {
    id: 'limitation-liability',
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by Indian law, Javitri Trading Service Pvt. Ltd. and its directors shall not be liable for indirect, incidental, or consequential losses arising from market fluctuations, technical exchange downtimes, or user misunderstanding of market risks.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Legal Jurisdiction',
    content: `These terms and any bilateral dispute arising out of corporate transactions shall be governed by and construed in accordance with the laws of the Republic of India. The courts of Uttar Pradesh shall have exclusive jurisdiction over legal proceedings.`,
  },
]

function AccordionItem({ section, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden transition-all shadow-xs">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
      >
        <span className="text-base font-bold text-[#0f172a]">{section.title}</span>
        <ChevronDown
          className="h-5 w-5 text-[#64748b] transition-transform duration-200 shrink-0 ml-4"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 text-sm text-[#334155] leading-relaxed whitespace-pre-line border-t border-[#f1f5f9]">
          {section.content}
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
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#059669] uppercase tracking-wider mb-4">
            <Scale className="h-4 w-4" /> Legal Framework
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Please review the legal and operational terms governing client agreements, service duration, daily payout tracking, and compliance policies.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Corporate Identity Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#059669]" />
            <p className="text-sm font-bold text-[#0f172a]">{COMPANY.name}</p>
          </div>
          <p className="text-xs font-mono font-semibold text-[#1a3c8f]">CIN: {COMPANY.cin}</p>
          <p className="text-xs text-[#64748b]">Registered Address: {COMPANY.address}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">11 Formal Sections</p>
          <button
            onClick={() => { setExpandAll(!expandAll); setOpenSection(null) }}
            className="text-xs font-bold text-[#059669] hover:underline"
          >
            {expandAll ? 'Collapse All Sections' : 'Expand All Sections'}
          </button>
        </div>

        {/* Accordions */}
        <div className="space-y-4 mb-12">
          {SECTIONS.map((section) => (
            <AccordionItem
              key={section.id}
              section={section}
              isOpen={isOpen(section.id)}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </div>

        {/* Action Link Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-[#e2e8f0]">
          <Link to="/risk-disclosure">
            <Button variant="secondary" size="md">
              Risk Disclosure Statement
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="md" variant="primary">
              Contact Compliance Desk
            </Button>
          </Link>
        </div>

      </div>

    </div>
  )
}
