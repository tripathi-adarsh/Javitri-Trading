import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { FileText, Download, Loader2, ChevronDown } from 'lucide-react'

/* ─── Company ─────────────────────────────────────────────── */
const CO = {
  name:      'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  short:     'Javitri Trading Service Pvt. Ltd.',
  addr1:     'Main Bazar, Khakhreru, Fatehpur',
  addr2:     'Uttar Pradesh – 212656',
  phone:     '+91 9022487800',
  email:     'info@javitritrading.com',
  website:   'www.javitritrading.com',
  cin:       'U66190GJ2026PTC183862',
  gst:       '09AAHCJ6166E1ZD',
  pan:       'AAHCJ6166E',
  logo:      '/logo.jpeg',
  sign:      '/signature.png',
  state:     'Uttar Pradesh',
  stateCode: '09',
}
const CGST_R = 9, SGST_R = 9

/* ─── Plans ────────────────────────────────────────────────── */
const PLANS = [
  { label:'Plan 1  – ₹10,000',    value:'Plan 1',  amount:10000   },
  { label:'Plan 2  – ₹30,000',    value:'Plan 2',  amount:30000   },
  { label:'Plan 3  – ₹50,000',    value:'Plan 3',  amount:50000   },
  { label:'Plan 4  – ₹1,00,000',  value:'Plan 4',  amount:100000  },
  { label:'Plan 5  – ₹3,00,000',  value:'Plan 5',  amount:300000  },
  { label:'Plan 6  – ₹5,00,000',  value:'Plan 6',  amount:500000  },
  { label:'Plan 7  – ₹10,00,000', value:'Plan 7',  amount:1000000 },
  { label:'Plan 8  – ₹15,00,000', value:'Plan 8',  amount:1500000 },
  { label:'Plan 9  – ₹20,00,000', value:'Plan 9',  amount:2000000 },
  { label:'Plan 10 – ₹50,00,000', value:'Plan 10', amount:5000000 },
]
const DURATIONS = [
  { label:'1 Month',  value:'1m',  months:1  },
  { label:'2 Months', value:'2m',  months:2  },
  { label:'3 Months', value:'3m',  months:3  },
  { label:'6 Months', value:'6m',  months:6  },
  { label:'1 Year',   value:'1y',  months:12 },
]
const PMODES = ['UPI','NEFT','RTGS','IMPS','Cash','Cheque']

