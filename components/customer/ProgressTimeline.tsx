'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface TimelineStep {
  id: string
  label: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
}

interface ProgressTimelineProps {
  steps: TimelineStep[]
  orientation?: 'horizontal' | 'vertical'
}

export function ProgressTimeline({ steps, orientation = 'vertical' }: ProgressTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="w-full">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center',
                index < steps.length - 1 && 'flex-1'
              )}
            >
              <div className="flex items-center w-full">
                {/* Step circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0',
                    step.status === 'completed' && 'border-success bg-success',
                    step.status === 'current' && 'border-gold-light bg-gold-light/10',
                    step.status === 'upcoming' && 'border-slate-600 bg-slate-800'
                  )}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        step.status === 'current' ? 'text-gold-light' : 'text-slate-500'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1',
                      step.status === 'completed' ? 'bg-success' : 'bg-slate-700'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    step.status === 'current' ? 'text-gold-light' :
                    step.status === 'completed' ? 'text-slate-300' : 'text-slate-500'
                  )}
                >
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-slate-600 mt-0.5">{step.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vertical orientation
  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-[19px] top-10 h-full w-0.5',
                step.status === 'completed' ? 'bg-success' : 'bg-slate-700'
              )}
            />
          )}

          {/* Step circle */}
          <div
            className={cn(
              'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0',
              step.status === 'completed' && 'border-success bg-success',
              step.status === 'current' && 'border-gold-light bg-gold-light/10',
              step.status === 'upcoming' && 'border-slate-600 bg-slate-800'
            )}
          >
            {step.status === 'completed' ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <span
                className={cn(
                  'text-sm font-semibold',
                  step.status === 'current' ? 'text-gold-light' : 'text-slate-500'
                )}
              >
                {index + 1}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  'font-medium',
                  step.status === 'current' ? 'text-gold-light' :
                  step.status === 'completed' ? 'text-slate-200' : 'text-slate-500'
                )}
              >
                {step.label}
              </h4>
              {step.date && (
                <span className="text-xs text-slate-500">{step.date}</span>
              )}
            </div>
            {step.description && (
              <p className="mt-1 text-sm text-slate-400">{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
