import React, { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2, Edit2, ShieldCheck, Tag } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const VALUE_TYPE_LABELS = {
  not_configured:        { label: 'Not Configured', color: 'red' },
  service_fee:           { label: 'Service Fee',      color: 'teal' },
  commission:            { label: 'Commission',       color: 'blue' },
  illustrative_estimate: { label: 'Illustrative Estimate', color: 'amber' },
  other_approved:        { label: 'Other Approved',   color: 'emerald' },
}

const fmt = (paise) => paise != null
  ? `₹${(paise / 100).toLocaleString('en-IN')}`
  : '—'

export default function AdminPlansPage() {
  const { token } = useTrading()
  const [plans, setPlans]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await api.admin.plans.listAll(token)
      setPlans(res.data.plans || [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPlans() }, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api.admin.plans.update(editing.id, {
        associatedValueType:  editing.associated_value_type,
        associatedValueLabel: editing.associated_value_label,
        complianceStatus:     editing.compliance_status,
        isActive:             editing.is_active,
        riskDisclosure:       editing.risk_disclosure,
      }, token)
      setEditing(null)
      fetchPlans()
    } catch (err) {
      alert(err.message || 'Failed to save plan configuration')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Investment Plans Configuration</h1>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Configure investment plans, fee parameters, and statutory risk disclosures
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchPlans}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-[#e2e8f0] rounded-2xl animate-pulse" />
          ))
        ) : plans.map(plan => {
          const vtInfo = VALUE_TYPE_LABELS[plan.associated_value_type] || VALUE_TYPE_LABELS.not_configured
          const isEditingThis = editing?.id === plan.id
          return (
            <div key={plan.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-base font-extrabold text-[#0f172a]">{plan.name}</p>
                    <Badge color={plan.is_active ? 'emerald' : 'gray'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge color={plan.compliance_status === 'approved' ? 'emerald' : plan.compliance_status === 'suspended' ? 'red' : 'amber'}>
                      {plan.compliance_status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-6 text-xs text-[#64748b] font-medium">
                    <span>Investment Amount: <span className="text-[#0f172a] font-bold">{fmt(plan.deal_amount_paise)}</span></span>
                    <span>
                      Associated Value: <span className="text-[#059669] font-bold">{fmt(plan.associated_value_paise)}</span>
                      {' '}<Badge color={vtInfo.color} className="ml-1.5">{vtInfo.label}</Badge>
                    </span>
                    {plan.associated_value_label && (
                      <span>Display Tag: <span className="text-[#0f172a] font-semibold">{plan.associated_value_label}</span></span>
                    )}
                  </div>
                </div>
                {!isEditingThis && (
                  <Button size="sm" variant="secondary" onClick={() => setEditing({ ...plan })}>
                    <Edit2 className="h-3.5 w-3.5" /> Configure Plan
                  </Button>
                )}
              </div>

              {/* Inline editor */}
              {isEditingThis && (
                <div className="mt-5 pt-5 border-t border-[#f1f5f9] grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                      Associated Value Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editing.associated_value_type}
                      onChange={e => setEditing(prev => ({ ...prev, associated_value_type: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#059669]"
                    >
                      <option value="not_configured">Not Configured — DO NOT ACTIVATE</option>
                      <option value="service_fee">Service Fee</option>
                      <option value="commission">Commission</option>
                      <option value="illustrative_estimate">Illustrative Estimate (non-guaranteed)</option>
                      <option value="other_approved">Other Approved Value</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                      Display Label (shown on cards)
                    </label>
                    <input
                      value={editing.associated_value_label || ''}
                      onChange={e => setEditing(prev => ({ ...prev, associated_value_label: e.target.value }))}
                      placeholder="e.g. Service Fee, Platform Commission"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                      Compliance Status
                    </label>
                    <select
                      value={editing.compliance_status}
                      onChange={e => setEditing(prev => ({ ...prev, compliance_status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#059669]"
                    >
                      <option value="pending_review">Pending Review</option>
                      <option value="approved">Approved (Compliance Cleared)</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.is_active}
                        onChange={e => setEditing(prev => ({ ...prev, is_active: e.target.checked }))}
                        disabled={editing.associated_value_type === 'not_configured' || editing.compliance_status !== 'approved'}
                        className="rounded border-[#cbd5e1] text-[#059669] focus:ring-[#059669] h-4 w-4"
                      />
                      <span className="text-sm font-bold text-[#0f172a]">Publish Active</span>
                    </label>
                    {(editing.associated_value_type === 'not_configured' || editing.compliance_status !== 'approved') && (
                      <span className="text-xs text-amber-600 font-semibold">Requires value type & approval first</span>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                      Mandatory Risk Disclosure Text
                    </label>
                    <textarea
                      value={editing.risk_disclosure || ''}
                      onChange={e => setEditing(prev => ({ ...prev, risk_disclosure: e.target.value }))}
                      rows={2}
                      placeholder="Enter applicable statutory risk disclosures…"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#059669] resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <Button variant="secondary" size="md" onClick={() => setEditing(null)}>Cancel</Button>
                    <Button size="md" loading={saving} onClick={handleSave}>
                      <CheckCircle2 className="h-4 w-4" /> Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
