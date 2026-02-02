/**
 * AI Line Item Suggestions
 * Recommends line items based on detected issues, roof characteristics, and estimate context
 */

import OpenAI from 'openai'
import type {
  RoofVariables,
  AiSuggestion,
  EstimateLineItem,
  MacroRoofType,
  MacroJobType,
  LineItemCategory
} from '@/lib/supabase/types'
import type { AiResult, PhotoAnalysisResult } from './provider'
import type { PhotoMeasurementResult, DetectedFeature } from './photo-measurements'

export interface LineItemSuggestionInput {
  variables: RoofVariables
  currentLineItems?: EstimateLineItem[]
  roofType?: MacroRoofType
  jobType?: MacroJobType
  detectedIssues?: PhotoAnalysisResult['detectedIssues']
  photoMeasurements?: PhotoMeasurementResult
  customerNotes?: string
  estimateTotal?: number
  region?: {
    state?: string
    climate?: 'cold' | 'moderate' | 'hot' | 'coastal'
  }
}

export interface LineItemRecommendation {
  line_item_code: string
  reason: string
  priority: 'required' | 'recommended' | 'optional'
  confidence: number
  category: string
  estimatedQuantity?: number
  quantityFormula?: string
}

export interface MacroRecommendation {
  macroName: string
  reason: string
  matchScore: number
  roofType: MacroRoofType
  jobType: MacroJobType
}

export interface LineItemSuggestionResult {
  recommendations: LineItemRecommendation[]
  macroRecommendations: MacroRecommendation[]
  missingItems: AiSuggestion[]
  costSavings: AiSuggestion[]
  upgrades: AiSuggestion[]
  warnings: AiSuggestion[]
  summary: string
}

// Common line item codes and their triggers
const LINE_ITEM_TRIGGERS: Record<string, {
  triggers: string[]
  category: string
  priority: 'required' | 'recommended' | 'optional'
}> = {
  'RFG100': { triggers: ['tear_off', 'replacement', 'one_layer'], category: 'tear_off', priority: 'required' },
  'RFG101': { triggers: ['tear_off', 'replacement', 'two_layers'], category: 'tear_off', priority: 'required' },
  'RFG220': { triggers: ['underlayment', 'felt', 'standard'], category: 'underlayment', priority: 'required' },
  'RFG240': { triggers: ['underlayment', 'synthetic', 'premium'], category: 'underlayment', priority: 'recommended' },
  'RFG250': { triggers: ['ice_dam', 'cold_climate', 'ice_water_shield'], category: 'underlayment', priority: 'required' },
  'RFG410': { triggers: ['shingle', '3_tab', 'economy'], category: 'shingles', priority: 'required' },
  'RFG420': { triggers: ['shingle', 'laminate', 'architectural', 'standard'], category: 'shingles', priority: 'required' },
  'RFG430': { triggers: ['shingle', 'designer', 'premium'], category: 'shingles', priority: 'optional' },
  'FLS100': { triggers: ['drip_edge', 'edge', 'eave'], category: 'flashing', priority: 'required' },
  'FLS110': { triggers: ['step_flashing', 'wall', 'chimney'], category: 'flashing', priority: 'required' },
  'FLS120': { triggers: ['valley', 'valley_metal'], category: 'flashing', priority: 'required' },
  'FLS130': { triggers: ['chimney', 'chimney_flashing', 'counter_flashing'], category: 'flashing', priority: 'required' },
  'VNT100': { triggers: ['ridge_vent', 'ventilation', 'ridge'], category: 'ventilation', priority: 'required' },
  'VNT110': { triggers: ['pipe_boot', 'vent_pipe', 'plumbing'], category: 'ventilation', priority: 'required' },
  'VNT120': { triggers: ['roof_vent', 'exhaust', 'attic'], category: 'ventilation', priority: 'recommended' },
  'SKY100': { triggers: ['skylight', 'skylight_flashing'], category: 'skylights', priority: 'required' },
  'SKY110': { triggers: ['skylight_replace', 'skylight_new'], category: 'skylights', priority: 'optional' },
  'GTR100': { triggers: ['gutter', 'aluminum', '5_inch'], category: 'gutters', priority: 'optional' },
  'GTR110': { triggers: ['gutter', 'seamless', '6_inch'], category: 'gutters', priority: 'optional' },
  'GTR200': { triggers: ['downspout', 'downspout_standard'], category: 'gutters', priority: 'optional' },
}

