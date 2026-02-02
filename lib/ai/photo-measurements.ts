/**
 * AI Photo-to-Variables Analysis
 * Analyzes drone/satellite photos to extract roof measurements and detect features
 */

import OpenAI from 'openai'
import type { RoofVariables, SlopeVariables } from '@/lib/supabase/types'
import type { AiResult } from './provider'
import { getEmptyVariables, getPitchMultiplier } from '@/lib/estimation/variables'

export interface PhotoMeasurementInput {
  imageUrl?: string
  imageBase64?: string
  photoType: 'drone' | 'satellite' | 'ground' | 'unknown'
  knownDimensions?: {
    referenceLengthFt?: number // Known reference for scale (e.g., car = 15ft)
    referenceType?: string
  }
}

export interface DetectedRoofPlane {
  id: string
  estimatedSqFt: number
  estimatedPitch: number
  pitchConfidence: number
  shape: 'rectangle' | 'triangle' | 'trapezoid' | 'complex'
  position: 'front' | 'back' | 'left' | 'right' | 'center'
}

export interface DetectedFeature {
  type: 'skylight' | 'chimney' | 'vent' | 'pipe_boot' | 'dormer' | 'valley' | 'hip' | 'ridge' | 'gutter' | 'solar_panel'
  count: number
  confidence: number
  estimatedDimensions?: {
    lengthFt?: number
    widthFt?: number
  }
}

export interface PhotoMeasurementResult {
  success: boolean
  confidence: number

  // Estimated overall dimensions
  estimatedTotalSqFt: number
  estimatedTotalSquares: number
  estimatedFootprintLengthFt: number
  estimatedFootprintWidthFt: number

  // Detected roof characteristics
  detectedMaterial: string | null
  detectedPitch: number
  pitchCategory: 'flat' | 'low' | 'standard' | 'steep' | 'very_steep'
  roofStyle: 'gable' | 'hip' | 'flat' | 'mansard' | 'gambrel' | 'shed' | 'complex'

  // Individual roof planes
  detectedPlanes: DetectedRoofPlane[]

  // Detected features
  detectedFeatures: DetectedFeature[]

  // Generated variables ready for estimation
  suggestedVariables: RoofVariables

  // Warnings or notes
  notes: string[]
  limitationsWarning?: string
}

const PHOTO_MEASUREMENT_PROMPT = `You are an expert roof measurement analyst. Analyze this photo and extract roof measurements and features.

IMPORTANT: Be conservative with estimates. If uncertain, provide lower confidence scores.

Return your analysis as JSON with this EXACT structure:
{
  "success": true,
  "confidence": number between 0 and 1 (overall confidence in measurements),

  "estimatedTotalSqFt": number (total roof surface area, accounting for pitch),
  "estimatedFootprintLengthFt": number (building length at ground level),
  "estimatedFootprintWidthFt": number (building width at ground level),

  "detectedMaterial": one of "asphalt_shingle", "metal_standing_seam", "metal_corrugated", "tile_concrete", "tile_clay", "slate", "wood_shake", "flat_membrane", "unknown" or null,
  "detectedPitch": number (estimated pitch as rise/12, e.g., 4 for 4/12),
  "roofStyle": one of "gable", "hip", "flat", "mansard", "gambrel", "shed", "complex",

  "detectedPlanes": [
    {
      "id": "F1" or "F2" etc,
      "estimatedSqFt": number,
      "estimatedPitch": number,
      "pitchConfidence": number 0-1,
      "shape": one of "rectangle", "triangle", "trapezoid", "complex",
      "position": one of "front", "back", "left", "right", "center"
    }
  ],

  "detectedFeatures": [
    {
      "type": one of "skylight", "chimney", "vent", "pipe_boot", "dormer", "valley", "hip", "ridge", "gutter", "solar_panel",
      "count": number,
      "confidence": number 0-1,
      "estimatedDimensions": { "lengthFt": number, "widthFt": number } or null
    }
  ],

  "notes": ["array of observations or limitations"],
  "limitationsWarning": "string if photo quality or angle limits accuracy" or null
}

Guidelines for estimation:
- Average single-story home footprint: 1500-2000 sq ft
- Average two-story home: 1000-1500 sq ft footprint
- Standard car in driveway = ~15ft for scale reference
- Garage door = ~9ft wide for scale reference
- Account for pitch multiplier when estimating total roof sqft
- Count visible pipe boots, vents, and skylights
- Note if view is obstructed or partial

If this is NOT a roof photo or you cannot make reasonable estimates, return:
{
  "success": false,
  "confidence": 0,
  "notes": ["explanation of why measurement failed"],
  "limitationsWarning": "description of issue"
}`

