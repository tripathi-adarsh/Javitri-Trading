import React from 'react'

export default function StatCard({ icon: Icon, label, value, color = 'blue', loading = false, subtitle = '' }) {
  const colors = {
    blue:    { icon: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', val: '#0b1e3f' },
    gold:    { icon: '#b45309', bg: '#fffbeb', border: '#fde68a', val: '#0b1e3f' },
    navy:    { icon: '#0b1e3f', bg: '#f1f5f9', border: '#cbd5e1', val: '#0b1e3f' },
    emerald: { icon: '#059669', bg: '#ecfdf5', border: '#a7f3d0', val: '#0b1e3f' },
    amber:   { icon: '#d97706', bg: '#fffbeb', border: '#fde68a', val: '#0b1e3f' },
    red:     { icon: '#dc2626', bg: '#fef2f2', border: '#fecaca', val: '#0b1e3f' },
    violet:  { icon: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', val: '#0b1e3f' },
    teal:    { icon: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', val: '#0b1e3f' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#cbd5e1] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon className="h-5 w-5" style={{ color: c.icon }} />
        </div>
        {subtitle && (
          <span className="text-[11px] font-bold text-[#334155] bg-[#f8fafc] px-2.5 py-0.5 rounded-full border border-[#cbd5e1]">
            {subtitle}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-20 bg-[#f1f5f9] animate-pulse rounded-md" />
        ) : (
          <p className="text-2xl font-black text-[#0b1e3f] tracking-tight">
            {value ?? '0'}
          </p>
        )}
      </div>
    </div>
  )
}