const AI_SUGGESTION_PROMPT = `You are an expert roofing estimator. Analyze the provided roof information and suggest line items, identify missing items, and provide recommendations.

Context:
- Variables: SQ (squares), SF (sqft), P (perimeter), EAVE, RIDGE, VALLEY, HIP, RAKE lengths
- Current line items already in the estimate (if any)
- Detected issues from photos (if any)
- Roof type, job type, region/climate

Return JSON with this structure:
{
  "recommendations": [
    {
      "line_item_code": "RFG420",
      "reason": "Architectural shingles recommended for standard residential replacement",
      "priority": "required" | "recommended" | "optional",
      "confidence": 0.95,
      "category": "shingles",
      "estimatedQuantity": 25,
      "quantityFormula": "SQ*1.10"
    }
  ],
  "macroRecommendations": [
    {
      "macroName": "Full Replacement - Laminate",
      "reason": "Best match for standard asphalt shingle replacement",
      "matchScore": 0.95,
      "roofType": "asphalt_shingle",
      "jobType": "full_replacement"
    }
  ],
  "missingItems": [
    {
      "type": "missing_item",
      "title": "Ice & Water Shield Missing",
      "description": "Cold climate detected - ice dam protection required at eaves",
      "line_item_code": "RFG250",
      "confidence": 0.9
    }
  ],
  "costSavings": [
    {
      "type": "cost_saving",
      "title": "3-Tab Alternative",
      "description": "3-tab shingles would save $1,500 but have shorter warranty",
      "impact": -1500,
      "line_item_code": "RFG410",
      "confidence": 0.85
    }
  ],
  "upgrades": [
    {
      "type": "upgrade",
      "title": "Premium Underlayment",
      "description": "Synthetic underlayment offers better protection for $400 more",
      "impact": 400,
      "line_item_code": "RFG240",
      "confidence": 0.8
    }
  ],
  "warnings": [
    {
      "type": "warning",
      "title": "Complex Roof Detected",
      "description": "Multiple valleys and hips may require additional labor time",
      "confidence": 0.7
    }
  ],
  "summary": "Brief summary of recommendations and key considerations"
}

Key considerations:
- ALWAYS include tear-off for replacement jobs
- ALWAYS include underlayment
- ALWAYS include drip edge
- Check for valley/hip flashing based on variables
- Ice & water shield required in cold climates
- Starter strip for all shingle roofs
- Cap shingles for ridges and hips
- Ventilation based on sqft (1 per 150-300 sqft attic)
- Flashing around skylights and chimneys based on counts`

export async function suggestLineItems(
  input: LineItemSuggestionInput
): Promise<AiResult<LineItemSuggestionResult>> {
  const startTime = Date.now()
  const model = 'gpt-4o'

  // First, apply rule-based suggestions
  const ruleBasedSuggestions = generateRuleBasedSuggestions(input)

  // If no API key, return rule-based only
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: true,
      data: ruleBasedSuggestions,
      provider: 'fallback',
      latencyMs: Date.now() - startTime,
    }
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const contextPrompt = buildContextPrompt(input)

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: AI_SUGGESTION_PROMPT },
        { role: 'user', content: contextPrompt },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const latencyMs = Date.now() - startTime
    const responseText = response.choices[0]?.message?.content

    if (!responseText) {
      return {
        success: true,
        data: ruleBasedSuggestions,
        provider: 'fallback',
        latencyMs,
      }
    }

    const aiResult = JSON.parse(responseText) as LineItemSuggestionResult

    // Merge AI results with rule-based (AI takes priority but rule-based fills gaps)
    const merged = mergeWithRuleBased(aiResult, ruleBasedSuggestions)

    return {
      success: true,
      data: merged,
      provider: 'openai',
      latencyMs,
      model,
    }
  } catch (error) {
    // Fall back to rule-based on error
    return {
      success: true,
      data: ruleBasedSuggestions,
      provider: 'fallback',
      latencyMs: Date.now() - startTime,
    }
  }
}

