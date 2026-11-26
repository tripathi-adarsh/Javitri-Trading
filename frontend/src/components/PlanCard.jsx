import React from 'react'
import { Check, X, Zap, Star, Crown } from 'lucide-react'
import Badge from './ui/Badge.jsx'
import Button from './ui/Button.jsx'

const colorConfig = {
  teal: {
    icon: 'bg-blue-50 border-blue-200 text-[#2563eb]',
    badge: 'blue',
    accent: 'text-[#2563eb]',
    border: 'border-[#e2e8f0]',
    hoverBorder: 'hover:border-[#2563eb]',
    glow: 'hover:shadow-md',
    button: 'outline',
  },
  emerald: {
    icon: 'bg-blue-50 border-blue-200 text-[#2563eb]',
    badge: 'blue',
    accent: 'text-[#2563eb]',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-[#2563eb]',
    glow: 'hover:shadow-lg',
    button: 'primary',
  },
  violet: {
    icon: 'bg-indigo-50 border-indigo-200 text-[#4f46e5]',
    badge: 'indigo',
    accent: 'text-[#4f46e5]',
    border: 'border-[#e2e8f0]',
    hoverBorder: 'hover:border-[#4f46e5]',
    glow: 'hover:shadow-md',
    button: 'secondary',
  },
}

const planIcons = {
  teal: Zap,
  emerald: Star,
  violet: Crown,
}

export default function PlanCard({ plan, isSelected, onSelect }) {
  const cfg = colorConfig[plan.color] || colorConfig.emerald
  const Icon = planIcons[plan.color] || Star

  return (
    <div
      className={`
        relative flex flex-col rounded-3xl border bg-white p-6 sm:p-7 transition-all duration-300 cursor-pointer shadow-sm
        ${cfg.border} ${cfg.hoverBorder} ${cfg.glow}
        ${isSelected ? 'ring-2 ring-[#2563eb] shadow-md border-[#2563eb]' : ''}
      `}
      onClick={() => onSelect(plan)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${plan.name} plan at ₹${plan.price} per month`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(plan)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] rounded-t-3xl" />

      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge color="blue">{plan.badge}</Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${cfg.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        {isSelected && (
          <div className="h-6 w-6 rounded-full bg-[#2563eb] flex items-center justify-center shadow-sm">
            <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-extrabold text-[#0f172a]">{plan.name}</h3>
      <p className="text-xs sm:text-sm text-[#475569] mt-1 mb-5">{plan.tagline}</p>

      {/* Price */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-100">
        <div className="flex items-baseline gap-1">
          <span className="text-[#64748b] text-sm font-bold">₹</span>
          <span className="text-3xl font-extrabold text-[#0f172a]">
            {Number(plan.price || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[#64748b] text-xs font-semibold">/ mo</span>
        </div>
        <p className="text-[11px] text-[#2563eb] font-semibold mt-1">Monday to Friday Operational Cycle</p>
      </div>

      {/* Features included */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features && plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#334155]">
            <Check className="h-4 w-4 shrink-0 mt-0.5 text-[#2563eb] stroke-[2.5]" />
            <span>{f}</span>
          </li>
        ))}
        {plan.notIncluded && plan.notIncluded.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#94a3b8] line-through">
            <X className="h-4 w-4 shrink-0 mt-0.5 text-[#cbd5e1]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Select button */}
      <Button
        variant={isSelected ? 'primary' : 'outline'}
        className="w-full justify-center !text-xs !py-3"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(plan)
        }}
      >
        {isSelected ? '✓ Selected Plan' : 'Select This Plan'}
      </Button>
    </div>
  )
}
