'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Calendar, Phone, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeNextStep } from '@/lib/customer/journey'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

interface NextStepHeroProps {
  hasEstimate: boolean
  estimatePrice?: number
  quoteAccepted?: boolean
  hasFinancingApp: boolean
  financingStatus?: string
  hasInsuranceClaim: boolean
  insuranceStatus?: string
  hasAppointment: boolean
  programCount: number
  hasStormDamage?: boolean
  onNavigate: (href: string) => void
  onScrollTo?: (id: string) => void
}

export function NextStepHero(props: NextStepHeroProps) {
  const { onNavigate, onScrollTo, ...data } = props
  const step = computeNextStep(data)

  const variantStyles = {
    gold: 'border-gold-light/40 bg-gradient-to-r from-gold-light/10 via-gold-light/5 to-transparent',
    success: 'border-success/40 bg-gradient-to-r from-success/10 via-success/5 to-transparent',
    info: 'border-blue-400/40 bg-gradient-to-r from-blue-400/10 via-blue-400/5 to-transparent',
  }

  const accentColor = {
    gold: 'text-gold-light',
    success: 'text-success',
    info: 'text-blue-400',
  }

  const handleAction = () => {
    if (step.actionScrollTo && onScrollTo) {
      onScrollTo(step.actionScrollTo)
    } else if (step.actionHref) {
      onNavigate(step.actionHref)
    } else if (CALENDLY_URL) {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = getPhoneLink()
    }
  }

  const isPhoneCTA = !step.actionHref && !step.actionScrollTo
  const isCalendlyCTA = step.priority === 7 && CALENDLY_URL

  return (
    <Card variant="dark" className={cn('overflow-hidden', variantStyles[step.variant])}>
      <CardContent className="py-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-semibold uppercase tracking-wider mb-1', accentColor[step.variant])}>
              Next Step
            </p>
            <h2 className="text-lg font-bold text-slate-100">
              {step.message}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {step.description}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isPhoneCTA ? (
              <>
                {isCalendlyCTA ? (
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    rightIcon={<ExternalLink className="h-3 w-3" />}
                    onClick={handleAction}
                  >
                    {step.actionLabel}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    leftIcon={<Phone className="h-4 w-4" />}
                    onClick={() => { window.location.href = getPhoneLink() }}
                  >
                    Call {getPhoneDisplay()}
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="primary"
                className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={handleAction}
              >
                {step.actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
