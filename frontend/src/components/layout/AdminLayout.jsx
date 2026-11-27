import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, FileSearch,
  BarChart3, TrendingUp, FileText,
  LogOut, ChevronLeft, ChevronRight,
  Shield, Menu, Wallet, MessageSquare, ExternalLink, ArrowRight
} from 'lucide-react'
import { useTrading } from '../../context/TradingContext.jsx'
import { api } from '../../utils/api.js'

const NAV_ITEMS = [
  { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard',           roles: ['admin','super_admin','employee'] },
  { to: '/admin/employees',        icon: Users,           label: 'Employees',            roles: ['admin','super_admin'] },
  { to: '/admin/clients',          icon: UserCheck,       label: 'Clients',              roles: ['admin','super_admin','employee'] },
  { to: '/admin/kyc-review',       icon: FileSearch,      label: 'KYC Review',           roles: ['admin','super_admin'] },
  { to: '/admin/plan-requests',    icon: TrendingUp,      label: 'Plan Requests',        roles: ['admin','super_admin','employee'] },
  { to: '/admin/payment-requests', icon: Wallet,          label: 'Payment Requests',     roles: ['admin','super_admin','employee'] },
  { to: '/admin/payout-reports',   icon: BarChart3,       label: 'Payout Reports',       roles: ['admin','super_admin','employee'] },
  { to: '/admin/contact-messages', icon: MessageSquare,   label: 'Contact Messages',     roles: ['admin','super_admin'] },
  { to: '/admin/plans',            icon: BarChart3,       label: 'Plans Configuration',  roles: ['admin','super_admin'] },
  { to: '/admin/audit-logs',       icon: FileText,        label: 'Audit Logs',           roles: ['admin','super_admin'] },
]

export default function AdminLayout({ children }) {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, token, logout } = useTrading()

  const role = user?.role || 'employee'
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  // Determine active item for breadcrumb
  const currentItem = visibleItems.find(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
  const pageTitle = currentItem?.label || 'Administration'

  const handleLogout = async () => {
    try { await api.auth.logout(token) } catch { /* ignore */ }
    logout()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white select-none">

      {/* Brand header */}
      <div className={`border-b border-[#e2e8f0] flex items-center gap-3 ${collapsed ? 'p-3 justify-center' : 'px-5 py-4'}`}>
        <div className="bg-white rounded-xl p-1 shrink-0 border border-[#e2e8f0] shadow-sm flex items-center justify-center">
          <img src="/logo.jpeg" alt="Javitri Trading" className={collapsed ? 'h-7 w-7' : 'h-8 w-8'}
            style={{ objectFit: 'contain', borderRadius: '6px' }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-black text-[#0b1e3f] leading-tight truncate tracking-tight">Javitri Trading Service</p>
            <p className="text-[10px] text-[#b45309] font-black uppercase tracking-wider">Pvt. Ltd. · Admin</p>
          </div>
        )}
      </div>

      {/* User profile snippet */}
      {!collapsed && (
        <div className="border-b border-[#e2e8f0] px-5 py-3.5 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black bg-gradient-to-br from-blue-50 to-amber-50 text-[#0b1e3f] border border-blue-200 shadow-xs">
              {user?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0b1e3f] truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                <p className="text-[10px] text-[#64748b] font-semibold capitalize truncate">
                  {role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!collapsed && (
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 pt-2 pb-1">
            Menu Navigation
          </p>
        )}
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${
                active
                  ? 'bg-blue-50/70 text-[#1d4ed8] font-bold border-l-4 border-[#1d4ed8] shadow-xs'
                  : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0b1e3f] border-l-4 border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-[#1d4ed8]' : 'text-[#64748b]'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer controls */}
      <div className="border-t border-[#e2e8f0] p-3 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] transition-all ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title={collapsed ? 'Public Site' : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-[#64748b]" />
          {!collapsed && <span>View Public Website</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-500" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 shrink-0 relative bg-white border-r border-[#e2e8f0] shadow-xs ${
          collapsed ? 'w-18' : 'w-60'
        }`}
      >
        <SidebarContent />

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex items-center justify-center h-6 w-6 rounded-full z-20 bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] shadow-xs cursor-pointer transition-colors"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex flex-col w-64 h-full bg-white border-r border-[#e2e8f0] shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-white border-b border-[#e2e8f0] shadow-xs">
          {/* Mobile hamburger + Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-[#475569] hover:bg-[#f8fafc] border border-[#e2e8f0] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="Javitri" className="h-7 w-7 object-contain rounded" />
              <span className="text-sm font-bold text-[#0f172a]">Admin</span>
            </div>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#64748b]">
            <Link to="/admin/dashboard" className="text-[#64748b] hover:text-[#1d4ed8] transition-colors">
              Admin Portal
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#cbd5e1]" />
            <span className="text-[#0b1e3f] font-black">{pageTitle}</span>
          </div>

          {/* Right section: security pill & profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8fafc] border border-amber-200/80 text-xs shadow-xs">
              <Shield className="h-3.5 w-3.5 text-[#b45309]" />
              <span className="font-black text-[#0b1e3f] capitalize">{role.replace('_', ' ')}</span>
              <span className="text-[#cbd5e1]">|</span>
              <span className="text-[#64748b] font-medium">{user?.email}</span>
            </div>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:text-[#1d4ed8] hover:bg-[#f8fafc] transition-all"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Top corporate tri-color accent line */}
        <div className="h-1 royal-gold-line shrink-0" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  )
}
