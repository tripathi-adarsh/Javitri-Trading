'use strict'
require('dotenv').config()
const { sequelize, Plan, PromoCode, LegalDocument, User, Employee } = require('../models/index')

// ─── Javitri 10 Deal Plans ────────────────────────────────────────────────────
// IMPORTANT COMPLIANCE NOTE:
// The 'associated_value_paise' in each plan has NOT been confirmed by the company.
// It could be a service fee, commission, or illustrative estimate.
// Do NOT label as guaranteed profit/income until:
//   1. Company confirms the meaning
//   2. Legal/compliance approval is obtained
//   3. Admin sets associated_value_type to a value other than 'not_configured'
// Plans are created with is_active = false and compliance_status = 'pending_review'
// An admin must explicitly activate each plan after confirming associated_value_type.

const PLANS = [
  {
    slug:                    'plan-1',
    name:                    'Plan 1',
    tagline:                 'Entry-level deal plan',
    price_paise:             0,              // subscription price (if any) — TBD
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       1000000,        // ₹10,000
    associated_value_paise:  20000,          // ₹200 — meaning TBD
    associated_value_type:   'not_configured',
    associated_value_label:  null,           // admin must configure this
    sort_order:              1,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹10,000', 'As per approved terms'],
    not_included: [],
    color: 'teal',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-2',
    name:                    'Plan 2',
    tagline:                 'Standard deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       3000000,        // ₹30,000
    associated_value_paise:  70000,          // ₹700
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              2,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹30,000', 'As per approved terms'],
    not_included: [],
    color: 'teal',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-3',
    name:                    'Plan 3',
    tagline:                 'Mid-range deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       5000000,        // ₹50,000
    associated_value_paise:  120000,         // ₹1,200
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              3,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹50,000', 'As per approved terms'],
    not_included: [],
    color: 'emerald',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-4',
    name:                    'Plan 4',
    tagline:                 '₹1 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       10000000,       // ₹1,00,000
    associated_value_paise:  250000,         // ₹2,500
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              4,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹1,00,000', 'As per approved terms'],
    not_included: [],
    color: 'emerald',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-5',
    name:                    'Plan 5',
    tagline:                 '₹3 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       30000000,       // ₹3,00,000
    associated_value_paise:  800000,         // ₹8,000
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              5,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹3,00,000', 'As per approved terms'],
    not_included: [],
    color: 'emerald',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-6',
    name:                    'Plan 6',
    tagline:                 '₹5 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       50000000,       // ₹5,00,000
    associated_value_paise:  1350000,        // ₹13,500
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              6,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹5,00,000', 'As per approved terms'],
    not_included: [],
    color: 'violet',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-7',
    name:                    'Plan 7',
    tagline:                 '₹10 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       100000000,      // ₹10,00,000
    associated_value_paise:  3000000,        // ₹30,000
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              7,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹10,00,000', 'As per approved terms'],
    not_included: [],
    color: 'violet',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-8',
    name:                    'Plan 8',
    tagline:                 '₹15 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       150000000,      // ₹15,00,000
    associated_value_paise:  4000000,        // ₹40,000
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              8,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹15,00,000', 'As per approved terms'],
    not_included: [],
    color: 'violet',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-9',
    name:                    'Plan 9',
    tagline:                 '₹20 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       200000000,      // ₹20,00,000
    associated_value_paise:  5500000,        // ₹55,000
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              9,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹20,00,000', 'As per approved terms'],
    not_included: [],
    color: 'violet',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
  {
    slug:                    'plan-10',
    name:                    'Plan 10',
    tagline:                 '₹50 Lakh deal plan',
    price_paise:             0,
    platform_fee_paise:      0,
    billing_cycle:           'monthly',
    deal_amount_paise:       500000000,      // ₹50,00,000
    associated_value_paise:  13000000,       // ₹1,30,000
    associated_value_type:   'not_configured',
    associated_value_label:  null,
    sort_order:              10,
    is_active:               false,
    compliance_status:       'pending_review',
    features: ['Deal Amount: ₹50,00,000', 'As per approved terms'],
    not_included: [],
    color: 'violet',
    risk_disclosure: 'DRAFT — Risk disclosures must be approved before publication.',
  },
]

// ─── Legal Documents ──────────────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    id:      'intro',
    title:   '1. Introduction',
    content: `[DRAFT] These Terms and Conditions govern your use of services provided by JAVITRI TRADING SERVICE PRIVATE LIMITED (CIN: U66190GJ2026PTC183862), registered at Sachin, Surat, Gujarat, India.\n\nBy registering or using our platform, you agree to these terms. If you do not agree, do not use our services.`,
  },
  {
    id:      'eligibility',
    title:   '2. Eligibility',
    content: `[DRAFT] You must be at least 18 years of age and a resident of India. You must complete the KYC process as required by applicable law. Providing false information may result in account termination.`,
  },
  {
    id:      'deal-terms',
    title:   '3. Deal Plans and Payment Terms',
    content: `[DRAFT] Deal plans are subject to the specific terms configured by the company. The associated value displayed with each plan represents [TO BE CONFIRMED — meaning not yet determined]. Do not interpret this as a guaranteed return, profit, or income until the company confirms its meaning and obtains applicable compliance approvals.\n\nPayment terms, refund policies, and cancellation procedures will be communicated before any payment is required.`,
  },
  {
    id:      'compliance',
    title:   '4. Regulatory Compliance',
    content: `[DRAFT] JAVITRI TRADING SERVICE PRIVATE LIMITED is registered under the Companies Act 2013. All applicable regulatory requirements will be met before any financial services are offered. Clients will be informed of applicable regulations, disclosures, and their rights before subscribing to any plan.`,
  },
  {
    id:      'data-privacy',
    title:   '5. Data Privacy',
    content: `[DRAFT] Personal data is collected and processed in accordance with the Information Technology Act, 2000 and applicable provisions of the Digital Personal Data Protection Act. Data is used only for legitimate business purposes and is not sold to third parties.`,
  },
  {
    id:      'disclaimer',
    title:   '6. Disclaimer',
    content: `[DRAFT] Information on this platform is for informational purposes only. JAVITRI TRADING SERVICE PRIVATE LIMITED does not make any guarantees of income, returns, or profits. All financial decisions are made at the client's own risk.`,
  },
]

