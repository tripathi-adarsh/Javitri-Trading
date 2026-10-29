import React from 'react'
import { Check } from 'lucide-react'

export default function Checkbox({ name, label, error, register, className = '', ...props }) {
  const inputProps = register ? register(name) : { name }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            id={name}
            aria-invalid={!!error}
            className="peer sr-only"
            {...inputProps}
            {...props}
          />
          <div className={`
            h-5 w-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            peer-checked:bg-emerald-500 peer-checked:border-emerald-500
            peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/50 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-gray-900
            ${error ? 'border-red-500' : 'border-gray-600 group-hover:border-gray-400'}
          `}>
            <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-sm text-gray-300 leading-relaxed">{label}</span>
      </label>

      {error && (
        <p role="alert" className="text-xs text-red-400 ml-8">{error}</p>
      )}
    </div>
  )
}
