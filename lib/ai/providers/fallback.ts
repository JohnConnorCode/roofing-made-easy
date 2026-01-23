import type {
  AiProvider,
  PhotoAnalysisInput,
  PhotoAnalysisResult,
  ExplanationInput,
  IntakeAnalysisInput,
  IntakeAnalysisResult,
  InternalNotesInput,
  AiResult,
} from '../provider'

export class FallbackProvider implements AiProvider {
  name = 'fallback' as const

  async analyzePhoto(_input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>> {
    // Fallback returns a generic "unable to analyze" result
    return {
      success: true,
      data: {
        isRoofPhoto: true, // Assume it's a roof photo
        confidence: 0.5,
        detectedMaterial: undefined,
        detectedIssues: [],
        estimatedCondition: undefined,
        notes: 'Automatic analysis unavailable. Our team will review your photos manually.',
      },
      provider: this.name,
      latencyMs: 0,
    }
  }

  async generateExplanation(input: ExplanationInput): Promise<AiResult<string>> {
    const { estimate, intake, adjustments } = input

    // Generate a rule-based explanation
    const parts: string[] = []

    // Opening
    parts.push(
      `Based on the information you provided, your estimated cost for ${
        intake.jobType?.replace('_', ' ') || 'roofing work'
      } ranges from $${estimate.priceLow.toLocaleString()} to $${estimate.priceHigh.toLocaleString()}, with $${estimate.priceLikely.toLocaleString()} being the most likely price.`
    )

    // Factors
    const significantFactors = adjustments.filter((a) => Math.abs(a.impact) >= 100)
    if (significantFactors.length > 0) {
      const factorList = significantFactors
        .map((f) => f.name.toLowerCase())
        .join(', ')
      parts.push(
        `Key factors affecting your estimate include ${factorList}.`
      )
    }

    // Size mention
    if (intake.roofSizeSqft) {
      parts.push(
        `Your ${intake.roofSizeSqft.toLocaleString()} square foot roof ${
          intake.roofMaterial
            ? `with ${intake.roofMaterial.replace('_', ' ')} material`
            : ''
        } falls within typical pricing ranges for your area.`
      )
    }

    // Closing
    parts.push(
      'This is an automated estimate based on the information provided. For an exact quote, schedule a free on-site consultation where we can assess your specific needs and provide detailed pricing.'
    )

    return {
      success: true,
      data: parts.join(' '),
      provider: this.name,
      latencyMs: 0,
    }
  }

  async analyzeIntake(input: IntakeAnalysisInput): Promise<AiResult<IntakeAnalysisResult>> {
    // Rule-based lead analysis
    let urgencyScore = 5
    let leadQuality: 'hot' | 'warm' | 'cold' = 'warm'
    const redFlags: string[] = []
    const opportunities: string[] = []

    // Urgency scoring
    if (input.timelineUrgency === 'emergency') {
      urgencyScore = 10
      leadQuality = 'hot'
    } else if (input.timelineUrgency === 'within_week') {
      urgencyScore = 8
      leadQuality = 'hot'
    } else if (input.timelineUrgency === 'within_month') {
      urgencyScore = 6
    } else if (input.timelineUrgency === 'flexible') {
      urgencyScore = 3
      leadQuality = 'cold'
    }

    // Insurance claims are priority
    if (input.hasInsuranceClaim) {
      urgencyScore = Math.min(urgencyScore + 2, 10)
      opportunities.push('Insurance claim - potentially higher-value job')
      if (leadQuality === 'cold') leadQuality = 'warm'
    }

    // Multiple issues increase urgency
    if (input.issues && input.issues.length >= 3) {
      urgencyScore = Math.min(urgencyScore + 1, 10)
      redFlags.push('Multiple issues reported - may indicate significant damage')
    }

    // Specific high-priority issues
    if (input.issues?.includes('leaks')) {
      urgencyScore = Math.min(urgencyScore + 2, 10)
      redFlags.push('Active leak reported - urgent attention needed')
    }
    if (input.issues?.includes('storm_damage')) {
      opportunities.push('Storm damage - may qualify for insurance')
    }

    // Complexity factors
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
    if (input.hasSolarPanels) {
      complexity = 'complex'
      redFlags.push('Solar panels present - requires coordination')
    }
    if ((input.stories || 1) >= 3) {
      complexity = complexity === 'simple' ? 'moderate' : 'complex'
    }
    if (input.roofPitch === 'steep' || input.roofPitch === 'very_steep') {
      complexity = complexity === 'simple' ? 'moderate' : 'complex'
    }

    // Opportunities
    if (input.roofAgeYears && input.roofAgeYears >= 20) {
      opportunities.push('Older roof - full replacement candidate')
    }
    if (input.roofSizeSqft && input.roofSizeSqft >= 2500) {
      opportunities.push('Large roof - higher revenue potential')
    }

    const suggestedFollowUp =
      leadQuality === 'hot'
        ? 'Call immediately - high priority lead'
        : leadQuality === 'warm'
          ? 'Call within 24 hours'
          : 'Add to nurture campaign, follow up in 48-72 hours'

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
      latencyMs: 0,
    }
  }

  async generateInternalNotes(input: InternalNotesInput): Promise<AiResult<string>> {
    const notes: string[] = []

    // Lead priority
    if (input.intakeAnalysis) {
      notes.push(
        `• Lead Quality: ${input.intakeAnalysis.leadQuality.toUpperCase()} (Urgency: ${input.intakeAnalysis.urgencyScore}/10)`
      )
    }

    // Key details
    const details: string[] = []
    if (input.intake.jobType) {
      details.push(input.intake.jobType.replace('_', ' '))
    }
    if (input.intake.roofSizeSqft) {
      details.push(`${input.intake.roofSizeSqft} sq ft`)
    }
    if (input.intake.roofMaterial) {
      details.push(input.intake.roofMaterial.replace('_', ' '))
    }
    if (details.length > 0) {
      notes.push(`• Job: ${details.join(', ')}`)
    }

    // Insurance
    if (input.intake.hasInsuranceClaim) {
      notes.push('• INSURANCE CLAIM - Verify claim details and adjuster contact')
    }

    // Red flags
    if (input.intakeAnalysis?.redFlags && input.intakeAnalysis.redFlags.length > 0) {
      notes.push(`• Watch for: ${input.intakeAnalysis.redFlags.join('; ')}`)
    }

    // Opportunities
    if (input.intakeAnalysis?.opportunities && input.intakeAnalysis.opportunities.length > 0) {
      notes.push(`• Opportunities: ${input.intakeAnalysis.opportunities.join('; ')}`)
    }

    // Timeline
    if (input.intake.timelineUrgency) {
      notes.push(`• Timeline: ${input.intake.timelineUrgency.replace('_', ' ')}`)
    }

    // Follow-up
    if (input.intakeAnalysis?.suggestedFollowUp) {
      notes.push(`• Next step: ${input.intakeAnalysis.suggestedFollowUp}`)
    }

    return {
      success: true,
      data: notes.join('\n'),
      provider: this.name,
      latencyMs: 0,
    }
  }
}
