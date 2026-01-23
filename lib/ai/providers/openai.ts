import OpenAI from 'openai'
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

Be conservative - only identify issues you can clearly see. Do NOT make up damage that isn't visible.`

export class OpenAIProvider implements AiProvider {
  name = 'openai' as const
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async analyzePhoto(input: PhotoAnalysisInput): Promise<AiResult<PhotoAnalysisResult>> {
    const startTime = Date.now()
    const model = 'gpt-4o'

    try {
      const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: 'text', text: PHOTO_ANALYSIS_PROMPT },
      ]

      if (input.imageBase64) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${input.imageBase64}`,
            detail: 'high',
          },
        })
      } else if (input.imageUrl) {
        content.push({
          type: 'image_url',
          image_url: {
            url: input.imageUrl,
            detail: 'high',
          },
        })
      }

      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content }],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      })

      const latencyMs = Date.now() - startTime
      const content_text = response.choices[0]?.message?.content

      if (!content_text) {
        return {
          success: false,
          error: 'No response from OpenAI',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      const parsed = JSON.parse(content_text) as PhotoAnalysisResult

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
    const model = 'gpt-4o'

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

      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      })

      const latencyMs = Date.now() - startTime
      const explanation = response.choices[0]?.message?.content

      if (!explanation) {
        return {
          success: false,
          error: 'No response from OpenAI',
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
    const model = 'gpt-4o'

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

Return your analysis as JSON with this exact structure:
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

      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const latencyMs = Date.now() - startTime
      const content = response.choices[0]?.message?.content

      if (!content) {
        return {
          success: false,
          error: 'No response from OpenAI',
          provider: this.name,
          latencyMs,
          model,
        }
      }

      const parsed = JSON.parse(content) as IntakeAnalysisResult

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
    const model = 'gpt-4o'

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

      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
      })

      const latencyMs = Date.now() - startTime
      const notes = response.choices[0]?.message?.content

      if (!notes) {
        return {
          success: false,
          error: 'No response from OpenAI',
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
}
