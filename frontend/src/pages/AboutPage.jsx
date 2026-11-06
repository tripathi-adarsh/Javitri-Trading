import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, MapPin, FileText, Users, ShieldCheck,
  BookOpen, TrendingUp, ArrowRight, MessageSquare, Phone, Mail, Navigation,
  ChevronLeft, ChevronRight, Award, Briefcase, GraduationCap, Camera
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

/* ── Constants ── */
const CIN  = 'U66190GJ2026PTC183862'
const GST  = '09AAHCJ6166E1ZD'
const DPIIT= 'DIPP291171'
const COMPANY = {
  name:'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  shortName:'Javitri Trading Service Pvt. Ltd.',
  phone:'+91 9022487800',
  emailInfo:'info@javitritrading.com',
  emailSales:'sales@javitritrading.com',
  schedule:'Monday to Friday',
}
const OFFICES = [{
  key:'fatehpur', city:'Fatehpur, Uttar Pradesh', label:'Our Office',
  address:'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
  maps:'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
}]
const WHATSAPP_URL = 'https://wa.me/919022487800'
const TELEGRAM_URL = 'https://t.me/Javitritradingservice'
const TG = ({ cls='h-4 w-4' }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
)

const VALUES = [
  { icon:ShieldCheck, title:'Transparency',    desc:'All plan terms, fees, and conditions are disclosed before any commitment is made.' },
  { icon:Users,       title:'Client-Focused',  desc:'Every client and learner receives personalised guidance through their market education journey.' },
  { icon:BookOpen,    title:'Education First', desc:'Our core focus is building genuine market knowledge — helping beginners understand stock markets before they invest.' },
  { icon:TrendingUp,  title:'Market Awareness',desc:'We help clients stay aware of market developments, trends, and risk factors relevant to investment decisions.' },
]

/* ─── 2 Directors ─────────────────────────────────────────── */
const DIRECTORS = [
  {
    name:           'Gende Lal Nishad',
    designation:    'Managing Director',
    photo:          '/director1.jpeg',
    qualifications: 'B.Com, MBA (Finance)',
    experience:     '20+ years in Stock Market & Financial Services',
    message:        'Our mission is to democratize stock market education across India. Every individual deserves access to quality financial knowledge regardless of background.',
    badges: [
      { icon: Award,         label: 'StartupIndia Registered' },
      { icon: Briefcase,     label: '20+ Yrs Exp.' },
      { icon: GraduationCap, label: 'MBA Finance' },
    ],
  },
  {
    name:           'Dinesh singh',
    designation:    'Director & Co-Founder',
    photo:          '/director2.jpeg',
    qualifications: 'B.A.',
    experience:     '10+ years in Trading & Business Development',
    message:        'We are committed to building a trustworthy platform where every learner grows with confidence. Transparency and education are at the core of everything we do.',
    badges: [
      { icon: Award,      label: 'StartupIndia Registered' },
      { icon: Briefcase,  label: '10+ Yrs Exp.' },
      { icon: TrendingUp, label: 'Trading Expert' },
    ],
  },
]

/* ─── Gallery ─────────────────────────────────────────────── */
const GALLERY = [
  '/gallery/img1.jpeg','/gallery/img2.jpeg','/gallery/img3.jpeg',
  '/gallery/img4.jpeg','/gallery/img6.jpeg','/gallery/img7.jpeg','/gallery/img8.jpeg',
]

