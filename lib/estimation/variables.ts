/**
 * Roof Variables Calculator
 *
 * Calculates Xactimate-style variables from roof measurements.
 * Variables: SQ, SF, P, EAVE, R, VAL, HIP, RAKE + per-slope variants
 */

import type { RoofSketch, RoofSlope, RoofVariables, SlopeVariables } from '@/lib/supabase/types'

// Standard pitch multipliers (rise/12 run)
// Based on actual roof area increase due to slope
export const PITCH_MULTIPLIERS: Record<number, number> = {
  0: 1.00,   // Flat
  1: 1.003,  // 1/12
  2: 1.014,  // 2/12
  3: 1.031,  // 3/12
  4: 1.054,  // 4/12
  5: 1.083,  // 5/12
  6: 1.118,  // 6/12
  7: 1.158,  // 7/12
  8: 1.202,  // 8/12
  9: 1.250,  // 9/12
  10: 1.302, // 10/12
  11: 1.357, // 11/12
  12: 1.414, // 12/12
  13: 1.474, // 13/12
  14: 1.537, // 14/12
  15: 1.601, // 15/12
  16: 1.667, // 16/12
  17: 1.734, // 17/12
  18: 1.803, // 18/12
}

/**
 * Get pitch multiplier for a given pitch
 * Uses linear interpolation for non-standard pitches
 */
export function getPitchMultiplier(pitch: number): number {
  if (pitch <= 0) return 1.00
  if (pitch >= 18) return PITCH_MULTIPLIERS[18]

  const lower = Math.floor(pitch)
  const upper = Math.ceil(pitch)

  if (lower === upper) {
    return PITCH_MULTIPLIERS[lower] || 1.00
  }

  const lowerMult = PITCH_MULTIPLIERS[lower] || 1.00
  const upperMult = PITCH_MULTIPLIERS[upper] || 1.00
  const fraction = pitch - lower

  return lowerMult + (upperMult - lowerMult) * fraction
}

/**
 * Calculate square feet from length and width with pitch adjustment
 */
export function calculateSqFtWithPitch(
  lengthFt: number,
  widthFt: number,
  pitch: number
): number {
  const baseSqFt = lengthFt * widthFt
  const multiplier = getPitchMultiplier(pitch)
  return baseSqFt * multiplier
}

/**
 * Convert square feet to squares (100 sq ft = 1 square)
 */
export function sqFtToSquares(sqFt: number): number {
  return sqFt / 100
}

/**
 * Convert squares to square feet
 */
export function squaresToSqFt(squares: number): number {
  return squares * 100
}

/**
 * Calculate variables for a single slope
 */
export function calculateSlopeVariables(slope: RoofSlope): SlopeVariables {
  return {
    SQ: slope.squares,
    SF: slope.sqft,
    PITCH: slope.pitch,
    EAVE: slope.eave_lf,
    RIDGE: slope.ridge_lf,
    VALLEY: slope.valley_lf,
    HIP: slope.hip_lf,
    RAKE: slope.rake_lf,
  }
}

/**
 * Calculate all roof variables from a sketch and its slopes
 */
export function calculateRoofVariables(
  sketch: RoofSketch,
  slopes: RoofSlope[] = []
): RoofVariables {
  // Build per-slope variables map
  const slopeVariables: Record<string, SlopeVariables> = {}

  for (const slope of slopes) {
    const key = `F${slope.slope_number}` // F1, F2, F3, etc.
    slopeVariables[key] = calculateSlopeVariables(slope)
  }

  return {
    // Main area variables
    SQ: sketch.total_squares,
    SF: sketch.total_sqft,

    // Perimeter and linear measurements
    P: sketch.total_perimeter_lf,
    EAVE: sketch.total_eave_lf,
    R: sketch.total_ridge_lf,
    VAL: sketch.total_valley_lf,
    HIP: sketch.total_hip_lf,
    RAKE: sketch.total_rake_lf,

    // Feature counts
    SKYLIGHT_COUNT: sketch.skylight_count,
    CHIMNEY_COUNT: sketch.chimney_count,
    PIPE_COUNT: sketch.pipe_boot_count,
    VENT_COUNT: sketch.vent_count,

    // Gutter-related
    GUTTER_LF: sketch.gutter_lf,
    DS_COUNT: sketch.downspout_count,

    // Per-slope variables
    slopes: slopeVariables,
  }
}

/**
 * Create variables from manual input (simple rectangle approximation)
 */
