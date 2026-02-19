import type { AiProvider as AiProviderType } from '@/lib/supabase/types'

export interface PhotoAnalysisInput {
  imageUrl: string
  imageBase64?: string
}

export interface DetectedIssue {
  issue: string
  confidence: number
  description?: string
}

export interface PhotoAnalysisResult {
  isRoofPhoto: boolean
  confidence: number
  detectedMaterial?: string
  detectedIssues: DetectedIssue[]
  estimatedCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  notes?: string
}

export interface ExplanationInput {
  estimate: {
    priceLow: number
    priceLikely: number
    priceHigh: number
  }
  intake: {
    jobType?: string
    roofMaterial?: string
    roofSizeSqft?: number
    roofPitch?: string
    stories?: number
    issues?: string[]
    timelineUrgency?: string
    hasSkylights?: boolean
    hasChimneys?: boolean
    hasSolarPanels?: boolean
    hasInsuranceClaim?: boolean
  }
  adjustments: Array<{
    name: string
    impact: number
    description: string
  }>
}

export interface IntakeAnalysisInput {
  jobType?: string
  roofMaterial?: string
  roofSizeSqft?: number
  roofPitch?: string
  stories?: number
  roofAgeYears?: number
  issues?: string[]
  issuesDescription?: string
  timelineUrgency?: string
  hasSkylights?: boolean
  hasChimneys?: boolean
  hasSolarPanels?: boolean
  hasInsuranceClaim?: boolean
  photoAnalyses?: PhotoAnalysisResult[]
}

export interface IntakeAnalysisResult {
  leadQuality: 'hot' | 'warm' | 'cold'
  urgencyScore: number // 1-10
  complexity: 'simple' | 'moderate' | 'complex'
  suggestedFollowUp: string
  redFlags: string[]
  opportunities: string[]
}

export interface InternalNotesInput {
  intake: IntakeAnalysisInput
  intakeAnalysis?: IntakeAnalysisResult
  estimate?: {
    priceLow: number
    priceLikely: number
    priceHigh: number
  }
  contact?: {
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
  }
}

// Financing guidance
export interface FinancingGuidanceInput {
  estimateAmount: number
  creditRange: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor'
  incomeRange?: string
  insurancePayoutAmount?: number
  state: string
}

export interface FinancingScenario {
  name: string
  termMonths: number
  estimatedRate: number
  monthlyPayment: number
  totalInterest: number
  recommendation: string
}

export interface FinancingGuidanceResult {
  scenarios: FinancingScenario[]
  summary: string
  nextStep: string
}

// Insurance letter
export interface InsuranceLetterInput {
  letterType: 'initial_claim' | 'appeal' | 'follow_up'
  claimData: {
    insuranceCompany?: string
    claimNumber?: string
    policyNumber?: string
    dateOfLoss?: string
    causeOfLoss?: string
    customerNotes?: string
  }
  propertyAddress: string
  customerName: string
  estimateAmount?: number
  claimAmountApproved?: number
  photoAnalyses?: PhotoAnalysisResult[]
}

// Eligibility guidance
export interface EligibilityGuidanceInput {
  eligiblePrograms: Array<{
    name: string
    programType: string
    maxBenefitAmount?: number
    applicationDeadline?: string
    tips?: string[]
  }>
  userContext: {
    income?: number
    state: string
    age?: number
    isVeteran?: boolean
    isDisabled?: boolean
    hasDisasterDeclaration?: boolean
  }
  estimateAmount?: number
}

export interface EligibilityAction {
  order: number
  programName: string
  reason: string
  potentialBenefit: string
}

export interface EligibilityGuidanceResult {
  prioritizedActions: EligibilityAction[]
  combinedStrategy: string
  importantNotes: string[]
}

// Business config shape (subset needed by advisor)
export interface AdvisorBusinessConfig {
  name: string
  tagline: string
  phone: { raw: string; display: string }
  email: { primary: string }
  hours: {
    weekdays: { open: string; close: string }
    saturday: { open: string; close: string } | null
    sunday: { open: string; close: string } | null
  }
}

// Advisor chat
export type AdvisorTopic = 'financing' | 'insurance' | 'assistance'

export interface AdvisorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AdvisorInput {
  topic: AdvisorTopic
  messages: AdvisorMessage[]
  businessConfig?: AdvisorBusinessConfig
  userContext: {
    estimateAmount?: number
    propertyAddress?: string
    propertyState?: string
    creditRange?: string
    incomeRange?: string
    insuranceCompany?: string
    causeOfLoss?: string
    claimStatus?: string
    claimAmountApproved?: number
    deductible?: number
    eligibleProgramNames?: string[]
    isVeteran?: boolean
    isDisabled?: boolean
    hasDisasterDeclaration?: boolean
    // Cross-topic awareness
    financingStatus?: string
    hasInsuranceClaim?: boolean
    hasStormDamage?: boolean
    fundingGap?: number
    eligibleProgramCount?: number
  }
}

export interface SuggestedAction {
  label: string
  href?: string
}

export interface AdvisorResult {
  message: string
  suggestedActions?: SuggestedAction[]
}

export interface AiResult<T> {
  success: boolean
  data?: T
  error?: string
  provider: AiProviderType
  latencyMs: number
  model?: string
}

export interface AiProvider {
  name: AiProviderType
  analyzePhoto(input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>>
  generateExplanation(input: ExplanationInput): Promise<AiResult<string>>
  analyzeIntake(input: IntakeAnalysisInput): Promise<AiResult<IntakeAnalysisResult>>
  generateInternalNotes(input: InternalNotesInput): Promise<AiResult<string>>
  generateFinancingGuidance(input: FinancingGuidanceInput): Promise<AiResult<FinancingGuidanceResult>>
  generateInsuranceLetter(input: InsuranceLetterInput): Promise<AiResult<string>>
  generateEligibilityGuidance(input: EligibilityGuidanceInput): Promise<AiResult<EligibilityGuidanceResult>>
  generateAdvisorResponse(input: AdvisorInput): Promise<AiResult<AdvisorResult>>
}

export async function withFallback<T>(
  providers: AiProvider[],
  operation: (provider: AiProvider) => Promise<AiResult<T>>,
  timeoutMs = 30000
): Promise<AiResult<T>> {
  for (const provider of providers) {
    try {
      const result = await Promise.race([
        operation(provider),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Provider ${provider.name} timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ])
      if (result.success) {
        return result
      }
      // Provider failed, try next
    } catch {
      // Provider threw error or timed out, try next
    }
  }

  return {
    success: false,
    error: 'All providers failed',
    provider: 'fallback',
    latencyMs: 0,
  }
}
