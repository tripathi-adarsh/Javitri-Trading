import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { FileText, Download, Loader2 } from 'lucide-react'

/* ── Company ── */
const CO = {
  name:     'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  short:    'Javitri Trading Service Pvt. Ltd.',
  addr1:    'Main Bazar, Khakhreru, Fatehpur',
  addr2:    'Uttar Pradesh – 212656',
  phone:    '+91 9022487800',
  email:    'info@javitritrading.com',
  gst:      '09AAHCJ6166E1ZD',
  cin:      'U66190GJ2026PTC183862',
  logo:     '/logo.jpeg',
  sign:     '/signature.png',
}

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

/* ── Helpers ── */
const inr = (v) => Number(v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})

const newNo = () => {
  const d = new Date()
  return `JTS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`
}

const todayISO = () => new Date().toISOString().split('T')[0]

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
}

/* Add N months to a date ISO string */
const addMonths = (iso, n) => {
  if (!iso || !n) return ''
  const d = new Date(iso + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return d.toISOString().split('T')[0]
}

/* ════════════════════════════════════════════
   INVOICE PRINT  (off-screen → PDF)
════════════════════════════════════════════ */
function InvoicePrint({ d }) {
  const plan     = PLANS.find(p => p.value === d.plan)
  const dur      = DURATIONS.find(x => x.value === d.duration)
  const amount   = plan ? plan.amount : 0

  /* Due date = invoice date + 1 month */
  const dueISO   = d.date ? addMonths(d.date, 1) : ''

  /* Description */
  const desc = [
    plan  ? `${plan.value}` : '',
    dur   ? `(Duration: ${dur.label})` : '',
    d.installment && dur ? `— Installment ${d.installment} of ${dur.months}` : '',
  ].filter(Boolean).join(' ')

  const navy = '#0f2460', gold = '#c8983a', white = '#fff', dark = '#111827', muted = '#6b7280'

  return (
    <div id="inv-doc" style={{
      width:'700px', background:white,
      fontFamily:"'Arial', Helvetica, sans-serif",
      fontSize:'12px', color:dark,
      padding:'0', boxSizing:'border-box',
    }}>

      {/* TOP BLUE BAR */}
      <div style={{height:'8px', background:navy}} />

      {/* ── COMPANY HEADER ── */}
      <div style={{padding:'28px 36px 18px', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
          <img src={CO.logo} alt="Logo"
            style={{width:'60px', height:'60px', objectFit:'contain', borderRadius:'8px'}}
            onError={e => e.target.style.display='none'} />
          <div>
            <div style={{fontSize:'15px', fontWeight:'800', color:navy, lineHeight:'1.2'}}>{CO.name}</div>
            <div style={{fontSize:'10.5px', color:muted, marginTop:'4px'}}>{CO.addr1}</div>
            <div style={{fontSize:'10.5px', color:muted}}>{CO.addr2}</div>
            <div style={{fontSize:'10.5px', color:muted, marginTop:'2px'}}>{CO.phone} · {CO.email}</div>
            <div style={{fontSize:'9.5px', color:muted, marginTop:'1px'}}>GSTIN: {CO.gst} | CIN: {CO.cin}</div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'26px', fontWeight:'900', color:navy, letterSpacing:'1px'}}>INVOICE</div>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{height:'1px', background:'#e5e7eb', margin:'0 36px'}} />

      {/* ── BILL TO + INVOICE META ── */}
      <div style={{padding:'18px 36px', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        {/* Bill To */}
        <div style={{flex:1}}>
          <div style={{fontSize:'10px', fontWeight:'800', color:muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'5px'}}>Bill To</div>
          <div style={{fontSize:'16px', fontWeight:'700', color:dark}}>{d.clientName || '—'}</div>
          {d.clientPhone && <div style={{fontSize:'11px', color:muted, marginTop:'2px'}}>{d.clientPhone}</div>}
          {d.clientEmail && <div style={{fontSize:'11px', color:muted}}>{d.clientEmail}</div>}
        </div>

        {/* Invoice meta */}
        <div style={{textAlign:'right', fontSize:'12px'}}>
          <table style={{borderCollapse:'collapse', marginLeft:'auto'}}>
            <tbody>
              {[
                ['INVOICE #',   d.invoiceNo],
                ['INVOICE DATE',fmtDate(d.date)],
                ['DUE DATE',    fmtDate(dueISO)],
                ['PAYMENT MODE',d.paymentMode],
                ['TXN ID',      d.txnId || '—'],
              ].map(([k,v]) => (
                <tr key={k}>
                  <td style={{padding:'3px 12px 3px 0', color:muted, fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'right', whiteSpace:'nowrap'}}>{k}</td>
                  <td style={{padding:'3px 0', fontWeight:'700', color:dark, textAlign:'right', whiteSpace:'nowrap'}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{height:'1px', background:'#e5e7eb', margin:'0 36px'}} />

      {/* ── INVOICE TOTAL HERO ── */}
      <div style={{padding:'18px 36px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:'22px', fontWeight:'800', color:dark}}>Invoice Total</div>
        <div style={{fontSize:'26px', fontWeight:'900', color:dark}}>₹ {inr(amount)}</div>
      </div>

      {/* DIVIDER */}
      <div style={{height:'1px', background:'#e5e7eb', margin:'0 36px'}} />

      {/* ── LINE ITEMS ── */}
      <div style={{padding:'0 36px'}}>
        {/* Header */}
        <div style={{display:'flex', padding:'8px 0', borderBottom:'2px solid #111827'}}>
          <div style={{width:'50px', fontSize:'10px', fontWeight:'800', color:dark, textTransform:'uppercase', letterSpacing:'0.5px'}}>QTY</div>
          <div style={{flex:1, fontSize:'10px', fontWeight:'800', color:dark, textTransform:'uppercase', letterSpacing:'0.5px'}}>DESCRIPTION</div>
          <div style={{width:'120px', fontSize:'10px', fontWeight:'800', color:dark, textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'right'}}>UNIT PRICE</div>
          <div style={{width:'100px', fontSize:'10px', fontWeight:'800', color:dark, textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'right'}}>AMOUNT</div>
        </div>

        {/* Row */}
        <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid #e5e7eb', alignItems:'flex-start'}}>
          <div style={{width:'50px', fontSize:'12px', color:dark}}>1</div>
          <div style={{flex:1, fontSize:'12px', color:dark}}>{desc}</div>
          <div style={{width:'120px', fontSize:'12px', color:dark, textAlign:'right'}}>{inr(amount)}</div>
          <div style={{width:'100px', fontSize:'12px', color:dark, textAlign:'right', fontWeight:'600'}}>{inr(amount)}</div>
        </div>

        {/* Total row */}
        <div style={{display:'flex', padding:'10px 0 6px', justifyContent:'flex-end', gap:'20px'}}>
          <div style={{fontSize:'13px', fontWeight:'800', color:dark}}>Total</div>
          <div style={{width:'100px', fontSize:'13px', fontWeight:'800', color:dark, textAlign:'right'}}>₹ {inr(amount)}</div>
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{padding:'16px 36px 10px', display:'flex', justifyContent:'flex-end'}}>
        <div style={{textAlign:'center'}}>
          <img src={CO.sign} alt="Signature"
            style={{height:'70px', maxWidth:'200px', objectFit:'contain', display:'block', margin:'0 auto'}}
            onError={e => { e.target.style.visibility='hidden'; e.target.style.height='30px' }} />
          <div style={{marginTop:'3px', fontSize:'11px', fontWeight:'700', color:dark}}>For {CO.short}</div>
        </div>
      </div>

      {/* ── TERMS ── */}
      <div style={{padding:'10px 36px 24px'}}>
        <div style={{height:'1px', background:'#e5e7eb', marginBottom:'12px'}} />
        <div style={{fontSize:'10px', fontWeight:'800', color:dark, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px'}}>Terms &amp; Conditions</div>
        <div style={{fontSize:'10px', color:muted, lineHeight:'1.6'}}>
          Payment is due by {fmtDate(dueISO)}. This is a computer-generated invoice.
          All disputes subject to Fatehpur, Uttar Pradesh jurisdiction.
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   FORM PAGE
════════════════════════════════════════════ */
export default function GenerateInvoicePage() {
  const [gen,  setGen]  = useState(false)
  const [form, setForm] = useState({
    invoiceNo:'', date:todayISO(),
    txnId:'', paymentMode:'UPI',
    plan:'', duration:'', installment:'',
    clientName:'', clientPhone:'', clientEmail:'',
  })

  useEffect(() => { setForm(f => ({...f, invoiceNo:newNo()})) }, [])

  const set    = (k,v) => setForm(f => ({...f, [k]:v}))
  const setDur = (v)   => setForm(f => ({...f, duration:v, installment:''}))
  const setPlan= (v)   => setForm(f => ({...f, plan:v}))

  const selDur   = DURATIONS.find(x => x.value === form.duration)
  const instOpts = selDur ? Array.from({length:selDur.months},(_,i)=>i+1) : []
  const selPlan  = PLANS.find(p => p.value === form.plan)

  const canGen = form.txnId.trim() && form.clientName.trim() && form.plan

  const handleGenerate = async () => {
    if (!canGen) return
    setGen(true)
    await new Promise(r => setTimeout(r, 200))
    try {
      const el = document.getElementById('inv-doc')
      const canvas = await html2canvas(el, {
        scale:3, useCORS:true, allowTaint:true,
        backgroundColor:'#ffffff', logging:false,
        width:700, windowWidth:700,
      })
      const pdf = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'})
      const pw  = pdf.internal.pageSize.getWidth()
      const ph  = pdf.internal.pageSize.getHeight()
      const ih  = (canvas.height * pw) / canvas.width
      if (ih <= ph) {
        pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,pw,ih)
      } else {
        const ppx = Math.floor((ph/pw)*canvas.width); let off=0
        while (off < canvas.height) {
          const sh = Math.min(ppx, canvas.height-off)
          const c2 = document.createElement('canvas')
          c2.width=canvas.width; c2.height=sh
          c2.getContext('2d').drawImage(canvas, 0, -off)
          if (off>0) pdf.addPage()
          pdf.addImage(c2.toDataURL('image/png'),'PNG',0,0,pw,(sh*pw)/canvas.width)
          off += sh
        }
      }
      pdf.save(`Invoice-${form.invoiceNo}.pdf`)
    } catch(e) { alert('PDF generate nahi hua.'); console.error(e) }
    finally { setGen(false) }
  }

  /* ── Form styles ── */
  const inp = {
    width:'100%', padding:'10px 13px', borderRadius:'8px',
    border:'1px solid rgba(212,168,67,0.3)',
    background:'rgba(6,12,28,0.65)', color:'#f0f4f8',
    fontSize:'13px', outline:'none', boxSizing:'border-box',
  }
  const lbl = {
    display:'block', fontSize:'10px', fontWeight:'700',
    color:'#8aa4ba', marginBottom:'5px',
    textTransform:'uppercase', letterSpacing:'0.5px',
  }
  const fieldWrap = { marginBottom:'14px' }

  return (
    <div style={{minHeight:'100vh', background:'#080f22', color:'#f0f4f8', paddingBottom:'60px'}}>

      {/* PAGE HEADER */}
      <div style={{background:'rgba(15,36,96,0.5)', borderBottom:'1px solid rgba(212,168,67,0.2)', padding:'20px 20px 16px'}}>
        <div style={{maxWidth:'780px', margin:'0 auto', display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.3)', borderRadius:'10px', padding:'9px'}}>
            <FileText style={{width:'20px', height:'20px', color:'#d4a843'}}/>
          </div>
          <div>
            <div style={{fontSize:'18px', fontWeight:'800', color:'#f0f4f8'}}>Invoice Generator</div>
            <div style={{fontSize:'11px', color:'#7090a8'}}>Javitri Trading Service Pvt. Ltd.</div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div style={{maxWidth:'780px', margin:'0 auto', padding:'20px 16px 0'}}>
        <div style={{
          background:'rgba(15,36,96,0.35)',
          border:'1px solid rgba(212,168,67,0.2)',
          borderRadius:'16px', padding:'24px 24px',
        }}>

          {/* ── Section: Invoice Info ── */}
          <div style={{fontSize:'11px', fontWeight:'800', color:'#d4a843', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px', paddingBottom:'8px', borderBottom:'1px solid rgba(212,168,67,0.15)'}}>
            Invoice Details
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'20px'}}>
            <div style={fieldWrap}>
              <label style={lbl}>Invoice No.</label>
              <input style={inp} value={form.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)}/>
            </div>
            <div style={fieldWrap}>
              <label style={lbl}>Date</label>
              <input style={inp} type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
            </div>
            <div style={fieldWrap}>
              <label style={lbl}>Payment Mode</label>
              <select style={{...inp,cursor:'pointer'}} value={form.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>
                {PMODES.map(m=><option key={m} value={m} style={{background:'#0d1629'}}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{...lbl, color: form.txnId?'#8aa4ba':'#f87171'}}>Transaction ID *</label>
            <input style={{...inp, borderColor: form.txnId?'rgba(212,168,67,0.3)':'rgba(248,113,113,0.5)'}}
              value={form.txnId} onChange={e=>set('txnId',e.target.value)}
              placeholder="UPI Ref / UTR / TXN Number"/>
          </div>

          {/* ── Section: Client ── */}
          <div style={{fontSize:'11px', fontWeight:'800', color:'#d4a843', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px', paddingBottom:'8px', borderBottom:'1px solid rgba(212,168,67,0.15)'}}>
            Client Details
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'20px'}}>
            <div>
              <label style={{...lbl, color: form.clientName?'#8aa4ba':'#f87171'}}>Client Name *</label>
              <input style={{...inp, borderColor: form.clientName?'rgba(212,168,67,0.3)':'rgba(248,113,113,0.5)'}}
                value={form.clientName} onChange={e=>set('clientName',e.target.value)} placeholder="Full name"/>
            </div>
            <div>
              <label style={lbl}>Mobile Number</label>
              <input style={inp} value={form.clientPhone} onChange={e=>set('clientPhone',e.target.value)} placeholder="+91 XXXXX XXXXX"/>
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} value={form.clientEmail} onChange={e=>set('clientEmail',e.target.value)} placeholder="client@email.com"/>
            </div>
          </div>

          {/* ── Section: Plan ── */}
          <div style={{fontSize:'11px', fontWeight:'800', color:'#d4a843', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px', paddingBottom:'8px', borderBottom:'1px solid rgba(212,168,67,0.15)'}}>
            Plan Details
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'8px'}}>
            <div>
              <label style={{...lbl, color: form.plan?'#8aa4ba':'#f87171'}}>Select Plan *</label>
              <select style={{...inp, cursor:'pointer', borderColor: form.plan?'rgba(212,168,67,0.3)':'rgba(248,113,113,0.5)'}}
                value={form.plan} onChange={e=>setPlan(e.target.value)}>
                <option value="" style={{background:'#0d1629'}}>— Select Plan —</option>
                {PLANS.map(p=><option key={p.value} value={p.value} style={{background:'#0d1629'}}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Plan Duration</label>
              <select style={{...inp, cursor:'pointer'}} value={form.duration} onChange={e=>setDur(e.target.value)}>
                <option value="" style={{background:'#0d1629'}}>— Select —</option>
                {DURATIONS.map(d=><option key={d.value} value={d.value} style={{background:'#0d1629'}}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Installment No.</label>
              <select
                style={{...inp, cursor:form.duration?'pointer':'not-allowed', opacity:form.duration?1:0.4}}
                value={form.installment} onChange={e=>set('installment',e.target.value)}
                disabled={!form.duration}>
                <option value="" style={{background:'#0d1629'}}>— Select —</option>
                {instOpts.map(i=><option key={i} value={i} style={{background:'#0d1629'}}>
                  Installment {i} of {selDur?.months}
                </option>)}
              </select>
            </div>
          </div>

          {/* Plan amount preview */}
          {selPlan && (
            <div style={{marginBottom:'20px', padding:'10px 14px', background:'rgba(212,168,67,0.06)', border:'1px solid rgba(212,168,67,0.18)', borderRadius:'8px', display:'flex', gap:'24px', flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:'9px', color:'#7090a8', marginBottom:'2px'}}>PLAN AMOUNT</div>
                <div style={{fontSize:'16px', fontWeight:'800', color:'#f0c060'}}>₹ {inr(selPlan.amount)}</div>
              </div>
              {selDur && <div>
                <div style={{fontSize:'9px', color:'#7090a8', marginBottom:'2px'}}>DURATION</div>
                <div style={{fontSize:'14px', fontWeight:'700', color:'#f0f4f8'}}>{selDur.label}</div>
              </div>}
              {form.installment && selDur && <div>
                <div style={{fontSize:'9px', color:'#7090a8', marginBottom:'2px'}}>INSTALLMENT</div>
                <div style={{fontSize:'14px', fontWeight:'700', color:'#4ade80'}}>{form.installment} of {selDur.months}</div>
              </div>}
              {form.date && <div>
                <div style={{fontSize:'9px', color:'#7090a8', marginBottom:'2px'}}>DUE DATE</div>
                <div style={{fontSize:'14px', fontWeight:'700', color:'#f0f4f8'}}>{fmtDate(addMonths(form.date,1))}</div>
              </div>}
            </div>
          )}

          {/* GENERATE */}
          <button onClick={handleGenerate} disabled={gen||!canGen} style={{
            width:'100%', padding:'14px', borderRadius:'10px', border:'none',
            background: canGen?'linear-gradient(135deg,#d4a843,#a07020)':'rgba(212,168,67,0.12)',
            color: canGen?'#fff':'#506070',
            fontSize:'14px', fontWeight:'800',
            cursor: canGen?'pointer':'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
            boxShadow: canGen?'0 4px 24px rgba(212,168,67,0.35)':'none',
          }}>
            {gen
              ? <><Loader2 style={{width:'18px',height:'18px',animation:'spin 1s linear infinite'}}/> Generating…</>
              : <><Download style={{width:'18px',height:'18px'}}/> Generate &amp; Download Invoice</>}
          </button>

          {!canGen && (
            <p style={{textAlign:'center',fontSize:'11px',color:'#f87171',marginTop:'6px',marginBottom:0}}>
              {!form.clientName.trim()?'⚠ Client Name required':!form.txnId.trim()?'⚠ Transaction ID required':'⚠ Plan select karein'}
            </p>
          )}
        </div>
      </div>

      {/* OFF-SCREEN INVOICE */}
      <div style={{position:'fixed',top:0,left:'-9999px',zIndex:-1,background:'#fff'}}>
        <InvoicePrint d={form}/>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
