/**
 * Variables Calculator Unit Tests
 *
 * Tests pitch multipliers and roof variable calculations.
 */

import { describe, it, expect } from 'vitest'
import {
  PITCH_MULTIPLIERS,
  getPitchMultiplier,
  calculateSqFtWithPitch,
  sqFtToSquares,
  squaresToSqFt,
  calculateSlopeVariables,
  calculateRoofVariables,
  calculateVariablesFromDimensions,
  calculateVariablesFromIntake,
  validateVariables,
  formatVariablesForDisplay,
  getEmptyVariables,
} from '@/lib/estimation/variables'
import type { RoofSlope, RoofSketch } from '@/lib/supabase/types'
import { sampleVariables, complexVariables, emptyVariables } from '../fixtures/estimation'

describe('getPitchMultiplier', () => {
  it('returns 1.0 for flat roof (0/12)', () => {
    expect(getPitchMultiplier(0)).toBe(1.0)
  })

  it('returns correct multiplier for 5/12 pitch', () => {
    expect(getPitchMultiplier(5)).toBe(1.083)
  })

  it('returns correct multiplier for 6/12 pitch', () => {
    expect(getPitchMultiplier(6)).toBe(1.118)
  })

  it('returns 1.414 for 12/12 pitch', () => {
    expect(getPitchMultiplier(12)).toBe(1.414)
  })

  it('handles out of range values (negative)', () => {
    expect(getPitchMultiplier(-5)).toBe(1.0)
  })

  it('handles out of range values (above 18)', () => {
    expect(getPitchMultiplier(20)).toBe(PITCH_MULTIPLIERS[18])
    expect(getPitchMultiplier(25)).toBe(PITCH_MULTIPLIERS[18])
  })

  it('interpolates non-integer pitches', () => {
    // Between 5 (1.083) and 6 (1.118)
    const result = getPitchMultiplier(5.5)
    expect(result).toBeCloseTo(1.1005, 3) // (1.083 + 1.118) / 2
  })

  it('returns correct value for integer pitch in table', () => {
    expect(getPitchMultiplier(3)).toBe(1.031)
    expect(getPitchMultiplier(8)).toBe(1.202)
  })
})

describe('PITCH_MULTIPLIERS constant', () => {
  it('contains multipliers for pitches 0-18', () => {
    expect(PITCH_MULTIPLIERS[0]).toBe(1.0)
    expect(PITCH_MULTIPLIERS[18]).toBe(1.803)
  })

  it('multipliers increase with pitch', () => {
    for (let i = 0; i < 18; i++) {
      expect(PITCH_MULTIPLIERS[i + 1]).toBeGreaterThan(PITCH_MULTIPLIERS[i])
    }
  })
})

describe('calculateSqFtWithPitch', () => {
  it('calculates correct area for flat roof', () => {
    const sqft = calculateSqFtWithPitch(50, 30, 0)
    expect(sqft).toBe(1500) // 50 * 30 * 1.0
  })

  it('calculates correct area for 5/12 pitch', () => {
    const sqft = calculateSqFtWithPitch(50, 30, 5)
    expect(sqft).toBeCloseTo(1624.5, 1) // 1500 * 1.083
  })

  it('calculates correct area for 12/12 pitch', () => {
    const sqft = calculateSqFtWithPitch(50, 30, 12)
    expect(sqft).toBeCloseTo(2121, 0) // 1500 * 1.414
  })
})

describe('sqFtToSquares and squaresToSqFt', () => {
  it('converts square feet to squares', () => {
    expect(sqFtToSquares(100)).toBe(1)
    expect(sqFtToSquares(2500)).toBe(25)
    expect(sqFtToSquares(150)).toBe(1.5)
  })

  it('converts squares to square feet', () => {
    expect(squaresToSqFt(1)).toBe(100)
    expect(squaresToSqFt(25)).toBe(2500)
    expect(squaresToSqFt(1.5)).toBe(150)
  })

  it('conversions are inverse of each other', () => {
    const original = 2500
    expect(squaresToSqFt(sqFtToSquares(original))).toBe(original)
  })
})

