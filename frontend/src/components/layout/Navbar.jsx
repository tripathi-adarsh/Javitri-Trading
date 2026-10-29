import React, { useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, MessageCircle, Globe, ChevronDown } from 'lucide-react'
import { useLang, LANGUAGES } from '../../context/LanguageContext.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [langOpen, setLangOpen]     = React.useState(false)
  const langRef = useRef(null)
  const location = useLocation()
  const { lang, setLang, t } = useLang()

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { to: '/',               labelKey: 'nav_home' },
    { to: '/about',          labelKey: 'nav_about' },
    { to: '/plans',          labelKey: 'nav_plans' },
    { to: '/services',       labelKey: 'nav_services' },
    // { to: '/learning',       labelKey: 'nav_learning' },
    // { to: '/risk-disclosure',labelKey: 'nav_risk' },
    { to: '/contact',        labelKey: 'nav_contact' },
  ]

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <header className="sticky top-0 z-50"
      style={{ background: 'rgba(7,12,24,0.98)', borderBottom: '1px solid rgba(200,152,58,0.25)', backdropFilter: 'blur(14px)' }}>

      {/* Gold top accent line */}
      <div className="gold-line" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-white rounded-xl p-1.5 shadow-md group-hover:shadow-lg transition-shadow">
              <img src="/logo.jpeg" alt="Javitri Trading Service" className="h-9 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-white">
                Javitri <span style={{ color: '#c8983a' }}>Trading</span>
              </p>
              <p className="text-[10px] leading-none" style={{ color: '#8899aa' }}>Service Pvt. Ltd.</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center mx-4">
            {navLinks.map(({ to, labelKey }) => (
              <Link
                key={to} to={to}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={isActive(to)
                  ? { color: '#c8983a', background: 'rgba(200,152,58,0.12)' }
                  : { color: '#b0bec5' }
                }
                onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' } }}
                onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = '#b0bec5'; e.currentTarget.style.background = 'transparent' } }}
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: '#b0bec5', border: '1px solid rgba(200,152,58,0.2)', background: 'rgba(200,152,58,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,152,58,0.5)'; e.currentTarget.style.color = '#c8983a' }}
                onMouseLeave={e => { if (!langOpen) { e.currentTarget.style.borderColor = 'rgba(200,152,58,0.2)'; e.currentTarget.style.color = '#b0bec5' } }}
                aria-label="Select language"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang.flag} {currentLang.nativeLabel}</span>
                <ChevronDown className="h-3 w-3" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[160px]"
                  style={{ background: '#0d1629', border: '1px solid rgba(200,152,58,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                  role="listbox"
                  aria-label="Available languages"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      role="option"
                      aria-selected={lang === l.code}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors"
                      style={{
                        color: lang === l.code ? '#c8983a' : '#b0bec5',
                        background: lang === l.code ? 'rgba(200,152,58,0.1)' : 'transparent',
                        fontWeight: lang === l.code ? '600' : '400',
                      }}
                      onMouseEnter={e => { if (lang !== l.code) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' } }}
                      onMouseLeave={e => { if (lang !== l.code) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0bec5' } }}
                    >
                      <span className="text-base">{l.flag}</span>
                      <div className="flex flex-col">
                        <span>{l.nativeLabel}</span>
                        {l.code !== 'en' && <span className="text-[10px]" style={{ color: '#64748b' }}>{l.label}</span>}
                      </div>
                      {lang === l.code && <span className="ml-auto text-[10px]" style={{ color: '#c8983a' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t('nav_whatsapp')}
            </a>

            {/* Admin */}
            <Link to="/admin/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ color: '#8899aa', border: '1px solid rgba(200,152,58,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#c8983a'; e.currentTarget.style.borderColor = 'rgba(200,152,58,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8899aa'; e.currentTarget.style.borderColor = 'rgba(200,152,58,0.2)' }}>
              <Shield className="h-3.5 w-3.5" />
              {t('nav_admin')}
            </Link>
          </div>

          {/* ── Mobile right ── */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile language compact */}
            <div className="relative" ref={null}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: '#b0bec5', border: '1px solid rgba(200,152,58,0.2)', background: 'rgba(200,152,58,0.05)' }}
                aria-label="Select language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang.flag}</span>
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[160px]"
                  style={{ background: '#0d1629', border: '1px solid rgba(200,152,58,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors"
                      style={{
                        color: lang === l.code ? '#c8983a' : '#b0bec5',
                        background: lang === l.code ? 'rgba(200,152,58,0.1)' : 'transparent',
                        fontWeight: lang === l.code ? '600' : '400',
                      }}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                      {lang === l.code && <span className="ml-auto" style={{ color: '#c8983a' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#b0bec5' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden py-3 flex flex-col gap-0.5"
            style={{ borderTop: '1px solid rgba(200,152,58,0.15)' }}>
            {navLinks.map(({ to, labelKey }) => (
              <Link key={to} to={to}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg"
                style={isActive(to)
                  ? { color: '#c8983a', background: 'rgba(200,152,58,0.1)' }
                  : { color: '#b0bec5' }}>
                {t(labelKey)}
              </Link>
            ))}
            <div className="flex flex-col gap-1 mt-2 pt-2"
              style={{ borderTop: '1px solid rgba(200,152,58,0.15)' }}>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg"
                style={{ color: '#25d366', background: 'rgba(37,211,102,0.08)' }}>
                <MessageCircle className="h-4 w-4" />
                {t('nav_whatsapp')}
              </a>
              <Link to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg"
                style={{ color: '#c8983a' }}>
                <Shield className="h-4 w-4" />
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
