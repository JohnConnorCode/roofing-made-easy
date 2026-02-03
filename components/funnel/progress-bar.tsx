'use client'

import { cn } from '@/lib/utils'
import { Check, MapPin, ClipboardList, User } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

// New streamlined 3-step funnel + estimate view
const STEPS = [
  { number: 1, label: 'Property', icon: MapPin },
  { number: 2, label: 'Details', icon: ClipboardList },
  { number: 3, label: 'Contact', icon: User },
]

export function ProgressBar({ currentStep, totalSteps = 3 }: ProgressBarProps) {
  // Normalize step number for display (steps 1-3 are input, 4 is estimate which shows as complete)
  const displayStep = Math.min(currentStep, 4)
  const progress = displayStep >= 4 ? 100 : ((displayStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full">
      {/* Mobile: Compact progress bar with icons */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, index) => {
            const isCompleted = displayStep > step.number || displayStep >= 4
            const isCurrent = displayStep === step.number
            const Icon = step.icon

            return (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
                    isCompleted && 'bg-[#c9a25c] text-[#0c0f14]',
                    isCurrent && 'bg-[#c9a25c]/20 border-2 border-[#c9a25c] text-[#c9a25c]',
                    !isCompleted && !isCurrent && 'bg-slate-800 text-slate-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-8 mx-2 transition-colors duration-300',
                      displayStep > step.number ? 'bg-[#c9a25c]' : 'bg-slate-700'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">
            {displayStep >= 4 ? 'Your Estimate' : `Step ${displayStep} of ${totalSteps}`}
          </span>
          <span className="text-sm text-[#c9a25c]">
            {displayStep >= 4 ? 'Complete' : STEPS[displayStep - 1]?.label}
          </span>
        </div>
      </div>

      {/* Desktop: Full step indicators with icons */}
      <nav className="hidden md:block" aria-label="Progress">
        <div className="relative">
          {/* Background connector line */}
          <div className="absolute top-5 left-[60px] right-[60px] h-0.5 bg-slate-700" />

          {/* Progress connector line */}
          <div
            className="absolute top-5 left-[60px] h-0.5 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] transition-all duration-500 ease-out"
            style={{ width: `calc(${progress}% - 120px * ${progress / 100})` }}
          />

          {/* Step circles */}
          <ol className="relative flex items-center justify-between">
            {STEPS.map((step) => {
              const isCompleted = displayStep > step.number || displayStep >= 4
              const isCurrent = displayStep === step.number
              const Icon = step.icon

              return (
                <li key={step.number} className="flex flex-col items-center">
                  {/* Step circle */}
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isCompleted && 'border-[#c9a25c] bg-[#c9a25c]',
                      isCurrent && 'border-[#c9a25c] bg-[#1a1f2e] scale-110 shadow-lg glow-gold',
                      !isCompleted && !isCurrent && 'border-slate-600 bg-[#1a1f2e]'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-[#0c0f14]" />
                    ) : (
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isCurrent ? 'text-[#c9a25c]' : 'text-slate-500'
                        )}
                      />
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className={cn(
                      'mt-2 text-sm font-medium transition-colors whitespace-nowrap',
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
