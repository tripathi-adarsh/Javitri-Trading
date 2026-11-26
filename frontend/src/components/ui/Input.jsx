import React from 'react'

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  hint,
  required = false,
  icon,
  rightElement,
  className = '',
  register,
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
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]">
            {icon}
          </div>
        )}

        <input
          id={name}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={`
            w-full rounded-xl px-4 py-2.5 text-sm font-medium
            transition-all duration-200 bg-white
            focus:outline-none focus:ring-3 focus:ring-[#059669]/20
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
          `}
          style={{
            border: error ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1',
            color: '#0f172a',
          }}
          onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.15)' }}
          onBlur={e => { e.target.style.borderColor = error ? '#dc2626' : '#cbd5e1'; e.target.style.boxShadow = 'none' }}
          {...inputProps}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} role="alert" className="text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs" style={{ color: '#5a6e85' }}>{hint}</p>
      )}
    </div>
  )
}