describe('calculateSlopeVariables', () => {
  it('extracts slope variables from RoofSlope', () => {
    const slope: RoofSlope = {
      id: 'slope-1',
      sketch_id: 'sketch-1',
      name: 'Front Slope',
      slope_number: 1,
      squares: 12.5,
      sqft: 1250,
      pitch: 5,
      pitch_multiplier: 1.083,
      eave_lf: 50,
      ridge_lf: 25,
      valley_lf: 10,
      hip_lf: 0,
      rake_lf: 40,
      length_ft: null,
      width_ft: null,
      is_walkable: true,
      has_steep_charge: false,
      has_limited_access: false,
      notes: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    const vars = calculateSlopeVariables(slope)
    expect(vars.SQ).toBe(12.5)
    expect(vars.SF).toBe(1250)
    expect(vars.PITCH).toBe(5)
    expect(vars.EAVE).toBe(50)
    expect(vars.RIDGE).toBe(25)
    expect(vars.VALLEY).toBe(10)
    expect(vars.HIP).toBe(0)
    expect(vars.RAKE).toBe(40)
  })
})

describe('calculateRoofVariables', () => {
  const mockSketch: RoofSketch = {
    id: 'sketch-1',
    lead_id: 'lead-1',
    total_squares: 25,
    total_sqft: 2500,
    total_perimeter_lf: 200,
    total_eave_lf: 100,
    total_ridge_lf: 50,
    total_valley_lf: 20,
    total_hip_lf: 0,
    total_rake_lf: 80,
    skylight_count: 1,
    chimney_count: 1,
    pipe_boot_count: 4,
    vent_count: 3,
    total_drip_edge_lf: 180,
    total_fascia_lf: 100,
    gutter_lf: 100,
    downspout_count: 4,
    existing_layers: 1,
    sketch_data: {},
    ai_generated: false,
    ai_confidence: null,
    ai_analysis_notes: null,
    measurement_source: 'manual',
    measurement_date: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  it('builds variables from sketch', () => {
    const vars = calculateRoofVariables(mockSketch)
    expect(vars.SQ).toBe(25)
    expect(vars.SF).toBe(2500)
    expect(vars.P).toBe(200)
    expect(vars.EAVE).toBe(100)
    expect(vars.R).toBe(50)
    expect(vars.VAL).toBe(20)
    expect(vars.HIP).toBe(0)
    expect(vars.RAKE).toBe(80)
    expect(vars.SKYLIGHT_COUNT).toBe(1)
    expect(vars.CHIMNEY_COUNT).toBe(1)
    expect(vars.PIPE_COUNT).toBe(4)
    expect(vars.VENT_COUNT).toBe(3)
    expect(vars.GUTTER_LF).toBe(100)
    expect(vars.DS_COUNT).toBe(4)
  })

  it('includes slope variables when slopes provided', () => {
    const slopes: RoofSlope[] = [
      {
        id: 's1',
        sketch_id: 'sketch-1',
        name: 'F1',
        slope_number: 1,
        squares: 12.5,
        sqft: 1250,
        pitch: 5,
        pitch_multiplier: 1.083,
        eave_lf: 50,
        ridge_lf: 25,
        valley_lf: 10,
        hip_lf: 0,
        rake_lf: 40,
        length_ft: null,
        width_ft: null,
        is_walkable: true,
        has_steep_charge: false,
        has_limited_access: false,
        notes: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ]

    const vars = calculateRoofVariables(mockSketch, slopes)
    expect(vars.slopes?.F1).toBeDefined()
    expect(vars.slopes?.F1.SQ).toBe(12.5)
  })
})

describe('calculateVariablesFromDimensions', () => {
  it('calculates SQ from length x width x pitch', () => {
    // 50ft x 30ft at 5/12 = 1500 * 1.083 = 1624.5 SF = 16.245 SQ
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.SQ).toBeCloseTo(16.25, 1)
    expect(vars.SF).toBeCloseTo(1625, 0)
  })

  it('calculates perimeter correctly', () => {
    // 2*(50+30) = 160 LF
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.P).toBe(160)
  })

  it('estimates eave from length (gable roof)', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    // For gable: eave = length * 2
    expect(vars.EAVE).toBe(100)
  })

  it('estimates ridge from length', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.R).toBe(50)
  })

  it('estimates rake from width', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.RAKE).toBe(60) // width * 2
  })

  it('sets valley and hip to 0 for simple gable', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.VAL).toBe(0)
    expect(vars.HIP).toBe(0)
  })

  it('counts skylights, chimneys, vents from input', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
      skylights: 2,
      chimneys: 1,
      pipeBoots: 3,
      vents: 4,
    })
    expect(vars.SKYLIGHT_COUNT).toBe(2)
    expect(vars.CHIMNEY_COUNT).toBe(1)
    expect(vars.PIPE_COUNT).toBe(3)
    expect(vars.VENT_COUNT).toBe(4)
  })

  it('uses default values for optional counts', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.SKYLIGHT_COUNT).toBe(0)
    expect(vars.CHIMNEY_COUNT).toBe(0)
    expect(vars.PIPE_COUNT).toBe(2) // Default
    expect(vars.VENT_COUNT).toBe(0)
  })

  it('calculates gutter length from eave when not specified', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.GUTTER_LF).toBe(100) // Same as eave
  })

  it('uses specified gutter length when provided', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
      gutterLf: 150,
    })
    expect(vars.GUTTER_LF).toBe(150)
  })

  it('creates two slope variables (F1, F2)', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })
    expect(vars.slopes?.F1).toBeDefined()
    expect(vars.slopes?.F2).toBeDefined()
    expect(vars.slopes?.F1.SQ).toBeCloseTo(8.12, 1) // Half of total
    expect(vars.slopes?.F1.PITCH).toBe(5)
  })
})

