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
    <div className="w-full py-8 px-4 bg-white border-b border-[#e2e8f0]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-[#e2e8f0] z-0 rounded-full" />

          {/* Filled progress bar */}
          <div
            className="absolute top-4 left-0 h-1 bg-[#059669] z-0 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isDone = currentStep > step.id
            const isActive = currentStep === step.id

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                <div className={`
                  h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${isDone
                    ? 'bg-[#059669] border-[#059669] text-white shadow-sm'
                    : isActive
                      ? 'bg-white border-[#059669] text-[#059669] ring-4 ring-[#059669]/15 shadow-sm'
                      : 'bg-white border-[#cbd5e1] text-[#64748b]'
                  }
                `}>
                  {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
                </div>
                <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                  isActive ? 'text-[#059669]' : isDone ? 'text-[#0f172a]' : 'text-[#64748b]'
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
