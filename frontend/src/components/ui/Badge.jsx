import React from 'react'

const colorMap = {
  gold:    'bg-gradient-to-r from-amber-50 to-yellow-50 text-[#92400e] border-[#fde68a] font-extrabold shadow-2xs',
  navy:    'bg-[#0b1e3f] text-white border-[#0a192f] font-extrabold',
  blue:    'bg-blue-50 text-[#1d4ed8] border-blue-200 font-extrabold',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  teal:    'bg-teal-50 text-teal-800 border-teal-300 font-bold',
  violet:  'bg-violet-50 text-violet-800 border-violet-300 font-bold',
  amber:   'bg-amber-50 text-amber-800 border-amber-300 font-bold',
  red:     'bg-red-50 text-red-800 border-red-300 font-bold',
  gray:    'bg-slate-100 text-slate-800 border-slate-300 font-bold',
}

export default function Badge({ children, color = 'blue', className = '' }) {
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
