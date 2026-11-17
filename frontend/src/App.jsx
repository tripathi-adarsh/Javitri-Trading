import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom'
import { TradingProvider, useTrading } from './context/TradingContext.jsx'
import { LanguageProvider, useLang } from './context/LanguageContext.jsx'

// Layout
import Navbar      from './components/layout/Navbar.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'

// Public pages
import HomePage           from './pages/HomePage.jsx'
import AboutPage          from './pages/AboutPage.jsx'
import HowItWorksPage     from './pages/HowItWorksPage.jsx'
import ContactPage        from './pages/ContactPage.jsx'
import TermsPage          from './pages/TermsPage.jsx'
import ServicesPage       from './pages/ServicesPage.jsx'
import LearningPage       from './pages/LearningPage.jsx'
import RiskDisclosurePage from './pages/RiskDisclosurePage.jsx'
import GenerateInvoicePage from './pages/GenerateInvoicePage.jsx'

// Client flow
import RegisterPage       from './pages/RegisterPage.jsx'
import PlansPage          from './pages/PlansPage.jsx'
import DealSummaryPage    from './pages/DealSummaryPage.jsx'
import ConsentPage        from './pages/ConsentPage.jsx'
import PaymentPage        from './pages/PaymentPage.jsx'

// Admin
import AdminLoginPage        from './pages/AdminLoginPage.jsx'
import DashboardPage         from './pages/admin/DashboardPage.jsx'
import EmployeesPage         from './pages/admin/EmployeesPage.jsx'
import ClientsPage           from './pages/admin/ClientsPage.jsx'
import KycReviewPage         from './pages/admin/KycReviewPage.jsx'
import AdminPlansPage        from './pages/admin/PlansPage.jsx'
import AuditLogsPage         from './pages/admin/AuditLogsPage.jsx'
import PlanRequestsPage      from './pages/admin/PlanRequestsPage.jsx'
import PayoutReportsPage     from './pages/admin/PayoutReportsPage.jsx'
import ContactMessagesPage   from './pages/admin/ContactMessagesPage.jsx'

// ── Guards & stubs ────────────────────────────────────────────────────────────
function AdminRoute({ children, allowedRoles = ['admin', 'super_admin', 'employee'] }) {
  const { user, token } = useTrading()
  if (!token || !user) return <Navigate to="/admin/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/admin/login" replace />
  return children
}

