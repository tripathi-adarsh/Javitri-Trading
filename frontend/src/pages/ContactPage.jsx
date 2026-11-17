import React, { useState } from 'react'
import {
  MapPin, Mail, Phone, Building2, Clock,
  AlertCircle, CheckCircle2, MessageSquare, Navigation, FileText
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Input  from '../components/ui/Input.jsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLang } from '../context/LanguageContext.jsx'
import { api } from '../utils/api.js'

/* ── Company constants ───────────────────────────────────────────────────── */
const CIN        = 'U66190GJ2026PTC183862'
const GST        = '09AAHCJ6166E1ZD'
const DPIIT      = 'DIPP291171'
const PHONE      = '+91 9022487800'
const EMAIL_INFO = 'info@javitritrading.com'
const EMAIL_SALES= 'sales@javitritrading.com'
const WHATSAPP   = 'https://wa.me/919022487800'
const TELEGRAM   = 'https://t.me/Javitritradingservice'
const SCHEDULE   = 'Monday to Friday'

const OFFICES = [
  {
    key:    'fatehpur',
    city:   'Fatehpur, Uttar Pradesh',
    address:'Main Bazar, Khakhreru, FATEHPUR, UTTAR PRADESH – 212656',
    maps:   'https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656',
  },
]

/* Google Maps embed src from user's provided iframe */
const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.818320343149!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399b47d3f58ca811%3A0xf23800cd427f7afa!2sJavitri%20Trading%20Service%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1792751526079!5m2!1sen!2sin'

/* ── Validation schema ───────────────────────────────────────────────────── */
const contactSchema = z.object({
  name:    z.string().min(2,  'Name must be at least 2 characters').max(100),
  email:   z.string().email('Please enter a valid email address'),
  phone:   z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { t } = useLang()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
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
        message: data.message,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Failed to send message. Please try again.')
    }
  }

  /* Success state */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: '#080f22' }}>
        <div className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,102,69,0.18)', border: '1px solid rgba(26,102,69,0.4)' }}>
          <CheckCircle2 className="h-8 w-8" style={{ color: '#4ade80' }} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f0f4f8' }}>{t('contact_success')}</h1>
          <p className="text-sm max-w-sm" style={{ color: '#9ab0c4' }}>{t('contact_success_sub')}</p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="secondary">Send Another Message</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#080f22' }}>

      {/* ── Page header ── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#d4a843' }}>
          <MessageSquare className="h-3.5 w-3.5" />
          Contact Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: '#f0f4f8' }}>
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: '#9ab0c4' }}>
          Have a question about our services, investment plans, or learning support?
          We're available Monday to Friday.
        </p>
      </section>

      {/* ── Main grid ── */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN — details ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Company identity card */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(15,36,96,0.55)', border: '1px solid rgba(212,168,67,0.28)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 shrink-0" style={{ color: '#d4a843' }} />
                <p className="text-sm font-bold" style={{ color: '#f0f4f8' }}>
                  JAVITRI TRADING SERVICE PRIVATE LIMITED
                </p>
              </div>
              {/* CIN */}
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8aa4ba' }}>CIN</p>
                  <p className="text-xs font-mono font-semibold" style={{ color: '#f0c060' }}>{CIN}</p>
                </div>
              </div>
              {/* GST */}
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8aa4ba' }}>GST Number</p>
                  <p className="text-xs font-mono font-semibold" style={{ color: '#f0c060' }}>{GST}</p>
                </div>
              </div>
              {/* DPIIT */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8aa4ba' }}>Startup India DPIIT</p>
                  <p className="text-xs font-mono font-semibold" style={{ color: '#f0c060' }}>{DPIIT}</p>
                </div>
              </div>

              {/* Both offices */}
              <div className="space-y-4">
                {OFFICES.map((office, idx) => (
                  <div key={office.key}>
                    {idx > 0 && <div className="h-px my-3" style={{ background: 'rgba(212,168,67,0.15)' }} />}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: '#d4a843' }} />
                      <p className="text-xs font-semibold" style={{ color: '#d4a843' }}>{office.city}</p>
                    </div>
                    <p className="text-xs leading-relaxed pl-5" style={{ color: '#d0e0ee' }}>
                      {office.address}
                    </p>
                    <a href={office.maps} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1.5 pl-5 hover:underline"
                      style={{ color: '#d4a843' }}>
                      <Navigation className="h-3 w-3" />
                      Get Directions
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone / Email / Hours */}
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(15,36,96,0.5)', border: '1px solid rgba(212,168,67,0.22)' }}>
              <div className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <div>
                  <a href={`tel:${PHONE}`} className="text-sm font-medium hover:underline"
                    style={{ color: '#f0f4f8' }}>{PHONE}</a>
                  <p className="text-xs mt-0.5" style={{ color: '#7090a8' }}>Click to call</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <div className="space-y-0.5">
                  <a href={`mailto:${EMAIL_INFO}`}
                    className="block text-xs hover:underline break-all leading-relaxed"
                    style={{ color: '#d0e0ee' }}>{EMAIL_INFO}</a>
                  <a href={`mailto:${EMAIL_SALES}`}
                    className="block text-xs hover:underline break-all leading-relaxed"
                    style={{ color: '#d0e0ee' }}>{EMAIL_SALES}</a>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <p className="text-sm" style={{ color: '#d0e0ee' }}>{SCHEDULE}</p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', color: '#25d366' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.12)'}>
              <MessageSquare className="h-5 w-5" />
              Chat on WhatsApp
            </a>

            {/* Telegram CTA */}
            <a href={TELEGRAM} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.35)', color: '#29a8e8' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,136,204,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,136,204,0.1)'}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Join on Telegram
            </a>

            {/* Security note */}
            <div className="rounded-xl p-4 flex gap-2"
              style={{ background: 'rgba(200,152,58,0.06)', border: '1px solid rgba(212,168,67,0.2)' }}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
              <p className="text-xs leading-relaxed" style={{ color: '#b8ccd8' }}>
                We will <strong style={{ color: '#f0f4f8' }}>never</strong> ask for your passwords,
                OTPs, PINs, or banking credentials through any channel.
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN — form ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(15,36,96,0.4)', border: '1px solid rgba(212,168,67,0.18)' }}>
              <h2 className="text-base font-semibold mb-5" style={{ color: '#f0f4f8' }}>
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('contact_name')}
                    name="name"
                    placeholder="Your full name"
                    required
                    register={register}
                    error={errors.name?.message}
                  />
                  <Input
                    label={t('contact_phone')}
                    name="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    required
                    register={register}
                    error={errors.phone?.message}
                  />
                </div>

                <Input
                  label={t('contact_email')}
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  register={register}
                  error={errors.email?.message}
                />

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#dde6f0' }}>
                    {t('contact_message')} <span style={{ color: '#d4a843' }}>*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="How can we help you?"
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
                    style={{
                      background: 'rgba(15,36,96,0.55)',
                      border: errors.message
                        ? '1px solid rgba(239,68,68,0.6)'
                        : '1px solid rgba(212,168,67,0.25)',
                      color: '#dde6f0',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.65)'}
                    onBlur={e  => e.currentTarget.style.borderColor = errors.message
                      ? 'rgba(239,68,68,0.6)' : 'rgba(212,168,67,0.25)'}
                  />
                  {errors.message && (
                    <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.message.message}</p>
                  )}
                </div>

                {/* Privacy notice */}
                <div className="rounded-lg p-3 text-xs"
                  style={{ background: 'rgba(15,36,96,0.5)', border: '1px solid rgba(15,36,96,0.85)', color: '#9ab0c4' }}>
                  By submitting this form you consent to Javitri Trading Service Pvt. Ltd. storing and processing
                  your contact information solely to respond to your enquiry, in accordance with our
                  Privacy Policy. We do not sell your personal data.
                </div>

                {submitError && (
                  <div className="rounded-xl p-3 flex gap-2"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                    <p className="text-sm" style={{ color: '#f87171' }}>{submitError}</p>
                  </div>
                )}

                <Button type="submit" size="lg" loading={isSubmitting} className="w-full"
                  style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
                  {t('contact_send')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Google Maps embed (full width) ── */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(212,168,67,0.28)', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
          {/* Map header */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: 'rgba(15,36,96,0.65)', borderBottom: '1px solid rgba(212,168,67,0.2)' }}>
            <MapPin className="h-4 w-4 shrink-0" style={{ color: '#d4a843' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f0f4f8' }}>
                Javitri Trading Service Pvt. Ltd.
              </p>
              <p className="text-xs" style={{ color: '#9ab0c4' }}>
                Main bazar, Khakhreru, Fatehpur, Uttar Pradesh 212656
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Main+Bazar+Khakhreru+Fatehpur+Uttar+Pradesh+212656"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#d4a843' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,67,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,168,67,0.12)'}>
              <Navigation className="h-3.5 w-3.5" />
              Open in Maps
            </a>
          </div>
          {/* Iframe */}
          <iframe
            src={MAPS_EMBED_SRC}
            width="100%"
            height="380"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Javitri Trading Service Pvt. Ltd."
          />
        </div>
      </div>

    </div>
  )
}