function buildContextPrompt(input: LineItemSuggestionInput): string {
  const parts: string[] = []

  // Roof variables
  parts.push('ROOF MEASUREMENTS:')
  parts.push(`- Total: ${input.variables.SQ} squares (${input.variables.SF} sq ft)`)
  parts.push(`- Perimeter: ${input.variables.P} LF`)
  parts.push(`- Eave: ${input.variables.EAVE} LF, Ridge: ${input.variables.R} LF`)
  parts.push(`- Valley: ${input.variables.VAL} LF, Hip: ${input.variables.HIP} LF, Rake: ${input.variables.RAKE} LF`)
  parts.push(`- Skylights: ${input.variables.SKYLIGHT_COUNT}, Chimneys: ${input.variables.CHIMNEY_COUNT}`)
  parts.push(`- Pipe boots: ${input.variables.PIPE_COUNT}, Vents: ${input.variables.VENT_COUNT}`)
  parts.push(`- Gutter: ${input.variables.GUTTER_LF} LF, Downspouts: ${input.variables.DS_COUNT}`)

  // Job context
  if (input.roofType || input.jobType) {
    parts.push('\nJOB CONTEXT:')
    if (input.roofType) parts.push(`- Roof Type: ${input.roofType}`)
    if (input.jobType) parts.push(`- Job Type: ${input.jobType}`)
  }

  // Region
  if (input.region) {
    parts.push('\nREGION:')
    if (input.region.state) parts.push(`- State: ${input.region.state}`)
    if (input.region.climate) parts.push(`- Climate: ${input.region.climate}`)
  }

  // Detected issues
  if (input.detectedIssues && input.detectedIssues.length > 0) {
    parts.push('\nDETECTED ISSUES:')
    input.detectedIssues.forEach(issue => {
      parts.push(`- ${issue.issue}: ${issue.description || 'detected'} (confidence: ${issue.confidence})`)
    })
  }

  // Photo measurements
  if (input.photoMeasurements) {
    parts.push('\nPHOTO ANALYSIS:')
    parts.push(`- Material: ${input.photoMeasurements.detectedMaterial || 'unknown'}`)
    parts.push(`- Pitch: ${input.photoMeasurements.detectedPitch}/12 (${input.photoMeasurements.pitchCategory})`)
    parts.push(`- Style: ${input.photoMeasurements.roofStyle}`)
    if (input.photoMeasurements.detectedFeatures.length > 0) {
      parts.push('- Features: ' + input.photoMeasurements.detectedFeatures.map(f => `${f.count} ${f.type}`).join(', '))
    }
  }

  // Current line items
  if (input.currentLineItems && input.currentLineItems.length > 0) {
    parts.push('\nCURRENT LINE ITEMS:')
    input.currentLineItems.forEach(item => {
      parts.push(`- ${item.item_code}: ${item.name} (qty: ${item.quantity})`)
    })
  }

  // Customer notes
  if (input.customerNotes) {
    parts.push('\nCUSTOMER NOTES:')
    parts.push(input.customerNotes)
  }

  return parts.join('\n')
}

/**
 * Generate rule-based suggestions without AI
 */
