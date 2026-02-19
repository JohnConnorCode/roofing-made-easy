import type {
  AiProvider,
  PhotoAnalysisInput,
  PhotoAnalysisResult,
  ExplanationInput,
  IntakeAnalysisInput,
  IntakeAnalysisResult,
  InternalNotesInput,
  AiResult,
  FinancingGuidanceInput,
  FinancingGuidanceResult,
  InsuranceLetterInput,
  EligibilityGuidanceInput,
  EligibilityGuidanceResult,
  AdvisorInput,
  AdvisorResult,
} from '../provider'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const CREDIT_RATES: Record<string, number> = {
  excellent: 6.99, good: 9.99, fair: 14.99, poor: 19.99, very_poor: 24.99,
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

export class FallbackProvider implements AiProvider {
  name = 'fallback' as const

  async analyzePhoto(_input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>> {
    // Fallback cannot determine photo content — return negative to avoid false positives
    return {
      success: true,
      data: {
        isRoofPhoto: false,
        confidence: 0,
        detectedMaterial: undefined,
        detectedIssues: [],
        estimatedCondition: undefined,
        notes: 'Automatic analysis is temporarily unavailable. Our team will review your photos.',
      },
      provider: this.name,
      latencyMs: 0,
    }
  }

  async generateExplanation(input: ExplanationInput): Promise<AiResult<string>> {
    const { estimate, intake, adjustments } = input

    // Generate a rule-based explanation referencing all available intake data
    const parts: string[] = []

    const jobLabel = intake.jobType?.replace(/_/g, ' ') || 'roofing work'

    // Material-specific context
    const materialNotes: Record<string, string> = {
      asphalt_shingle: 'Asphalt shingles offer the best balance of cost, durability, and curb appeal — they\'re the most popular choice among homeowners for good reason.',
      metal: 'Metal roofing is a premium, long-lasting choice that can last 40-70 years with minimal maintenance, and it offers excellent energy efficiency.',
      tile: 'Tile roofing provides exceptional durability and a distinctive look. While the upfront cost is higher, tile roofs can last 50+ years.',
      slate: 'Slate is one of the most durable and elegant roofing materials available, with a lifespan that can exceed 100 years.',
      wood_shake: 'Wood shake gives your home a beautiful, natural appearance. It requires more maintenance but offers great insulation properties.',
      flat_membrane: 'Flat/membrane roofing systems are ideal for low-slope roofs, providing excellent waterproofing and modern aesthetics.',
    }

    // Opening — warm and personal
    if (intake.roofSizeSqft) {
      parts.push(
        `Your ${intake.roofSizeSqft.toLocaleString()} sq ft roof ${jobLabel} is estimated between $${estimate.priceLow.toLocaleString()} and $${estimate.priceHigh.toLocaleString()}, with $${estimate.priceLikely.toLocaleString()} as the most likely cost.`
      )
    } else {
      parts.push(
        `Based on your property details, your ${jobLabel} is estimated between $${estimate.priceLow.toLocaleString()} and $${estimate.priceHigh.toLocaleString()}, with $${estimate.priceLikely.toLocaleString()} as the most likely cost.`
      )
    }

    // Material-specific note
    if (intake.roofMaterial && materialNotes[intake.roofMaterial]) {
      parts.push(materialNotes[intake.roofMaterial])
    } else if (intake.roofSizeSqft) {
      parts.push('This pricing is tailored to your roof size and local market rates.')
    }

    // Pitch and access difficulty
    if (intake.roofPitch === 'steep' || intake.roofPitch === 'very_steep') {
      parts.push(
        `Your ${intake.roofPitch.replace('_', ' ')} roof pitch adds complexity to the project, requiring additional safety equipment and labor time.`
      )
    }

    // Multi-story access
    if (intake.stories && intake.stories >= 2) {
      parts.push(
        `As a ${intake.stories}-story property, additional scaffolding and equipment are factored into the estimate for safe access.`
      )
    }

    // Roof features requiring special attention
    const features: string[] = []
    if (intake.hasSkylights) features.push('skylights')
    if (intake.hasChimneys) features.push('chimneys')
    if (intake.hasSolarPanels) features.push('solar panels')
    if (features.length > 0) {
      const featureList = features.length === 1
        ? features[0]
        : features.slice(0, -1).join(', ') + ' and ' + features[features.length - 1]
      parts.push(
        `Your roof includes ${featureList}, which require${features.length === 1 ? 's' : ''} specialized flashing, sealing, or coordination to ensure a watertight result.`
      )
    }

    // Issues reported
    if (intake.issues && intake.issues.length > 0) {
      const issueLabels = intake.issues.map(i => i.replace(/_/g, ' '))
      const issueList = issueLabels.length === 1
        ? issueLabels[0]
        : issueLabels.slice(0, -1).join(', ') + ' and ' + issueLabels[issueLabels.length - 1]
      parts.push(
        `The reported issues — ${issueList} — have been considered in the scope and pricing of this estimate.`
      )
    }

    // Significant pricing factors
    const significantFactors = adjustments.filter((a) => Math.abs(a.impact) >= 100)
    if (significantFactors.length > 0) {
      const factorList = significantFactors
        .map((f) => f.name.toLowerCase())
        .join(', ')
      parts.push(
        `Key factors affecting your estimate include ${factorList}.`
      )
    }

    // Timeline urgency
    if (intake.timelineUrgency) {
      const urgencyLabels: Record<string, string> = {
        emergency: 'Given the emergency nature of your request, we prioritize rapid response and can expedite scheduling.',
        asap: 'With your ASAP timeline, we can prioritize scheduling to get your project underway quickly.',
        within_month: 'Your timeline of completing this within the month aligns well with our typical scheduling.',
        within_3_months: 'Your flexible timeline within the next three months gives us room to coordinate the ideal crew and materials.',
        flexible: 'Your flexible timeline allows us to schedule at the most convenient time and potentially offer better material availability.',
        just_exploring: 'Since you\'re exploring options, this estimate gives you a solid baseline for comparison. It\'s valid for 30 days.',
      }
      const urgencyNote = urgencyLabels[intake.timelineUrgency]
      if (urgencyNote) {
        parts.push(urgencyNote)
      }
    }

    // Insurance claim
    if (intake.hasInsuranceClaim) {
      parts.push(
        'Since you have an active insurance claim, our team can work directly with your adjuster and provide the documentation needed to support your claim.'
      )
    }

    // Closing — consultation value prop
    if (intake.timelineUrgency === 'emergency' || intake.timelineUrgency === 'asap') {
      parts.push(
        'A free on-site consultation will give you an exact quote and let us begin planning your project right away — we\'re ready when you are.'
      )
    } else {
      parts.push(
        'Schedule a free on-site consultation to get an exact quote tailored to your home. Our roofing expert will walk through every detail so you can make a confident decision.'
      )
    }

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

  async generateFinancingGuidance(input: FinancingGuidanceInput): Promise<AiResult<FinancingGuidanceResult>> {
    const amountToFinance = input.estimateAmount - (input.insurancePayoutAmount || 0)
    const rate = CREDIT_RATES[input.creditRange] || 9.99

    const scenarios = [
      { name: 'Lowest Total Cost', termMonths: 36 },
      { name: 'Balanced', termMonths: 60 },
      { name: 'Best Monthly', termMonths: 120 },
    ].map(({ name, termMonths }) => {
      const monthlyPayment = calcMonthlyPayment(amountToFinance, rate, termMonths)
      const totalInterest = (monthlyPayment * termMonths) - amountToFinance
      return {
        name,
        termMonths,
        estimatedRate: rate,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        recommendation: termMonths === 36
          ? 'Best if you can afford higher payments - saves the most on interest.'
          : termMonths === 60
          ? 'Good balance between affordable payments and total cost.'
          : 'Lowest monthly payment, but you\'ll pay more in interest over time.',
      }
    })

    return {
      success: true,
      data: {
        scenarios,
        summary: `Based on ${input.creditRange} credit, you can expect rates around ${rate}% APR. The full amount to finance is $${amountToFinance.toLocaleString()}.`,
        nextStep: 'Create an account to get pre-qualified with actual lender rates.',
      },
      provider: this.name,
      latencyMs: 0,
    }
  }

  async generateInsuranceLetter(input: InsuranceLetterInput): Promise<AiResult<string>> {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const company = input.claimData.insuranceCompany || '[Insurance Company]'
    const policy = input.claimData.policyNumber || '[Policy Number]'
    const claim = input.claimData.claimNumber || '[Claim Number]'
    const dateOfLoss = input.claimData.dateOfLoss || '[Date of Loss]'
    const cause = input.claimData.causeOfLoss || '[cause]'

    if (input.letterType === 'appeal') {
      const letter = `${input.customerName}\n${input.propertyAddress}\n${today}\n\n${company}\nClaims Department\n\nRE: Appeal of Claim Decision\nPolicy: ${policy}\nClaim: ${claim}\nDate of Loss: ${dateOfLoss}\n\nDear Claims Department,\n\nI am writing to formally appeal the decision regarding my roof damage claim.\n\n${input.claimAmountApproved !== undefined && input.estimateAmount ? `The approved amount of $${input.claimAmountApproved.toLocaleString()} is less than the professional repair estimate of $${input.estimateAmount.toLocaleString()}.` : 'I believe the damage assessment was insufficient.'}\n\n${input.claimData.customerNotes || ''}\n\nI request a re-inspection and reconsideration of this claim.\n\nSincerely,\n${input.customerName}`
      return { success: true, data: letter, provider: this.name, latencyMs: 0 }
    }

    const letter = `${input.customerName}\n${input.propertyAddress}\n${today}\n\n${company}\nClaims Department\n\nRE: Property Damage Claim\nPolicy: ${policy}\nDate of Loss: ${dateOfLoss}\n\nDear Claims Department,\n\nI am reporting roof damage caused by ${cause} on ${dateOfLoss}.\n\n${input.estimateAmount ? `Professional repair estimate: $${input.estimateAmount.toLocaleString()}.` : ''}\n\n${input.claimData.customerNotes || ''}\n\nPlease assign an adjuster to inspect my property.\n\nSincerely,\n${input.customerName}`
    return { success: true, data: letter, provider: this.name, latencyMs: 0 }
  }

  async generateEligibilityGuidance(input: EligibilityGuidanceInput): Promise<AiResult<EligibilityGuidanceResult>> {
    const sorted = [...input.eligiblePrograms].sort((a, b) => {
      const aIsGrant = a.programType === 'federal' || a.programType === 'nonprofit' ? 0 : 1
      const bIsGrant = b.programType === 'federal' || b.programType === 'nonprofit' ? 0 : 1
      if (aIsGrant !== bIsGrant) return aIsGrant - bIsGrant
      return (b.maxBenefitAmount || 0) - (a.maxBenefitAmount || 0)
    })

    const prioritizedActions = sorted.map((program, index) => ({
      order: index + 1,
      programName: program.name,
      reason: program.programType === 'federal' || program.programType === 'nonprofit'
        ? 'Grant program - no repayment required'
        : 'Low-interest option to cover remaining costs',
      potentialBenefit: program.maxBenefitAmount
        ? `Up to $${program.maxBenefitAmount.toLocaleString()}`
        : 'Varies',
    }))

    const totalPotential = sorted.reduce((sum, p) => sum + (p.maxBenefitAmount || 0), 0)

    return {
      success: true,
      data: {
        prioritizedActions,
        combinedStrategy: `You may qualify for up to $${totalPotential.toLocaleString()} across ${sorted.length} programs. Start with grants, then loans for any gap.`,
        importantNotes: [
          'Apply for grants before loans - grants don\'t need repayment.',
          'Keep copies of all applications.',
        ],
      },
      provider: this.name,
      latencyMs: 0,
    }
  }

  async generateAdvisorResponse(input: AdvisorInput): Promise<AiResult<AdvisorResult>> {
    const topic = input.topic
    // Use DB-loaded config if available, fall back to static
    const phoneDisplay = input.businessConfig?.phone.display ?? BUSINESS_CONFIG.phone.display
    const phoneRaw = input.businessConfig?.phone.raw ?? BUSINESS_CONFIG.phone.raw
    const phoneHref = `tel:${phoneRaw.replace(/[^+\d]/g, '')}`
    let message: string
    const portalLink = `/portal/${topic}`
    const portalLabel = topic === 'financing' ? 'Explore Financing Options'
      : topic === 'insurance' ? 'Explore Insurance Options'
      : 'Explore Assistance Programs'

    if (topic === 'financing') {
      message = 'For personalized financing guidance, please call our office. We can walk you through loan options and help find the best fit for your budget.'
    } else if (topic === 'insurance') {
      message = 'For insurance claim guidance, document all damage with photos, contact your insurance company, and schedule an adjuster visit. Our team can guide you through each step.'
    } else {
      message = 'Use the eligibility screener to find programs you qualify for. We can help match you with federal, state, and local programs.'
    }

    return {
      success: true,
      data: {
        message,
        suggestedActions: [
          { label: `Call ${phoneDisplay}`, href: phoneHref },
          { label: portalLabel, href: portalLink },
        ],
      },
      provider: this.name,
      latencyMs: 0,
    }
  }
}
