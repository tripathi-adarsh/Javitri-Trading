import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const CO = {
  name:    'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  short:   'Javitri Trading Service Pvt. Ltd.',
  addr:    'Main Bazar, Khakhreru, Fatehpur, Uttar Pradesh – 212656',
  phone:   '+91 9022487800',
  email:   'info@javitritrading.com',
  website: 'www.javitritrading.com',
  cin:     'U66190GJ2026PTC183862',
  gst:     '09AAHCJ6166E1ZD',
  dpiit:   'DIPP291171',
  logo:    '/logo.jpeg',
  sign:    '/signature.png',
}

function fmtINR(num) {
  const n = Number(num) || 0
  return `₹${n.toLocaleString('en-IN')}`
}

export async function generatePlanRequestPdfBlob(regId) {
  const el = document.getElementById('plan-req-pdf-doc')
  if (!el) throw new Error('PDF template element not found')

  const canvas = await html2canvas(el, {
    scale: 2.2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 720,
    windowWidth: 720,
  })

  const pageWidth = 720
  const pageHeight = canvas.height / 2.2
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pageWidth, pageHeight] })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight)

  const safeId = (regId || 'Confirmation').replace(/[^a-zA-Z0-9-_]/g, '')
  return {
    blob: pdf.output('blob'),
    filename: `Javitri-Plan-${safeId}.pdf`,
  }
}

