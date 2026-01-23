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
}

export async function withFallback<T>(
  providers: AiProvider[],
  operation: (provider: AiProvider) => Promise<AiResult<T>>
): Promise<AiResult<T>> {
  for (const provider of providers) {
    try {
      const result = await operation(provider)
      if (result.success) {
        return result
      }
      console.warn(`Provider ${provider.name} failed:`, result.error)
    } catch (error) {
      console.error(`Provider ${provider.name} threw error:`, error)
    }
  }

  return {
    success: false,
    error: 'All providers failed',
    provider: 'fallback',
    latencyMs: 0,
  }
}
