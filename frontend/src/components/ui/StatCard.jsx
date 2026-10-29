import React from 'react'

export default function StatCard({ icon: Icon, label, value, color = 'emerald', loading = false }) {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red:     'bg-red-500/10 border-red-500/20 text-red-400',
    blue:    'bg-blue-500/10 border-blue-500/20 text-blue-400',
    violet:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
    teal:    'bg-teal-500/10 border-teal-500/20 text-teal-400',
  }
  const cls = colors[color] || colors.emerald

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${cls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {loading
          ? <div className="h-6 w-16 bg-gray-700 rounded animate-pulse mt-1" />
          : <p className="text-xl font-bold text-white">{value ?? '—'}</p>
        }
      </div>
    </div>
  )
}
