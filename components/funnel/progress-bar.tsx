'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

const STEPS = [
  { number: 1, label: 'Address' },
  { number: 2, label: 'Job Type' },
  { number: 3, label: 'Roof Details' },
  { number: 4, label: 'Issues' },
  { number: 5, label: 'Photos' },
  { number: 6, label: 'Timeline' },
  { number: 7, label: 'Contact' },
  { number: 8, label: 'Estimate' },
]

export function ProgressBar({ currentStep, totalSteps = 8 }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full">
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-slate-400">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <nav className="hidden md:block" aria-label="Progress">
        <div className="relative">
          {/* Background connector line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700" />

          {/* Progress connector line */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />

          {/* Step circles */}
          <ol className="relative flex items-center justify-between">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number

              return (
                <li key={step.number} className="flex flex-col items-center">
                  {/* Step circle */}
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isCompleted && 'border-[#c9a25c] bg-[#c9a25c]',
                      isCurrent && 'border-[#c9a25c] bg-[#1a1f2e] scale-110 shadow-lg glow-gold',
                      !isCompleted && !isCurrent && 'border-slate-600 bg-[#1a1f2e]'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-[#0c0f14]" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isCurrent ? 'text-[#c9a25c]' : 'text-slate-500'
                        )}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium transition-colors whitespace-nowrap',
                      isCurrent ? 'text-[#c9a25c]' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </nav>
    </div>
  )
}