function StubPage({ title }) {
  return (
    <div className="py-10 text-center">
      <p className="text-xl font-bold text-white mb-2">{title}</p>
      <p className="text-gray-500 text-sm">This section is under construction.</p>
    </div>
  )
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicShell />}>
        <Route path="/"                element={<HomePage />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/how-it-works"    element={<HowItWorksPage />} />
        <Route path="/contact"         element={<ContactPage />} />
        <Route path="/terms"           element={<TermsPage />} />
        <Route path="/plans"           element={<PlansPage />} />
        <Route path="/services"        element={<ServicesPage />} />
        <Route path="/learning"        element={<LearningPage />} />
        <Route path="/risk-disclosure" element={<RiskDisclosurePage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/deal-summary"    element={<DealSummaryPage />} />
        <Route path="/consent"         element={<ConsentPage />} />
        <Route path="/payment"         element={<PaymentPage />} />
      </Route>

      {/* Invoice generator — standalone, no navbar */}
      <Route path="/gen-invoice" element={<GenerateInvoicePage />} />

      {/* Admin login — no navbar */}
      <Route path="/admin/login" element={
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <AdminLoginPage />
        </div>
      } />

      {/* Admin panel */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminLayout>
            <Routes>
              <Route path="dashboard"          element={<DashboardPage />} />
              <Route path="employees"          element={<EmployeesPage />} />
              <Route path="clients"            element={<ClientsPage />} />
              <Route path="plan-requests"      element={<PlanRequestsPage />} />
              <Route path="payout-reports"     element={<PayoutReportsPage />} />
              <Route path="contact-messages"   element={<ContactMessagesPage />} />
              <Route path="kyc-review"         element={<KycReviewPage />} />
              <Route path="plans"              element={<AdminPlansPage />} />
              <Route path="audit-logs"         element={<AuditLogsPage />} />
              <Route path="*"                  element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </AdminRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Public shell ──────────────────────────────────────────────────────────────
function PublicShell() {
  return (
    <div className="min-h-screen" style={{ color: '#d1dae6' }}>
      <Navbar />
      <main><Outlet /></main>
      <PublicFooter />
    </div>
  )
}

// ── Company constants ─────────────────────────────────────────────────────────
const OFFICE_2  = {
  label:   'Our Office',
  address: 'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
  maps:    'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
}
const PHONE     = '+91 9022487800'
const EMAIL     = 'info@javitritrading.com'
const WHATSAPP  = 'https://wa.me/919022487800'
const SCHEDULE  = 'Monday to Friday'
const CIN       = 'U66190GJ2026PTC183862'
const GST_NO    = '09AAHCJ6166E1ZD'

// ── Footer ────────────────────────────────────────────────────────────────────
function PublicFooter() {
  const year = new Date().getFullYear()
  const { t } = useLang()

  const navLinks = [
    { to: '/',               label: t('nav_home') },
    { to: '/about',          label: t('nav_about') },
    { to: '/plans',          label: t('nav_plans') },
    { to: '/services',       label: t('nav_services') },
    { to: '/contact',        label: t('nav_contact') },
  ]
  const legalLinks = [
    { to: '/termss',           label: t('terms') },
    { to: '/termss',           label: t('privacy') },
    { to: '/risk-disclosures', label: t('risk_disclosure') },
    { to: '/admin/login',     label: 'Admin Login' },
  ]

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #070e22 0%, #040810 100%)',
      borderTop: '1px solid rgba(212,168,67,0.28)',
    }}>
      <div className="gold-line" />

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white rounded-xl p-1.5 shadow-lg">
                <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd." className="h-9 w-auto object-contain" />
              </div>
              <div>
                <p className="text-base font-bold leading-tight" style={{ color: '#f8fafc' }}>
                  Javitri <span style={{ color: '#d4a843' }}>Trading</span>
                </p>
                <p className="text-xs" style={{ color: '#6a7f95' }}>Service Pvt. Ltd.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#9aaabb' }}>
              {t('footer_tagline')}
            </p>
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
                style={{ background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.25)', color:'#d4a843', width:'fit-content' }}>
                <span style={{ color:'#7090a8', fontSize:'9px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px' }}>CIN</span>
                <span style={{ color:'#f0c060' }}>{CIN}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
                style={{ background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.25)', color:'#d4a843', width:'fit-content' }}>
                <span style={{ color:'#7090a8', fontSize:'9px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px' }}>GST</span>
                <span style={{ color:'#f0c060' }}>{GST_NO}</span>
              </div>
            </div>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.28)', color: '#25d366' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.12)'}>
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('contact_whatsapp')}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#d4a843' }}>
              {t('footer_nav')}
            </p>
            <div className="space-y-3">
              {navLinks.map(({ to, label }) => (
                <Link key={to + label} to={to}
                  className="block text-sm transition-colors"
                  style={{ color: '#9aaabb' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9aaabb'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#d4a843' }}>
              {t('footer_legal')}
            </p>
            <div className="space-y-3">
              {legalLinks.map(({ to, label }) => (
                <Link key={label} to={to}
                  className="block text-sm transition-colors"
                  style={{ color: '#9aaabb' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9aaabb'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#d4a843' }}>
              {t('footer_contact')}
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: '#d4a843' }}>🏢 {t('contact_office2')}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#9aaabb' }}>{OFFICE_2.address}</p>
                <a href={OFFICE_2.maps} target="_blank" rel="noopener noreferrer"
                  className="text-xs mt-1.5 inline-block hover:underline" style={{ color: '#d4a843' }}>
                  {t('get_directions')} →
                </a>
              </div>
              <div className="space-y-2">
                <a href={`tel:${PHONE}`}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: '#9aaabb' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9aaabb'}>
                  📞 {PHONE}
                </a>
                <a href={`mailto:${EMAIL}`}
                  className="flex items-start gap-1.5 text-xs transition-colors break-all"
                  style={{ color: '#9aaabb' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9aaabb'}>
                  ✉ {EMAIL}
                </a>
                <p className="text-xs" style={{ color: '#5e7285' }}>📅 {SCHEDULE}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(212,168,67,0.1)' }}>
          <p className="text-xs text-center sm:text-left" style={{ color: '#3d5060' }}>
            © {year} JAVITRI TRADING SERVICE PRIVATE LIMITED. {t('footer_copyright')}
          </p>
          <p className="text-xs text-center" style={{ color: '#3d5060' }}>
            Fatehpur, Uttar Pradesh
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <TradingProvider>
        <AppRoutes />
      </TradingProvider>
    </LanguageProvider>
  )
}
