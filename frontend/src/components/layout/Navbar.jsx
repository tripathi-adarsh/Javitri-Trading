import React, { useRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, MessageCircle, Globe, ChevronDown, PhoneCall, Send, Activity, UserCheck } from 'lucide-react'
import { useLang, LANGUAGES } from '../../context/LanguageContext.jsx'
import { useMarket } from '../../context/MarketContext.jsx'
import { useTrading } from '../../context/TradingContext.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'

export default function Navbar() {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [langOpen, setLangOpen]             = useState(false)
  const [mobileLangOpen, setMobileLangOpen] = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const langRef       = useRef(null)
  const mobileLangRef = useRef(null)
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const { marketStatus, nifty, bankNifty } = useMarket()
  const { user, token } = useTrading()
  const isClientLoggedIn = Boolean(token && user?.role === 'client')

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) setMobileLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { to: '/',         labelKey: 'nav_home' },
    { to: '/about',    labelKey: 'nav_about' },
    { to: '/plans',    labelKey: 'nav_plans' },
    { to: '/services', labelKey: 'nav_services' },
    { to: '/contact',  labelKey: 'nav_contact' },
  ]

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <header className="sticky top-0 z-50 bg-white"
      style={{
        borderBottom: '1px solid #e2e8f0',
        boxShadow: scrolled ? '0 4px 20px -2px rgba(15, 23, 42, 0.07)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
        transition: 'box-shadow 0.25s ease',
      }}>

      {/* ── Institutional Top Bar: Live NIFTY / BANK NIFTY + Market Status ── */}
      <div className="bg-[#0b1e3f] text-white text-[11px] py-1.5 px-3 sm:px-4 border-b border-[#1e3a8a]/40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
          
          {/* Row 1 / Left: Market Status condition badge + closure reason */}
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                marketStatus.isOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : marketStatus.reasonType === 'pre_open'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
              title={marketStatus.closeReason}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : marketStatus.reasonType === 'pre_open' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {marketStatus.statusText}
            </span>
            <span className="text-slate-300 text-[10px] font-semibold truncate">
              {marketStatus.isOpen
                ? '(NSE Live · 09:15 - 15:30 IST)'
                : `(${marketStatus.closeReason})`}
            </span>
          </div>

          {/* Row 2 / Right: Live NIFTY & BANK NIFTY Prices (both visible on mobile!) */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 font-mono text-[10px] sm:text-xs shrink-0 border-t border-white/10 pt-1 sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-1">
              <span className="text-slate-300 font-sans font-bold text-[10px]">NIFTY:</span>
              {nifty.price !== null ? (
                <>
                  <span className="font-extrabold text-white">{nifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`font-bold text-[10px] ${nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {nifty.percent >= 0 ? '+' : ''}{nifty.percent.toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-[10px]">Live…</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-300 font-sans font-bold text-[10px]">BANKNIFTY:</span>
              {bankNifty.price !== null ? (
                <>
                  <span className="font-extrabold text-white">{bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`font-bold text-[10px] ${bankNifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bankNifty.percent >= 0 ? '+' : ''}{bankNifty.percent.toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-[10px]">Live…</span>
              )}
            </div>
            <div className="hidden md:inline text-amber-300 font-sans font-extrabold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Startup India: DIPP291171
            </div>
          </div>

        </div>
      </div>

      {/* Corporate top micro-accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0b1e3f 0%, #1d4ed8 45%, #d4af37 80%, #f59e0b 100%)' }} />

      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0 py-1 min-w-0" aria-label="Javitri Trading Service Pvt. Ltd.">
            <div className="h-10 sm:h-14 w-10 sm:w-14 rounded-xl sm:rounded-2xl p-1 shadow-xs border-2 border-slate-200/90 bg-white group-hover:border-blue-400 transition-all flex items-center justify-center shrink-0">
              <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd." className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-lg font-black leading-tight text-[#0f172a] tracking-tight truncate">
                Javitri Trading <span className="text-[#1d4ed8]">Service</span>
              </p>
              <p className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-[#b45309]">Pvt. Ltd.</p>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center mx-2 xl:mx-4">
            {navLinks.map(({ to, labelKey }) => {
              const active = isActive(to)
              const label = t(labelKey) || labelKey
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-extrabold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#0b1e3f] !text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'text-[#334155] hover:text-[#1d4ed8] hover:bg-[#f8fafc]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* ── Desktop Right Actions ── */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">

            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all border border-[#e2e8f0] bg-[#f8fafc] text-[#0b1e3f] hover:border-[#cbd5e1]"
                aria-label="Select language"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <Globe className="h-3.5 w-3.5 text-[#1d4ed8] shrink-0" />
                <span>{currentLang.flag} {currentLang.nativeLabel}</span>
                <ChevronDown className="h-3 w-3 text-[#64748b] shrink-0"
                  style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-[60] min-w-[170px] bg-white border border-[#e2e8f0] shadow-xl py-1"
                  role="listbox"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      role="option"
                      aria-selected={lang === l.code}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors ${
                        lang === l.code ? 'text-[#b45309] bg-[#fffbeb] font-bold' : 'text-[#334155] hover:bg-[#f8fafc] hover:text-[#0b1e3f]'
                      }`}
                    >
                      <span className="text-base shrink-0">{l.flag}</span>
                      <div className="flex flex-col">
                        <span>{l.nativeLabel}</span>
                        {l.code !== 'en' && <span className="text-[10px] text-[#64748b]">{l.label}</span>}
                      </div>
                      {lang === l.code && <span className="ml-auto text-xs text-[#b45309] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-black transition-all bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe] hover:-translate-y-0.5 shadow-xs"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#1d4ed8] shrink-0" />
              <span>{t('nav_whatsapp')}</span>
            </a>

            {/* Telegram CTA */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-black transition-all bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 hover:-translate-y-0.5 shadow-xs"
              aria-label="Telegram"
            >
              <Send className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>{t('nav_telegram')}</span>
            </a>

            {/* Single Portal Login (or My Profile when client is signed in) */}
            {isClientLoggedIn ? (
              <Link
                to="/client/dashboard"
                className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-extrabold transition-all bg-[#1d4ed8] !text-white hover:bg-[#1e40af] shadow-xs hover:-translate-y-0.5"
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>My Profile</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-extrabold transition-all bg-[#0b1e3f] !text-white hover:bg-[#1d4ed8] shadow-xs hover:-translate-y-0.5"
              >
                <Shield className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span>{t('nav_admin')}</span>
              </Link>
            )}
          </div>

          {/* ── Mobile Right Actions ── */}
          <div className="flex lg:hidden items-center gap-2">

            {/* Mobile language button */}
            <div className="relative" ref={mobileLangRef}>
              <button
                onClick={() => setMobileLangOpen(v => !v)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold border border-[#e2e8f0] bg-[#f8fafc] text-[#334155]"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4 text-[#64748b] shrink-0" />
                <span>{currentLang.flag}</span>
              </button>

              {mobileLangOpen && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden min-w-[170px] bg-white border border-[#e2e8f0] shadow-xl py-1 z-[9999]"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setMobileLangOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left ${
                        lang === l.code ? 'text-[#b45309] bg-[#fffbeb] font-bold' : 'text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span className="text-base shrink-0">{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                      {lang === l.code && <span className="ml-auto text-xs text-[#b45309]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="p-2 rounded-lg border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6 shrink-0" /> : <Menu className="h-6 w-6 shrink-0" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden py-4 px-1 border-t border-[#e2e8f0] space-y-2 bg-white">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map(({ to, labelKey }) => {
                const active = isActive(to)
                const label = t(labelKey) || labelKey
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 text-sm rounded-2xl transition-all ${
                      active ? 'bg-[#0b1e3f] !text-white font-black shadow-sm' : 'text-[#334155] font-bold hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-xs ${active ? 'text-blue-300' : 'text-[#94a3b8]'}`}>→</span>
                  </Link>
                )
              })}
            </div>
            <div className="pt-3 mt-2 border-t border-[#e2e8f0] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8]"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>{t('nav_whatsapp')}</span>
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl bg-sky-50 border border-sky-200 text-sky-800"
                >
                  <Send className="h-4 w-4 shrink-0 text-sky-600" />
                  <span>{t('nav_telegram')}</span>
                </a>
              </div>
              {isClientLoggedIn ? (
                <Link
                  to="/client/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-black rounded-xl bg-[#1d4ed8] !text-white shadow-sm"
                >
                  <UserCheck className="h-4 w-4 shrink-0" />
                  <span>My Profile</span>
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-black rounded-xl bg-[#0b1e3f] !text-white shadow-sm"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{t('nav_admin')}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
