import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom'
import { TradingProvider, useTrading } from './context/TradingContext.jsx'
import { LanguageProvider, useLang } from './context/LanguageContext.jsx'
import { MarketProvider } from './context/MarketContext.jsx'

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
import RegisterPage        from './pages/RegisterPage.jsx'
import PlansPage           from './pages/PlansPage.jsx'
import DealSummaryPage     from './pages/DealSummaryPage.jsx'
import ConsentPage         from './pages/ConsentPage.jsx'
import PaymentPage         from './pages/PaymentPage.jsx'
import ClientDashboardPage from './pages/ClientDashboardPage.jsx'

// Admin
import AdminLoginPage        from './pages/AdminLoginPage.jsx'
import DashboardPage         from './pages/admin/DashboardPage.jsx'
import EmployeesPage         from './pages/admin/EmployeesPage.jsx'
import ClientsPage           from './pages/admin/ClientsPage.jsx'
import KycReviewPage         from './pages/admin/KycReviewPage.jsx'
import AdminPlansPage        from './pages/admin/PlansPage.jsx'
import AuditLogsPage         from './pages/admin/AuditLogsPage.jsx'
import PlanRequestsPage      from './pages/admin/PlanRequestsPage.jsx'
import PaymentRequestsPage   from './pages/admin/PaymentRequestsPage.jsx'
import PayoutReportsPage     from './pages/admin/PayoutReportsPage.jsx'
import ContactMessagesPage   from './pages/admin/ContactMessagesPage.jsx'

// ── Guards & stubs ────────────────────────────────────────────────────────────
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center space-y-3">
        <div className="h-9 w-9 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-[#64748b]">Restoring session…</p>
      </div>
    </div>
  )
}

function AdminRoute({ children, allowedRoles = ['admin', 'super_admin', 'employee'] }) {
  const { user, token, authLoading } = useTrading()
  if (authLoading) return <AuthLoadingScreen />
  if (!token || !user) return <Navigate to="/admin/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/admin/login" replace />
  return children
}

function ClientRoute({ children }) {
  const { user, token, authLoading } = useTrading()
  if (authLoading) return <AuthLoadingScreen />
  if (!token || !user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'client') return <Navigate to="/admin/login" replace />
  return children
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
        <Route path="/login"           element={<Navigate to="/admin/login" replace />} />
        <Route path="/client/login"    element={<Navigate to="/admin/login" replace />} />
        <Route path="/client/dashboard" element={
          <ClientRoute>
            <ClientDashboardPage />
          </ClientRoute>
        } />
      </Route>

      {/* Invoice generator — standalone, no navbar */}
      <Route path="/gen-invoice" element={<GenerateInvoicePage />} />

      {/* Admin login — standalone white theme */}
      <Route path="/admin/login" element={
        <div className="min-h-screen bg-white">
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
              <Route path="payment-requests"   element={<PaymentRequestsPage />} />
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
    <div className="min-h-screen bg-white text-[#1e293b] flex flex-col justify-between">
      <div>
        <Navbar />
        <main><Outlet /></main>
      </div>
      <PublicFooter />
    </div>
  )
}

// ── Company constants ─────────────────────────────────────────────────────────
const OFFICE_2  = {
  label:   'Registered Office',
  address: 'Main Bazar, Khakhreru, Fatehpur, Uttar Pradesh – 212656',
  maps:    'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
}
const PHONE     = '+91 9022487800'
const EMAIL     = 'info@javitritrading.com'
const WHATSAPP  = 'https://wa.me/919022487800'
const TELEGRAM  = 'https://t.me/Javitritradingservice'
const SCHEDULE  = 'Monday to Friday'
const CIN       = 'U66190GJ2026PTC183862'
const GST_NO    = '09AAHCJ6166E1ZD'
const DPIIT_NO  = 'DIPP291171'

