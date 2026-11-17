import React, { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2, Edit2 } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { api } from '../../utils/api.js'
import { useTrading } from '../../context/TradingContext.jsx'

const VALUE_TYPE_LABELS = {
  not_configured:     { label: 'Not Configured', color: 'red' },
  service_fee:        { label: 'Service Fee',      color: 'teal' },
  commission:         { label: 'Commission',       color: 'blue' },
  illustrative_estimate: { label: 'Illustrative Estimate', color: 'amber' },
  other_approved:     { label: 'Other Approved',   color: 'emerald' },
}

const fmt = (paise) => paise != null
  ? `₹${(paise / 100).toLocaleString('en-IN')}`
  : '—'

export default function AdminPlansPage() {
  const { token } = useTrading()
  const [plans, setPlans]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)   // plan being edited
  const [saving, setSaving]     = useState(false)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await api.admin.plans.listAll(token)
      setPlans(res.data.plans)
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
      alert(err.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Deal Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure and activate plans after compliance review</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPlans}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/40 border border-gray-800 rounded-xl animate-pulse" />
          ))
        ) : plans.map(plan => {
          const vtInfo = VALUE_TYPE_LABELS[plan.associated_value_type] || VALUE_TYPE_LABELS.not_configured
          const isEditingThis = editing?.id === plan.id
          return (
            <div key={plan.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{plan.name}</p>
                    <Badge color={plan.is_active ? 'emerald' : 'gray'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge color={plan.compliance_status === 'approved' ? 'emerald' : plan.compliance_status === 'suspended' ? 'red' : 'amber'}>
                      {plan.compliance_status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>Deal Amount: <span className="text-white font-medium">{fmt(plan.deal_amount_paise)}</span></span>
                    <span>
                      Associated Value: <span className="text-white font-medium">{fmt(plan.associated_value_paise)}</span>
                      {' '}<Badge color={vtInfo.color} className="ml-1">{vtInfo.label}</Badge>
                    </span>
                    {plan.associated_value_label && (
                      <span>Label: <span className="text-white">{plan.associated_value_label}</span></span>
                    )}
                  </div>
                </div>
                {!isEditingThis && (
                  <Button size="sm" variant="secondary" onClick={() => setEditing({ ...plan })}>
                    <Edit2 className="h-3.5 w-3.5" /> Configure
                  </Button>
                )}
              </div>

              {/* Inline editor */}
              {isEditingThis && (
                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Associated Value Type <span className="text-red-400">*</span></label>
                    <select
                      value={editing.associated_value_type}
                      onChange={e => setEditing(prev => ({ ...prev, associated_value_type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="not_configured">Not Configured — DO NOT ACTIVATE</option>
                      <option value="service_fee">Service Fee</option>
                      <option value="commission">Commission</option>
                      <option value="illustrative_estimate">Illustrative Estimate (non-guaranteed)</option>
                      <option value="other_approved">Other Approved Value</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Display Label (shown to clients)</label>
                    <input
                      value={editing.associated_value_label || ''}
                      onChange={e => setEditing(prev => ({ ...prev, associated_value_label: e.target.value }))}
                      placeholder="e.g. Service Fee, Platform Commission"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Compliance Status</label>
                    <select
                      value={editing.compliance_status}
                      onChange={e => setEditing(prev => ({ ...prev, compliance_status: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="pending_review">Pending Review</option>
                      <option value="approved">Approved (only after legal authorization)</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.is_active}
                        onChange={e => setEditing(prev => ({ ...prev, is_active: e.target.checked }))}
                        disabled={editing.associated_value_type === 'not_configured' || editing.compliance_status !== 'approved'}
                        className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-300">Active</span>
                    </label>
                    {(editing.associated_value_type === 'not_configured' || editing.compliance_status !== 'approved') && (
                      <span className="text-xs text-amber-400">Configure type + compliance first</span>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5">Risk Disclosure Text</label>
                    <textarea
                      value={editing.risk_disclosure || ''}
                      onChange={e => setEditing(prev => ({ ...prev, risk_disclosure: e.target.value }))}
                      rows={2}
                      placeholder="Enter applicable risk disclosures…"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                    <Button size="sm" loading={saving} onClick={handleSave}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Save Changes
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
