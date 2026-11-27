import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Mail, Phone, MapPin, CreditCard, Upload,
  AlertCircle, CheckCircle2, Loader2, FileCheck, X, ArrowRight, ShieldCheck
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
  fullName:    z.string().min(2, 'Full name required').max(200),
  mobile:      z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email:       z.string().email('Valid email required'),
  addressLine: z.string().max(500).optional().or(z.literal('')),
  city:        z.string().min(2, 'City required'),
  state:       z.string().min(1, 'State required'),
  postalCode:  z.string().regex(/^\d{6}$/, '6-digit PIN code required'),
  clientType:  z.enum(['individual', 'business']).default('individual'),
  pan:         z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
})

/* ── File picker ── */
function FilePicker({ label, file, onSelect, onRemove, inputId }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">{label}</p>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files && e.target.files[0]
          if (f) onSelect(f)
          e.target.value = ''
        }}
      />
      {file ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#059669] min-w-0">
            <FileCheck size={16} className="shrink-0" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 shrink-0 bg-red-100 hover:bg-red-200 rounded-lg p-1 text-red-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById(inputId).click()}
          className="flex flex-col items-center gap-1.5 p-5 rounded-xl cursor-pointer bg-[#f8fafc] border-2 border-dashed border-[#cbd5e1] hover:border-[#059669] hover:bg-emerald-50/30 transition-all text-center"
        >
          <Upload size={20} className="text-[#059669]" />
          <span className="text-xs font-bold text-[#0f172a]">Click here to choose file</span>
          <span className="text-[11px] text-[#64748b]">JPEG · PNG · WebP · PDF · max 5 MB</span>
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

  const handleUpload = async () => {
    if (!aadhaar || !aadhaarBack || !panFile || !passbook) {
      setError('Please select all four required documents.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('aadhaarImage',     aadhaar)
      fd.append('aadhaarBackImage', aadhaarBack)
      fd.append('panImage',         panFile)
      fd.append('passbookImage',    passbook)

      const res = await fetch(`${API_BASE}/clients/${clientId}/kyc-documents`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`)
      onDone()
    } catch (err) {
      setError(err.message || 'Failed to upload documents. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <FilePicker label="Aadhaar Card (Front)" file={aadhaar} onSelect={setAadhaar} onRemove={() => setAadhaar(null)} inputId="reg-aadhaar-front" />
      <FilePicker label="Aadhaar Card (Back)" file={aadhaarBack} onSelect={setAadhaarBack} onRemove={() => setAadhaarBack(null)} inputId="reg-aadhaar-back" />
      <FilePicker label="PAN Card" file={panFile} onSelect={setPanFile} onRemove={() => setPanFile(null)} inputId="reg-pan" />
      <FilePicker label="Bank Passbook / Cheque" file={passbook} onSelect={setPassbook} onRemove={() => setPassbook(null)} inputId="reg-passbook" />

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button size="xl" loading={busy} onClick={handleUpload} className="w-full">
        Upload Documents & Finish Registration <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

/* ── Main page ── */
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6 px-4 text-center py-16">
      <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-[#059669]" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2 tracking-tight">Registration Complete!</h1>
        <p className="text-sm text-[#64748b] max-w-sm font-medium">Your investor profile and documents have been received. Our compliance desk will verify your details.</p>
      </div>
      <div className="rounded-2xl p-6 w-full max-w-sm text-left bg-white border border-[#e2e8f0] shadow-sm">
        <p className="text-xs uppercase font-bold tracking-wider mb-4 text-[#64748b]">Registration Summary</p>
        <div className="flex justify-between text-sm mb-2.5 pb-2 border-b border-[#f1f5f9]">
          <span className="text-[#64748b]">Registration ID</span>
          <span className="font-mono font-bold text-[#059669]">{regData?.registrationId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748b]">KYC Status</span>
          <span className="text-[#059669] font-bold capitalize">{regData?.status?.replace(/_/g, ' ') || 'Submitted'}</span>
        </div>
      </div>
      <p className="text-xs text-[#94a3b8]">Please save your Registration ID for future reference and login.</p>
      <Button onClick={() => window.location.href = '/'}>Return to Homepage</Button>
    </div>
  )

  /* Upload step */
  if (step === 'upload') return (
    <div className="min-h-screen bg-[#f8fafc] py-14 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] inline-block">
              <img src="/logo.jpeg" alt="Javitri" className="h-12 w-auto object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <CheckCircle2 size={16} className="text-[#059669]" />
            <span className="text-xs font-bold text-[#059669]">Account registered successfully</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight mb-1">Upload KYC Documents</h2>
          <p className="text-xs text-[#64748b] font-medium">Mandatory regulatory compliance: Aadhaar (Front & Back), PAN, Passbook</p>
        </div>

        <div className="rounded-2xl p-7 bg-white border border-[#e2e8f0] shadow-sm">
          <UploadStep
            clientId={regData?.clientId}
            registrationId={regData?.registrationId}
            onDone={() => setStep('done')}
          />
        </div>

        <p className="text-center text-xs mt-6 text-[#94a3b8]">
          JAVITRI TRADING SERVICE PRIVATE LIMITED · CIN: U66190GJ2026PTC183862
        </p>
      </div>
    </div>
  )

  /* Registration form */
  return (
    <div className="min-h-screen bg-[#f8fafc] py-14 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] inline-block">
              <img src="/logo.jpeg" alt="Javitri Trading Service" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">Client Investor Registration</h1>
          <p className="text-sm text-[#64748b] font-medium">
            Open your secure portfolio management account with Javitri Trading Service
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-2xl p-8 space-y-8 bg-white border border-[#e2e8f0] shadow-sm">

            {/* Personal Info */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-[#059669]">
                <User className="h-4 w-4" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name (as per Aadhaar)" name="fullName" placeholder="Rahul Kumar Sharma"
                    required register={formRegister} error={errors.fullName?.message} />
                </div>
                <Input label="Mobile Number" name="mobile" type="tel" placeholder="9876543210"
                  required register={formRegister} error={errors.mobile?.message}
                  icon={<Phone className="h-4 w-4" />} hint="10-digit Indian mobile number" />
                <Input label="Email Address" name="email" type="email" placeholder="rahul@example.com"
                  required register={formRegister} error={errors.email?.message}
                  icon={<Mail className="h-4 w-4" />} />
              </div>
            </section>

            {/* Address */}
            <section className="pt-4 border-t border-[#f1f5f9]">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-[#059669]">
                <MapPin className="h-4 w-4" /> Residential Address
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
                  required register={formRegister} error={errors.postalCode?.message} hint="6-digit Indian PIN code" />
                <Select label="Account Classification" name="clientType"
                  options={[{ value: 'individual', label: 'Individual Investor' }, { value: 'business', label: 'Corporate / Business Entity' }]}
                  register={formRegister} error={errors.clientType?.message} />
              </div>
            </section>

            {/* PAN */}
            <section className="pt-4 border-t border-[#f1f5f9]">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 text-[#059669]">
                <CreditCard className="h-4 w-4" /> Tax Identification (PAN)
              </h2>
              <p className="text-xs text-[#64748b] mb-4">
                PAN input is optional here. All four KYC identity documents will be uploaded in the next step.
              </p>
              <div className="sm:max-w-xs">
                <Input label="PAN Number (optional)" name="pan" placeholder="ABCDE1234F"
                  register={formRegister} error={errors.pan?.message}
                  hint="Format: ABCDE1234F" icon={<CreditCard className="h-4 w-4" />} />
              </div>
            </section>

            {apiError && (
              <div className="flex gap-2.5 rounded-xl p-4 bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm font-semibold text-red-700">{apiError}</p>
              </div>
            )}

            <Button type="submit" size="xl" loading={isSubmitting} className="w-full">
              Continue to Document Upload <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-center text-xs mt-6 text-[#94a3b8]">
          JAVITRI TRADING SERVICE PRIVATE LIMITED · CIN: U66190GJ2026PTC183862
        </p>
      </div>
    </div>
  )
}