// ── Premium White Corporate Footer ────────────────────────────────────────────
function PublicFooter() {
  const year = new Date().getFullYear()
  const { t } = useLang()

  const navLinks = [
    { to: '/',            label: t('nav_home') || 'Home' },
    { to: '/about',       label: t('nav_about') || 'About Us' },
    { to: '/plans',       label: t('nav_plans') || 'Investment Plans' },
    { to: '/services',    label: t('nav_services') || 'Services' },
    { to: '/contact',     label: t('nav_contact') || 'Contact Us' },
  ]

  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0]">
      {/* Decorative luxury corporate top border accent */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0b1e3f 0%, #1d4ed8 45%, #d4af37 80%, #f59e0b 100%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

          {/* Column 1: Brand & Registration */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#cbd5e1] h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center shrink-0">
                <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd." className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black leading-tight text-[#0b1e3f]">
                  Javitri Trading <span className="text-[#1d4ed8]">Service</span>
                </p>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#b45309]">Pvt. Ltd.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-[#334155] font-medium">
              {t('footer_tagline') || 'Premier corporate platform for structured stock market investment plans, vehicle & health insurance, and daughter marriage wealth planning across India.'}
            </p>

            {/* Govt. Recognition & Statutory Identifiers */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-[#92400e] border border-[#fde68a] shadow-xs">
                <span className="font-mono font-bold text-[#b45309]">Startup India:</span>
                <span className="text-[#0b1e3f]">{DPIIT_NO}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-[#92400e] border border-[#fde68a] shadow-xs">
                <span className="font-mono font-bold text-[#b45309]">CIN:</span>
                <span className="text-[#0b1e3f]">{CIN}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-[#92400e] border border-[#fde68a] shadow-xs">
                <span className="font-mono font-bold text-[#b45309]">GST:</span>
                <span className="text-[#0b1e3f]">{GST_NO}</span>
              </div>
            </div>

            {/* Direct Social Channels (WhatsApp & Telegram) */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe] shadow-xs"
              >
                <svg className="h-4 w-4 text-[#1d4ed8]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 shadow-xs"
              >
                <svg className="h-4 w-4 text-sky-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
                </svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#1d4ed8]"></span> {t('footer_quick_nav') || 'Quick Navigation'}
            </p>
            <div className="space-y-2.5">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to + label}
                  to={to}
                  className="block text-sm text-[#334155] hover:text-[#1d4ed8] font-bold transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/admin/login"
                className="block text-sm text-[#64748b] hover:text-[#0b1e3f] font-semibold transition-colors pt-2"
              >
                Admin / Client Login →
              </Link>
            </div>
          </div>

          {/* Column 3: Contact & Highlighted Address */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b45309]"></span> Our Location
            </p>

            {/* Highlighted Registered Address Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-2 border-amber-300/80 shadow-xs">
              <p className="text-xs font-black text-[#0b1e3f] mb-1.5 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#b45309]"></span>
                {t('footer_address_title') || 'Registered Office'}
              </p>
              <div className="p-2.5">
                <p className="text-xs font-black text-[#0b1e3f] leading-relaxed">
                  Main Bazar, Khakhreru, Fatehpur, Uttar Pradesh – 212656
                </p>
              </div>
              <a
                href={OFFICE_2.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-2 inline-flex items-center gap-1 text-[#1d4ed8] font-black hover:underline"
              >
                <span>View Location on Google Maps</span> →
              </a>
            </div>

            {/* Highlighted Operating Hours Card */}
            <div className="p-3.5 rounded-2xl bg-blue-50/90 border-2 border-blue-200 shadow-xs text-xs">
              <p className="font-black text-[#1d4ed8] flex items-center gap-1.5">
                <span>📅</span> {t('footer_operating_hours') || 'Operating: Monday to Friday (09:00 - 18:00 IST)'}
              </p>
              <p className="text-[11px] font-bold text-[#475569] mt-0.5">
                {t('footer_weekend_closed') || 'Saturday & Sunday Closed (Market Holidays)'}
              </p>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <a href={`tel:${PHONE}`} className="flex items-center gap-2 text-[#0b1e3f] hover:text-[#1d4ed8] font-extrabold transition-colors">
                📞 <span>{PHONE}</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-[#0b1e3f] hover:text-[#1d4ed8] font-extrabold transition-colors break-all">
                ✉ <span>{EMAIL}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748b] font-medium">
          <p>© {year} JAVITRI TRADING SERVICE PRIVATE LIMITED. {t('footer_rights') || 'All rights reserved.'}</p>
          <p className="font-bold text-[#0b1e3f]">
            Startup India: {DPIIT_NO} · CIN: {CIN} · GST: {GST_NO}
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
      <MarketProvider>
        <TradingProvider>
          <AppRoutes />
        </TradingProvider>
      </MarketProvider>
    </LanguageProvider>
  )
}
