import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, GraduationCap, BarChart2, TrendingUp, Users,
  Briefcase, ShieldCheck, ArrowRight, MessageSquare, Bell, Award, CheckCircle2,
  Calendar, Landmark, FileText, Sparkles, Car, HeartPulse, HeartHandshake, PhoneCall
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { useLang } from '../context/LanguageContext.jsx'

const WHATSAPP_URL = 'https://wa.me/919022487800'

export default function ServicesPage() {
  const { t, lang } = useLang()

  const SERVICES = [
    {
      icon: TrendingUp,
      title: t('service_equity_title'),
      desc: t('service_equity_desc'),
      tag: lang === 'hi' ? 'निवेश' : 'Investment',
      badgeCls: 'bg-blue-50 text-[#1d4ed8] border-blue-200',
      link: '/plans',
      linkText: lang === 'hi' ? 'निवेश प्लान्स देखें' : 'Explore Investment Plans',
      features: [
        lang === 'hi' ? 'सोमवार से शुक्रवार दैनिक पेआउट (महीने के 22 सत्र)' : 'Monday to Friday daily payouts (22 sessions/month)',
        lang === 'hi' ? '100% औपचारिक कानूनी अनुबंध और पारदर्शिता' : '100% documented agreements & statutory compliance',
        lang === 'hi' ? 'सप्ताहांत (शनि व रवि) शून्य जोखिम एवं अवकाश' : 'Zero weekend market exposure'
      ],
    },
    {
      icon: Car,
      title: t('service_auto_title'),
      desc: t('service_auto_desc'),
      tag: lang === 'hi' ? 'वाहन बीमा' : 'Vehicle Insurance',
      badgeCls: 'bg-amber-50 text-[#b45309] border-amber-200',
      link: '/contact',
      linkText: lang === 'hi' ? 'बीमा कोटेशन प्राप्त करें' : 'Request Vehicle Quote',
      features: [
        lang === 'hi' ? 'बाइक एवं कार दोनों के लिए कॉम्प्रिहेंसिव पॉलिसी' : 'Comprehensive coverage for bikes & cars',
        lang === 'hi' ? 'जीरो डेप्रिसिएशन एवं 24x7 ऑन-रोड सहायता' : 'Zero-depreciation rider & 24x7 roadside assist',
        lang === 'hi' ? 'पूरे भारत में कैशलेस गैरेज नेटवर्क' : 'Cashless network across India'
      ],
    },
    {
      icon: HeartPulse,
      title: t('service_health_title'),
      desc: t('service_health_desc'),
      tag: lang === 'hi' ? 'स्वास्थ्य बीमा' : 'Health Insurance',
      badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      link: '/contact',
      linkText: lang === 'hi' ? 'हेल्थ पॉलिसी परामर्श लें' : 'Get Health Cover Consultation',
      features: [
        lang === 'hi' ? '10,000+ अस्पतालों में कैशलेस इलाज' : 'Cashless admission in 10,000+ hospitals',
        lang === 'hi' ? 'गंभीर बीमारी एवं डे-केयर सर्जरी कवर' : 'Critical illness cover & day-care treatments',
        lang === 'hi' ? 'धारा 80D के तहत संपूर्ण आयकर बचत' : 'Full tax deduction under Section 80D'
      ],
    },
    {
      icon: HeartHandshake,
      title: t('service_vivah_title'),
      desc: t('service_vivah_desc'),
      tag: lang === 'hi' ? 'कन्या सुरक्षा' : 'Family Future',
      badgeCls: 'bg-purple-50 text-purple-800 border-purple-200',
      link: '/contact',
      linkText: lang === 'hi' ? 'बेटी विवाह योजना शुरू करें' : 'Start Daughter Plan',
      features: [
        lang === 'hi' ? 'बेटी के सुखद विवाह हेतु समर्पित वेल्थ फंड' : "Dedicated fund for daughter's marriage",
        lang === 'hi' ? 'उच्च शिक्षा एवं दीर्घकालिक कम्पाउंडिंग ग्रोथ' : 'Higher education & long-term wealth compounding',
        lang === 'hi' ? 'व्यक्तिगत रिलेशनशिप मैनेजर द्वारा मार्गदर्शन' : 'Dedicated relationship manager guidance'
      ],
    },
    {
      icon: GraduationCap,
      title: t('service_demat_title'),
      desc: t('service_demat_desc'),
      tag: lang === 'hi' ? 'ऑनबोर्डिंग' : 'Onboarding',
      badgeCls: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      link: '/contact',
      linkText: lang === 'hi' ? 'डीमैट सहायता प्राप्त करें' : 'Demat Assistance',
      features: [
        lang === 'hi' ? 'तत्काल डिजिटल केवाईसी एवं सत्यापन' : 'Instant digital KYC & depository setup',
        lang === 'hi' ? 'ब्रोकरेज शुल्क बचत अनुकूलन' : 'Brokerage fee optimization',
        lang === 'hi' ? 'सीधा SEBI-पंजीकृत डिपॉजिटरी एकीकरण' : 'Direct SEBI-registered depository integration'
      ],
    },
    {
      icon: BarChart2,
      title: t('service_mentorship_title'),
      desc: t('service_mentorship_desc'),
      tag: lang === 'hi' ? 'प्रशिक्षण' : 'Education',
      badgeCls: 'bg-sky-50 text-sky-800 border-sky-200',
      link: '/contact',
      linkText: lang === 'hi' ? 'ट्रेनिंग शेड्यूल जानें' : 'View Training Schedule',
      features: [
        lang === 'hi' ? 'प्राइस एक्शन, ब्रेकआउट और कैंडलस्टिक संरचनाएं' : 'Price action & candlestick structures',
        lang === 'hi' ? 'वॉल्यूम वेटेड एवरेज प्राइस (VWAP) तकनीक' : 'Volume weighted average price (VWAP)',
        lang === 'hi' ? 'ऑप्शंस हेजिंग एवं स्ट्रिक्ट स्टॉप-लॉस अनुशासन' : 'Options hedging & strict drawdown control'
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-white border-b border-[#e2e8f0] py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-[#0b1e3f] tracking-tight mb-4">
            {t('services_heading')}
          </h1>
          <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto leading-relaxed font-medium">
            {t('services_subheading')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 rounded-2xl bg-white border border-[#cbd5e1] text-xs font-bold text-[#0b1e3f] shadow-xs flex items-center gap-2">
              <Award className="h-4 w-4 text-[#b45309] shrink-0" />
              <span>{t('govt_recognized')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map(({ icon: Icon, title, desc, tag, badgeCls, link, linkText, features }) => {
            return (
              <div
                key={title}
                className="p-8 rounded-3xl bg-white border-2 border-[#e2e8f0] shadow-sm hover:border-[#1d4ed8] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#cbd5e1] to-transparent group-hover:from-[#0b1e3f] group-hover:via-[#1d4ed8] group-hover:to-[#d4af37] transition-all" />
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8] group-hover:scale-105 transition-transform shadow-xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${badgeCls}`}>
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#0b1e3f] mb-2 group-hover:text-[#1d4ed8] transition-colors">{title}</h3>
                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed mb-6 font-normal">{desc}</p>

                  {/* Feature bullet list */}
                  <div className="space-y-2 pt-4 border-t border-[#f1f5f9]">
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#0f172a] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1d4ed8] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#f1f5f9]">
                  <Link
                    to={link}
                    className="inline-flex items-center gap-2 text-xs font-black text-[#1d4ed8] hover:text-[#0b1e3f] transition-colors"
                  >
                    <span>{linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Monday-Friday Market Operating Framework */}
      <section className="py-14 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border-2 border-[#cbd5e1] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="h-16 w-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8] shrink-0 shadow-xs">
              <Calendar className="h-8 w-8 shrink-0" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                {lang === 'hi' ? 'संस्थागत कार्य दिवस चक्र' : 'Institutional Operating Schedule'}
              </div>
              <h3 className="text-xl font-black text-[#0b1e3f]">
                {lang === 'hi' ? 'सोमवार से शुक्रवार कड़ा परिचालन अनुशासन' : 'Strict Monday to Friday Operational Discipline'}
              </h3>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'हमारे सभी निवेश रिटर्न प्रोजेक्शन और ट्रेडिंग कार्य नेशनल स्टॉक एक्सचेंज (NSE) और बॉम्बे स्टॉक एक्सचेंज (BSE) के 5 सक्रिय दिनों (सोमवार से शुक्रवार) पर संचालित होते हैं। सप्ताहांत में व्यक्तिगत समीक्षा व आगामी सप्ताह की रणनीति तैयार की जाती है।'
                  : 'All trading desk simulations, mentorship classes, and investment return projections are anchored to the 5 active trading days (Monday to Friday) observed by the NSE and BSE. Weekends are reserved for personal risk review and strategic preparation.'}
              </p>
            </div>
            <div className="shrink-0">
              <Link to="/plans">
                <Button size="md" variant="primary" className="font-black !text-white bg-[#1d4ed8] hover:bg-[#1e40af] shadow-md">
                  {lang === 'hi' ? 'रिटर्न सिम्युलेटर देखें' : 'View Return Simulator'} <ArrowRight className="h-4 w-4 !text-white shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-black text-[#0b1e3f]">{t('cta_title')}</h2>
          <p className="text-base text-[#334155] max-w-xl mx-auto leading-relaxed font-medium">
            {t('cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="primary" className="font-black !text-white bg-[#1d4ed8] hover:bg-[#1e40af] shadow-md">
                {t('cta_contact')} <ArrowRight className="h-4 w-4 !text-white shrink-0" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="font-black text-[#1d4ed8] border-2 border-[#bfdbfe] hover:bg-[#eff6ff] shadow-xs">
                <MessageSquare className="h-4 w-4 text-[#1d4ed8] shrink-0" /> {t('cta_whatsapp')}
              </Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}