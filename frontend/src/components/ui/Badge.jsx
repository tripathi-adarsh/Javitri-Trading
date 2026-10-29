import React from 'react'

const colorMap = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  teal:    'bg-teal-500/15 text-teal-400 border-teal-500/30',
  violet:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  amber:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red:     'bg-red-500/15 text-red-400 border-red-500/30',
  gray:    'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export default function Badge({ children, color = 'emerald', className = '' }) {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
      ${colorMap[color] || colorMap.gray}
      ${className}
    `}>
      {children}
    </span>
  )
}
