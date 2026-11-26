import React from 'react'

const variants = {
  primary:
    'bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#1e40af] hover:to-[#1d4ed8] text-white font-extrabold shadow-[0_4px_14px_rgba(29,78,216,0.35)] hover:shadow-[0_6px_20px_rgba(29,78,216,0.45)] hover:-translate-y-0.5 active:translate-y-0 border border-[#1e40af]',
  gold:
    'bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] hover:from-[#92400e] hover:to-[#d97706] text-white font-extrabold shadow-[0_4px_16px_rgba(180,83,9,0.35)] hover:shadow-[0_6px_22px_rgba(180,83,9,0.45)] hover:-translate-y-0.5 active:translate-y-0 border border-amber-600',
  navy:
    'bg-[#0b1e3f] hover:bg-[#0f2744] text-white font-extrabold shadow-[0_4px_14px_rgba(11,30,63,0.3)] hover:shadow-[0_6px_20px_rgba(11,30,63,0.4)] hover:-translate-y-0.5 active:translate-y-0 border border-[#0a192f]',
  secondary:
    'bg-white hover:bg-[#f8fafc] text-[#0b1e3f] font-extrabold border-2 border-[#cbd5e1] hover:border-[#1d4ed8] shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'bg-white hover:bg-blue-50 text-[#1d4ed8] font-extrabold border-2 border-[#1d4ed8] hover:border-[#1e40af] hover:-translate-y-0.5 active:translate-y-0',
  outlineGold:
    'bg-white hover:bg-amber-50 text-[#b45309] font-extrabold border-2 border-[#d97706] hover:border-[#b45309] hover:-translate-y-0.5 active:translate-y-0',
  outlineNavy:
    'bg-white hover:bg-slate-100 text-[#0b1e3f] font-extrabold border-2 border-[#0b1e3f] hover:border-[#0a192f] hover:-translate-y-0.5 active:translate-y-0',
  blueLight:
    'bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] font-extrabold border border-[#bfdbfe] hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'text-[#334155] hover:text-[#0b1e3f] hover:bg-[#f1f5f9] font-bold active:translate-y-0',
  danger:
    'bg-[#dc2626] hover:bg-[#b91c1c] text-white font-extrabold shadow-[0_4px_14px_rgba(220,38,38,0.28)] hover:-translate-y-0.5 active:translate-y-0 border border-[#b91c1c]',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  xl: 'px-8 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl
        transition-all duration-200 cursor-pointer select-none tracking-tight
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
        focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:ring-offset-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