function generateRuleBasedSuggestions(input: LineItemSuggestionInput): LineItemSuggestionResult {
  const recommendations: LineItemRecommendation[] = []
  const missingItems: AiSuggestion[] = []
  const warnings: AiSuggestion[] = []
  const upgrades: AiSuggestion[] = []
  const costSavings: AiSuggestion[] = []

  const { variables, jobType, roofType, currentLineItems = [] } = input
  const currentCodes = new Set(currentLineItems.map(li => li.item_code))

  // Determine if this is a replacement or repair
  const isReplacement = jobType === 'full_replacement' || jobType === 'partial_replacement'
  const isShingle = roofType === 'asphalt_shingle' || !roofType

  // Required items for replacement
  if (isReplacement) {
    // Tear-off
    if (!currentCodes.has('RFG100') && !currentCodes.has('RFG101')) {
      recommendations.push({
        line_item_code: 'RFG100',
        reason: 'Tear-off required for replacement job',
        priority: 'required',
        confidence: 1.0,
        category: 'tear_off',
        estimatedQuantity: variables.SQ,
        quantityFormula: 'SQ',
      })
    }

    // Underlayment
    if (!currentCodes.has('RFG220') && !currentCodes.has('RFG240')) {
      recommendations.push({
        line_item_code: 'RFG220',
        reason: 'Underlayment required for replacement',
        priority: 'required',
        confidence: 1.0,
        category: 'underlayment',
        estimatedQuantity: Math.ceil(variables.SQ * 1.05),
        quantityFormula: 'SQ*1.05',
      })
    }
  }

  // Shingles for shingle roofs
  if (isShingle && !currentCodes.has('RFG410') && !currentCodes.has('RFG420') && !currentCodes.has('RFG430')) {
    recommendations.push({
      line_item_code: 'RFG420',
      reason: 'Architectural shingles - standard choice for residential',
      priority: 'required',
      confidence: 0.95,
      category: 'shingles',
      estimatedQuantity: Math.ceil(variables.SQ * 1.10),
      quantityFormula: 'SQ*1.10',
    })
  }

  // Drip edge
  if (!currentCodes.has('FLS100')) {
    recommendations.push({
      line_item_code: 'FLS100',
      reason: 'Drip edge required at eaves and rakes',
      priority: 'required',
      confidence: 1.0,
      category: 'flashing',
      estimatedQuantity: variables.EAVE + variables.RAKE,
      quantityFormula: 'EAVE+RAKE',
    })
  }

  // Valley flashing
  if (variables.VAL > 0 && !currentCodes.has('FLS120')) {
    recommendations.push({
      line_item_code: 'FLS120',
      reason: 'Valley metal required for valley protection',
      priority: 'required',
      confidence: 1.0,
      category: 'flashing',
      estimatedQuantity: Math.ceil(variables.VAL * 1.05),
      quantityFormula: 'VAL*1.05',
    })
  }

  // Ridge vent
  if (variables.R > 0 && !currentCodes.has('VNT100')) {
    recommendations.push({
      line_item_code: 'VNT100',
      reason: 'Ridge vent for proper attic ventilation',
      priority: 'required',
      confidence: 0.9,
      category: 'ventilation',
      estimatedQuantity: variables.R,
      quantityFormula: 'R',
    })
  }

  // Pipe boots
  if (variables.PIPE_COUNT > 0 && !currentCodes.has('VNT110')) {
    recommendations.push({
      line_item_code: 'VNT110',
      reason: 'Pipe boot replacement for plumbing vents',
      priority: 'required',
      confidence: 1.0,
      category: 'ventilation',
      estimatedQuantity: variables.PIPE_COUNT,
    })
  }

  // Skylight flashing
  if (variables.SKYLIGHT_COUNT > 0 && !currentCodes.has('SKY100')) {
    recommendations.push({
      line_item_code: 'SKY100',
      reason: 'Skylight flashing for existing skylights',
      priority: 'required',
      confidence: 1.0,
      category: 'skylights',
      estimatedQuantity: variables.SKYLIGHT_COUNT,
    })
  }

  // Chimney flashing
  if (variables.CHIMNEY_COUNT > 0 && !currentCodes.has('FLS130')) {
    recommendations.push({
      line_item_code: 'FLS130',
      reason: 'Chimney counter-flashing required',
      priority: 'required',
      confidence: 1.0,
      category: 'flashing',
      estimatedQuantity: variables.CHIMNEY_COUNT,
    })
  }

  // Check for missing required items
  if (isReplacement && isShingle) {
    const requiredCategories: LineItemCategory[] = ['tear_off', 'underlayment', 'shingles', 'flashing', 'ventilation']
    const currentCategories = new Set<LineItemCategory>(currentLineItems.map(li => li.category))

    requiredCategories.forEach(cat => {
      if (!currentCategories.has(cat)) {
        missingItems.push({
          type: 'missing_item',
          title: `${cat.replace('_', ' ')} items missing`,
          description: `No ${cat.replace('_', ' ')} line items found - typically required for replacement`,
          confidence: 0.8,
        })
      }
    })
  }

  // Cold climate warning
  if (input.region?.climate === 'cold') {
    if (!currentCodes.has('RFG250')) {
      missingItems.push({
        type: 'missing_item',
        title: 'Ice & Water Shield Required',
        description: 'Cold climate detected - ice dam protection required at eaves, valleys, and penetrations',
        line_item_code: 'RFG250',
        confidence: 0.95,
      })
    }
  }

  // Complex roof warning
  if (variables.VAL > 20 || variables.HIP > 40) {
    warnings.push({
      type: 'warning',
      title: 'Complex Roof Structure',
      description: 'Multiple valleys and hips detected - may require additional labor time and materials',
      confidence: 0.85,
    })
  }

  // Upgrade suggestion - synthetic underlayment
  if (currentCodes.has('RFG220') && !currentCodes.has('RFG240')) {
    upgrades.push({
      type: 'upgrade',
      title: 'Premium Synthetic Underlayment',
      description: 'Upgrade to synthetic underlayment for better tear resistance and walkability',
      impact: Math.round(variables.SQ * 7), // ~$7/SQ more
      line_item_code: 'RFG240',
      confidence: 0.75,
    })
  }

  // Cost saving - 3-tab vs architectural
  if (currentCodes.has('RFG420') && !currentCodes.has('RFG410')) {
    costSavings.push({
      type: 'cost_saving',
      title: '3-Tab Shingle Alternative',
      description: '3-tab shingles are more economical but have shorter warranty (20yr vs 30yr)',
      impact: Math.round(-variables.SQ * 30), // ~$30/SQ less
      line_item_code: 'RFG410',
      confidence: 0.7,
    })
  }

  // Macro recommendations based on job type
  const macroRecommendations: MacroRecommendation[] = []

  if (jobType === 'full_replacement' && isShingle) {
    macroRecommendations.push({
      macroName: 'Full Replacement - Laminate',
      reason: 'Standard template for asphalt shingle replacement',
      matchScore: 0.95,
      roofType: 'asphalt_shingle',
      jobType: 'full_replacement',
    })
  } else if (jobType === 'storm_damage' || jobType === 'insurance_claim') {
    macroRecommendations.push({
      macroName: 'Storm Damage - Insurance',
      reason: 'Template optimized for insurance claim documentation',
      matchScore: 0.9,
      roofType: roofType || 'asphalt_shingle',
      jobType: 'storm_damage',
    })
  } else if (jobType === 'repair') {
    macroRecommendations.push({
      macroName: 'Repair - Shingle',
      reason: 'Basic repair template',
      matchScore: 0.85,
      roofType: 'asphalt_shingle',
      jobType: 'repair',
    })
  }

  return {
    recommendations,
    macroRecommendations,
    missingItems,
    costSavings,
    upgrades,
    warnings,
    summary: `Generated ${recommendations.length} line item recommendations based on roof measurements. ${missingItems.length} potential missing items identified.`,
  }
}

