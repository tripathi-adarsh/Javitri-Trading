import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Mail, Phone, MapPin, CreditCard, Upload,
  AlertCircle, CheckCircle2, Loader2, FileCheck, X, ArrowRight
} from 'lucide-react'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import { api } from '../utils/api.js'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
].map(s => ({ value: s, label: s }))

const schema = z.object({
  fullName:    z.string().min(2).max(200),
  mobile:      z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email:       z.string().email('Valid email required'),
  addressLine: z.string().max(500).optional().or(z.literal('')),
  city:        z.string().min(2, 'City required'),
  state:       z.string().min(1, 'State required'),
  postalCode:  z.string().regex(/^\d{6}$/, '6-digit PIN code required'),
  clientType:  z.enum(['individual', 'business']).default('individual'),
  pan:         z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().or(z.literal('')),
})

/* ── File picker ── */
function FilePicker({ label, file, onSelect, onRemove, inputId }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ color: '#9ab0c4', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files && e.target.files[0]
          if (f) onSelect(f)
          e.target.value = ''
        }}
      />
      {file ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontSize: 12, minWidth: 0 }}>
            <FileCheck size={16} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            style={{
              marginLeft: 10, flexShrink: 0, background: 'rgba(239,68,68,0.15)',
              border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#f87171',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById(inputId).click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '20px 10px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(13,31,87,0.4)', border: '2px dashed rgba(200,152,58,0.4)',
          }}
        >
          <Upload size={20} style={{ color: '#c8983a' }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>Click here to choose file</span>
          <span style={{ color: '#475569', fontSize: 11 }}>JPEG · PNG · WebP · PDF · max 5 MB</span>
        </div>
      )}
    </div>
  )
}

/* ── Upload step — all 4 images ── */
function UploadStep({ clientId, registrationId, onDone }) {
  const [aadhaar,      setAadhaar]      = useState(null)
  const [aadhaarBack,   setAadhaarBack]  = useState(null)
  const [panFile,       setPanFile]      = useState(null)
  const [passbook,      setPassbook]     = useState(null)
  const [busy,         setBusy]         = useState(false)
  const [error,        setError]        = useState('')
  const [done,         setDone]         = useState(false)

  async function doUpload() {
    if (!aadhaar)      { setError('Aadhaar Card (Front) is required.'); return }
    if (!aadhaarBack)  { setError('Aadhaar Card (Back) is required.'); return }
    if (!panFile)      { setError('PAN Card is required.'); return }
    if (!passbook)     { setError('Bank Passbook / Statement is required.'); return }

    setBusy(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('aadhaarImage',      aadhaar)
      fd.append('aadhaarBackImage',  aadhaarBack)
      fd.append('panImage',          panFile)
      fd.append('passbookImage',     passbook)

      const res = await fetch(`${API_BASE}/clients/${clientId}/kyc-documents`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Upload failed: ' + res.status)
      setDone(true)
    } catch (e) {
      setError(e.message || 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
        background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle2 size={28} style={{ color: '#4ade80' }} />
      </div>
      <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>All Documents Uploaded!</p>
      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 24 }}>Our team will verify your documents shortly.</p>
      <button
        onClick={onDone}
        style={{
          padding: '10px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#c8983a,#a07020)', color: '#fff', fontWeight: 600,
        }}
      >
        Done
      </button>
    </div>
  )

  return (
    <div>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 20 }}>
        Registration ID:{' '}
        <span style={{ color: '#c8983a', fontFamily: 'monospace', fontWeight: 700 }}>{registrationId}</span>
      </p>

      <FilePicker
        label="Aadhaar Card — Front *"
        file={aadhaar}
        onSelect={setAadhaar}
        onRemove={() => setAadhaar(null)}
        inputId="fp_aadhaar_front"
      />
      <FilePicker
        label="Aadhaar Card — Back *"
        file={aadhaarBack}
        onSelect={setAadhaarBack}
        onRemove={() => setAadhaarBack(null)}
        inputId="fp_aadhaar_back"
      />
      <FilePicker
        label="PAN Card *"
        file={panFile}
        onSelect={setPanFile}
        onRemove={() => setPanFile(null)}
        inputId="fp_pan"
      />
      <FilePicker
        label="Bank Passbook / Statement *"
        file={passbook}
        onSelect={setPassbook}
        onRemove={() => setPassbook(null)}
        inputId="fp_passbook"
      />

      {error && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 14px', borderRadius: 12, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={doUpload}
        disabled={busy}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: busy ? 'rgba(200,152,58,0.3)' : 'linear-gradient(135deg,#c8983a,#a07020)',
          color: '#fff', fontWeight: 600, fontSize: 14, cursor: busy ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {busy
          ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
          : <><Upload size={16} /> Upload All Documents</>
        }
      </button>
    </div>
  )
}

