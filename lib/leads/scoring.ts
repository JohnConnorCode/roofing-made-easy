/**
 * Lead Scoring Algorithm
 *
 * Calculates a lead score (0-100) based on various factors
 * to help prioritize leads without external services.
 */

export interface LeadScoreInput {
  jobType?: string | null
  timelineUrgency?: string | null
  photosCount?: number
  hasInsuranceClaim?: boolean
  roofSizeSqft?: number | null
}

export interface LeadScore {
  score: number
  tier: 'hot' | 'warm' | 'cool'
  factors: Array<{
    name: string
    points: number
  }>
}

// Point values for job types
const JOB_TYPE_SCORES: Record<string, number> = {
  full_replacement: 25,
  commercial: 20,
  solar: 18,
  repair: 15,
  gutter: 10,
  inspection: 5,
  maintenance: 5,
}

// Point values for urgency
const URGENCY_SCORES: Record<string, number> = {
  emergency: 30,
  asap: 20,
  within_month: 10,
  within_3_months: 5,
  flexible: 2,
}

// Maximum points for photos (2 points per photo, max 10 points)
const PHOTO_POINTS_PER = 2
const PHOTO_POINTS_MAX = 10

// Insurance claim bonus
const INSURANCE_CLAIM_BONUS = 15

// Large roof bonus threshold (sqft)
const LARGE_ROOF_THRESHOLD = 2000
const LARGE_ROOF_BONUS = 5

/**
 * Calculate lead score based on input factors
 */
export function calculateLeadScore(input: LeadScoreInput): LeadScore {
  const factors: LeadScore['factors'] = []
  let totalScore = 0

  // Job type scoring
  if (input.jobType && JOB_TYPE_SCORES[input.jobType]) {
    const points = JOB_TYPE_SCORES[input.jobType]
    factors.push({
      name: `Job type: ${input.jobType.replace('_', ' ')}`,
      points,
    })
    totalScore += points
  }

  // Urgency scoring
  if (input.timelineUrgency && URGENCY_SCORES[input.timelineUrgency]) {
    const points = URGENCY_SCORES[input.timelineUrgency]
    factors.push({
      name: `Urgency: ${input.timelineUrgency.replace('_', ' ')}`,
      points,
    })
    totalScore += points
  }

  // Photos scoring
  if (input.photosCount && input.photosCount > 0) {
    const points = Math.min(input.photosCount * PHOTO_POINTS_PER, PHOTO_POINTS_MAX)
    factors.push({
      name: `${input.photosCount} photo${input.photosCount > 1 ? 's' : ''} uploaded`,
      points,
    })
    totalScore += points
  }

  // Insurance claim bonus
  if (input.hasInsuranceClaim) {
    factors.push({
      name: 'Insurance claim',
      points: INSURANCE_CLAIM_BONUS,
    })
    totalScore += INSURANCE_CLAIM_BONUS
  }

  // Large roof bonus
  if (input.roofSizeSqft && input.roofSizeSqft > LARGE_ROOF_THRESHOLD) {
    factors.push({
      name: `Large roof (${input.roofSizeSqft.toLocaleString()} sq ft)`,
      points: LARGE_ROOF_BONUS,
    })
    totalScore += LARGE_ROOF_BONUS
  }

  // Determine tier
  let tier: LeadScore['tier']
  if (totalScore >= 70) {
    tier = 'hot'
  } else if (totalScore >= 40) {
    tier = 'warm'
  } else {
    tier = 'cool'
  }

  return {
    score: Math.min(totalScore, 100), // Cap at 100
    tier,
    factors,
  }
}

/**
 * Get the display properties for a lead score tier
 */
export function getScoreTierDisplay(tier: LeadScore['tier']): {
  label: string
  className: string
  emoji: string
} {
  switch (tier) {
    case 'hot':
      return {
        label: 'Hot',
        className: 'bg-red-100 text-red-800',
        emoji: '🔥',
      }
    case 'warm':
      return {
        label: 'Warm',
        className: 'bg-orange-100 text-orange-800',
        emoji: '',
      }
    case 'cool':
      return {
        label: 'Cool',
        className: 'bg-slate-100 text-slate-600',
        emoji: '',
      }
  }
}
