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
          <span className="text-sm font-medium text-slate-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-slate-500">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <nav className="hidden md:block" aria-label="Progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number

            return (
              <li key={step.number} className="relative flex flex-col items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute right-1/2 top-4 -mr-px h-0.5 w-full -translate-y-1/2 transition-colors duration-300',
                      isCompleted ? 'bg-amber-500' : 'bg-slate-200'
                    )}
                    style={{ width: 'calc(100% + 2rem)', right: '50%', transform: 'translateX(-50%)' }}
                  />
                )}

                {/* Step circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'border-amber-500 bg-amber-500 scale-100',
                    isCurrent && 'border-amber-500 bg-white scale-110 shadow-md',
                    !isCompleted && !isCurrent && 'border-slate-300 bg-white'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isCurrent ? 'text-amber-600' : 'text-slate-400'
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isCurrent ? 'text-amber-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
