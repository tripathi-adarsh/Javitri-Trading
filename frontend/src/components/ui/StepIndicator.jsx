import React from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Register' },
  { id: 2, label: 'Choose Plan' },
  { id: 3, label: 'Review Deal' },
  { id: 4, label: 'Payment' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700 z-0" />

          {/* Filled progress bar */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isDone = currentStep > step.id
            const isActive = currentStep === step.id

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                <div className={`
                  h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                      ? 'bg-gray-900 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }
                `}>
                  {isDone ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors ${
                  isActive ? 'text-emerald-400' : isDone ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