/* ── Main page — direct registration without token ── */
export default function ClientRegisterPage() {
  const [step,       setStep]       = useState('form')
  const [regData,    setRegData]    = useState(null)
  const [apiError,   setApiError]   = useState('')

  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { clientType: 'individual' },
  })

  const onSubmit = async (formData) => {
    setApiError('')
    try {
      const res = await api.public.registerClient({
        ...formData,
        pan: formData.pan?.toUpperCase() || undefined,
      })
      setRegData(res.data)
      setStep('upload')
    } catch (e) {
      setApiError(e.message || 'Registration failed. Please try again.')
    }
  }

  /* Done */
  if (step === 'done') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="h-16 w-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(26,102,69,0.15)', border: '1px solid rgba(26,102,69,0.4)' }}>
        <CheckCircle2 className="h-8 w-8" style={{ color: '#4ade80' }} />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>Registration Complete!</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Your details have been submitted. Our team will contact you shortly.</p>
      </div>
      <div className="rounded-2xl p-5 w-full max-w-sm text-left"
        style={{ background: 'rgba(13,31,87,0.5)', border: '1px solid rgba(200,152,58,0.2)' }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Registration Details</p>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: '#64748b' }}>Registration ID</span>
          <span className="font-mono font-bold" style={{ color: '#c8983a' }}>{regData?.registrationId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#64748b' }}>Status</span>
          <span style={{ color: '#4ade80' }} className="capitalize">{regData?.status?.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <p className="text-xs" style={{ color: '#475569' }}>Please save your Registration ID for future reference.</p>
    </div>
  )

  /* Upload step */
  if (step === 'upload') return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#0a0f1e' }}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-3 shadow-xl inline-block">
              <img src="/logo.jpeg" alt="Javitri" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
            <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600 }}>Registration successful!</span>
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#fff', marginBottom: 4 }}>Upload KYC Documents</h2>
          <p style={{ color: '#64748b', fontSize: 12 }}>All four documents are required — Aadhaar (Front + Back), PAN, Passbook</p>
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(13,31,87,0.3)', border: '1px solid rgba(200,152,58,0.2)' }}>
          <UploadStep
            clientId={regData?.clientId}
            registrationId={regData?.registrationId}
            onDone={() => setStep('done')}
          />
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#334155' }}>
          JAVITRI TRADING SERVICE PRIVATE LIMITED · CIN: U66190GJ2026PTC183862
        </p>
      </div>
    </div>
  )

  /* Registration form */
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#0a0f1e' }}>
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-2xl p-3 shadow-xl inline-block">
              <img src="/logo.jpeg" alt="Javitri Trading Service" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#fff' }}>Client Registration</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Register to get started with Javitri Trading Service
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-2xl p-6 sm:p-8 space-y-7"
            style={{ background: 'rgba(13,31,87,0.3)', border: '1px solid rgba(200,152,58,0.2)' }}>

            {/* Personal Info */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#c8983a' }}>
                <User className="h-4 w-4" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name" name="fullName" placeholder="Rahul Kumar Sharma"
                    required register={formRegister} error={errors.fullName?.message} />
                </div>
                <Input label="Mobile Number" name="mobile" type="tel" placeholder="9876543210"
                  required register={formRegister} error={errors.mobile?.message}
                  icon={<Phone className="h-4 w-4" />} hint="10-digit Indian mobile" />
                <Input label="Email Address" name="email" type="email" placeholder="rahul@example.com"
                  required register={formRegister} error={errors.email?.message}
                  icon={<Mail className="h-4 w-4" />} />
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#c8983a' }}>
                <MapPin className="h-4 w-4" /> Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Address Line" name="addressLine" placeholder="House / Flat No., Street, Area"
                    register={formRegister} error={errors.addressLine?.message} />
                </div>
                <Input label="City" name="city" placeholder="Your city"
                  required register={formRegister} error={errors.city?.message} />
                <Select label="State" name="state" options={INDIAN_STATES}
                  required register={formRegister} error={errors.state?.message} />
                <Input label="PIN Code" name="postalCode" placeholder="395006"
                  required register={formRegister} error={errors.postalCode?.message} hint="6-digit PIN" />
                <Select label="Client Type" name="clientType"
                  options={[{ value: 'individual', label: 'Individual' }, { value: 'business', label: 'Business' }]}
                  register={formRegister} error={errors.clientType?.message} />
              </div>
            </section>

            {/* PAN */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: '#c8983a' }}>
                <CreditCard className="h-4 w-4" /> KYC
              </h2>
              <p className="text-xs mb-4" style={{ color: '#475569' }}>
                PAN optional. All four KYC images (Aadhaar front, Aadhaar back, PAN, Passbook) will be uploaded in the next step.
              </p>
              <div className="sm:max-w-xs">
                <Input label="PAN Number (optional)" name="pan" placeholder="ABCDE1234F"
                  register={formRegister} error={errors.pan?.message}
                  hint="Format: ABCDE1234F" icon={<CreditCard className="h-4 w-4" />} />
              </div>
            </section>

            {apiError && (
              <div className="flex gap-2 rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                <p className="text-sm" style={{ color: '#f87171' }}>{apiError}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full"
              style={{ background: 'linear-gradient(135deg,#c8983a,#a07020)', border: 'none', color: '#fff' }}>
              Continue to Document Upload <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: '#334155' }}>
          JAVITRI TRADING SERVICE PRIVATE LIMITED · CIN: U66190GJ2026PTC183862
        </p>
      </div>
    </div>
  )
}
