import React from 'react'
import { Check, X, Zap, Star, Crown } from 'lucide-react'
import Badge from './ui/Badge.jsx'
import Button from './ui/Button.jsx'

const colorConfig = {
  teal: {
    icon: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    badge: 'teal',
    accent: 'text-teal-400',
    border: 'border-teal-500/20',
    glow: 'hover:border-teal-500/40 hover:shadow-teal-500/10',
    button: 'outline',
  },
  emerald: {
    icon: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    badge: 'emerald',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'hover:border-emerald-500/60 hover:shadow-emerald-500/15',
    button: 'primary',
  },
  violet: {
    icon: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    badge: 'violet',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    button: 'secondary',
  },
}

const planIcons = {
  teal: Zap,
  emerald: Star,
  violet: Crown,
}

export default function PlanCard({ plan, isSelected, onSelect }) {
  const cfg = colorConfig[plan.color] || colorConfig.teal
  const Icon = planIcons[plan.color] || Zap

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border bg-gray-900/60 p-6 transition-all duration-300 cursor-pointer
        ${cfg.border} ${cfg.glow}
        ${isSelected ? 'ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-500/10' : ''}
        hover:shadow-xl
      `}
      onClick={() => onSelect(plan)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${plan.name} plan at ₹${plan.price} per month`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(plan)}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge color={plan.color}>{plan.badge}</Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${cfg.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        {isSelected && (
          <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="text-sm text-gray-400 mt-1 mb-5">{plan.tagline}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-gray-400 text-sm">₹</span>
          <span className={`text-4xl font-extrabold ${cfg.accent}`}>
            {plan.price.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-sm">/ mo</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">+ 18% GST applicable</p>
      </div>

      {/* Features included */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.accent}`} />
            {f}
          </li>
        ))}
        {plan.notIncluded.map((f, i) => (
          <li key={`no-${i}`} className="flex items-start gap-2.5 text-sm text-gray-600 line-through">
            <X className="h-4 w-4 shrink-0 mt-0.5 text-gray-700" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={isSelected ? 'primary' : cfg.button}
        size="md"
        className="w-full"
        onClick={(e) => { e.stopPropagation(); onSelect(plan) }}
      >
        {isSelected ? '✓ Selected' : `Choose ${plan.name}`}
      </Button>
    </div>
  )
}
