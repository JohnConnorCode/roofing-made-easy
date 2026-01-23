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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 text-slate-600">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {showBack && onBack ? (
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
          >
            {backLabel}
          </Button>
        ) : (
          <div />
        )}

        {onNext && (
          <Button
            variant="primary"
            size="xl"
            onClick={onNext}
            disabled={isNextDisabled}
            isLoading={isLoading}
            rightIcon={!isLoading ? <ArrowRight className="h-5 w-5" /> : undefined}
            className="min-w-[160px]"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