const PRIVACY_SECTIONS = [
  {
    id:      'collection',
    title:   '1. Information We Collect',
    content: `[DRAFT] We collect personal information including full name, mobile number, email address, address, and KYC documents (PAN, identity references) as required for our services and regulatory compliance.`,
  },
  {
    id:      'use',
    title:   '2. How We Use Your Information',
    content: `[DRAFT] Your information is used to: provide services, comply with applicable laws and regulations, process payments, verify identity, and communicate important service updates.`,
  },
  {
    id:      'security',
    title:   '3. Data Security',
    content: `[DRAFT] Sensitive information (PAN, bank details) is encrypted at rest. We implement appropriate technical and organizational measures to protect your data. Access is restricted to authorized personnel only.`,
  },
  {
    id:      'rights',
    title:   '4. Your Rights',
    content: `[DRAFT] Under applicable Indian law, you have the right to access, correct, and in certain circumstances request deletion of your personal data. To exercise these rights, contact us at: [CONTACT EMAIL TO BE CONFIGURED].`,
  },
  {
    id:      'contact',
    title:   '5. Contact Us',
    content: `[DRAFT] For privacy-related queries, contact: JAVITRI TRADING SERVICE PRIVATE LIMITED, Sachin, Surat, Gujarat, India.\n\nRegistered CIN: U66190GJ2026PTC183862`,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed () {
  try {
    await sequelize.authenticate()
    console.log('✓ MySQL connected')

    // Sync tables
    await sequelize.sync({ alter: true })
    console.log('✓ Tables synced')

    // 10 Javitri plans
    for (const p of PLANS) {
      const [plan, created] = await Plan.findOrCreate({
        where: { slug: p.slug },
        defaults: p,
      })
      if (!created) {
        // Update deal amounts and compliance fields only — preserve admin changes
        await plan.update({
          deal_amount_paise:       p.deal_amount_paise,
          associated_value_paise:  p.associated_value_paise,
          name:                    p.name,
          tagline:                 p.tagline,
          sort_order:              p.sort_order,
          features:                p.features,
          color:                   p.color,
        })
      }
    }
    console.log('✓ 10 Javitri deal plans seeded (all inactive — admin must activate after compliance review)')

    // Legal docs
    await LegalDocument.findOrCreate({
      where:    { type: 'terms', version: '1.0.0-draft' },
      defaults: {
        type:           'terms',
        version:        '1.0.0-draft',
        title:          'Terms & Conditions — JAVITRI TRADING SERVICE PRIVATE LIMITED',
        content:        TERMS_SECTIONS,
        status:         'published',
        effective_date: '2026-10-01',
      },
    })
    console.log('✓ Terms document seeded')

    await LegalDocument.findOrCreate({
      where:    { type: 'privacy', version: '1.0.0-draft' },
      defaults: {
        type:           'privacy',
        version:        '1.0.0-draft',
        title:          'Privacy Policy — JAVITRI TRADING SERVICE PRIVATE LIMITED',
        content:        PRIVACY_SECTIONS,
        status:         'published',
        effective_date: '2026-10-01',
      },
    })
    console.log('✓ Privacy policy seeded')

    // Super admin user
    const superAdminExists = await User.findOne({ where: { email: 'superadmin@javitritrading.in' } })
    if (!superAdminExists) {
      const superAdmin = await User.create({
        first_name:          'Super',
        last_name:           'Admin',
        email:               'superadmin@javitritrading.in',
        phone:               '9000000001',
        dob:                 '1985-01-01',
        pan:                 'SUPER1234A',
        city:                'Surat',
        state:               'gj',
        annual_income:       'above_25l',
        trading_experience:  'expert',
        password_hash:       'SuperAdmin@123456',  // hashed by beforeCreate hook
        role:                'super_admin',
        email_verified:      true,
      })
      console.log('✓ Super Admin created  (superadmin@javitritrading.in / SuperAdmin@123456)')
    } else {
      console.log('  Super Admin already exists — skipped')
    }

    // Admin user
    const adminExists = await User.findOne({ where: { email: 'admin@javitritrading.in' } })
    if (!adminExists) {
      await User.create({
        first_name:          'Admin',
        last_name:           'Javitri',
        email:               'admin@javitritrading.in',
        phone:               '9000000002',
        dob:                 '1990-01-01',
        pan:                 'ADMIN1234B',
        city:                'Surat',
        state:               'gj',
        annual_income:       'above_25l',
        trading_experience:  'expert',
        password_hash:       'Admin@123456',
        role:                'admin',
        email_verified:      true,
      })
      console.log('✓ Admin user created  (admin@javitritrading.in / Admin@123456)')
    } else {
      console.log('  Admin user already exists — skipped')
    }

    // Sample employee user + Employee record
    const empUserExists = await User.findOne({ where: { email: 'employee@javitritrading.in' } })
    if (!empUserExists) {
      const empUser = await User.create({
        first_name:          'Rahul',
        last_name:           'Employee',
        email:               'employee@javitritrading.in',
        phone:               '9000000003',
        dob:                 '1995-06-15',
        pan:                 'EMPLO1234C',
        city:                'Surat',
        state:               'gj',
        annual_income:       '5l_10l',
        trading_experience:  'intermediate',
        password_hash:       'Employee@123456',
        role:                'employee',
        email_verified:      true,
      })
      await Employee.create({
        user_id:       empUser.id,
        employee_code: 'JVT-EMP-1001',
        department:    'Sales',
      })
      console.log('✓ Sample employee created  (employee@javitritrading.in / Employee@123456, code: JVT-EMP-1001)')
    } else {
      console.log('  Sample employee already exists — skipped')
    }

    console.log('\n✓ Seed complete')
    console.log('\n⚠️  COMPLIANCE REMINDER:')
    console.log('   All 10 plans are created with is_active=false and compliance_status=pending_review.')
    console.log('   An admin must configure associated_value_type and activate each plan before')
    console.log('   clients can submit orders. Do NOT activate plans until business model,')
    console.log('   legal authorization, and terms have been confirmed.')
    process.exit(0)
  } catch (err) {
    console.error('✗ Seed failed:', err)
    process.exit(1)
  }
}

seed()
