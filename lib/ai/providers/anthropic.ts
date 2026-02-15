import Anthropic from '@anthropic-ai/sdk'
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
import { buildSystemPrompt, parseAdvisorResponse } from '../advisor'

/**
 * Extract the first balanced JSON object from a string.
 * Handles cases where the model returns text before/after the JSON.
 */
function extractJson(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') depth--
    if (depth === 0) {
      return text.slice(start, i + 1)
    }
  }
  return null
}

const PHOTO_ANALYSIS_PROMPT = `You are analyzing a photo that may be of a roof. Analyze the image and provide a structured assessment.

Return your analysis as JSON with this exact structure:
{
  "isRoofPhoto": boolean,
  "confidence": number between 0 and 1,
  "detectedMaterial": one of "asphalt_shingle", "metal", "tile", "slate", "wood_shake", "flat_membrane", "unknown" or null if not a roof,
  "detectedIssues": [
    {
      "issue": one of "missing_shingles", "damaged_shingles", "leaks", "moss_algae", "sagging", "flashing", "gutter_damage", "ventilation", "ice_dams", "storm_damage", "other",
      "confidence": number between 0 and 1,
      "description": "brief description of what you see"
    }
  ],
  "estimatedCondition": one of "excellent", "good", "fair", "poor", "critical" or null,
  "notes": "any additional observations about the roof"
}

Be conservative - only identify issues you can clearly see. Do NOT make up damage that isn't visible.
Respond with only the JSON object, no other text.`

// 60 second timeout for AI API calls (image analysis can be slow)
const AI_TIMEOUT_MS = 60_000