describe('calculateVariablesFromIntake', () => {
  it('estimates dimensions from square footage', () => {
    const vars = calculateVariablesFromIntake({
      roof_size_sqft: 2000,
      roof_pitch: 'medium',
    })
    // sqrt(2000) = ~44.7 for each side
    expect(vars.SF).toBeGreaterThan(2000) // Includes pitch multiplier
    expect(vars.SQ).toBeGreaterThan(20)
  })

  it('converts pitch strings to numbers', () => {
    const flat = calculateVariablesFromIntake({ roof_pitch: 'flat' })
    const steep = calculateVariablesFromIntake({ roof_pitch: 'steep' })
    expect(flat.SQ).toBeLessThan(steep.SQ) // Same footprint, different slope
  })

  it('handles skylights and chimneys flags', () => {
    const withFeatures = calculateVariablesFromIntake({
      has_skylights: true,
      has_chimneys: true,
    })
    expect(withFeatures.SKYLIGHT_COUNT).toBe(1)
    expect(withFeatures.CHIMNEY_COUNT).toBe(1)

    const without = calculateVariablesFromIntake({
      has_skylights: false,
      has_chimneys: false,
    })
    expect(without.SKYLIGHT_COUNT).toBe(0)
    expect(without.CHIMNEY_COUNT).toBe(0)
  })

  it('estimates pipe boots based on stories', () => {
    const oneStory = calculateVariablesFromIntake({ stories: 1 })
    const twoStory = calculateVariablesFromIntake({ stories: 2 })
    expect(twoStory.PIPE_COUNT).toBeGreaterThan(oneStory.PIPE_COUNT)
  })

  it('uses defaults for missing values', () => {
    const vars = calculateVariablesFromIntake({})
    expect(vars.SF).toBeGreaterThan(0)
    expect(vars.SQ).toBeGreaterThan(0)
  })
})

describe('validateVariables', () => {
  it('returns valid for reasonable values', () => {
    const result = validateVariables(sampleVariables)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns errors for negative values', () => {
    const invalid = { ...sampleVariables, SQ: -10 }
    const result = validateVariables(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Squares cannot be negative')
  })

  it('warns about very large roofs', () => {
    const large = { ...sampleVariables, SQ: 250 }
    const result = validateVariables(large)
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Very large roof (>200 squares)')
  })

  it('warns about very small roofs', () => {
    const small = { ...sampleVariables, SQ: 3 }
    const result = validateVariables(small)
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Very small roof (<5 squares)')
  })

  it('warns about SF/SQ inconsistency', () => {
    const inconsistent = { ...sampleVariables, SF: 1000 } // SQ=25 but SF=1000
    const result = validateVariables(inconsistent)
    expect(result.warnings.some(w => w.includes('inconsistent'))).toBe(true)
  })
})

describe('formatVariablesForDisplay', () => {
  it('formats all variables with units', () => {
    const formatted = formatVariablesForDisplay(sampleVariables)
    expect(formatted['Total Squares']).toBe('25.00 SQ')
    expect(formatted['Square Feet']).toBe('2,500 SF')
    expect(formatted['Perimeter']).toBe('200 LF')
    expect(formatted['Skylights']).toBe('1')
  })
})

describe('getEmptyVariables', () => {
  it('returns all zeros', () => {
    const empty = getEmptyVariables()
    expect(empty.SQ).toBe(0)
    expect(empty.SF).toBe(0)
    expect(empty.SKYLIGHT_COUNT).toBe(0)
    expect(empty.slopes).toEqual({})
  })

  it('returns a new object each time', () => {
    const empty1 = getEmptyVariables()
    const empty2 = getEmptyVariables()
    empty1.SQ = 100
    expect(empty2.SQ).toBe(0)
  })
})

describe('real-world calculation scenarios', () => {
  it('calculates typical ranch home correctly', () => {
    // 50x30 ranch at 4/12 pitch
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 4,
      skylights: 1,
      chimneys: 1,
      pipeBoots: 3,
    })

    // 1500 sqft footprint * 1.054 = 1581 sqft = 15.81 SQ
    expect(vars.SQ).toBeCloseTo(15.81, 1)
    expect(vars.P).toBe(160)
    expect(vars.EAVE).toBe(100)
    expect(vars.R).toBe(50)
  })

  it('calculates two-story colonial correctly', () => {
    // 40x30 at 8/12 pitch
    const vars = calculateVariablesFromDimensions({
      lengthFt: 40,
      widthFt: 30,
      pitch: 8,
      skylights: 0,
      chimneys: 1,
      pipeBoots: 4,
      vents: 3,
    })

    // 1200 sqft * 1.202 = 1442 sqft = 14.42 SQ
    expect(vars.SQ).toBeCloseTo(14.42, 1)
    expect(vars.CHIMNEY_COUNT).toBe(1)
    expect(vars.PIPE_COUNT).toBe(4)
  })
})

