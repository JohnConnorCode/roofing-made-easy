/**
 * Mock AI provider for testing without real API keys
 * Returns realistic responses for all AI operations
 */

import type {
  AiProvider,
  PhotoAnalysisInput,
  PhotoAnalysisResult,
  ExplanationInput,
  IntakeAnalysisInput,
  IntakeAnalysisResult,
  InternalNotesInput,
  AiResult,
} from '@/lib/ai/provider'
import { simulateDelay, getMockDelay } from './config'

export class MockAiProvider implements AiProvider {
  name: 'mock' = 'mock'

  async analyzePhoto(_input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>> {
    const startTime = Date.now()
    await simulateDelay()

    // Return realistic mock analysis
    const issues = [
      { issue: 'damaged_shingles', confidence: 0.85, description: 'Several shingles show curling and wear' },
      { issue: 'moss_algae', confidence: 0.72, description: 'Green growth visible in shaded areas' },
    ]

    // Randomly vary the response for more realistic testing
    const randomIssues = issues.filter(() => Math.random() > 0.3)

    return {
      success: true,
      data: {
        isRoofPhoto: true,
        confidence: 0.92,
        detectedMaterial: 'asphalt_shingle',
        detectedIssues: randomIssues,
        estimatedCondition: randomIssues.length > 1 ? 'fair' : 'good',
        notes: 'Mock analysis - roof appears to be standard asphalt shingle construction with typical wear patterns.',
      },
      provider: this.name,
      latencyMs: Date.now() - startTime,
      model: 'mock-vision-v1',
    }
  }

  async generateExplanation(input: ExplanationInput): Promise<AiResult<string>> {
    const startTime = Date.now()
    await simulateDelay()

    const { estimate, intake, adjustments } = input

    // Generate a realistic explanation
    const parts: string[] = []

    parts.push(
      `Your ${intake.jobType?.replace('_', ' ') || 'roofing'} estimate of $${estimate.priceLikely.toLocaleString()} reflects current market rates for ${intake.roofMaterial?.replace('_', ' ') || 'standard'} roofing in your area.`
    )

    if (intake.roofSizeSqft) {
      parts.push(
        `The ${intake.roofSizeSqft.toLocaleString()} square foot roof size is the primary factor in this calculation.`
      )
    }

    if (adjustments.length > 0) {
      const significant = adjustments.filter((a) => Math.abs(a.impact) >= 200)
      if (significant.length > 0) {
        parts.push(
          `Key price factors include ${significant.map((a) => a.name.toLowerCase()).join(', ')}.`
        )
      }
    }

    if (intake.timelineUrgency === 'emergency' || intake.timelineUrgency === 'within_week') {
      parts.push('The expedited timeline adds a premium to ensure crew availability.')
    }

    parts.push(
      'This automated estimate provides a starting point. Schedule a free on-site consultation for exact pricing tailored to your specific roof conditions and requirements.'
    )

    return {
      success: true,
      data: parts.join(' '),
      provider: this.name,
      latencyMs: Date.now() - startTime,
      model: 'mock-text-v1',
    }
  }

  async analyzeIntake(input: IntakeAnalysisInput): Promise<AiResult<IntakeAnalysisResult>> {
    const startTime = Date.now()
    await simulateDelay()

    // Calculate lead quality based on intake data
    let urgencyScore = 5
    let leadQuality: 'hot' | 'warm' | 'cold' = 'warm'
    const redFlags: string[] = []
    const opportunities: string[] = []

    // Timeline affects urgency
    if (input.timelineUrgency === 'emergency') {
      urgencyScore = 10
      leadQuality = 'hot'
      redFlags.push('Emergency situation - verify scope before committing')
    } else if (input.timelineUrgency === 'within_week') {
      urgencyScore = 8
      leadQuality = 'hot'
    } else if (input.timelineUrgency === 'within_month') {
      urgencyScore = 6
    } else if (input.timelineUrgency === 'flexible') {
      urgencyScore = 3
      leadQuality = 'cold'
    }

    // Insurance claims are high value
    if (input.hasInsuranceClaim) {
      urgencyScore = Math.min(urgencyScore + 2, 10)
      opportunities.push('Insurance claim - higher close rate, faster payment')
      if (leadQuality === 'cold') leadQuality = 'warm'
    }

    // Multiple issues indicate urgency
    if (input.issues && input.issues.length >= 3) {
      urgencyScore = Math.min(urgencyScore + 1, 10)
    }

    // Active leaks are urgent
    if (input.issues?.includes('leaks')) {
      urgencyScore = Math.min(urgencyScore + 2, 10)
      redFlags.push('Active leak - prioritize response')
      leadQuality = 'hot'
    }

    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
    if (input.hasSolarPanels) {
      complexity = 'complex'
      redFlags.push('Solar panel coordination required')
    }
    if ((input.stories || 1) >= 3 || input.roofPitch === 'very_steep') {
      complexity = complexity === 'simple' ? 'moderate' : 'complex'
    }

    // Opportunities
    if (input.roofAgeYears && input.roofAgeYears >= 20) {
      opportunities.push('Aging roof - full replacement likely needed')
    }
    if (input.roofSizeSqft && input.roofSizeSqft >= 2500) {
      opportunities.push('Large roof - premium project value')
    }
    if (input.jobType === 'full_replacement') {
      opportunities.push('Full replacement - highest revenue potential')
    }

    const suggestedFollowUp =
      leadQuality === 'hot'
        ? 'Call within 1 hour - high priority'
        : leadQuality === 'warm'
          ? 'Call within 24 hours'
          : 'Email follow-up, call in 2-3 days'

    return {
      success: true,
      data: {
        leadQuality,
        urgencyScore,
        complexity,
        suggestedFollowUp,
        redFlags,
        opportunities,
      },
      provider: this.name,
      latencyMs: Date.now() - startTime,
      model: 'mock-analysis-v1',
    }
  }

  async generateInternalNotes(input: InternalNotesInput): Promise<AiResult<string>> {
    const startTime = Date.now()
    await simulateDelay()

    const notes: string[] = []
    const { intake, intakeAnalysis, estimate, contact } = input

    // Lead summary
    if (intakeAnalysis) {
      notes.push(
        `• LEAD QUALITY: ${intakeAnalysis.leadQuality.toUpperCase()} (${intakeAnalysis.urgencyScore}/10 urgency)`
      )
    }

    // Contact info
    if (contact?.firstName || contact?.lastName) {
      notes.push(`• Contact: ${contact.firstName || ''} ${contact.lastName || ''} - ${contact.phone || contact.email || 'no contact info'}`)
    }

    // Job details
    const jobDetails: string[] = []
    if (intake.jobType) jobDetails.push(intake.jobType.replace('_', ' '))
    if (intake.roofSizeSqft) jobDetails.push(`${intake.roofSizeSqft} sqft`)
    if (intake.roofMaterial) jobDetails.push(intake.roofMaterial.replace('_', ' '))
    if (jobDetails.length > 0) {
      notes.push(`• Job: ${jobDetails.join(', ')}`)
    }

    // Price range
    if (estimate) {
      notes.push(
        `• Estimate: $${estimate.priceLow.toLocaleString()} - $${estimate.priceHigh.toLocaleString()}`
      )
    }

    // Talking points
    notes.push('• Talking Points:')
    if (intake.hasInsuranceClaim) {
      notes.push('  - Discuss insurance process and documentation')
    }
    if (intake.issues?.includes('leaks')) {
      notes.push('  - Address leak urgency and temporary protection')
    }
    notes.push('  - Confirm timeline expectations and availability')
    notes.push('  - Review material options and warranties')

    // Site visit prep
    notes.push('• Site Visit: Bring ladder, camera, sample materials')

    // Follow-up
    if (intakeAnalysis?.suggestedFollowUp) {
      notes.push(`• Action: ${intakeAnalysis.suggestedFollowUp}`)
    }

    return {
      success: true,
      data: notes.join('\n'),
      provider: this.name,
      latencyMs: Date.now() - startTime,
      model: 'mock-notes-v1',
    }
  }
}

// Singleton instance
export const mockAiProvider = new MockAiProvider()

// Check if we should use mock AI
export function shouldUseMockAi(): boolean {
  return (
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
    (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)
  )
}