export class AnthropicProvider implements AiProvider {
  name = 'anthropic' as const
  private client: Anthropic | null = null

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not configured')
      }
      this.client = new Anthropic({
        apiKey,
        timeout: AI_TIMEOUT_MS,
        maxRetries: 2,
      })
    }
    return this.client
  }

  async analyzePhoto(input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>> {
    const startTime = Date.now()
    const model = 'claude-sonnet-4-5-20250929'

    try {
      const content: Anthropic.Messages.ContentBlockParam[] = []

      if (input.imageBase64) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: input.imageBase64,
          },
        })
      } else if (input.imageUrl) {
        content.push({
          type: 'image',
          source: {
            type: 'url',
            url: input.imageUrl,
          },
        })
      }

      content.push({ type: 'text', text: PHOTO_ANALYSIS_PROMPT })

      const client = this.getClient()
      const response = await client.messages.create({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content }],
      })

      const latencyMs = Date.now() - startTime
      const textBlock = response.content.find((block) => block.type === 'text')
      const content_text = textBlock?.type === 'text' ? textBlock.text : null

      if (!content_text) {
        return {
          success: false,
          error: 'No response from Anthropic',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      // Extract JSON from response (Claude might include extra text)
      const jsonMatch = extractJson(content_text)
      if (!jsonMatch) {
        return {
          success: false,
          error: 'Could not parse JSON from response',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      const parsed = JSON.parse(jsonMatch) as PhotoAnalysisResult

      return {
        success: true,
        data: parsed,
        provider: this.name,
        latencyMs,
        model,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model,
      }
    }
  }

  async generateExplanation(input: ExplanationInput): Promise<AiResult<string>> {
    const startTime = Date.now()
    const model = 'claude-sonnet-4-5-20250929'

    try {
      const prompt = `You are a helpful roofing expert. Generate a brief, friendly explanation (2-3 paragraphs) of a roofing estimate for a homeowner.

Estimate Details:
- Price Range: $${input.estimate.priceLow.toLocaleString()} - $${input.estimate.priceHigh.toLocaleString()}
- Most Likely: $${input.estimate.priceLikely.toLocaleString()}
- Job Type: ${input.intake.jobType || 'roof work'}
- Roof Material: ${input.intake.roofMaterial || 'standard'}
- Size: ${input.intake.roofSizeSqft || 'typical'} sq ft
- Stories: ${input.intake.stories || 1}
- Pitch: ${input.intake.roofPitch || 'standard'}
- Issues: ${input.intake.issues?.join(', ') || 'none specified'}
- Timeline: ${input.intake.timelineUrgency || 'flexible'}
${input.intake.hasSkylights ? '- Has skylights' : ''}
${input.intake.hasChimneys ? '- Has chimneys' : ''}
${input.intake.hasSolarPanels ? '- Has solar panels' : ''}

Price Factors:
${input.adjustments.map((a) => `- ${a.name}: ${a.impact >= 0 ? '+' : ''}$${a.impact.toLocaleString()} (${a.description})`).join('\n')}

Write a warm, professional explanation that:
1. Summarizes why the estimate falls in this range
2. Highlights key factors affecting the price
3. Sets appropriate expectations
4. Encourages scheduling a free consultation for an exact quote

Keep it under 200 words. Don't use phrases like "I understand" or "I can see". Be direct and informative.`

      const client = this.getClient()
      const response = await client.messages.create({
        model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })

      const latencyMs = Date.now() - startTime
      const textBlock = response.content.find((block) => block.type === 'text')
      const explanation = textBlock?.type === 'text' ? textBlock.text : null

      if (!explanation) {
        return {
          success: false,
          error: 'No response from Anthropic',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      return {
        success: true,
        data: explanation.trim(),
        provider: this.name,
        latencyMs,
        model,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model,
      }
    }
  }

  async analyzeIntake(input: IntakeAnalysisInput): Promise<AiResult<IntakeAnalysisResult>> {
    const startTime = Date.now()
    const model = 'claude-sonnet-4-5-20250929'

    try {
      const prompt = `You are analyzing a roofing lead intake form to help sales prioritize and prepare. Analyze the following information and provide a structured assessment.

Intake Data:
- Job Type: ${input.jobType || 'not specified'}
- Roof Material: ${input.roofMaterial || 'not specified'}
- Roof Size: ${input.roofSizeSqft || 'not specified'} sq ft
- Roof Pitch: ${input.roofPitch || 'not specified'}
- Stories: ${input.stories || 'not specified'}
- Roof Age: ${input.roofAgeYears || 'not specified'} years
- Issues: ${input.issues?.join(', ') || 'none specified'}
- Issues Description: ${input.issuesDescription || 'none'}
- Timeline: ${input.timelineUrgency || 'not specified'}
- Has Skylights: ${input.hasSkylights ? 'Yes' : 'No'}
- Has Chimneys: ${input.hasChimneys ? 'Yes' : 'No'}
- Has Solar Panels: ${input.hasSolarPanels ? 'Yes' : 'No'}
- Insurance Claim: ${input.hasInsuranceClaim ? 'Yes' : 'No'}

Return ONLY a JSON object with this exact structure:
{
  "leadQuality": one of "hot", "warm", "cold",
  "urgencyScore": number 1-10,
  "complexity": one of "simple", "moderate", "complex",
  "suggestedFollowUp": "brief recommended action for sales",
  "redFlags": ["array of concerns or potential issues"],
  "opportunities": ["array of upsell or priority indicators"]
}

Consider:
- Emergency/urgent timeline = hot lead
- Insurance claims = often higher value
- Multiple issues = higher urgency
- Large roof or premium materials = higher value
- Solar panels = complexity flag`

      const client = this.getClient()
      const response = await client.messages.create({
        model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })

      const latencyMs = Date.now() - startTime
      const textBlock = response.content.find((block) => block.type === 'text')
      const content = textBlock?.type === 'text' ? textBlock.text : null

      if (!content) {
        return {
          success: false,
          error: 'No response from Anthropic',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      const jsonStr = extractJson(content)
      if (!jsonStr) {
        return {
          success: false,
          error: 'Could not parse JSON from response',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      const parsed = JSON.parse(jsonStr) as IntakeAnalysisResult

      return {
        success: true,
        data: parsed,
        provider: this.name,
        latencyMs,
        model,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model,
      }
    }
  }

  async generateInternalNotes(input: InternalNotesInput): Promise<AiResult<string>> {
    const startTime = Date.now()
    const model = 'claude-sonnet-4-5-20250929'

    try {
      const prompt = `Generate concise internal notes for our sales team about this roofing lead. These are INTERNAL notes, not customer-facing.

Lead Information:
- Contact: ${input.contact?.firstName || ''} ${input.contact?.lastName || ''} (${input.contact?.phone || 'no phone'}, ${input.contact?.email || 'no email'})
- Job Type: ${input.intake.jobType || 'not specified'}
- Roof: ${input.intake.roofMaterial || 'unknown material'}, ${input.intake.roofSizeSqft || '?'} sq ft, ${input.intake.stories || '?'} stories
- Age: ${input.intake.roofAgeYears || 'unknown'} years
- Issues: ${input.intake.issues?.join(', ') || 'none reported'}
- Additional Notes: ${input.intake.issuesDescription || 'none'}
- Timeline: ${input.intake.timelineUrgency || 'not specified'}
- Insurance: ${input.intake.hasInsuranceClaim ? 'Yes - active claim' : 'No'}
${input.intakeAnalysis ? `
Analysis:
- Lead Quality: ${input.intakeAnalysis.leadQuality}
- Urgency: ${input.intakeAnalysis.urgencyScore}/10
- Complexity: ${input.intakeAnalysis.complexity}
- Red Flags: ${input.intakeAnalysis.redFlags.join(', ') || 'none'}
- Opportunities: ${input.intakeAnalysis.opportunities.join(', ') || 'none'}` : ''}
${input.estimate ? `
Estimate: $${input.estimate.priceLow.toLocaleString()} - $${input.estimate.priceHigh.toLocaleString()} (likely: $${input.estimate.priceLikely.toLocaleString()})` : ''}

Write 3-5 bullet points for the sales team including:
- Key talking points for the call
- Questions to ask during site visit
- Potential upsells or concerns to address
- Recommended approach based on urgency and lead quality

Keep it brief and actionable. Use bullet points.`

      const client = this.getClient()
      const response = await client.messages.create({
        model,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      })

      const latencyMs = Date.now() - startTime
      const textBlock = response.content.find((block) => block.type === 'text')
      const notes = textBlock?.type === 'text' ? textBlock.text : null

      if (!notes) {
        return {
          success: false,
          error: 'No response from Anthropic',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      return {
        success: true,
        data: notes.trim(),
        provider: this.name,
        latencyMs,
        model,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model,
      }
    }
  }

  private extractJson<T>(text: string): T {
    const jsonStr = extractJson(text)
    if (!jsonStr) {
      throw new Error('Could not parse JSON from response')
    }
    return JSON.parse(jsonStr) as T
  }

  async generateFinancingGuidance(input: FinancingGuidanceInput): Promise<AiResult<FinancingGuidanceResult>> {
    const startTime = Date.now()
    try {
      const client = this.getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: `You are a roofing financing advisor. Generate 3 payment scenarios.
Credit rates: excellent=6.99%, good=9.99%, fair=14.99%, poor=19.99%, very_poor=24.99%.
Respond with ONLY JSON: { "scenarios": [{ "name", "termMonths", "estimatedRate", "monthlyPayment", "totalInterest", "recommendation" }], "summary", "nextStep" }`,
        messages: [
          {
            role: 'user',
            content: `Estimate: $${input.estimateAmount}, Credit: ${input.creditRange}, State: ${input.state}${input.insurancePayoutAmount ? `, Insurance payout: $${input.insurancePayoutAmount}` : ''}. Generate 3 scenarios (36mo, 60mo, 120mo).`,
          },
        ],
      })

      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const data = this.extractJson<FinancingGuidanceResult>(text)

      return {
        success: true,
        data,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model: 'claude-sonnet-4-5-20250929',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic financing guidance failed',
        provider: this.name,
        latencyMs: Date.now() - startTime,
      }
    }
  }

  async generateInsuranceLetter(input: InsuranceLetterInput): Promise<AiResult<string>> {
    const startTime = Date.now()
    try {
      const letterTypeLabel = input.letterType === 'appeal' ? 'appeal' : input.letterType === 'follow_up' ? 'follow-up' : 'initial claim'

      const client = this.getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: `Write a professional insurance ${letterTypeLabel} letter for roofing damage. Be factual and persuasive.`,
        messages: [
          {
            role: 'user',
            content: `Write a ${letterTypeLabel} letter:
Customer: ${input.customerName}, Property: ${input.propertyAddress}
Insurance: ${input.claimData.insuranceCompany || '[Company]'}, Policy: ${input.claimData.policyNumber || '[Policy]'}, Claim: ${input.claimData.claimNumber || '[Claim]'}
Date of Loss: ${input.claimData.dateOfLoss || '[Date]'}, Cause: ${input.claimData.causeOfLoss || '[Cause]'}
${input.estimateAmount ? `Estimate: $${input.estimateAmount.toLocaleString()}` : ''}
${input.claimAmountApproved !== undefined ? `Approved: $${input.claimAmountApproved.toLocaleString()}` : ''}
${input.claimData.customerNotes || ''}`,
          },
        ],
      })

      const letter = response.content[0]?.type === 'text' ? response.content[0].text : ''

      return {
        success: true,
        data: letter,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model: 'claude-sonnet-4-5-20250929',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic letter generation failed',
        provider: this.name,
        latencyMs: Date.now() - startTime,
      }
    }
  }

  async generateEligibilityGuidance(input: EligibilityGuidanceInput): Promise<AiResult<EligibilityGuidanceResult>> {
    const startTime = Date.now()
    try {
      const client = this.getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        system: `You are an assistance programs advisor. Prioritize programs: grants before loans, deadline-sensitive first, highest benefit first.
Respond with ONLY JSON: { "prioritizedActions": [{ "order", "programName", "reason", "potentialBenefit" }], "combinedStrategy", "importantNotes": [] }`,
        messages: [
          {
            role: 'user',
            content: `Programs: ${JSON.stringify(input.eligiblePrograms)}
Context: State=${input.userContext.state}${input.userContext.age ? `, Age=${input.userContext.age}` : ''}${input.userContext.isVeteran ? ', Veteran' : ''}${input.userContext.hasDisasterDeclaration ? ', Disaster area' : ''}
${input.estimateAmount ? `Estimate: $${input.estimateAmount}` : ''}`,
          },
        ],
      })

      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const data = this.extractJson<EligibilityGuidanceResult>(text)

      return {
        success: true,
        data,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model: 'claude-sonnet-4-5-20250929',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic eligibility guidance failed',
        provider: this.name,
        latencyMs: Date.now() - startTime,
      }
    }
  }

  async generateAdvisorResponse(input: AdvisorInput): Promise<AiResult<AdvisorResult>> {
    const startTime = Date.now()
    try {
      const systemPrompt = buildSystemPrompt(input)

      const client = this.getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: systemPrompt,
        messages: input.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      const rawContent = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const parsed = parseAdvisorResponse(rawContent, input.businessConfig)

      return {
        success: true,
        data: parsed,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        model: 'claude-sonnet-4-5-20250929',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic advisor failed',
        provider: this.name,
        latencyMs: Date.now() - startTime,
      }
    }
  }
}
