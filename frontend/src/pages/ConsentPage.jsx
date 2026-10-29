import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, FileText, Lock, ArrowRight, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import { useTrading } from '../context/TradingContext.jsx'
import { api } from '../utils/api.js'

export default function ConsentPage() {
  const navigate = useNavigate()
  const { token, selectedPlan, dealData, setConsentGiven } = useTrading()

  const [termsDoc,   setTermsDoc]   = useState(null)
  const [privacyDoc, setPrivacyDoc] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [termsChecked,   setTermsChecked]   = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [expandTerms,    setExpandTerms]    = useState(false)
  const [expandPrivacy,  setExpandPrivacy]  = useState(false)

  // Fetch current published versions from server so version numbers are accurate
  useEffect(() => {
    if (!token) { navigate('/register'); return }
    if (!selectedPlan) { navigate('/plans'); return }

    Promise.all([
      api.legal.get('terms'),
      api.legal.get('privacy'),
    ])
      .then(([t, p]) => {
        setTermsDoc(t.data)
        setPrivacyDoc(p.data)
      })
      .catch(() => setFetchError('Could not load legal documents. Please refresh and try again.'))
      .finally(() => setLoading(false))
  }, [token, selectedPlan])

  const canProceed = termsChecked && privacyChecked && termsDoc && privacyDoc

  const handleProceed = () => {
    if (!canProceed) return
    setConsentGiven(true)
    navigate('/payment')
  }

  if (!selectedPlan) return null

  return (
    <div className="min-h-screen">
      <StepIndicator currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Review & <span className="gradient-text">Accept Terms</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Before proceeding to payment, please read and accept our Terms & Conditions
            and Privacy Policy. This consent is recorded with a timestamp.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading legal documents…</span>
          </div>
        ) : fetchError ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
            <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">{fetchError}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order summary reminder */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">You are subscribing to</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-white">{selectedPlan.name} Plan</p>
                  <p className="text-xs text-gray-400">Monthly · Auto-renews</p>
                </div>
                {dealData?.totalAmount && (
                  <span className="text-xl font-extrabold text-emerald-400">
                    ₹{dealData.totalAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              termsChecked ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-gray-800 bg-gray-900/60'
            }`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Custom checkbox */}
                  <button
                    type="button"
                    onClick={() => setTermsChecked(!termsChecked)}
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                      ${termsChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-gray-400'}`}
                    aria-checked={termsChecked}
                    role="checkbox"
                    aria-label="Accept Terms and Conditions"
                  >
                    {termsChecked && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Terms & Conditions</span>
                        {termsDoc && (
                          <span className="text-xs text-gray-500">v{termsDoc.version}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandTerms(!expandTerms)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {expandTerms ? 'Collapse' : 'Read'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      I have read and agree to the Terms & Conditions of Javitri Trading Service Private Limited
                      (CIN: U66190GJ2026PTC183862).
                    </p>
                  </div>
                </div>

                {expandTerms && termsDoc && (
                  <div className="mt-4 ml-9 border-t border-gray-800 pt-4 space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                    {termsDoc.content?.map((section) => (
                      <div key={section.id}>
                        <p className="text-xs font-semibold text-gray-300 mb-1">{section.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Policy */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              privacyChecked ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-gray-800 bg-gray-900/60'
            }`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setPrivacyChecked(!privacyChecked)}
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                      ${privacyChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-gray-400'}`}
                    aria-checked={privacyChecked}
                    role="checkbox"
                    aria-label="Accept Privacy Policy"
                  >
                    {privacyChecked && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Privacy Policy</span>
                        {privacyDoc && (
                          <span className="text-xs text-gray-500">v{privacyDoc.version}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandPrivacy(!expandPrivacy)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {expandPrivacy ? 'Collapse' : 'Read'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      I consent to the collection and processing of my personal data as described in the Privacy Policy,
                      under the IT Act 2000 and applicable DPDP Act provisions.
                    </p>
                  </div>
                </div>

                {expandPrivacy && privacyDoc && (
                  <div className="mt-4 ml-9 border-t border-gray-800 pt-4 space-y-4 max-h-64 overflow-y-auto pr-2">
                    {privacyDoc.content?.map((section) => (
                      <div key={section.id}>
                        <p className="text-xs font-semibold text-gray-300 mb-1">{section.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Draft notice */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <span className="font-semibold">Draft Notice:</span> These are draft legal documents
                (version 1.0.0-draft). Final versions will be supplied once approved company
                policies are ready. Your consent version is stored alongside your order.
              </p>
            </div>

            {/* Audit trail notice */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300/80 leading-relaxed">
                Your consent will be recorded with: your user ID, the document version,
                timestamp, and IP address — stored securely for compliance purposes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="ghost" size="lg" onClick={() => navigate('/deal-summary')}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                size="lg"
                onClick={handleProceed}
                disabled={!canProceed}
                className="flex-1"
              >
                Accept & Continue to Payment <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {!canProceed && (termsChecked || privacyChecked) && (
              <p className="text-xs text-amber-400 text-center">
                Please accept both documents to continue.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
