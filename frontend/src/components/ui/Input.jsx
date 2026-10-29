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
  register,       // from React Hook Form
  ...props
}) {
  const inputProps = register ? register(name) : { name }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-emerald-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            w-full rounded-lg bg-gray-800/80 border px-4 py-2.5 text-sm text-gray-100
            placeholder:text-gray-500 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
              : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-gray-600'
            }
          `}
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
        <p id={`${name}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
}
