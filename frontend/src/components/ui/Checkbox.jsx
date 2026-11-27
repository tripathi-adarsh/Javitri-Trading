import React from 'react'
import { Check } from 'lucide-react'

export default function Checkbox({ name, label, error, register, className = '', ...props }) {
  const inputProps = register ? register(name) : { name }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-start gap-3 cursor-pointer group select-none">
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
            h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center bg-white
            peer-checked:bg-[#059669] peer-checked:border-[#059669]
            peer-focus-visible:ring-2 peer-focus-visible:ring-[#059669]/40 peer-focus-visible:ring-offset-2
            ${error ? 'border-red-500' : 'border-[#cbd5e1] group-hover:border-[#94a3b8]'}
          `}>
            <Check className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>
        <span className="text-sm text-[#1e293b] font-normal leading-relaxed">{label}</span>
      </label>

      {error && (
        <p role="alert" className="text-xs text-red-600 ml-8 font-medium">{error}</p>
      )}
    </div>
  )
}
