import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  name,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  register,
  className = '',
  ...props
}) {
  const inputProps = register ? register(name) : { name }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-bold text-[#0f172a]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          aria-invalid={!!error}
          className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none bg-white"
          style={{
            border: error ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1',
            color: '#0f172a',
          }}
          onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.15)' }}
          onBlur={e => { e.target.style.borderColor = error ? '#dc2626' : '#cbd5e1'; e.target.style.boxShadow = 'none' }}
          {...inputProps}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#5a6e85' }} />
      </div>

      {error && (
        <p role="alert" className="text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