export async function analyzePhotoForMeasurements(
  input: PhotoMeasurementInput
): Promise<AiResult<PhotoMeasurementResult>> {
  const startTime = Date.now()
  const model = 'gpt-4o'

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
      provider: 'openai',
      latencyMs: Date.now() - startTime,
    }
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: PHOTO_MEASUREMENT_PROMPT },
    ]

    // Add context about known dimensions if provided
    if (input.knownDimensions?.referenceLengthFt) {
      content.push({
        type: 'text',
        text: `Reference for scale: ${input.knownDimensions.referenceType || 'object'} is approximately ${input.knownDimensions.referenceLengthFt} feet.`,
      })
    }

    // Add the image
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
    } else {
      return {
        success: false,
        error: 'No image provided',
        provider: 'openai',
        latencyMs: Date.now() - startTime,
      }
    }

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content }],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const latencyMs = Date.now() - startTime
    const responseText = response.choices[0]?.message?.content

    if (!responseText) {
      return {
        success: false,
        error: 'No response from OpenAI',
        provider: 'openai',
        latencyMs,
        model,
      }
    }

    const parsed = JSON.parse(responseText) as Partial<PhotoMeasurementResult>

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.limitationsWarning || 'Could not analyze photo',
        provider: 'openai',
        latencyMs,
        model,
      }
    }

    // Calculate derived values
    const result = enrichMeasurementResult(parsed)

    return {
      success: true,
      data: result,
      provider: 'openai',
      latencyMs,
      model,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'openai',
      latencyMs: Date.now() - startTime,
      model,
    }
  }
}

/**
 * Enrich the raw AI response with calculated variables
 */
