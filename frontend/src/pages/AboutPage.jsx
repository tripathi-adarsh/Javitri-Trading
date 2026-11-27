import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, MapPin, FileText, Users, ShieldCheck,
  BookOpen, TrendingUp, ArrowRight, MessageSquare, Phone, Mail, Navigation,
  ChevronLeft, ChevronRight, Award, Briefcase, GraduationCap, Camera, CheckCircle2,
  X, ZoomIn, Eye, Sparkles, Scale, Landmark, Shield
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'

/* ── Statutory Constants ── */
const CIN   = 'U66190GJ2026PTC183862'
const GST   = '09AAHCJ6166E1ZD'
const DPIIT = 'DIPP291171'
const ROC   = 'RoC - Kanpur, Uttar Pradesh'

const COMPANY = {
  legalName: 'JAVITRI TRADING SERVICE PRIVATE LIMITED',
  brandName: 'Javitri Trading Service Pvt. Ltd.',
  tagline: 'Empowering Retail Participants with Institutional-Grade Market Discipline',
  phone: '+91 9022487800',
  emailInfo: 'info@javitritrading.com',
  emailSales: 'sales@javitritrading.com',
  schedule: 'Monday to Friday (09:00 - 18:00 IST)',
}

const OFFICES = [{
  key: 'fatehpur',
  city: 'Fatehpur, Uttar Pradesh',
  label: 'Registered Office',
  address: 'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
  maps: 'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
}]

const WHATSAPP_URL = 'https://wa.me/919022487800'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Absolute Statutory Transparency',
    desc: 'All plan parameters, proposed figures, and contractual terms are formally documented and disclosed prior to any onboarding commitment.',
  },
  {
    icon: Users,
    title: 'Dedicated Client Mentorship',
    desc: 'Every registered client is assigned a dedicated relationship manager and senior market mentor to provide guidance throughout their journey.',
  },
  {
    icon: BookOpen,
    title: 'Education-First Philosophy',
    desc: 'We prioritize genuine analytical capability over speculative hype—teaching technical chart structures, order book depth, and macroeconomic indicators.',
  },
  {
    icon: TrendingUp,
    title: 'Monday to Friday Discipline',
    desc: 'Our operations strictly align with standard Indian exchange schedules (NSE/BSE), instilling professional risk budgeting across all 5 trading days.',
  },
]

const DIRECTORS = [
  {
    name: 'Gende Lal Nishad',
    designation: 'Managing Director & Chief Executive Officer',
    qualifications: 'B.Com, MBA (Finance)',
    experience: '20+ Years in Capital Markets & Financial Services',
    focus: 'Institutional Risk Hedging, Corporate Strategy & Strategic Expansion',
    message: 'Our corporate mission is to democratize institutional-grade stock market education and disciplined portfolio guidance across India. Every aspiring retail participant deserves structured, ethical, and fully transparent financial mentoring.',
    badges: [
      { icon: Award, label: 'Managing Director' },
      { icon: GraduationCap, label: 'MBA (Finance)' },
      { icon: Briefcase, label: '20+ Yrs Financial Experience' },
      { icon: Landmark, label: 'Corporate Board Member' },
    ],
  },
  {
    name: 'Dinesh Singh',
    designation: 'Director & Co-Founder',
    qualifications: 'B.A. (Economics & Management)',
    experience: '10+ Years in Trading Systems & Market Development',
    focus: 'Client Relationship Systems, Operations & Market Research',
    message: 'We are committed to building a transparent, resilient financial ecosystem where client protection and comprehensive market education lead every decision. Integrity and clarity govern our relationships with all participants.',
    badges: [
      { icon: Award, label: 'Director & Co-Founder' },
      { icon: TrendingUp, label: '10+ Yrs Market Development' },
      { icon: Users, label: 'Client Operations Head' },
      { icon: ShieldCheck, label: 'Compliance Advocate' },
    ],
  },
]

/* ── Authentic Corporate Facilities & Operations Photos ── */
const CORPORATE_GALLERY = [
  { src: '/gallery/img1.jpeg' },
  { src: '/gallery/img2.jpeg' },
  { src: '/gallery/img3.jpeg' },
  { src: '/gallery/img4.jpeg' },
  { src: '/gallery/img5.jpeg' },
  { src: '/gallery/img6.jpeg' },
  { src: '/gallery/img7.jpeg' },
  { src: '/gallery/img8.jpeg' },
  { src: '/gallery/img9.jpeg' },
  { src: '/gallery/img10.jpeg' },
  { src: '/gallery/img11.jpeg' },
  { src: '/gallery/img12.jpeg' },
]

