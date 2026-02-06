import type { TimelineStep } from '@/components/customer'

interface JourneyData {
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
}

export function computeJourneySteps(data: JourneyData): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      id: 'estimate',
      label: 'Estimate',
      description: data.hasEstimate
        ? data.estimatePrice
          ? `$${data.estimatePrice.toLocaleString()}`
          : 'Received'
        : 'Get your free estimate',
      status: data.hasEstimate ? 'completed' : 'current',
    },
    {
      id: 'quote',
      label: 'Quote Review',
      description: data.quoteAccepted
        ? 'Accepted'
        : data.hasEstimate
        ? 'Review & accept your quote'
        : 'Pending estimate',
      status: data.quoteAccepted
        ? 'completed'
        : data.hasEstimate
        ? 'current'
        : 'upcoming',
    },
    {
      id: 'funding',
      label: 'Financing / Insurance',
      description: getFundingDescription(data),
      status: getFundingStatus(data),
    },
    {
      id: 'consultation',
      label: 'Consultation',
      description: data.hasAppointment
        ? 'Scheduled'
        : 'Meet with our team',
      status: data.hasAppointment
        ? 'completed'
        : allFundingDone(data)
        ? 'current'
        : 'upcoming',
    },
    {
      id: 'project',
      label: 'Project',
      description: data.hasAppointment
        ? 'Ready to begin'
        : 'Begin your roofing project',
      status: data.hasAppointment ? 'current' : 'upcoming',
    },
  ]

  return steps
}

function getFundingDescription(data: JourneyData): string {
  const parts: string[] = []

  if (data.hasFinancingApp) {
    const label = data.financingStatus === 'approved'
      ? 'Financing approved'
      : data.financingStatus === 'denied'
      ? 'Financing denied'
      : 'Financing in progress'
    parts.push(label)
  }

  if (data.hasInsuranceClaim) {
    const label = data.insuranceStatus === 'settled'
      ? 'Claim settled'
      : data.insuranceStatus === 'approved'
      ? 'Claim approved'
      : 'Claim in progress'
    parts.push(label)
  }

  if (parts.length > 0) return parts.join(' | ')
  return 'Explore financing or file a claim'
}

function getFundingStatus(data: JourneyData): 'completed' | 'current' | 'upcoming' {
  if (!data.quoteAccepted) return 'upcoming'
  if (allFundingDone(data)) return 'completed'
  if (data.hasFinancingApp || data.hasInsuranceClaim) return 'current'
  return 'current'
}

function allFundingDone(data: JourneyData): boolean {
  const financingDone = data.hasFinancingApp && (data.financingStatus === 'approved' || data.financingStatus === 'denied')
  const insuranceDone = data.hasInsuranceClaim && (data.insuranceStatus === 'settled' || data.insuranceStatus === 'approved' || data.insuranceStatus === 'denied')

  if (data.hasFinancingApp && data.hasInsuranceClaim) {
    return !!(financingDone && insuranceDone)
  }
  if (data.hasFinancingApp) return !!financingDone
  if (data.hasInsuranceClaim) return !!insuranceDone
  return false
}

interface NextStepInfo {
  priority: number
  message: string
  description: string
  actionLabel: string
  actionHref?: string
  actionScrollTo?: string
  variant: 'gold' | 'success' | 'info'
}

export function computeNextStep(data: JourneyData): NextStepInfo {
  // Priority 1: No estimate
  if (!data.hasEstimate) {
    return {
      priority: 1,
      message: 'Get Your Free Estimate',
      description: 'Start your roofing journey with a personalized estimate based on your property details.',
      actionLabel: 'Get Estimate',
      actionHref: '/',
      variant: 'gold',
    }
  }

  // Priority 2: Estimate exists, quote not accepted
  if (!data.quoteAccepted) {
    return {
      priority: 2,
      message: 'Review & Accept Your Quote',
      description: 'Your estimate is ready. Review the details and accept to move forward with your project.',
      actionLabel: 'View Quote',
      actionScrollTo: 'quote-section',
      variant: 'gold',
    }
  }

  // Priority 3: Quote accepted, no financing app
  if (!data.hasFinancingApp && !data.hasInsuranceClaim) {
    return {
      priority: 3,
      message: 'Explore Financing Options',
      description: 'Most projects qualify for financing. Check your options in just 2 minutes — no credit impact.',
      actionLabel: 'Check Financing',
      actionHref: '/portal/financing',
      variant: 'gold',
    }
  }

  // Priority 4: Storm damage, no insurance claim
  if (data.hasStormDamage && !data.hasInsuranceClaim) {
    return {
      priority: 4,
      message: 'File Your Insurance Claim',
      description: 'We see you have storm damage. Filing a claim could significantly reduce your out-of-pocket cost.',
      actionLabel: 'Start Claim',
      actionHref: '/portal/insurance',
      variant: 'info',
    }
  }

  // Priority 5: Financing submitted, waiting
  if (data.hasFinancingApp && data.financingStatus !== 'approved' && data.financingStatus !== 'denied') {
    return {
      priority: 5,
      message: 'Financing Under Review',
      description: 'Your pre-qualification is being reviewed. Typically 1-2 business days.',
      actionLabel: 'View Status',
      actionHref: '/portal/financing',
      variant: 'info',
    }
  }

  // Priority 6: Insurance in progress
  if (data.hasInsuranceClaim && data.insuranceStatus !== 'settled' && data.insuranceStatus !== 'approved' && data.insuranceStatus !== 'denied') {
    return {
      priority: 6,
      message: 'Claim In Progress',
      description: 'Your insurance claim is being processed. Check the latest status and next steps.',
      actionLabel: 'Track Claim',
      actionHref: '/portal/insurance',
      variant: 'info',
    }
  }

  // Priority 7: All progressing, schedule consultation
  if (!data.hasAppointment) {
    return {
      priority: 7,
      message: 'Schedule Your Consultation',
      description: 'Everything is on track. Book a free consultation to discuss your project details.',
      actionLabel: 'Schedule Now',
      actionHref: undefined, // Will use Calendly or phone
      variant: 'success',
    }
  }

  // Priority 8: Financing approved, project ready
  return {
    priority: 8,
    message: 'Your Project is Ready',
    description: 'All steps are complete. Give us a call to finalize your project start date.',
    actionLabel: 'Call Us',
    actionHref: undefined,
    variant: 'success',
  }
}
