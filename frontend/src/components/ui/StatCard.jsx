import React from 'react'

export default function StatCard({ icon: Icon, label, value, color = 'gold', loading = false }) {
  const colors = {
    gold:    { icon:'#d4a843', bg:'rgba(212,168,67,0.12)', border:'rgba(212,168,67,0.3)' },
    emerald: { icon:'#4ade80', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.25)' },
    amber:   { icon:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.25)' },
    red:     { icon:'#f87171', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)' },
    blue:    { icon:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)' },
    violet:  { icon:'#a78bfa', bg:'rgba(139,92,246,0.1)',  border:'rgba(139,92,246,0.25)' },
    teal:    { icon:'#2dd4bf', bg:'rgba(45,212,191,0.1)',  border:'rgba(45,212,191,0.25)' },
  }
  const c = colors[color] || colors.gold

  return (
    <div style={{
      background: 'rgba(15,36,96,0.38)',
      border: '1px solid rgba(212,168,67,0.15)',
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        height: '42px', width: '42px', borderRadius: '12px',
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '20px', height: '20px', color: c.icon }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: '#7090a8', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          {label}
        </p>
        {loading
          ? <div style={{ height: '24px', width: '64px', background: 'rgba(212,168,67,0.1)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          : <p style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4f8', lineHeight: 1 }}>{value ?? '—'}</p>
        }
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