export function calculateVariablesFromDimensions(input: {
  lengthFt: number
  widthFt: number
  pitch: number
  stories?: number
  skylights?: number
  chimneys?: number
  pipeBoots?: number
  vents?: number
  gutterLf?: number
  downspouts?: number
}): RoofVariables {
  const {
    lengthFt,
    widthFt,
    pitch,
    skylights = 0,
    chimneys = 0,
    pipeBoots = 2,
    vents = 0,
    gutterLf,
    downspouts = 2,
  } = input

  // Calculate base measurements
  const pitchMultiplier = getPitchMultiplier(pitch)
  const baseSqFt = lengthFt * widthFt
  const actualSqFt = baseSqFt * pitchMultiplier
  const squares = sqFtToSquares(actualSqFt)

  // Calculate perimeter and edges
  // For a simple gable roof:
  const perimeter = 2 * (lengthFt + widthFt)
  const eave = lengthFt * 2 // Two eave edges
  const ridge = lengthFt // One ridge
  const rake = widthFt * 2 // Two rake edges

  // Estimate gutter length (usually equals eave length)
  const calculatedGutterLf = gutterLf ?? eave

  return {
    SQ: Math.round(squares * 100) / 100,
    SF: Math.round(actualSqFt),
    P: Math.round(perimeter),
    EAVE: Math.round(eave),
    R: Math.round(ridge),
    VAL: 0, // No valleys in simple gable
    HIP: 0, // No hips in simple gable
    RAKE: Math.round(rake),
    SKYLIGHT_COUNT: skylights,
    CHIMNEY_COUNT: chimneys,
    PIPE_COUNT: pipeBoots,
    VENT_COUNT: vents,
    GUTTER_LF: Math.round(calculatedGutterLf),
    DS_COUNT: downspouts,
    slopes: {
      F1: {
        SQ: Math.round((squares / 2) * 100) / 100,
        SF: Math.round(actualSqFt / 2),
        PITCH: pitch,
        EAVE: Math.round(eave / 2),
        RIDGE: Math.round(ridge / 2),
        VALLEY: 0,
        HIP: 0,
        RAKE: Math.round(rake / 2),
      },
      F2: {
        SQ: Math.round((squares / 2) * 100) / 100,
        SF: Math.round(actualSqFt / 2),
        PITCH: pitch,
        EAVE: Math.round(eave / 2),
        RIDGE: Math.round(ridge / 2),
        VALLEY: 0,
        HIP: 0,
        RAKE: Math.round(rake / 2),
      },
    },
  }
}

/**
 * Create variables from intake data (rough estimate)
 */
export function calculateVariablesFromIntake(intake: {
  roof_size_sqft?: number | null
  roof_pitch?: string | null
  stories?: number
  has_skylights?: boolean
  has_chimneys?: boolean
}): RoofVariables {
  const {
    roof_size_sqft = 2000,
    roof_pitch = 'medium',
    stories = 1,
    has_skylights = false,
    has_chimneys = false,
  } = intake

  // Convert pitch string to number
  const pitchMap: Record<string, number> = {
    flat: 1,
    low: 3,
    medium: 5,
    steep: 8,
    very_steep: 12,
    unknown: 5,
  }
  const pitch = pitchMap[roof_pitch || 'medium'] || 5

  // Estimate dimensions from square footage
  // Assume roughly square footprint
  const baseSqFt = roof_size_sqft || 2000
  const sideLength = Math.sqrt(baseSqFt)

  return calculateVariablesFromDimensions({
    lengthFt: sideLength,
    widthFt: sideLength,
    pitch,
    stories,
    skylights: has_skylights ? 1 : 0,
    chimneys: has_chimneys ? 1 : 0,
    pipeBoots: 2 + (stories || 1), // Estimate based on bathrooms
    vents: Math.ceil(baseSqFt / 500), // 1 vent per 500 sqft
    downspouts: Math.ceil(sideLength / 20), // Every 20 feet of eave
  })
}

/**
 * Validate variables are within reasonable ranges
 */
export function validateVariables(variables: RoofVariables): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for negative values
  if (variables.SQ < 0) errors.push('Squares cannot be negative')
  if (variables.SF < 0) errors.push('Square feet cannot be negative')
  if (variables.EAVE < 0) errors.push('Eave length cannot be negative')
  if (variables.R < 0) errors.push('Ridge length cannot be negative')

  // Check for unreasonable values
  if (variables.SQ > 200) warnings.push('Very large roof (>200 squares)')
  if (variables.SQ < 5) warnings.push('Very small roof (<5 squares)')

  // Check consistency
  const expectedSqFt = variables.SQ * 100
  if (Math.abs(variables.SF - expectedSqFt) > 10) {
    warnings.push('SF and SQ values are inconsistent')
  }

  // Check perimeter vs area ratio
  if (variables.SF > 0 && variables.P > 0) {
    const areaPerimeterRatio = variables.SF / variables.P
    if (areaPerimeterRatio < 5) warnings.push('Unusual shape - very long/narrow')
    if (areaPerimeterRatio > 50) warnings.push('Perimeter seems too small for area')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Format variables for display
 */
export function formatVariablesForDisplay(variables: RoofVariables): Record<string, string> {
  return {
    'Total Squares': `${variables.SQ.toFixed(2)} SQ`,
    'Square Feet': `${variables.SF.toLocaleString()} SF`,
    Perimeter: `${variables.P.toFixed(0)} LF`,
    'Eave Length': `${variables.EAVE.toFixed(0)} LF`,
    'Ridge Length': `${variables.R.toFixed(0)} LF`,
    'Valley Length': `${variables.VAL.toFixed(0)} LF`,
    'Hip Length': `${variables.HIP.toFixed(0)} LF`,
    'Rake Length': `${variables.RAKE.toFixed(0)} LF`,
    Skylights: variables.SKYLIGHT_COUNT.toString(),
    Chimneys: variables.CHIMNEY_COUNT.toString(),
    'Pipe Boots': variables.PIPE_COUNT.toString(),
    Vents: variables.VENT_COUNT.toString(),
    'Gutter Length': `${variables.GUTTER_LF.toFixed(0)} LF`,
    Downspouts: variables.DS_COUNT.toString(),
  }
}

/**
 * Get empty/default variables
 */
export function getEmptyVariables(): RoofVariables {
  return {
    SQ: 0,
    SF: 0,
    P: 0,
    EAVE: 0,
    R: 0,
    VAL: 0,
    HIP: 0,
    RAKE: 0,
    SKYLIGHT_COUNT: 0,
    CHIMNEY_COUNT: 0,
    PIPE_COUNT: 0,
    VENT_COUNT: 0,
    GUTTER_LF: 0,
    DS_COUNT: 0,
    slopes: {},
  }
}