function enrichMeasurementResult(parsed: Partial<PhotoMeasurementResult>): PhotoMeasurementResult {
  const pitch = parsed.detectedPitch || 5
  const pitchMultiplier = getPitchMultiplier(pitch)

  // Calculate total squares
  const totalSqFt = parsed.estimatedTotalSqFt || 0
  const totalSquares = totalSqFt / 100

  // Determine pitch category
  let pitchCategory: PhotoMeasurementResult['pitchCategory'] = 'standard'
  if (pitch === 0) pitchCategory = 'flat'
  else if (pitch <= 3) pitchCategory = 'low'
  else if (pitch <= 6) pitchCategory = 'standard'
  else if (pitch <= 9) pitchCategory = 'steep'
  else pitchCategory = 'very_steep'

  // Extract feature counts
  const features = parsed.detectedFeatures || []
  const skylightFeature = features.find(f => f.type === 'skylight')
  const chimneyFeature = features.find(f => f.type === 'chimney')
  const pipeFeature = features.find(f => f.type === 'pipe_boot')
  const ventFeature = features.find(f => f.type === 'vent')
  const ridgeFeature = features.find(f => f.type === 'ridge')
  const valleyFeature = features.find(f => f.type === 'valley')
  const hipFeature = features.find(f => f.type === 'hip')
  const gutterFeature = features.find(f => f.type === 'gutter')

  // Build roof variables from detected data
  const lengthFt = parsed.estimatedFootprintLengthFt || 50
  const widthFt = parsed.estimatedFootprintWidthFt || 30
  const perimeter = 2 * (lengthFt + widthFt)

  // Estimate linear footage based on roof style
  const roofStyle = parsed.roofStyle || 'gable'
  let eaveLf = perimeter
  let ridgeLf = lengthFt // Gable default
  let rakeLf = widthFt * 2 // Gable default
  let valleyLf = 0
  let hipLf = 0

  if (roofStyle === 'hip') {
    ridgeLf = lengthFt * 0.6
    hipLf = Math.sqrt(widthFt * widthFt / 4 + (pitch * widthFt / 24) ** 2) * 4
    rakeLf = 0
  } else if (roofStyle === 'flat') {
    ridgeLf = 0
    rakeLf = 0
  }

  // Override with detected values if available
  if (ridgeFeature?.estimatedDimensions?.lengthFt) {
    ridgeLf = ridgeFeature.estimatedDimensions.lengthFt
  }
  if (valleyFeature?.estimatedDimensions?.lengthFt) {
    valleyLf = valleyFeature.estimatedDimensions.lengthFt * (valleyFeature.count || 1)
  }
  if (hipFeature?.estimatedDimensions?.lengthFt) {
    hipLf = hipFeature.estimatedDimensions.lengthFt * (hipFeature.count || 1)
  }

  // Build slope variables from detected planes
  const slopes: Record<string, SlopeVariables> = {}
  if (parsed.detectedPlanes && parsed.detectedPlanes.length > 0) {
    parsed.detectedPlanes.forEach((plane, idx) => {
      slopes[plane.id || `F${idx + 1}`] = {
        SQ: plane.estimatedSqFt / 100,
        SF: plane.estimatedSqFt,
        PITCH: plane.estimatedPitch,
        EAVE: 0, // Would need more detailed analysis
        RIDGE: 0,
        VALLEY: 0,
        HIP: 0,
        RAKE: 0,
      }
    })
  }

  const suggestedVariables: RoofVariables = {
    SQ: totalSquares,
    SF: totalSqFt,
    P: perimeter,
    EAVE: eaveLf,
    R: ridgeLf,
    VAL: valleyLf,
    HIP: hipLf,
    RAKE: rakeLf,
    SKYLIGHT_COUNT: skylightFeature?.count || 0,
    CHIMNEY_COUNT: chimneyFeature?.count || 0,
    PIPE_COUNT: pipeFeature?.count || 2, // Default 2 if not detected
    VENT_COUNT: ventFeature?.count || Math.ceil(totalSquares / 3), // 1 per ~300 sqft
    GUTTER_LF: gutterFeature?.estimatedDimensions?.lengthFt || eaveLf,
    DS_COUNT: Math.ceil(eaveLf / 40), // 1 downspout per 40 LF
    slopes,
  }

  return {
    success: true,
    confidence: parsed.confidence || 0.5,
    estimatedTotalSqFt: totalSqFt,
    estimatedTotalSquares: totalSquares,
    estimatedFootprintLengthFt: lengthFt,
    estimatedFootprintWidthFt: widthFt,
    detectedMaterial: parsed.detectedMaterial || null,
    detectedPitch: pitch,
    pitchCategory,
    roofStyle: roofStyle,
    detectedPlanes: parsed.detectedPlanes || [],
    detectedFeatures: features,
    suggestedVariables,
    notes: parsed.notes || [],
    limitationsWarning: parsed.limitationsWarning,
  }
}

/**
 * Analyze multiple photos and merge results for better accuracy
 */