export default function AboutPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const openLightbox = (index) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const nextPhoto = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev + 1) % CORPORATE_GALLERY.length)
  }, [lightboxIndex])

  const prevPhoto = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev - 1 + CORPORATE_GALLERY.length) % CORPORATE_GALLERY.length)
  }, [lightboxIndex])

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'ArrowLeft') prevPhoto()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, nextPhoto, prevPhoto])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page Header / Hero ── */}
      <section className="bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-white border-b border-[#e2e8f0] py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-[#0b1e3f] tracking-tight mb-4">
            About {COMPANY.brandName}
          </h1>
          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed mb-8">
            An incorporated financial education institution and market guidance entity headquartered in Uttar Pradesh, dedicated to empowering retail traders across India through disciplined Monday to Friday execution frameworks.
          </p>

          {/* Statutory Verification Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Corporate CIN', val: CIN, color: 'text-[#1d4ed8]' },
              { label: 'GST', val: GST, color: 'text-[#b45309]' },
              { label: 'Startup India', val: ` ${DPIIT}`, color: 'text-[#0b1e3f]' },
              { label: 'ROC Jurisdiction', val: ROC, color: 'text-[#334155]' },
            ].map(({ label, val, color }) => (
              <div key={label} className="px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{label}</p>
                <p className={`text-xs font-mono font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Corporate Mission & Overview ── */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-3xl font-black text-[#0b1e3f] tracking-tight">
              Institutional Standards, Retail Transparency
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              <strong>JAVITRI TRADING SERVICE PRIVATE LIMITED</strong> was incorporated to bridge the critical gap between institutional financial strategy and retail market participation. We operate with a strict ethos of statutory compliance, data-driven technical analysis, and structured risk protection.
            </p>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Our market training programs and corporate investment plans strictly mirror standard Indian stock exchange trading sessions—running Monday through Friday. We equip our clients with comprehensive Demat guidance, daily market sentiment debriefs, and transparent performance audits.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-xs text-[#64748b] font-medium">Trading Schedule</p>
                <p className="text-sm font-bold text-[#0f172a] mt-0.5">Monday to Friday</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-xs text-[#64748b] font-medium">Market Cycles</p>
                <p className="text-sm font-bold text-[#2563eb] mt-0.5">22 Days / Month</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] col-span-2 sm:col-span-1">
                <p className="text-xs text-[#64748b] font-medium">Agreements</p>
                <p className="text-sm font-bold text-[#0f172a] mt-0.5">100% Documented</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-[#e2e8f0] p-7 shadow-lg space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#e2e8f0]">
                <div className="h-12 w-12 rounded-2xl bg-white border border-[#cbd5e1] p-1.5 shadow-xs flex items-center justify-center">
                  <img src="/logo.jpeg" alt="Javitri Trading Service Pvt. Ltd." className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0f172a]">{COMPANY.legalName}</h3>
                  <p className="text-xs text-[#2563eb] font-bold">CIN: {CIN}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#475569]">
                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Company Type:</span>
                  <span className="font-semibold text-[#0f172a]">Private Limited Company</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Registration Authority:</span>
                  <span className="font-semibold text-[#0f172a]">RoC - Kanpur (Govt. of India)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Main Trading Schedule:</span>
                  <span className="font-semibold text-[#2563eb]">Mon–Fri (5 Days/Wk, 22 Days/Mo)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Corporate Bank Accounts:</span>
                  <span className="font-semibold text-[#0f172a]">Scheduled Commercial Banks</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#64748b]">Registered Address:</span>
                  <span className="font-semibold text-[#0f172a] text-right truncate max-w-[200px]">Fatehpur, Uttar Pradesh</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/plans">
                  <Button size="md" variant="primary" className="w-full justify-center">
                    Explore Corporate Plans <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Executive Leadership: Board of Directors ── */}
      <section className="py-16 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] uppercase tracking-wider mb-2">
              <Landmark className="h-3.5 w-3.5" /> Corporate Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a]">Board of Directors</h2>
            <p className="text-sm text-[#64748b] mt-1 max-w-xl mx-auto">
              Distinguished market professionals guiding Javitri Trading Service Pvt. Ltd. with complete transparency, regulatory compliance, and fiduciary responsibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DIRECTORS.map((dir) => (
              <div
                key={dir.name}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Director Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-xl font-extrabold text-[#2563eb]">
                        {dir.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#0f172a]">{dir.name}</h3>
                        <p className="text-xs font-bold text-[#2563eb] mt-0.5">{dir.designation}</p>
                        <p className="text-xs text-[#64748b] mt-0.5">{dir.qualifications}</p>
                      </div>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563eb] shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Credentials & Focus */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                      <Briefcase className="h-4 w-4 text-[#2563eb] shrink-0" />
                      <span><strong>Experience:</strong> {dir.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                      <Scale className="h-4 w-4 text-[#2563eb] shrink-0" />
                      <span><strong>Key Portfolio:</strong> {dir.focus}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dir.badges.map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f8fafc] border border-[#e2e8f0] text-[#334155]"
                      >
                        <Icon className="h-3 w-3 text-[#2563eb]" />
                        <span>{label}</span>
                      </span>
                    ))}
                  </div>

                  {/* Leadership Statement */}
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs sm:text-sm text-[#334155] italic leading-relaxed relative">
                    <span className="text-2xl text-[#2563eb]/30 font-serif leading-none mr-1">“</span>
                    {dir.message}
                    <span className="text-2xl text-[#2563eb]/30 font-serif leading-none ml-1">”</span>
                  </div>
                </div>

                {/* Director Verification Footer */}
                <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1 font-semibold text-[#2563eb]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Registered Director
                  </span>
                  <span>Javitri Trading Service Pvt. Ltd.</span>
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Commitment Statement */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Institutional Fiduciary Pledge</p>
              <h3 className="text-lg font-bold text-[#0f172a]">Direct Executive Accountability</h3>
              <p className="text-xs text-[#475569] max-w-xl leading-relaxed">
                Every client agreement is executed under direct executive oversight. We maintain an open grievance channel directly accessible to our leadership desk.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-4 bg-[#f8fafc] px-5 py-3 rounded-2xl border border-[#e2e8f0]">
              <img src="/signature.png" alt="Executive Seal & Signature" className="h-10 w-auto object-contain opacity-80" />
              <div className="text-left">
                <p className="text-xs font-bold text-[#0f172a]">Authorized Signatory</p>
                <p className="text-[10px] text-[#64748b]">Javitri Trading Service Pvt. Ltd.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corporate Principles & Values ── */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Corporate Culture</span>
          <h2 className="text-3xl font-extrabold text-[#0f172a] mt-2">Institutional Principles</h2>
          <p className="text-sm text-[#64748b] mt-1">The foundational pillars that guide our customer relationships and market operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex gap-5 hover:border-[#cbd5e1] hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6 text-[#2563eb]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a] mb-1.5">{title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Corporate Facilities & Operations Showcase (HD Lightbox Gallery) ── */}
      <section id="gallery" className="py-16 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
              Corporate Facilities &amp; Operations Gallery
            </h2>
            <p className="text-sm text-[#64748b] mt-2">
              Photographs representing operations and premises of Javitri Trading Service Pvt. Ltd. Click any photo to zoom.
            </p>
          </div>

          {/* Photo Grid - Clean image cards with hover zoom button, no hardcoded text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {CORPORATE_GALLERY.map((photo, idx) => (
              <div
                key={photo.src + idx}
                onClick={() => openLightbox(idx)}
                className="group relative bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs hover:border-[#1d4ed8] hover:shadow-lg transition-all duration-200 cursor-pointer aspect-[16/10]"
              >
                <img
                  src={photo.src}
                  alt="Corporate facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/60 px-3.5 py-2 rounded-xl backdrop-blur-xs shadow-md">
                    <ZoomIn className="h-4 w-4 text-blue-300" /> Click to Zoom
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#64748b] mt-8">
            All photographs represent authentic operations and registered premises of <strong>JAVITRI TRADING SERVICE PRIVATE LIMITED</strong>.
          </p>
        </div>
      </section>

      {/* ── Statutory & Headquarters Info Card ── */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e2e8f0] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Statutory &amp; Corporate Identification</h2>
              <p className="text-xs text-[#64748b]">Certified corporate records under Ministry of Corporate Affairs, Government of India</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-200 self-start sm:self-auto">
              <Shield className="h-3.5 w-3.5" /> Active &amp; Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Corporate Name</p>
              <p className="font-bold text-[#0f172a] mt-0.5">{COMPANY.legalName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Corporate Identity Number (CIN)</p>
              <p className="font-mono font-bold text-[#1e3a8a] mt-0.5">{CIN}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">GST Registration Number</p>
              <p className="font-mono font-bold text-[#2563eb] mt-0.5">{GST}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Government Recognition</p>
              <p className="font-mono font-bold text-[#0f172a] mt-0.5">Startup India Registered ({DPIIT})</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Registered Office</p>
              <p className="text-xs text-[#334155] leading-relaxed mt-0.5">{OFFICES[0].address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Operational Working Schedule</p>
              <p className="text-xs text-[#334155] mt-0.5">{COMPANY.schedule}</p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="text-center mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact">
            <Button size="lg" variant="primary">
              Contact Corporate Headquarters <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="text-[#2563eb] border-[#bfdbfe] hover:bg-[#eff6ff]">
              <MessageSquare className="h-4 w-4 text-[#2563eb]" /> WhatsApp Corporate Desk
            </Button>
          </a>
        </div>
      </section>

      {/* ── Fullscreen HD Lightbox Modal ── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white shrink-0">
              <span className="text-xs font-bold text-[#64748b]">
                Photo {lightboxIndex + 1} of {CORPORATE_GALLERY.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="h-9 w-9 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[460px]">
              <img
                src={CORPORATE_GALLERY[lightboxIndex].src}
                alt="Corporate Facility"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 hover:bg-white text-[#0f172a] shadow-lg flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 hover:bg-white text-[#0f172a] shadow-lg flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
