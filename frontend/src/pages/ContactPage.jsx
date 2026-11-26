import React, { useState } from 'react'
import {
  MapPin, Mail, Phone, Building2, Clock,
  AlertCircle, CheckCircle2, MessageSquare, Navigation, FileText, Send, ShieldCheck,
  SendHorizontal, Award, Zap, ChevronDown
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLang } from '../context/LanguageContext.jsx'
import { api } from '../utils/api.js'

/* ── Company constants ── */
const CIN        = 'U66190GJ2026PTC183862'
const GST        = '09AAHCJ6166E1ZD'
const DPIIT      = 'DIPP291171'
const PHONE      = '+91 9022487800'
const EMAIL_INFO = 'info@javitritrading.com'
const EMAIL_SALES= 'sales@javitritrading.com'
const WHATSAPP   = 'https://wa.me/919022487800'
const TELEGRAM   = 'https://t.me/Javitritradingservice'
const SCHEDULE   = 'Monday to Friday (09:00 - 18:00 IST)'
const ADDRESS    = 'Main Bazar, Khakhreru, Fatehpur, Uttar Pradesh – 212656'

const OFFICES = [
  {
    key:    'fatehpur',
    city:   'Fatehpur, Uttar Pradesh',
    address: ADDRESS,
    maps:   'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
  },
]

const MAPS_EMBED_SRC =
  'https://maps.google.com/maps?q=Main+Bazar,+Khakhreru,+Fatehpur,+Uttar+Pradesh+212656&t=&z=14&ie=UTF8&iwloc=&output=embed'