export async function analyzeMultiplePhotos(
  inputs: PhotoMeasurementInput[]
): Promise<AiResult<PhotoMeasurementResult>> {
  const startTime = Date.now()

  if (inputs.length === 0) {
    return {
      success: false,
      error: 'No photos provided',
      provider: 'openai',
      latencyMs: 0,
    }
  }

  // Analyze each photo
  const results: PhotoMeasurementResult[] = []
  for (const input of inputs) {
    const result = await analyzePhotoForMeasurements(input)
    if (result.success && result.data) {
      results.push(result.data)
    }
  }

  if (results.length === 0) {
    return {
      success: false,
      error: 'No photos could be analyzed',
      provider: 'openai',
      latencyMs: Date.now() - startTime,
    }
  }

  // If only one result, return it
  if (results.length === 1) {
    return {
      success: true,
      data: results[0],
      provider: 'openai',
      latencyMs: Date.now() - startTime,
    }
  }

  // Merge multiple results - use weighted average based on confidence
  const merged = mergePhotoResults(results)

  return {
    success: true,
    data: merged,
    provider: 'openai',
    latencyMs: Date.now() - startTime,
  }
}

function mergePhotoResults(results: PhotoMeasurementResult[]): PhotoMeasurementResult {
  const totalWeight = results.reduce((sum, r) => sum + r.confidence, 0)

  // Weighted averages for numeric values
  const weightedAvg = (getter: (r: PhotoMeasurementResult) => number) => {
    return results.reduce((sum, r) => sum + getter(r) * r.confidence, 0) / totalWeight
  }

  // Most common value for categorical
  const mostCommon = <T>(getter: (r: PhotoMeasurementResult) => T): T => {
    const counts = new Map<T, number>()
    results.forEach(r => {
      const val = getter(r)
      counts.set(val, (counts.get(val) || 0) + r.confidence)
    })
    let maxVal = getter(results[0])
    let maxCount = 0
    counts.forEach((count, val) => {
      if (count > maxCount) {
        maxCount = count
        maxVal = val
      }
    })
    return maxVal
  }

  // Merge features by taking max count with highest confidence
  const allFeatures = new Map<string, DetectedFeature>()
  results.forEach(r => {
    r.detectedFeatures.forEach(f => {
      const existing = allFeatures.get(f.type)
      if (!existing || f.confidence > existing.confidence) {
        allFeatures.set(f.type, f)
      }
    })
  })

  // Merge planes - take unique ones
  const allPlanes = new Map<string, DetectedRoofPlane>()
  results.forEach(r => {
    r.detectedPlanes.forEach(p => {
      const existing = allPlanes.get(p.id)
      if (!existing || p.pitchConfidence > existing.pitchConfidence) {
        allPlanes.set(p.id, p)
      }
    })
  })

  const mergedSqFt = weightedAvg(r => r.estimatedTotalSqFt)
  const mergedPitch = Math.round(weightedAvg(r => r.detectedPitch))

  // Create merged result
  const merged: PhotoMeasurementResult = {
    success: true,
    confidence: Math.min(...results.map(r => r.confidence)) * 1.1, // Slight boost for multiple sources
    estimatedTotalSqFt: Math.round(mergedSqFt),
    estimatedTotalSquares: Math.round(mergedSqFt) / 100,
    estimatedFootprintLengthFt: Math.round(weightedAvg(r => r.estimatedFootprintLengthFt)),
    estimatedFootprintWidthFt: Math.round(weightedAvg(r => r.estimatedFootprintWidthFt)),
    detectedMaterial: mostCommon(r => r.detectedMaterial),
    detectedPitch: mergedPitch,
    pitchCategory: mostCommon(r => r.pitchCategory),
    roofStyle: mostCommon(r => r.roofStyle),
    detectedPlanes: Array.from(allPlanes.values()),
    detectedFeatures: Array.from(allFeatures.values()),
    suggestedVariables: getEmptyVariables(), // Will be recalculated
    notes: [...new Set(results.flatMap(r => r.notes))],
    limitationsWarning: results.find(r => r.limitationsWarning)?.limitationsWarning,
  }

  // Recalculate variables from merged data
  const enriched = enrichMeasurementResult(merged)
  merged.suggestedVariables = enriched.suggestedVariables

  return merged
}
