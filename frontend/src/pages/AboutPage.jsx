import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, MapPin, FileText, Users, ShieldCheck,
  BookOpen, TrendingUp, ArrowRight, MessageSquare, Phone, Mail, Navigation
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

/* ── Company constants ───────────────────────────────────────────────────── */
const CIN        = 'U66190GJ2026PTC183862'
const COMPANY    = {
  name:     'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  shortName:'Javitri Trading Service Pvt. Ltd.',
  phone:    '+91 9022487800',
  email:    'javitritradingservice86@gmail.com',
  schedule: 'Monday to Friday',
}

const OFFICES = [
  {
    key:    'surat',
    city:   'Surat, Gujarat',
    label:  'Surat Office',
    address:'B.134 YOGESHWAR NAGAR, SACHIN, SURAT, GUJARAT – 394230',
    maps:   'https://maps.google.com/?q=Javitri+Trading+Service+Sachin+Surat+Gujarat',
  },
  {
    key:    'fatehpur',
    city:   'Fatehpur, Uttar Pradesh',
    label:  'Fatehpur Office',
    address:'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
    maps:   'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
  },
]

const WHATSAPP_URL = 'https://wa.me/919022487800'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    desc:  'All plan terms, fees, and conditions are disclosed before any commitment is made.',
  },
  {
    icon: Users,
    title: 'Client-Focused',
    desc:  'Every client and learner receives personalised guidance through their market education journey.',
  },
  {
    icon: BookOpen,
    title: 'Education First',
    desc:  'Our core focus is building genuine market knowledge — helping beginners understand stock markets before they invest.',
  },
  {
    icon: TrendingUp,
    title: 'Market Awareness',
    desc:  'We help clients stay aware of market developments, trends, and risk factors relevant to investment decisions.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
          style={{ borderColor: 'rgba(212,168,67,0.4)', background: 'rgba(212,168,67,0.08)', color: '#d4a843' }}>
          <Building2 className="h-3.5 w-3.5" />
          About Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight" style={{ color: '#f0f4f8' }}>
          About <span className="gradient-text">Javitri Trading Service Pvt. Ltd.</span>
        </h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed mb-6" style={{ color: '#9ab0c4' }}>
          Javitri Trading Service Pvt. Ltd. is a stock market education and trading guidance business
          with offices in Surat (Gujarat) and Fatehpur (Uttar Pradesh). Our focus is on helping
          individuals — especially beginners — understand the Indian stock market, learn trading
          concepts, and make informed decisions with greater confidence.
        </p>

        {/* CIN badge — prominent */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mx-auto"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.4)' }}>
          <FileText className="h-4 w-4 shrink-0" style={{ color: '#d4a843' }} />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#8aa4ba' }}>
              Corporate Identity Number (CIN)
            </p>
            <p className="text-sm font-mono font-bold" style={{ color: '#f0c060' }}>{CIN}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-5" style={{ color: '#7090a8' }}>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: '#d4a843' }} />
            Surat, Gujarat &amp; Fatehpur, UP
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" style={{ color: '#d4a843' }} />
            Mon–Fri Schedule
          </span>
        </div>
      </section>

      {/* ── What we do ── */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(15,36,96,0.4)', border: '1px solid rgba(212,168,67,0.15)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#f0f4f8' }}>What We Do</h2>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#aabbcc' }}>
            <p>
              At Javitri Trading Service Pvt. Ltd., we provide stock market education, beginner learning support,
              trading guidance, and market awareness services. We work with individuals who want to learn
              how the equity, options, commodity, and forex markets operate — covering everything from the
              basics to more advanced analytical concepts.
            </p>
            <p>
              We assist clients with Demat account opening guidance, explain how to read and use trading
              platforms, and offer structured educational content on market terminology, chart reading,
              and risk management principles.
            </p>
            <p>
              We also offer investment plans with associated support services. All figures shown are
              illustrative. No figures on this website constitute guaranteed returns or income promises.
            </p>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#f0f4f8' }}>
          Our <span className="gradient-text">Principles</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="flex gap-4 p-5 rounded-2xl transition-all duration-200"
              style={{ border: '1px solid rgba(212,168,67,0.15)', background: 'rgba(15,36,96,0.33)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.42)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.15)'; e.currentTarget.style.transform = 'none' }}
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.28)' }}>
                <Icon className="h-5 w-5" style={{ color: '#d4a843' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: '#f0f4f8' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9ab0c4' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Company information card ── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(15,36,96,0.5)', border: '1px solid rgba(212,168,67,0.25)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: '#f0f4f8' }}>Company Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">

            {/* Company name */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#7090a8' }}>Legal Company Name</p>
              <p className="font-semibold" style={{ color: '#f0f4f8' }}>{COMPANY.name}</p>
            </div>

            {/* CIN */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#7090a8' }}>CIN</p>
              <p className="font-mono font-bold text-base" style={{ color: '#f0c060' }}>{CIN}</p>
              <p className="text-xs mt-0.5" style={{ color: '#7090a8' }}>Incorporated under Companies Act, 2013</p>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#7090a8' }}>Business Days</p>
              <p style={{ color: '#d0e0ee' }}>{COMPANY.schedule}</p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#7090a8' }}>Contact</p>
              <div className="space-y-1.5">
                <a href={`tel:${COMPANY.phone}`}
                  className="flex items-center gap-1.5 hover:underline"
                  style={{ color: '#d0e0ee' }}>
                  <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                  {COMPANY.phone}
                </a>
                <a href={`mailto:${COMPANY.email}`}
                  className="flex items-center gap-1.5 hover:underline text-xs break-all"
                  style={{ color: '#d0e0ee' }}>
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                  {COMPANY.email}
                </a>
              </div>
            </div>

            {/* Both offices — full width */}
            {OFFICES.map((office) => (
              <div key={office.key} className="sm:col-span-1">
                <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#7090a8' }}>
                  {office.label}
                </p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: '#d4a843' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#d0e0ee' }}>{office.city}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9ab0c4' }}>
                      {office.address}
                    </p>
                    <a href={office.maps} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1.5 hover:underline"
                      style={{ color: '#d4a843' }}>
                      <Navigation className="h-3 w-3" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact">
            <Button size="lg"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Contact Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.35)', color: '#25d366' }}>
              <MessageSquare className="h-4 w-4" />
              WhatsApp Us
            </Button>
          </a>
        </div>
      </section>

    </div>
  )
}
