'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StepContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  className?: string
}

export function StepContainer({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isNextDisabled = false,
  isLoading = false,
  showBack = true,
  className,
}: StepContainerProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 text-slate-400">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 animate-slide-up delay-100">
        {children}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4 animate-slide-up delay-200">
        {showBack && onBack ? (
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            className="btn-press border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            {backLabel}
          </Button>
        ) : (
          <div />
        )}

        {onNext && (
          <div aria-live="polite">
            <Button
              variant="primary"
              size="xl"
              onClick={onNext}
              disabled={isNextDisabled}
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight className="h-5 w-5" /> : undefined}
              className="min-w-[160px] btn-press shadow-lg glow-gold bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
            >
              {nextLabel}
            </Button>
            {isLoading && <span className="sr-only">Loading, please wait...</span>}
          </div>
        )}
      </div>
    </div>
  )
}
