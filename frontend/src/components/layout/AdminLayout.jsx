import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Link2, UserCheck, FileSearch,
  BarChart3, ShoppingCart, CreditCard, Scale, FileText,
  ClipboardList, Settings, LogOut, TrendingUp, ChevronLeft,
  ChevronRight, Shield, Menu, X, Wallet, MessageSquare
} from 'lucide-react'
import { useTrading } from '../../context/TradingContext.jsx'
import { api } from '../../utils/api.js'

const NAV_ITEMS = [
  { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard',          roles: ['admin','super_admin','employee'] },
  { to: '/admin/employees',        icon: Users,           label: 'Employees',           roles: ['admin','super_admin'] },
  { to: '/admin/clients',          icon: UserCheck,       label: 'Clients',             roles: ['admin','super_admin','employee'] },
  { to: '/admin/kyc-review',       icon: FileSearch,      label: 'KYC Review',          roles: ['admin','super_admin'] },
  { to: '/admin/plan-requests',    icon: TrendingUp,      label: 'Plan Requests',       roles: ['admin','super_admin','employee'] },
  { to: '/admin/payout-reports',   icon: Wallet,          label: 'Payout Reports',      roles: ['admin','super_admin','employee'] },
  { to: '/admin/contact-messages', icon: MessageSquare,   label: 'Contact Messages',    roles: ['admin','super_admin'] },
  { to: '/admin/plans',            icon: BarChart3,       label: 'Plans Configurations',roles: ['admin','super_admin'] },
  { to: '/admin/audit-logs',       icon: FileText,        label: 'Audit Logs',          roles: ['admin','super_admin'] },
]

/* ── colours — lighter theme, better readability ── */
const THEME = {
  bg:          '#0e1a35',
  sidebar:     '#111f3d',
  border:      'rgba(212,168,67,0.22)',
  gold:        '#d4a843',
  goldMuted:   'rgba(212,168,67,0.6)',
  activeB:     'rgba(212,168,67,0.15)',
  activeBorder:'rgba(212,168,67,0.45)',
  text:        '#dde8f5',
  textMuted:   '#7090a8',
  hover:       'rgba(212,168,67,0.08)',
}

export default function AdminLayout({ children }) {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout, token } = useTrading()

  const role = user?.role || 'employee'
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  const handleLogout = async () => {
    try { await api.auth.logout() } catch { /* ignore */ }
    logout()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div style={{ borderBottom: `1px solid ${THEME.border}`, padding: collapsed ? '14px 12px' : '14px 16px' }}
        className="flex items-center gap-3">
        <div style={{ background: '#fff', borderRadius: '10px', padding: '4px', flexShrink: 0 }}>
          <img src="/logo.jpeg" alt="Javitri" className={collapsed ? 'h-7 w-7' : 'h-9 w-9'} style={{ objectFit:'contain', borderRadius:'6px', display:'block' }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate" style={{ color: '#f0f4f8' }}>Admin Panel</p>
            <p className="text-[10px] truncate" style={{ color: THEME.gold }}>Javitri Trading</p>
          </div>
        )}
      </div>

      {/* User badge */}
      {!collapsed && (
        <div style={{ borderBottom: `1px solid ${THEME.border}`, padding: '10px 16px' }}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: 'rgba(212,168,67,0.15)', color: THEME.gold, border: `1px solid ${THEME.activeBorder}` }}>
              {user?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#f0f4f8' }}>
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] capitalize" style={{ color: THEME.gold }}>
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5" style={{ padding: '10px 8px' }}>
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link key={to} to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                background:     active ? THEME.activeB : 'transparent',
                border:         `1px solid ${active ? THEME.activeBorder : 'transparent'}`,
                color:          active ? THEME.gold : THEME.text,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = THEME.hover; e.currentTarget.style.color = '#f0f4f8' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.text } }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: active ? THEME.gold : THEME.textMuted }} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Gold line */}
      <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,${THEME.gold},transparent)`, margin:'0 12px' }} />

      {/* Logout */}
      <div style={{ padding: '8px' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', color: THEME.textMuted, border:'1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=THEME.textMuted; e.currentTarget.style.borderColor='transparent' }}
          title={collapsed ? 'Logout' : undefined}>
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: THEME.bg }}>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-58'}`}
        style={{ background: THEME.sidebar, borderRight: `1px solid ${THEME.border}`, width: collapsed ? '64px' : '224px' }}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute flex items-center justify-center h-6 w-6 rounded-full z-20 transition-colors"
          style={{ top:'68px', left: collapsed ? '52px' : '212px', background:'#0f2460', border:`1px solid ${THEME.border}`, color: THEME.gold }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='#0f2460'}
          aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex flex-col w-56 h-full"
            style={{ background: THEME.sidebar, borderRight: `1px solid ${THEME.border}` }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 shrink-0"
          style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: THEME.text }}
            onMouseEnter={e => e.currentTarget.style.background = THEME.hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div style={{ background:'#fff', borderRadius:'8px', padding:'3px' }}>
              <img src="/logo.jpeg" alt="Javitri" className="h-7 w-7 object-contain rounded" />
            </div>
            <span className="text-sm font-bold" style={{ color:'#f0f4f8' }}>Admin Panel</span>
          </div>

          {/* Desktop info */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs" style={{ color: THEME.textMuted }}>
            <Shield className="h-3.5 w-3.5" style={{ color: THEME.gold }} />
            <span className="capitalize">{role.replace('_',' ')}</span>
            <span>·</span>
            <span>{user?.email}</span>
          </div>

          {/* Back to site */}
          <Link to="/"
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ color: THEME.gold, border:`1px solid ${THEME.activeBorder}`, background: THEME.activeB }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background=THEME.activeB}>
            ← Public Site
          </Link>
        </header>

        {/* Gold accent line */}
        <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.4),transparent)`, flexShrink:0 }} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