const contactSchema = z.object({
  name:    z.string().min(2,  'Name must be at least 2 characters').max(100),
  email:   z.string().email('Please enter a valid email address'),
  phone:   z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  service: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { t, lang } = useLang()

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    setSubmitError('')
    try {
      await api.contact.submit({
        name:    data.name,
        email:   data.email,
        phone:   data.phone,
        message: data.service ? `[Service: ${data.service}] ${data.message}` : data.message,
      })
      setSubmitted(true)
      reset()
    } catch (err) {
      setSubmitError(err.message || 'Failed to send message. Please try again.')
    }
  }

  /* Success state */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-20 bg-white">
        <div className="h-20 w-20 rounded-3xl flex items-center justify-center bg-blue-50 border-2 border-blue-200 shadow-md">
          <CheckCircle2 className="h-10 w-10 text-[#1d4ed8]" />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black mb-3 text-[#0b1e3f]">
            {lang === 'hi' ? 'पूछताछ सफलतापूर्वक भेज दी गई है!' : 'Message Sent Successfully!'}
          </h1>
          <p className="text-base text-[#334155] leading-relaxed font-medium">
            {lang === 'hi'
              ? 'जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड से संपर्क करने के लिए धन्यवाद। हमारी वरिष्ठ टीम 24 कार्य घंटों में आपसे संपर्क करेगी।'
              : 'Thank you for contacting Javitri Trading Service Pvt. Ltd. Our dedicated advisory manager will review your inquiry and reach out within 24 business hours.'}
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="secondary" className="font-bold border-2 border-[#cbd5e1] text-[#0b1e3f] shadow-xs">
          {lang === 'hi' ? 'अन्य संदेश भेजें' : 'Send Another Message'}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page Header ── */}
      <section className="bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-white border-b border-[#e2e8f0] py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-[#0b1e3f] tracking-tight mb-4">
            {t('contact_heading')}
          </h1>
          <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto leading-relaxed font-medium">
            {t('contact_subheading')}
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Corporate Office & Registry Details */}
          <div className="lg:col-span-5 space-y-6">

            {/* Corporate Registry Card with Luxury FinTech Accents */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />
              
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#e2e8f0]">
                <div className="h-16 w-16 rounded-2xl bg-white border-2 border-slate-200 p-1.5 flex items-center justify-center shadow-xs shrink-0">
                  <img src="/logo.jpeg" alt="Javitri Trading" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0b1e3f] tracking-tight">JAVITRI TRADING SERVICE</h2>
                  <p className="text-xs font-black uppercase tracking-wider text-[#b45309]">Private Limited Company</p>
                </div>
              </div>

              {/* Statutory Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block">Corporate CIN</span>
                  <span className="text-[11px] font-mono font-black text-[#0b1e3f] block truncate" title={CIN}>{CIN}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block">GST</span>
                  <span className="text-[11px] font-mono font-black text-[#1d4ed8] block truncate" title={GST}>{GST}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block">Startup India</span>
                  <span className="text-[11px] font-mono font-black text-[#b45309] block truncate" title={DPIIT}>{DPIIT}</span>
                </div>
              </div>

              {/* Highlighted Corporate Address Card (Prominently Highlighted as requested) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border-2 border-amber-300 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-[#b45309]">
                    <MapPin className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#b45309]">
                    {t('contact_registered_office')}
                  </span>
                </div>
                <p className="text-sm font-black text-[#0b1e3f] leading-relaxed">
                  {ADDRESS}
                </p>
                <div className="pt-1">
                  <a
                    href={OFFICES[0].maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#1d4ed8] hover:text-[#0b1e3f] transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5 text-[#1d4ed8] shrink-0" />
                    <span>{t('contact_get_directions')}</span>
                  </a>
                </div>
              </div>

              {/* Highlighted Operating Schedule Card (Prominently Highlighted as requested) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-white border-2 border-blue-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-blue-100 text-[#1d4ed8]">
                    <Clock className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#1d4ed8]">
                    {lang === 'hi' ? 'आधिकारिक कार्य दिवस' : 'Official Operating Schedule'}
                  </span>
                </div>
                <p className="text-sm font-black text-[#0b1e3f]">
                  📅 Operating: Monday to Friday (09:00 - 18:00 IST)
                </p>
                <p className="text-xs font-bold text-[#b45309]">
                  {lang === 'hi' ? 'शनिवार एवं रविवार अवकाश (बाजार बंद)' : 'Saturday & Sunday Closed (Market Holidays)'}
                </p>
              </div>

              {/* Direct Communication Channels */}
              <div className="space-y-3 pt-2 border-t border-[#f1f5f9] text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200">
                  <span className="font-bold text-[#475569]">{lang === 'hi' ? 'टेलीफोन लाइन:' : 'Telephone Line:'}</span>
                  <a href={`tel:${PHONE}`} className="font-black text-[#0b1e3f] hover:text-[#1d4ed8] text-sm">
                    {PHONE}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200">
                  <span className="font-bold text-[#475569]">{lang === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                  <a href={`mailto:${EMAIL_INFO}`} className="font-black text-[#0b1e3f] hover:text-[#1d4ed8]">
                    {EMAIL_INFO}
                  </a>
                </div>
              </div>

              {/* Direct Connect Buttons (WhatsApp & Telegram Desk) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#eff6ff] border-2 border-[#bfdbfe] text-xs font-black text-[#1d4ed8] hover:bg-[#dbeafe] transition-all shadow-xs"
                >
                  <MessageSquare className="h-4 w-4 text-[#1d4ed8] shrink-0" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={TELEGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-xs font-black text-sky-800 hover:bg-sky-100 transition-all shadow-xs"
                >
                  <Send className="h-4 w-4 text-sky-700 shrink-0" />
                  <span>Telegram</span>
                </a>
              </div>

              {/* Security Alert Notice */}
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#1d4ed8] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#334155] leading-relaxed font-semibold">
                  {t('contact_anti_fraud')}
                </p>
              </div>

            </div>

          </div>

          {/* Right Column: High-Contrast Official Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 royal-gold-line" />
              
              <div>
                <span className="gold-badge mb-2 inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#b45309] shrink-0" />
                  <span>{lang === 'hi' ? 'त्वरित प्रतिक्रिया' : 'Fast Response Desk'}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0b1e3f] tracking-tight">
                  {t('contact_form_title')}
                </h2>
                <p className="text-sm text-[#334155] mt-1 font-medium">
                  {t('contact_form_sub')}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-1.5">
                      {t('contact_name_label')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      placeholder={t('contact_name_ph')}
                      className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-2 border-slate-300 text-[#0b1e3f] font-semibold placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 focus:outline-none transition-all shadow-2xs"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 font-bold mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-1.5">
                      {t('contact_phone_label')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder={t('contact_phone_ph')}
                      className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-2 border-slate-300 text-[#0b1e3f] font-semibold placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 focus:outline-none transition-all shadow-2xs"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 font-bold mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-1.5">
                      {t('contact_email_label')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder={t('contact_email_ph')}
                      className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-2 border-slate-300 text-[#0b1e3f] font-semibold placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 focus:outline-none transition-all shadow-2xs"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 font-bold mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-1.5">
                      {t('contact_service_label')}
                    </label>
                    <select
                      {...register('service')}
                      className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-2 border-slate-300 text-[#0b1e3f] font-bold focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="">{t('contact_service_default')}</option>
                      <option value="Corporate Investment Plan">{t('contact_opt_plan')}</option>
                      <option value="Bike / Car Insurance">{t('contact_opt_auto')}</option>
                      <option value="Health Insurance">{t('contact_opt_health')}</option>
                      <option value="Beti Ke Vivah Plan">{t('contact_opt_vivah')}</option>
                      <option value="Demat & Account Support">{t('contact_opt_demat')}</option>
                      <option value="General Corporate Inquiry">{t('contact_opt_general')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#0b1e3f] mb-1.5">
                    {t('contact_msg_label')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder={t('contact_msg_ph')}
                    className="w-full rounded-2xl px-4 py-3 text-sm bg-white border-2 border-slate-300 text-[#0b1e3f] font-semibold placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 focus:outline-none transition-all resize-none shadow-2xs"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 font-bold mt-1">{errors.message.message}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-xs text-[#334155] leading-relaxed font-medium">
                  {lang === 'hi'
                    ? 'यह फॉर्म सबमिट करके, आप सहमत हैं कि जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड केवल आपकी पूछताछ का उत्तर देने हेतु आपके विवरण का सुरक्षित रूप से उपयोग करेगी।'
                    : 'By submitting this inquiry, you confirm that Javitri Trading Service Pvt. Ltd. may process your contact details solely to deliver official advisory communication.'}
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full font-black bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] !text-white shadow-[0_4px_16px_rgba(29,78,216,0.35)] py-4 text-base cursor-pointer"
                >
                  <Send className="h-4 w-4 !text-white shrink-0" />
                  <span className="!text-white">{t('contact_submit')}</span>
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* ── Interactive Google Maps Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md">
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-black text-[#0b1e3f]">Javitri Trading Service Pvt. Ltd. Headquarters</p>
              <p className="text-xs text-[#475569] font-medium">{ADDRESS}</p>
            </div>
            <a
              href={OFFICES[0].maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-white border border-[#cbd5e1] text-[#0b1e3f] hover:bg-[#f8fafc] shadow-xs"
            >
              <Navigation className="h-3.5 w-3.5 text-[#1d4ed8] shrink-0" />
              <span>{t('contact_get_directions')}</span>
            </a>
          </div>
          <iframe
            src={MAPS_EMBED_SRC}
            width="100%"
            height="380"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Javitri Trading Office Location"
          />
        </div>
      </section>

    </div>
  )
}