/* ─── Gallery component — 3 cards visible, center larger ─── */
function Gallery() {
  const [active, setActive] = useState(0)
  const [paused, setPaused]   = useState(false)
  const total = GALLERY.length

  const go = useCallback((d) => setActive(p => (p + d + total) % total), [total])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 3000)
    return () => clearInterval(t)
  }, [go, paused])

  /* indices for left, center, right */
  const idxL = (active - 1 + total) % total
  const idxC = active
  const idxR = (active + 1) % total

  const cards = [
    { idx: idxL, pos: 'left'   },
    { idx: idxC, pos: 'center' },
    { idx: idxR, pos: 'right'  },
  ]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── 3-card row ── */}
      <div className="relative flex items-center gap-3 sm:gap-4 px-10 sm:px-12">

        {cards.map(({ idx, pos }) => {
          const isCenter = pos === 'center'
          return (
            <div
              key={`${active}-${pos}`}
              onClick={() => pos === 'left' ? go(-1) : pos === 'right' ? go(1) : null}
              style={{
                flex:          isCenter ? '1.6' : '1',
                aspectRatio:   isCenter ? '3/4' : '3/4',
                borderRadius:  isCenter ? '18px' : '14px',
                overflow:      'hidden',
                border:        isCenter
                                 ? '2px solid rgba(212,168,67,0.7)'
                                 : '1px solid rgba(212,168,67,0.2)',
                background:    '#080f22',
                boxShadow:     isCenter
                                 ? '0 20px 50px rgba(0,0,0,0.6)'
                                 : '0 6px 20px rgba(0,0,0,0.4)',
                opacity:       isCenter ? 1 : 0.6,
                transform:     isCenter ? 'scale(1.04)' : 'scale(0.97)',
                transition:    'all 0.4s ease',
                cursor:        isCenter ? 'default' : 'pointer',
                flexShrink:    0,
                position:      'relative',
              }}
            >
              {/* Gold top line on center */}
              {isCenter && (
                <div style={{
                  position:'absolute', top:0, left:0, right:0, height:'2px', zIndex:2,
                  background:'linear-gradient(90deg,transparent,#d4a843,transparent)',
                }} />
              )}

              <img
                src={GALLERY[idx]}
                alt={`Gallery ${idx + 1}`}
                style={{
                  width:          '100%',
                  height:         '100%',
                  objectFit:      'cover',
                  objectPosition: 'center top',
                  display:        'block',
                }}
              />
            </div>
          )
        })}

        {/* Prev arrow */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all"
          style={{ transform:'translateY(-50%)', background:'rgba(8,15,32,0.9)', border:'1px solid rgba(212,168,67,0.45)', color:'#d4a843', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(8,15,32,0.9)'}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next arrow */}
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all"
          style={{ transform:'translateY(-50%)', background:'rgba(8,15,32,0.9)', border:'1px solid rgba(212,168,67,0.45)', color:'#d4a843', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(212,168,67,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(8,15,32,0.9)'}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Counter + dots */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.2)' }}>
          <Camera className="h-3 w-3" style={{ color:'#d4a843' }} />
          <span className="text-xs font-bold" style={{ color:'#d4a843' }}>
            {String(active + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {GALLERY.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Slide ${i+1}`}
              style={{
                height:'3px', width: i===active ? '24px' : '8px',
                borderRadius:'99px', border:'none', cursor:'pointer', padding:0,
                background: i===active
                  ? 'linear-gradient(90deg,#d4a843,#f0c060)'
                  : 'rgba(212,168,67,0.22)',
                transition:'all 0.35s ease',
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Director card ───────────────────────────────────────── */
function DirectorCard({ dir }) {
  return (
    <div className="rounded-2xl overflow-hidden h-full"
      style={{ background:'rgba(15,36,96,0.45)', border:'1px solid rgba(212,168,67,0.25)' }}>
      <div className="gold-line" />
      <div className="p-6 sm:p-8 flex flex-col items-center text-center h-full">

        {/* Circular photo */}
        {/* <div className="relative mb-5 shrink-0">
          <div className="rounded-full overflow-hidden"
            style={{ width:'140px', height:'140px', border:'3px solid #d4a843', boxShadow:'0 0 0 6px rgba(212,168,67,0.1), 0 16px 40px rgba(0,0,0,0.4)' }}>
            {dir.photo ? (
              <img src={dir.photo} alt={dir.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold"
                style={{ background:'linear-gradient(135deg,rgba(15,36,96,0.95),rgba(8,15,32,0.98))', color:'#d4a843' }}>
                {dir.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#d4a843,#a07020)', border:'2px solid #080f22' }}>
            <ShieldCheck className="h-4 w-4" style={{ color:'#fff' }} />
          </div>
        </div> */}

        {/* Name & role */}
        <p className="text-xl font-bold mb-0.5" style={{ color:'#f0f4f8' }}>{dir.name}</p>
        <p className="text-sm font-semibold mb-1" style={{ color:'#d4a843' }}>{dir.designation}</p>
        <p className="text-xs mb-0.5" style={{ color:'#7090a8' }}>{dir.qualifications}</p>
        <p className="text-xs mb-4" style={{ color:'#7090a8' }}>{dir.experience}</p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {dir.badges.map(({ icon:Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.28)', color:'#d4a843' }}>
              <Icon className="h-2.5 w-2.5" />{label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full mb-4" style={{ height:'1px', background:'rgba(212,168,67,0.15)' }} />

        {/* Quote */}
        <div className="flex-1 relative">
          <span className="absolute -top-3 left-0 text-5xl font-serif leading-none select-none"
            style={{ color:'rgba(212,168,67,0.2)', lineHeight:1 }}>"</span>
          <p className="text-sm italic leading-relaxed pt-2" style={{ color:'#c0d0e0' }}>
            {dir.message}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background:'#080f22' }}>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
          style={{ borderColor:'rgba(212,168,67,0.4)', background:'rgba(212,168,67,0.08)', color:'#d4a843' }}>
          <Building2 className="h-3.5 w-3.5" /> About Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color:'#f0f4f8' }}>
          About <span className="gradient-text">Javitri Trading Service Pvt. Ltd.</span>
        </h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed mb-6" style={{ color:'#9ab0c4' }}>
          A stock market education and trading guidance business based in Fatehpur, Uttar Pradesh —
          helping individuals understand the Indian stock market and make informed decisions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[['CIN',CIN],['GST',GST],['DPIIT',DPIIT]].map(([k,v]) => (
            <div key={k} className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.35)' }}>
              <FileText className="h-3.5 w-3.5 shrink-0" style={{ color:'#d4a843' }} />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color:'#8aa4ba' }}>{k}</p>
                <p className="text-xs font-mono font-bold" style={{ color:'#f0c060' }}>{v}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs mt-4" style={{ color:'#7090a8' }}>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color:'#d4a843' }} />Fatehpur, UP
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" style={{ color:'#d4a843' }} />Mon–Fri
          </span>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background:'rgba(15,36,96,0.4)', border:'1px solid rgba(212,168,67,0.15)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color:'#f0f4f8' }}>What We Do</h2>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color:'#aabbcc' }}>
            <p>At Javitri Trading Service Pvt. Ltd., we provide stock market education, beginner learning support, trading guidance, and market awareness services.</p>
            <p>We assist clients with Demat account opening guidance, trading platform navigation, and structured educational content on market terminology, chart reading, and risk management.</p>
            <p>We also offer investment plans with associated support services. All figures shown are illustrative — no figures constitute guaranteed returns.</p>
          </div>
        </div>
      </section>

      {/* Directors */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{ background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.35)', color:'#d4a843' }}>
            <Users className="h-3.5 w-3.5" /> Leadership
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color:'#f0f4f8' }}>
            Meet Our <span className="gradient-text">Directors</span>
          </h2>
          <p className="text-sm mt-2" style={{ color:'#7090a8' }}>The people behind Javitri Trading Service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DIRECTORS.map((dir) => (
            <DirectorCard key={dir.name} dir={dir} />
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color:'#f0f4f8' }}>
          Our <span className="gradient-text">Principles</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ icon:Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl transition-all duration-200"
              style={{ border:'1px solid rgba(212,168,67,0.15)', background:'rgba(15,36,96,0.33)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,168,67,0.42)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(212,168,67,0.15)'; e.currentTarget.style.transform='none' }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.28)' }}>
                <Icon className="h-5 w-5" style={{ color:'#d4a843' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color:'#f0f4f8' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:'#9ab0c4' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{ background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.35)', color:'#d4a843' }}>
            <Camera className="h-3.5 w-3.5" /> Our Gallery
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color:'#f0f4f8' }}>
            Moments &amp; <span className="gradient-text">Milestones</span>
          </h2>
          <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color:'#9ab0c4' }}>
            A glimpse of our journey — events, workshops, and milestones.
          </p>
        </div>
        <Gallery />
      </section>

      {/* Company Info */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background:'rgba(15,36,96,0.5)', border:'1px solid rgba(212,168,67,0.25)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color:'#f0f4f8' }}>Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color:'#7090a8' }}>Legal Company Name</p>
              <p className="font-semibold" style={{ color:'#f0f4f8' }}>{COMPANY.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color:'#7090a8' }}>CIN</p>
              <p className="font-mono font-bold" style={{ color:'#f0c060' }}>{CIN}</p>
              <p className="text-xs mt-0.5" style={{ color:'#7090a8' }}>Incorporated under Companies Act, 2013</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color:'#7090a8' }}>GST Number</p>
              <p className="font-mono font-bold" style={{ color:'#f0c060' }}>{GST}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color:'#7090a8' }}>Startup India DPIIT</p>
              <p className="font-mono font-bold" style={{ color:'#f0c060' }}>{DPIIT}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color:'#7090a8' }}>Business Days</p>
              <p style={{ color:'#d0e0ee' }}>{COMPANY.schedule}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color:'#7090a8' }}>Contact</p>
              <div className="space-y-1.5">
                <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-1.5 hover:underline" style={{ color:'#d0e0ee' }}>
                  <Phone className="h-3.5 w-3.5 shrink-0" style={{ color:'#d4a843' }} />{COMPANY.phone}
                </a>
                <a href={`mailto:${COMPANY.emailInfo}`} className="flex items-center gap-1.5 hover:underline text-xs break-all" style={{ color:'#d0e0ee' }}>
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color:'#d4a843' }} />{COMPANY.emailInfo}
                </a>
                <a href={`mailto:${COMPANY.emailSales}`} className="flex items-center gap-1.5 hover:underline text-xs break-all" style={{ color:'#d0e0ee' }}>
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color:'#d4a843' }} />{COMPANY.emailSales}
                </a>
              </div>
            </div>
            {OFFICES.map(o => (
              <div key={o.key} className="sm:col-span-1">
                <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color:'#7090a8' }}>{o.label}</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color:'#d4a843' }} />
                  <div>
                    <p className="font-medium" style={{ color:'#d0e0ee' }}>{o.city}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color:'#9ab0c4' }}>{o.address}</p>
                    <a href={o.maps} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1.5 hover:underline" style={{ color:'#d4a843' }}>
                      <Navigation className="h-3 w-3" /> Get Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact">
            <Button size="lg" style={{ background:'linear-gradient(135deg,#c8983a,#a07020)', border:'none', color:'#fff' }}>
              Contact Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" style={{ background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.35)', color:'#25d366' }}>
              <MessageSquare className="h-4 w-4" /> WhatsApp Us
            </Button>
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" style={{ background:'rgba(0,136,204,0.1)', border:'1px solid rgba(0,136,204,0.35)', color:'#29a8e8' }}>
              <TG /> Telegram
            </Button>
          </a>
        </div>
      </section>

    </div>
  )
}
