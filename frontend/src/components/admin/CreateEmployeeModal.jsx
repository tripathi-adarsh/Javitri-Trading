import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, AlertCircle, CheckCircle2, Copy } from 'lucide-react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { api } from '../../utils/api.js'

const schema = z.object({
  firstName:  z.string().min(2, 'Required').max(50),
  lastName:   z.string().min(2, 'Required').max(50),
  email:      z.string().email('Valid email required'),
  phone:      z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  city:       z.string().min(2, 'City required').optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
})

export default function CreateEmployeeModal({ token, onClose, onCreated }) {
  const [created, setCreated] = useState(null)
  const [apiError, setApiError] = useState('')
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    setApiError('')
    try {
      const res = await api.admin.employees.create(data, token)
      setCreated(res.data)
    } catch (err) {
      setApiError(err.message || 'Failed to create employee')
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(created.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!created ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">
            {created ? 'Employee Created' : 'New Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {created ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Employee created successfully</p>
                  <p className="text-xs text-gray-400">Code: <span className="font-mono text-emerald-400">{created.employee?.employeeCode}</span></p>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                <p className="text-xs text-amber-300 font-semibold mb-2">⚠ Temporary Password — Share Securely</p>
                <p className="text-xs text-gray-400 mb-3">
                  This password is shown only once. Share it with the employee through a secure channel.
                  They should change it on first login.
                </p>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                  <code className="flex-1 text-sm text-white font-mono">{created.temporaryPassword}</code>
                  <button onClick={copyPassword} className="text-gray-400 hover:text-emerald-400 transition-colors">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button size="md" className="w-full" onClick={onCreated}>Done</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" name="firstName" placeholder="Rahul" required register={register} error={errors.firstName?.message} />
                <Input label="Last Name"  name="lastName"  placeholder="Sharma" required register={register} error={errors.lastName?.message} />
              </div>
              <Input label="Email" name="email" type="email" placeholder="rahul@javitritrading.in" required register={register} error={errors.email?.message} />
              <Input label="Mobile" name="phone" type="tel" placeholder="9876543210" required register={register} error={errors.phone?.message} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" name="city" placeholder="Surat" register={register} error={errors.city?.message} />
                <Input label="Department" name="department" placeholder="Sales" register={register} error={errors.department?.message} />
              </div>

              {apiError && (
                <div className="flex gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{apiError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" size="md" loading={isSubmitting} className="flex-1">Create Employee</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