export function PlanRequestPdf({ data }) {
  if (!data) return null

  const dealAmt  = Number(data.plan?.dealAmountINR || 0)
  const dailyAmt = Number(data.plan?.proposedDailyINR || 0)
  const weeklyAmt  = dailyAmt * 5
  const monthlyAmt = dailyAmt * 22
  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : 'https://javitritrading.com/admin/login'

  const navy   = '#0b1e3f'
  const blue   = '#1d4ed8'
  const gold   = '#c8983a'
  const dark   = '#0f172a'
  const muted  = '#475569'
  const subtle = '#64748b'
  const border = '#e2e8f0'
  const softBg = '#f8fafc'

  return (
    <div
      id="plan-req-pdf-doc"
      style={{
        width: '720px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
        color: dark,
        boxSizing: 'border-box',
      }}
    >
      {/* Top Corporate Bar */}
      <div style={{ height: '7px', background: `linear-gradient(90deg, ${navy} 0%, ${blue} 50%, ${gold} 100%)` }} />

      {/* Company Header */}
      <div style={{ padding: '22px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '62px', height: '62px', borderRadius: '10px', border: `1px solid ${border}`,
            padding: '4px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img
              src={CO.logo}
              alt="Logo"
              style={{ width: '52px', height: '52px', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: navy, letterSpacing: '0.2px' }}>{CO.name}</div>
            <div style={{ fontSize: '10px', color: muted, marginTop: '3px' }}>Registered Office: {CO.addr}</div>
            <div style={{ fontSize: '10px', color: muted, marginTop: '2px' }}>
              Phone: {CO.phone} &nbsp;|&nbsp; Email: {CO.email} &nbsp;|&nbsp; {CO.website}
            </div>
            <div style={{ fontSize: '9.5px', fontWeight: '700', color: '#92400e', marginTop: '3px' }}>
              Startup India: {CO.dpiit} &nbsp;|&nbsp; CIN: {CO.cin} &nbsp;|&nbsp; GSTIN: {CO.gst}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            display: 'inline-block', padding: '5px 10px', borderRadius: '6px',
            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
            fontSize: '10px', fontWeight: '800', color: blue, textTransform: 'uppercase', letterSpacing: '0.8px',
          }}>
            Plan Confirmation
          </div>
          <div style={{ fontSize: '10px', color: subtle, marginTop: '6px' }}>
            Date: <strong style={{ color: dark }}>{data.submittedDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
          {data.regId && (
            <div style={{ fontSize: '10px', color: subtle, marginTop: '2px' }}>
              Reg. ID: <strong style={{ color: navy }}>{data.regId}</strong>
            </div>
          )}
          {data.requestNumber && (
            <div style={{ fontSize: '10px', color: subtle, marginTop: '2px' }}>
              Request No: <strong style={{ color: blue }}>{data.requestNumber}</strong>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '1px', margin: '0 28px', backgroundColor: border }} />

      {/* Two-Column Client & Registration Summary */}
      <div style={{ padding: '16px 28px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, backgroundColor: softBg, border: `1px solid ${border}`, borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: navy, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Client Information
          </div>
          {[
            ['Full Name', data.clientName || '—'],
            ['Mobile', data.mobile || '—'],
            ['Email', data.credentials?.email || data.email || '—'],
            ['Location', [data.city, data.state, data.postalCode].filter(Boolean).join(', ') || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: subtle }}>{k}:</span>
              <span style={{ fontWeight: '700', color: dark, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, backgroundColor: softBg, border: `1px solid ${border}`, borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: navy, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Application Reference
          </div>
          {[
            ['Registration ID', data.regId || '—'],
            ['Plan Request No.', data.requestNumber || 'Pending Assignment'],
            ['Nominee', data.nomineeName ? `${data.nomineeName}${data.nomineeRelation ? ` (${data.nomineeRelation})` : ''}` : 'On Record'],
            ['Settlement Bank', data.bankName || 'On Record'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: subtle }}>{k}:</span>
              <span style={{ fontWeight: '700', color: dark, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requested Plan Details */}
      <div style={{ padding: '0 28px 16px' }}>
        <div style={{
          border: '1.5px solid #bfdbfe',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: navy, color: '#ffffff', padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Requested Investment Plan Details
            </span>
            <span style={{
              fontSize: '10.5px', fontWeight: '800', color: '#fde68a',
              backgroundColor: 'rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: '999px',
            }}>
              {data.plan?.name || 'Selected Plan'}
            </span>
          </div>

          <div style={{ padding: '14px 16px', backgroundColor: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${border}`, textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', color: subtle, fontSize: '10px', textTransform: 'uppercase' }}>Plan Name</th>
                  <th style={{ padding: '6px 8px', color: subtle, fontSize: '10px', textTransform: 'uppercase', textAlign: 'right' }}>Investment Amount</th>
                  <th style={{ padding: '6px 8px', color: subtle, fontSize: '10px', textTransform: 'uppercase', textAlign: 'right' }}>Daily Payout*</th>
                  <th style={{ padding: '6px 8px', color: subtle, fontSize: '10px', textTransform: 'uppercase', textAlign: 'right' }}>Weekly (5 Days)</th>
                  <th style={{ padding: '6px 8px', color: subtle, fontSize: '10px', textTransform: 'uppercase', textAlign: 'right' }}>Monthly (~22 Days)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 8px', fontWeight: '800', color: navy }}>{data.plan?.name || '—'}</td>
                  <td style={{ padding: '10px 8px', fontWeight: '900', color: dark, textAlign: 'right' }}>{fmtINR(dealAmt)}</td>
                  <td style={{ padding: '10px 8px', fontWeight: '800', color: blue, textAlign: 'right' }}>{fmtINR(dailyAmt)} / day</td>
                  <td style={{ padding: '10px 8px', fontWeight: '700', color: dark, textAlign: 'right' }}>{fmtINR(weeklyAmt)}</td>
                  <td style={{ padding: '10px 8px', fontWeight: '800', color: '#92400e', textAlign: 'right' }}>{fmtINR(monthlyAmt)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '9.5px', color: subtle, marginTop: '8px', borderTop: `1px solid ${border}`, paddingTop: '6px' }}>
              * Operating Cycle: Monday to Friday (5 trading sessions/week, ~22 sessions/month). Saturday &amp; Sunday closed (market holidays).
            </div>
          </div>
        </div>
      </div>

      {/* Client Portal Login Credentials */}
      <div style={{ padding: '0 28px 16px' }}>
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fcd34d',
          borderRadius: '12px',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '900', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Client Portal Login Credentials
            </span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: blue }}>{loginUrl}</span>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', backgroundColor: '#ffffff', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px' }}>
              <div style={{ fontSize: '9.5px', fontWeight: '700', color: subtle, textTransform: 'uppercase' }}>Login Email</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: navy, marginTop: '2px' }}>
                {data.credentials?.email || data.email || '—'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '220px', backgroundColor: '#ffffff', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px' }}>
              <div style={{ fontSize: '9.5px', fontWeight: '700', color: subtle, textTransform: 'uppercase' }}>
                {data.credentials?.password ? 'Generated Password' : 'Password'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: blue, marginTop: '2px' }}>
                {data.credentials?.password || 'Use your existing portal password'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#78350f', marginTop: '8px', lineHeight: '1.45' }}>
            Use these credentials to sign in at <strong>{loginUrl}</strong> to view your active plans, track received payments &amp; daily payouts, and submit payment requests directly to Admin.
          </div>
        </div>
      </div>

      {/* 24-Hour Callback & Anti-Fraud Notice */}
      <div style={{ padding: '0 28px 16px', display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <div style={{ flex: 1.4, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: navy, marginBottom: '4px' }}>
            Next Steps &amp; Dedicated Support
          </div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: blue, marginBottom: '4px' }}>
            Our corporate support team will contact you within 24 business hours.
          </div>
          <div style={{ fontSize: '10px', color: muted, lineHeight: '1.5' }}>
            Working Hours: Monday to Friday (09:00 AM – 06:00 PM IST)
            <br />
            WhatsApp / Call: {CO.phone} &nbsp;|&nbsp; Email: {CO.email}
            <br />
            Security Notice: We never ask for Net Banking passwords, ATM PIN, UPI PIN, or OTP.
          </div>
        </div>

        <div style={{ flex: 0.7, border: `1px solid ${border}`, borderRadius: '10px', padding: '10px 14px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <img
            src={CO.sign}
            alt="Signature"
            style={{ height: '48px', maxWidth: '160px', objectFit: 'contain', margin: '0 auto 4px', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{ fontSize: '10px', fontWeight: '800', color: navy }}>For {CO.short}</div>
          <div style={{ fontSize: '9px', color: subtle }}>Authorised Signatory</div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${navy} 0%, ${gold} 50%, ${navy} 100%)` }} />
      <div style={{ backgroundColor: softBg, padding: '8px 28px', textAlign: 'center', fontSize: '9px', color: subtle }}>
        {CO.name} · CIN: {CO.cin} · GSTIN: {CO.gst} · Startup India: {CO.dpiit} · All disputes subject to Fatehpur, UP jurisdiction.
      </div>
    </div>
  )
}