/* ─── Helpers ──────────────────────────────────────────────── */
const n   = v  => parseFloat(v) || 0
const inr = v  => n(v).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})
const fmtD = iso => {
  if (!iso) return '—'
  return new Date(iso+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
}
const addM = (iso, m) => {
  if (!iso||!m) return ''
  const d = new Date(iso+'T00:00:00')
  d.setMonth(d.getMonth()+m)
  return d.toISOString().split('T')[0]
}
const todayISO = () => new Date().toISOString().split('T')[0]
const newNo = () => {
  const d = new Date()
  const datePart = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const key = `inv_counter_${datePart}`
  const count = (parseInt(localStorage.getItem(key) || '0') + 1)
  localStorage.setItem(key, String(count))
  return `JTS-${datePart}-${count}`
}

/* Words for amount */
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tens  = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
function numWords(n) {
  if (n===0) return 'Zero'
  if (n<0)   return 'Minus '+numWords(-n)
  let w=''
  if (n>=10000000) { w+=numWords(Math.floor(n/10000000))+' Crore '; n%=10000000 }
  if (n>=100000)   { w+=numWords(Math.floor(n/100000))+' Lakh ';   n%=100000   }
  if (n>=1000)     { w+=numWords(Math.floor(n/1000))+' Thousand '; n%=1000     }
  if (n>=100)      { w+=ones[Math.floor(n/100)]+' Hundred ';       n%=100      }
  if (n>=20)       { w+=tens[Math.floor(n/10)]+' '; n%=10 }
  if (n>0)         { w+=ones[n]+' ' }
  return w.trim()
}
function amountInWords(amt) {
  const r = Math.round(amt)
  const p = Math.round((amt-r)*100)
  let s = numWords(r)+' Rupees'
  if (p>0) s += ' and '+numWords(p)+' Paise'
  return s+' Only'
}

/* ─── INVOICE PRINT DOM ────────────────────────────────────── */
function InvoicePrint({ d }) {
  const plan    = PLANS.find(p=>p.value===d.plan)
  const dur     = DURATIONS.find(x=>x.value===d.duration)
  const planAmt = plan ? plan.amount : 0

  /* GST calc */
  const taxable = planAmt
  const cgst    = d.gstMode ? +(taxable*CGST_R/100).toFixed(2) : 0
  const sgst    = d.gstMode ? +(taxable*SGST_R/100).toFixed(2) : 0
  const total   = +(taxable+cgst+sgst).toFixed(2)

  /* Due date — next installment month */
  const nextDue = d.date && dur ? addM(d.date, 1) : ''

  /* Description */
  const desc = [
    plan  ? plan.value : '',
    '– Stock Market Education & Trading Guidance Service',
    dur   ? `(${dur.label})` : '',
    d.installment && dur ? `Installment ${d.installment}/${dur.months}` : '',
  ].filter(Boolean).join(' ')

  const gold='#c8983a', navy='#0f2460', white='#fff', dark='#0f172a', muted='#64748b', green='#16a34a', red='#dc2626'

  return (
    <div id="inv-doc" style={{ width:'700px', background:white, fontFamily:'Arial,Helvetica,sans-serif', fontSize:'12px', color:dark, boxSizing:'border-box' }}>

      {/* TOP BAR */}
      <div style={{ height:'6px', background:`linear-gradient(90deg,${navy},${gold},${navy})` }} />

      {/* HEADER */}
      <div style={{ padding:'20px 28px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ background:white, border:`1px solid #e2e8f0`, borderRadius:'8px', padding:'4px', width:'58px', height:'58px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src={CO.logo} alt="Logo" style={{ width:'50px', height:'50px', objectFit:'contain', borderRadius:'6px' }} onError={e=>e.target.style.display='none'} />
          </div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:'800', color:navy, lineHeight:'1.2' }}>{CO.name}</div>
            <div style={{ fontSize:'9.5px', color:muted, marginTop:'3px' }}>{CO.addr1}, {CO.addr2}</div>
            <div style={{ fontSize:'9.5px', color:muted }}>{CO.phone} · {CO.email}</div>
            <div style={{ fontSize:'9px', color:gold, marginTop:'2px' }}>GSTIN: {CO.gst} | PAN: {CO.pan} | CIN: {CO.cin}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'20px', fontWeight:'900', color:navy, letterSpacing:'1.5px' }}>
            {d.gstMode ? 'TAX INVOICE' : 'INVOICE'}
          </div>
          <div style={{ fontSize:'9px', color:muted, marginTop:'2px' }}>Original for Recipient</div>
        </div>
      </div>

      <div style={{ height:'1px', margin:'0 28px', background:'#e2e8f0' }} />

      {/* META: Invoice Details + Subscription Details */}
      <div style={{ padding:'14px 28px', display:'flex', gap:'16px' }}>
        {/* Invoice Details */}
        <div style={{ flex:1, fontSize:'11px' }}>
          <div style={{ fontWeight:'800', color:navy, marginBottom:'8px', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Invoice Details</div>
          {[
            ['Invoice No.',    d.invoiceNo],
            ['Invoice Date',   fmtD(d.date)],
            ['Payment Mode',   d.paymentMode],
            ['Transaction ID', d.txnId||'—'],
          ].map(([k,v])=>(
            <div key={k} style={{ display:'flex', gap:'8px', marginBottom:'4px' }}>
              <span style={{ color:muted, minWidth:'90px' }}>{k}:</span>
              <span style={{ fontWeight:'600', color:dark }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Subscription Details */}
        {(d.plan||d.duration) && (
          <div style={{ flex:1, fontSize:'11px' }}>
            <div style={{ fontWeight:'800', color:navy, marginBottom:'8px', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Subscription Details</div>
            {[
              d.plan     && ['Plan',         plan?.value||''],
              d.duration && ['Duration',     dur?.label||''],
              d.installment&&dur && ['Installment', `${d.installment} of ${dur.months}`],
              nextDue    && dur && n(d.installment)<dur.months && ['Next Due Date', fmtD(nextDue)],
              d.gstMode  && ['Place of Supply', `${CO.state} (${CO.stateCode})`],
            ].filter(Boolean).map(([k,v])=>(
              <div key={k} style={{ display:'flex', gap:'8px', marginBottom:'4px' }}>
                <span style={{ color:muted, minWidth:'90px' }}>{k}:</span>
                <span style={{ fontWeight:'600', color:dark }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bill To */}
        <div style={{ flex:1, fontSize:'11px' }}>
          <div style={{ fontWeight:'800', color:navy, marginBottom:'8px', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Bill To</div>
          <div style={{ fontWeight:'700', fontSize:'13px', color:dark }}>{d.clientName||'—'}</div>
          {d.clientPhone && <div style={{ color:muted, marginTop:'2px' }}>📞 {d.clientPhone}</div>}
          {d.clientEmail && <div style={{ color:muted }}>✉ {d.clientEmail}</div>}
        </div>
      </div>

      <div style={{ height:'1px', margin:'0 28px', background:'#e2e8f0' }} />

      {/* INVOICE AMOUNT HERO */}
      <div style={{ padding:'12px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:'18px', fontWeight:'800', color:dark }}>Invoice Amount</div>
        <div style={{ fontSize:'22px', fontWeight:'900', color:navy }}>₹ {inr(total)}</div>
      </div>

      <div style={{ height:'1px', margin:'0 28px', background:'#e2e8f0' }} />

      {/* LINE ITEMS TABLE */}
      <div style={{ padding:'0 28px 12px' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px', marginTop:'12px' }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${dark}` }}>
              <th style={{ padding:'6px 8px', textAlign:'left',  fontWeight:'800', textTransform:'uppercase', fontSize:'9.5px', letterSpacing:'0.5px' }}>Description</th>
              {d.gstMode && <th style={{ padding:'6px 8px', textAlign:'center', fontWeight:'800', textTransform:'uppercase', fontSize:'9.5px', letterSpacing:'0.5px' }}>HSN/SAC</th>}
              <th style={{ padding:'6px 8px', textAlign:'right',  fontWeight:'800', textTransform:'uppercase', fontSize:'9.5px', letterSpacing:'0.5px' }}>Rate</th>
              <th style={{ padding:'6px 8px', textAlign:'right',  fontWeight:'800', textTransform:'uppercase', fontSize:'9.5px', letterSpacing:'0.5px' }}>Qty</th>
              <th style={{ padding:'6px 8px', textAlign:'right',  fontWeight:'800', textTransform:'uppercase', fontSize:'9.5px', letterSpacing:'0.5px' }}>Amount(INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
              <td style={{ padding:'8px 8px', color:dark }}>{desc}</td>
              {d.gstMode && <td style={{ padding:'8px 8px', textAlign:'center', color:muted }}>997331</td>}
              <td style={{ padding:'8px 8px', textAlign:'right' }}>₹{inr(taxable)}</td>
              <td style={{ padding:'8px 8px', textAlign:'center' }}>1</td>
              <td style={{ padding:'8px 8px', textAlign:'right', fontWeight:'600' }}>₹{inr(taxable)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'8px' }}>
          <table style={{ fontSize:'11px', minWidth:'220px', borderCollapse:'collapse' }}>
            <tbody>
              {d.gstMode && <>
                <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                  <td style={{ padding:'4px 8px', color:muted }}>Discount</td>
                  <td style={{ padding:'4px 8px', textAlign:'right' }}>₹ 0</td>
                </tr>
                <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                  <td style={{ padding:'4px 8px', color:muted }}>CGST @ {CGST_R}%</td>
                  <td style={{ padding:'4px 8px', textAlign:'right', color:green }}>₹ {inr(cgst)}</td>
                </tr>
                <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                  <td style={{ padding:'4px 8px', color:muted }}>SGST @ {SGST_R}%</td>
                  <td style={{ padding:'4px 8px', textAlign:'right', color:green }}>₹ {inr(sgst)}</td>
                </tr>
              </>}
              <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                <td style={{ padding:'4px 8px', color:muted }}>Total</td>
                <td style={{ padding:'4px 8px', textAlign:'right', fontWeight:'700' }}>₹ {inr(total)}</td>
              </tr>
              <tr style={{ background:'#f8fafc' }}>
                <td style={{ padding:'6px 8px', fontWeight:'800', color:dark }}>Grand Total</td>
                <td style={{ padding:'6px 8px', textAlign:'right', fontWeight:'900', color:navy, fontSize:'14px' }}>₹ {inr(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount Due section — only for multi-installment */}
        {dur && dur.months > 1 && d.installment && (
          <div style={{ marginTop:'10px', padding:'8px 10px', background:'#f0fdf4', border:`1px solid #bbf7d0`, borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'11px', fontWeight:'700', color:'#166534' }}>
              {n(d.installment) === dur.months ? 'Final Payment — Fully Paid' : `Amount Due (Installment ${d.installment}/${dur.months})`}
            </span>
            <span style={{ fontSize:'13px', fontWeight:'900', color: n(d.installment)===dur.months ? green : navy }}>
              {n(d.installment)===dur.months ? '✓ COMPLETE' : `₹ ${inr(total)}`}
            </span>
          </div>
        )}

        {/* In words */}
        <div style={{ marginTop:'8px', fontSize:'10px', color:muted }}>
          <span style={{ fontWeight:'700', color:dark }}>In words: </span>{amountInWords(total)}
        </div>
      </div>

      <div style={{ height:'1px', margin:'0 28px', background:'#e2e8f0' }} />

      {/* SIGNATURE */}
      <div style={{ padding:'12px 28px 14px', display:'flex', justifyContent:'flex-end' }}>
        <div style={{ textAlign:'center' }}>
          <img src={CO.sign} alt="Signature"
            style={{ height:'65px', maxWidth:'200px', objectFit:'contain', display:'block', margin:'0 auto' }}
            onError={e=>{ e.target.style.visibility='hidden'; e.target.style.height='30px' }} />
          <div style={{ marginTop:'3px', fontSize:'10px', fontWeight:'700', color:dark }}>For {CO.short}</div>
          <div style={{ fontSize:'9px', color:muted }}>Authorised Signatory</div>
        </div>
      </div>

      {/* NOTE */}
      <div style={{ padding:'0 28px 12px', fontSize:'9.5px', color:muted }}>
        <div style={{ fontWeight:'700', color:dark, marginBottom:'3px' }}>Note:</div>
        {d.gstMode
          ? <div>1. Tax is not to be paid under reverse charge mechanism.<br/>2. All disputes subject to Fatehpur, Uttar Pradesh jurisdiction.</div>
          : <div>All disputes subject to Fatehpur, Uttar Pradesh jurisdiction.</div>
        }
      </div>

      {/* BOTTOM BAR */}
      <div style={{ height:'4px', background:`linear-gradient(90deg,${navy},${gold},${navy})` }} />
      <div style={{ background:'#f8fafc', padding:'5px 28px', textAlign:'center', fontSize:'8.5px', color:muted }}>
        {CO.website} · GSTIN: {CO.gst} · CIN: {CO.cin}
      </div>
    </div>
  )
}

/* ─── MAIN FORM ────────────────────────────────────────────── */
export default function GenerateInvoicePage() {
  const [gen,  setGen]  = useState(false)
  const [form, setForm] = useState({
    invoiceNo:'', date:todayISO(),
    txnId:'', paymentMode:'UPI',
    plan:'', duration:'', installment:'',
    clientName:'', clientPhone:'', clientEmail:'',
    gstMode: false,   // false = Normal, true = GST
  })

  useEffect(()=>{ setForm(f=>({...f,invoiceNo:newNo()})) },[])

  const set    = (k,v) => setForm(f=>({...f,[k]:v}))
  const setDur = v     => setForm(f=>({...f,duration:v,installment:''}))
  const setPlan= v     => setForm(f=>({...f,plan:v}))

  const selPlan = PLANS.find(p=>p.value===form.plan)
  const selDur  = DURATIONS.find(x=>x.value===form.duration)
  const instOpts= selDur ? Array.from({length:selDur.months},(_,i)=>i+1) : []

  const planAmt = selPlan ? selPlan.amount : 0
  const cgst    = form.gstMode ? +(planAmt*CGST_R/100).toFixed(2) : 0
  const sgst    = form.gstMode ? +(planAmt*SGST_R/100).toFixed(2) : 0
  const total   = planAmt + cgst + sgst

  /* Due date for multi-month */
  const showDue  = selDur && selDur.months > 1 && form.installment
  const nextDue  = showDue ? addM(form.date, 1) : ''
  const isFinal  = showDue && n(form.installment) === selDur.months

  const canGen = form.txnId.trim() && form.clientName.trim() && form.plan

  /* Build PDF blob — returns { blob, filename } */
  const buildPdf = async () => {
    const el = document.getElementById('inv-doc')
    // Use actual content width (700px) for accurate rendering
    const canvas = await html2canvas(el, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fff',
      logging: false,
      width: 700,
      windowWidth: 700,
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [700, canvas.height / 2.5] })
    // Use exact content size — no A4 padding, no white space
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 700, canvas.height / 2.5)
    return { blob: pdf.output('blob'), filename: `Invoice-${form.invoiceNo}.pdf` }
  }

  const generate = async () => {
    if (!canGen) return
    setGen(true)
    await new Promise(r => setTimeout(r, 250))
    try {
      const { blob, filename } = await buildPdf()
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    } catch(e) { alert('PDF generate nahi hua.'); console.error(e) }
    finally { setGen(false) }
  }

  const shareWA = async () => {
    if (!canGen) return
    setGen(true)
    await new Promise(r => setTimeout(r, 250))
    try {
      const { blob, filename } = await buildPdf()
      const file = new File([blob], filename, { type: 'application/pdf' })

      // Use Web Share API if available (mobile browsers)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Invoice ${form.invoiceNo}`, text: `Invoice from Javitri Trading Service Pvt. Ltd.` })
      } else if (form.clientPhone) {
        // Fallback: open WhatsApp with phone number
        const phone = form.clientPhone.replace(/\D/g,'')
        const msg   = encodeURIComponent(`Invoice ${form.invoiceNo} from Javitri Trading Service Pvt. Ltd.\nAmount: ₹${inr(total)}\nDate: ${fmtD(form.date)}`)
        window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91'+phone}?text=${msg}`, '_blank')
        // Also download the PDF
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 3000)
      } else {
        alert('Mobile number enter karein ya device mein share support nahi hai.')
      }
    } catch(e) { if (e.name !== 'AbortError') { alert('Share nahi ho saka.'); console.error(e) } }
    finally { setGen(false) }
  }

  /* Styles */
  const inp  = { width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #cbd5e1', background:'#ffffff', color:'#0f172a', fontSize:'13px', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }
  const lbl  = { display:'block', fontSize:'11px', fontWeight:'700', color:'#475569', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }
  const card = { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'22px 24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }
  const sec  = { fontSize:'14px', fontWeight:'800', color:'#0f172a', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'8px' }
  const g3   = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px' }
  const reqB = v => v ? '#cbd5e1' : '#f87171'

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', color:'#0f172a', paddingBottom:'60px' }}>

      {/* Header */}
      <div style={{ background:'#ffffff', borderBottom:'1px solid #e2e8f0', padding:'24px 20px 20px', boxShadow:'0 1px 2px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'12px', padding:'10px' }}>
            <FileText style={{ width:'24px', height:'24px', color:'#059669' }} />
          </div>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:'800', color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>Corporate Invoice Generator</h1>
            <p style={{ fontSize:'12px', color:'#64748b', margin:'3px 0 0', fontWeight:'500' }}>Javitri Trading Service Pvt. Ltd. · Billing System</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 16px 0' }}>

        {/* ── INVOICE TYPE TOGGLE ── */}
        <div style={{ ...card, marginBottom:'16px' }}>
          <div style={sec}>📋 Invoice Type</div>
          <div style={{ display:'flex', gap:'12px' }}>
            {[
              { val:false, label:'Standard Invoice', sub:'Without GST (Direct Service)' },
              { val:true,  label:'GST Tax Invoice', sub:'With CGST (9%) + SGST (9%)' },
            ].map(opt => (
              <button key={String(opt.val)}
                onClick={() => set('gstMode', opt.val)}
                style={{
                  flex:1, padding:'14px 18px', borderRadius:'12px', cursor:'pointer',
                  border: form.gstMode===opt.val ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: form.gstMode===opt.val ? '#f0fdf4' : '#ffffff',
                  textAlign:'left', transition:'all 0.2s',
                  boxShadow: form.gstMode===opt.val ? '0 2px 6px rgba(5,150,105,0.08)' : 'none',
                }}>
                <div style={{ fontSize:'13.5px', fontWeight:'700', color: form.gstMode===opt.val ? '#059669' : '#0f172a' }}>
                  {form.gstMode===opt.val ? '● ' : '○ '}{opt.label}
                </div>
                <div style={{ fontSize:'11.5px', color:'#64748b', marginTop:'4px', fontWeight:'500' }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── INVOICE DETAILS ── */}
        <div style={card}>
          <div style={sec}>📄 Invoice Details</div>
          <div style={g3}>
            <div>
              <label style={lbl}>Invoice No.</label>
              <input style={inp} value={form.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Date</label>
              <input style={inp} type="date" value={form.date} onChange={e=>set('date',e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Payment Mode</label>
              <select style={{ ...inp, cursor:'pointer' }} value={form.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>
                {PMODES.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={{ ...lbl, color: form.txnId ? '#475569':'#dc2626' }}>Transaction ID / UTR *</label>
              <input style={{ ...inp, borderColor:reqB(form.txnId) }} value={form.txnId} onChange={e=>set('txnId',e.target.value)} placeholder="UPI Ref / UTR / TXN Number" />
            </div>
          </div>
        </div>

        {/* ── CLIENT ── */}
        <div style={card}>
          <div style={sec}>👤 Client Details</div>
          <div style={g3}>
            <div>
              <label style={{ ...lbl, color: form.clientName ? '#475569':'#dc2626' }}>Client Full Name *</label>
              <input style={{ ...inp, borderColor:reqB(form.clientName) }} value={form.clientName} onChange={e=>set('clientName',e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label style={lbl}>Mobile Number</label>
              <input style={inp} value={form.clientPhone} onChange={e=>set('clientPhone',e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input style={inp} value={form.clientEmail} onChange={e=>set('clientEmail',e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
        </div>

        {/* ── PLAN ── */}
        <div style={card}>
          <div style={sec}>📦 Plan Details</div>
          <div style={g3}>
            <div>
              <label style={{ ...lbl, color: form.plan ? '#475569':'#dc2626' }}>Select Plan *</label>
              <select style={{ ...inp, cursor:'pointer', borderColor:reqB(form.plan) }} value={form.plan} onChange={e=>setPlan(e.target.value)}>
                <option value="">— Select Plan —</option>
                {PLANS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Duration</label>
              <select style={{ ...inp, cursor:'pointer' }} value={form.duration} onChange={e=>setDur(e.target.value)}>
                <option value="">— Select Duration —</option>
                {DURATIONS.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Installment No.</label>
              <select style={{ ...inp, cursor: form.duration ? 'pointer':'not-allowed', opacity: form.duration ? 1:0.5 }}
                value={form.installment} onChange={e=>set('installment',e.target.value)} disabled={!form.duration}>
                <option value="">— Select Installment —</option>
                {instOpts.map(i=><option key={i} value={i}>Installment {i} of {selDur?.months}</option>)}
              </select>
            </div>
          </div>

          {/* Live summary */}
          {selPlan && (
            <div style={{ marginTop:'18px', padding:'16px 20px', borderRadius:'12px', background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'24px', marginBottom: form.gstMode ? '14px' : 0 }}>
                <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px', textTransform:'uppercase' }}>PLAN AMOUNT</div><div style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a' }}>₹ {inr(planAmt)}</div></div>
                {selDur && <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px', textTransform:'uppercase' }}>DURATION</div><div style={{ fontSize:'15px', fontWeight:'700', color:'#0f172a' }}>{selDur.label}</div></div>}
                {form.installment && selDur && <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px', textTransform:'uppercase' }}>INSTALLMENT</div><div style={{ fontSize:'15px', fontWeight:'700', color:'#059669' }}>{form.installment} of {selDur.months}</div></div>}
                {showDue && nextDue && !isFinal && <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px', textTransform:'uppercase' }}>NEXT DUE DATE</div><div style={{ fontSize:'15px', fontWeight:'700', color:'#0f172a' }}>{fmtD(nextDue)}</div></div>}
                {isFinal && <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px', textTransform:'uppercase' }}>STATUS</div><div style={{ fontSize:'15px', fontWeight:'700', color:'#059669' }}>✓ Final Payment</div></div>}
              </div>

              {/* GST breakdown */}
              {form.gstMode && planAmt > 0 && (
                <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'12px', display:'flex', gap:'20px', flexWrap:'wrap' }}>
                  <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px' }}>TAXABLE BASE</div><div style={{ fontSize:'14px', fontWeight:'700', color:'#334155' }}>₹ {inr(planAmt)}</div></div>
                  <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px' }}>CGST 9%</div><div style={{ fontSize:'14px', fontWeight:'700', color:'#059669' }}>₹ {inr(cgst)}</div></div>
                  <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px' }}>SGST 9%</div><div style={{ fontSize:'14px', fontWeight:'700', color:'#059669' }}>₹ {inr(sgst)}</div></div>
                  <div><div style={{ fontSize:'10px', color:'#64748b', fontWeight:'700', marginBottom:'3px' }}>TOTAL INCL. GST</div><div style={{ fontSize:'18px', fontWeight:'800', color:'#059669' }}>₹ {inr(total)}</div></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── GENERATE ── */}
        <div style={{ display:'flex', gap:'12px' }}>
          {/* Download button */}
          <button onClick={generate} disabled={gen||!canGen} style={{
            flex: 1, padding:'15px', borderRadius:'12px', border:'none',
            background: canGen ? '#059669' : '#e2e8f0',
            color: canGen ? '#ffffff' : '#94a3b8', fontSize:'15px', fontWeight:'800',
            cursor: canGen ? 'pointer':'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
            boxShadow: canGen ? '0 4px 14px rgba(5,150,105,0.25)':'none',
            transition:'all 0.2s',
          }}>
            {gen
              ? <><Loader2 style={{ width:'20px', height:'20px', animation:'spin 1s linear infinite' }}/> Generating…</>
              : <><Download style={{ width:'20px', height:'20px' }}/> Download PDF Invoice</>}
          </button>

          {/* WhatsApp Share — show when mobile number entered */}
          {form.clientPhone && (
            <button onClick={shareWA} disabled={gen||!canGen} style={{
              padding:'15px 22px', borderRadius:'12px',
              background: canGen ? '#ecfdf5' : '#f8fafc',
              border: canGen ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              color: canGen ? '#059669' : '#94a3b8', fontSize:'13.5px', fontWeight:'800',
              cursor: canGen ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              flexShrink:0, transition:'all 0.2s',
            }}>
              {gen ? <Loader2 style={{ width:'18px', height:'18px', animation:'spin 1s linear infinite' }}/> : (
                <>
                  <svg style={{ width:'20px', height:'20px' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share via WhatsApp
                </>
              )}
            </button>
          )}
        </div>
        {!canGen && (
          <p style={{ textAlign:'center', fontSize:'12px', color:'#dc2626', marginTop:'10px', fontWeight:'600' }}>
            {!form.clientName.trim() ? '⚠ Client Name required' : !form.txnId.trim() ? '⚠ Transaction ID / UTR required' : '⚠ Please select a plan'}
          </p>
        )}
      </div>

      {/* Off-screen invoice */}
      <div style={{ position:'fixed', top:0, left:'-9999px', zIndex:-1, background:'#fff' }}>
        <InvoicePrint d={form} />
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
