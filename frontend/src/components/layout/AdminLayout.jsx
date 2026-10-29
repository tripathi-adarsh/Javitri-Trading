import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Link2, UserCheck, FileSearch,
  BarChart3, ShoppingCart, CreditCard, Scale, FileText,
  ClipboardList, Settings, LogOut, TrendingUp, ChevronLeft,
  ChevronRight, Shield, Menu, X
} from 'lucide-react'
import { useTrading } from '../../context/TradingContext.jsx'
import { api } from '../../utils/api.js'

const NAV_ITEMS = [
  { to: '/admin/dashboard',         icon: LayoutDashboard, label: 'Dashboard',          roles: ['admin','super_admin','employee'] },
  { to: '/admin/employees',         icon: Users,           label: 'Employees',           roles: ['admin','super_admin'] },
  { to: '/admin/registration-links',icon: Link2,           label: 'Registration Links',  roles: ['admin','super_admin','employee'] },
  { to: '/admin/clients',           icon: UserCheck,       label: 'Clients',             roles: ['admin','super_admin','employee'] },
  { to: '/admin/kyc-review',        icon: FileSearch,      label: 'KYC Review',          roles: ['admin','super_admin'] },
  { to: '/admin/plans',             icon: BarChart3,       label: 'Plans',               roles: ['admin','super_admin'] },
  { to: '/admin/orders',            icon: ShoppingCart,    label: 'Orders',              roles: ['admin','super_admin'] },
  { to: '/admin/payments',          icon: CreditCard,      label: 'Payments',            roles: ['admin','super_admin'] },
  { to: '/admin/terms',             icon: Scale,           label: 'Terms & Policies',    roles: ['admin','super_admin'] },
  { to: '/admin/reports',           icon: ClipboardList,   label: 'Reports',             roles: ['admin','super_admin'] },
  { to: '/admin/audit-logs',        icon: FileText,        label: 'Audit Logs',          roles: ['admin','super_admin'] },
  { to: '/admin/settings',          icon: Settings,        label: 'Settings',            roles: ['admin','super_admin'] },
]

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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
      <div className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
        <img
          src="/logo.jpeg"
          alt="Javitri Trading Service"
          className={collapsed ? 'h-8 w-8 object-contain rounded' : 'h-10 w-auto object-contain'}
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-emerald-400/80 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                ${active
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-gray-800 bg-gray-950 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -right-3 h-6 w-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
          style={{ left: collapsed ? '52px' : '228px' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-400" /> : <ChevronLeft className="h-3 w-3 text-gray-400" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-60 h-full bg-gray-950 border-r border-gray-800 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <img src="/logo.jpeg" alt="Javitri Trading" className="h-8 w-auto object-contain" />
            <span className="text-sm font-semibold text-white">Admin Panel</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <span className="capitalize">{role.replace('_', ' ')}</span>
            <span>·</span>
            <span>{user?.email}</span>
          </div>
          <Link to="/" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">
            ← Public Site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