function mergeWithRuleBased(
  aiResult: LineItemSuggestionResult,
  ruleBased: LineItemSuggestionResult
): LineItemSuggestionResult {
  // Use AI results as base, but add any rule-based items not covered
  const aiCodes = new Set(aiResult.recommendations.map(r => r.line_item_code))

  const mergedRecommendations = [
    ...aiResult.recommendations,
    ...ruleBased.recommendations.filter(r => !aiCodes.has(r.line_item_code)),
  ]

  // Merge missing items (dedupe by title)
  const aiMissingTitles = new Set(aiResult.missingItems.map(m => m.title))
  const mergedMissing = [
    ...aiResult.missingItems,
    ...ruleBased.missingItems.filter(m => !aiMissingTitles.has(m.title)),
  ]

  return {
    recommendations: mergedRecommendations,
    macroRecommendations: aiResult.macroRecommendations.length > 0
      ? aiResult.macroRecommendations
      : ruleBased.macroRecommendations,
    missingItems: mergedMissing,
    costSavings: aiResult.costSavings.length > 0 ? aiResult.costSavings : ruleBased.costSavings,
    upgrades: aiResult.upgrades.length > 0 ? aiResult.upgrades : ruleBased.upgrades,
    warnings: [...aiResult.warnings, ...ruleBased.warnings],
    summary: aiResult.summary || ruleBased.summary,
  }
}

/**
 * Quick check for commonly missing items based on current estimate
 */
export function checkForMissingItems(
  variables: RoofVariables,
  currentLineItems: EstimateLineItem[]
): AiSuggestion[] {
  const missing: AiSuggestion[] = []
  const currentCodes = new Set(currentLineItems.map(li => li.item_code))

  // Check tear-off
  if (!currentCodes.has('RFG100') && !currentCodes.has('RFG101')) {
    missing.push({
      type: 'missing_item',
      title: 'Tear-Off Not Included',
      description: 'Most replacements require existing shingle removal',
      line_item_code: 'RFG100',
      confidence: 0.9,
    })
  }

  // Check drip edge
  if (!currentCodes.has('FLS100')) {
    missing.push({
      type: 'missing_item',
      title: 'Drip Edge Missing',
      description: 'Drip edge is required by code at all eaves and rakes',
      line_item_code: 'FLS100',
      confidence: 0.95,
    })
  }

  // Check valley if needed
  if (variables.VAL > 0 && !currentCodes.has('FLS120')) {
    missing.push({
      type: 'missing_item',
      title: 'Valley Flashing Missing',
      description: `${variables.VAL} LF of valley detected - requires valley metal`,
      line_item_code: 'FLS120',
      confidence: 1.0,
    })
  }

  // Check chimney flashing
  if (variables.CHIMNEY_COUNT > 0 && !currentCodes.has('FLS130')) {
    missing.push({
      type: 'missing_item',
      title: 'Chimney Flashing Missing',
      description: `${variables.CHIMNEY_COUNT} chimney(s) detected - requires counter-flashing`,
      line_item_code: 'FLS130',
      confidence: 1.0,
    })
  }

  // Check skylights
  if (variables.SKYLIGHT_COUNT > 0 && !currentCodes.has('SKY100')) {
    missing.push({
      type: 'missing_item',
      title: 'Skylight Flashing Missing',
      description: `${variables.SKYLIGHT_COUNT} skylight(s) detected - requires flashing kit`,
      line_item_code: 'SKY100',
      confidence: 1.0,
    })
  }

  return missing
}