describe('multi-slope variable handling', () => {
  it('handles 3+ slopes correctly in complexVariables', () => {
    // complexVariables has F1, F2, F3, F4 slopes
    expect(complexVariables.slopes?.F1).toBeDefined()
    expect(complexVariables.slopes?.F2).toBeDefined()
    expect(complexVariables.slopes?.F3).toBeDefined()
    expect(complexVariables.slopes?.F4).toBeDefined()
    expect(complexVariables.slopes?.F1.SQ).toBe(10)
    expect(complexVariables.slopes?.F3.PITCH).toBe(6)
  })

  it('sums slope values correctly for complex roof', () => {
    // F1+F2+F3+F4 SQ should equal total SQ
    const slopeSum = Object.values(complexVariables.slopes || {}).reduce(
      (sum, slope) => sum + slope.SQ,
      0
    )
    expect(slopeSum).toBe(complexVariables.SQ)
  })
})

describe('validateVariables edge cases', () => {
  it('warns about very narrow buildings (low SF/P ratio)', () => {
    // SF/P < 5 indicates very narrow building
    const narrowBuilding = {
      ...sampleVariables,
      SF: 400,  // 400 SF
      P: 100,   // 100 LF perimeter, ratio = 4
    }
    const result = validateVariables(narrowBuilding)
    expect(result.warnings).toContain('Unusual shape - very long/narrow')
  })

  it('warns about unusually wide buildings (high SF/P ratio)', () => {
    // SF/P > 50 indicates perimeter is too small for area
    const wideBuilding = {
      ...sampleVariables,
      SF: 5100,  // 5100 SF
      P: 100,    // 100 LF perimeter, ratio = 51
    }
    const result = validateVariables(wideBuilding)
    expect(result.warnings).toContain('Perimeter seems too small for area')
  })

  it('handles zero perimeter gracefully', () => {
    const zeroPerimeter = {
      ...sampleVariables,
      P: 0,
      SF: 2500,
    }
    // Should not throw, and should not trigger ratio warnings since P is 0
    const result = validateVariables(zeroPerimeter)
    expect(result.valid).toBe(true)
    // No perimeter ratio warnings when P is 0
    expect(result.warnings.filter(w => w.includes('shape') || w.includes('Perimeter'))).toHaveLength(0)
  })

  it('handles zero SF gracefully', () => {
    const zeroSF = {
      ...sampleVariables,
      SF: 0,
      P: 100,
    }
    const result = validateVariables(zeroSF)
    // Should not throw and should not have perimeter ratio issues
    expect(result.valid).toBe(true)
  })

  it('returns error for negative SF', () => {
    const negativeSF = {
      ...sampleVariables,
      SF: -100,
    }
    const result = validateVariables(negativeSF)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Square feet cannot be negative')
  })

  it('returns error for negative EAVE', () => {
    const negativeEave = {
      ...sampleVariables,
      EAVE: -50,
    }
    const result = validateVariables(negativeEave)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Eave length cannot be negative')
  })

  it('returns error for negative ridge', () => {
    const negativeRidge = {
      ...sampleVariables,
      R: -25,
    }
    const result = validateVariables(negativeRidge)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Ridge length cannot be negative')
  })
})
