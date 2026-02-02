/**
 * Formula Parser Unit Tests
 *
 * Tests the recursive descent parser that evaluates mathematical expressions
 * with roof variable substitution.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateFormula,
  validateFormula,
  calculateQuantityWithWaste,
  formatFormula,
  getKnownVariables,
  getSuggestedFormula,
  COMMON_FORMULAS,
} from '@/lib/estimation/formula-parser'
import { sampleVariables, simpleVariables, emptyVariables } from '../fixtures/estimation'

describe('evaluateFormula', () => {
  describe('basic operations', () => {
    it('handles simple numbers', () => {
      expect(evaluateFormula('42', sampleVariables)).toBe(42)
      expect(evaluateFormula('3.14', sampleVariables)).toBe(3.14)
      expect(evaluateFormula('0', sampleVariables)).toBe(0)
    })

    it('handles addition: SQ+10', () => {
      expect(evaluateFormula('SQ+10', sampleVariables)).toBe(35) // 25 + 10
      expect(evaluateFormula('10+20', sampleVariables)).toBe(30)
    })

    it('handles subtraction: SQ-5', () => {
      expect(evaluateFormula('SQ-5', sampleVariables)).toBe(20) // 25 - 5
      expect(evaluateFormula('100-30', sampleVariables)).toBe(70)
    })

    it('handles multiplication: SQ*1.10', () => {
      expect(evaluateFormula('SQ*1.10', sampleVariables)).toBeCloseTo(27.5, 5)
      expect(evaluateFormula('10*5', sampleVariables)).toBe(50)
    })

    it('handles division: SF/100', () => {
      expect(evaluateFormula('SF/100', sampleVariables)).toBe(25) // 2500 / 100
      expect(evaluateFormula('100/4', sampleVariables)).toBe(25)
    })

    it('handles multiple operations with correct precedence', () => {
      // Multiplication before addition
      expect(evaluateFormula('SQ+10*2', sampleVariables)).toBe(45) // 25 + (10*2)
      // Division before subtraction
      expect(evaluateFormula('100-SF/100', sampleVariables)).toBe(75) // 100 - 25
      // Left to right for same precedence
      expect(evaluateFormula('10+5-3', sampleVariables)).toBe(12)
      expect(evaluateFormula('20/4*2', sampleVariables)).toBe(10)
    })
  })

  describe('parentheses', () => {
    it('handles parentheses: (SQ+5)*2', () => {
      expect(evaluateFormula('(SQ+5)*2', sampleVariables)).toBe(60) // (25+5)*2
    })

    it('handles nested parens: ((SQ+5)*2)+10', () => {
      expect(evaluateFormula('((SQ+5)*2)+10', sampleVariables)).toBe(70)
    })

    it('handles multiple parenthesized groups', () => {
      expect(evaluateFormula('(SQ+5)*(EAVE-50)', sampleVariables)).toBe(1500) // 30 * 50
    })

    it('handles deeply nested parentheses', () => {
      expect(evaluateFormula('(((10+5)))', sampleVariables)).toBe(15)
    })
  })

  describe('variables', () => {
    it('substitutes SQ variable', () => {
      expect(evaluateFormula('SQ', sampleVariables)).toBe(25)
    })

    it('substitutes all roof variables', () => {
      expect(evaluateFormula('SF', sampleVariables)).toBe(2500)
      expect(evaluateFormula('P', sampleVariables)).toBe(200)
      expect(evaluateFormula('EAVE', sampleVariables)).toBe(100)
      expect(evaluateFormula('R', sampleVariables)).toBe(50)
      expect(evaluateFormula('VAL', sampleVariables)).toBe(20)
      expect(evaluateFormula('HIP', sampleVariables)).toBe(0)
      expect(evaluateFormula('RAKE', sampleVariables)).toBe(80)
    })

    it('substitutes feature count variables', () => {
      expect(evaluateFormula('SKYLIGHT_COUNT', sampleVariables)).toBe(1)
      expect(evaluateFormula('CHIMNEY_COUNT', sampleVariables)).toBe(1)
      expect(evaluateFormula('PIPE_COUNT', sampleVariables)).toBe(4)
      expect(evaluateFormula('VENT_COUNT', sampleVariables)).toBe(3)
      expect(evaluateFormula('GUTTER_LF', sampleVariables)).toBe(100)
      expect(evaluateFormula('DS_COUNT', sampleVariables)).toBe(4)
    })

    it('handles slope variables: F1SQ+F2SQ', () => {
      expect(evaluateFormula('F1SQ+F2SQ', sampleVariables)).toBe(25) // 12.5 + 12.5
      expect(evaluateFormula('F1SF', sampleVariables)).toBe(1250)
      expect(evaluateFormula('F1PITCH', sampleVariables)).toBe(5)
    })

    it('is case insensitive for variables', () => {
      expect(evaluateFormula('sq', sampleVariables)).toBe(25)
      expect(evaluateFormula('Sq', sampleVariables)).toBe(25)
      expect(evaluateFormula('eave', sampleVariables)).toBe(100)
    })

    it('handles combined variable expressions', () => {
      expect(evaluateFormula('EAVE+RAKE', sampleVariables)).toBe(180) // 100 + 80
      expect(evaluateFormula('R+HIP', sampleVariables)).toBe(50) // 50 + 0
    })
  })

  describe('edge cases', () => {
    it('returns 0 for empty formula', () => {
      expect(evaluateFormula('', sampleVariables)).toBe(0)
      expect(evaluateFormula('   ', sampleVariables)).toBe(0)
    })

    it('throws on invalid formula', () => {
      expect(() => evaluateFormula('SQ+', sampleVariables)).toThrow()
      expect(() => evaluateFormula('++5', sampleVariables)).toThrow()
      expect(() => evaluateFormula('(SQ+5', sampleVariables)).toThrow()
      expect(() => evaluateFormula('SQ+5)', sampleVariables)).toThrow()
    })

    it('handles decimals: SQ*1.05', () => {
      expect(evaluateFormula('SQ*1.05', sampleVariables)).toBeCloseTo(26.25, 5)
      expect(evaluateFormula('0.5*10', sampleVariables)).toBe(5)
    })

    it('handles negative results', () => {
      expect(evaluateFormula('10-SQ', sampleVariables)).toBe(-15)
      expect(evaluateFormula('0-100', sampleVariables)).toBe(-100)
    })

    it('handles unary minus', () => {
      expect(evaluateFormula('-10', sampleVariables)).toBe(-10)
      expect(evaluateFormula('-SQ', sampleVariables)).toBe(-25)
      expect(evaluateFormula('10+-5', sampleVariables)).toBe(5)
    })

    it('throws on division by zero', () => {
      expect(() => evaluateFormula('SQ/0', sampleVariables)).toThrow('Division by zero')
      expect(() => evaluateFormula('100/HIP', sampleVariables)).toThrow('Division by zero') // HIP = 0
    })

    it('throws on unknown variables', () => {
      expect(() => evaluateFormula('UNKNOWN', sampleVariables)).toThrow('Unknown variable')
      expect(() => evaluateFormula('SQ+XYZ', sampleVariables)).toThrow('Unknown variable')
    })

    it('handles whitespace in formulas', () => {
      expect(evaluateFormula('  SQ  +  10  ', sampleVariables)).toBe(35)
      expect(evaluateFormula('SQ * 2', sampleVariables)).toBe(50)
    })
  })

  describe('security', () => {
    it('rejects eval attempts', () => {
      expect(() => evaluateFormula('eval("1+1")', sampleVariables)).toThrow()
    })

    it('rejects function calls', () => {
      expect(() => evaluateFormula('Math.sqrt(16)', sampleVariables)).toThrow()
      expect(() => evaluateFormula('console.log(1)', sampleVariables)).toThrow()
    })

    it('rejects special characters', () => {
      expect(() => evaluateFormula('SQ;alert(1)', sampleVariables)).toThrow()
      expect(() => evaluateFormula('SQ=10', sampleVariables)).toThrow()
    })
  })
})

describe('validateFormula', () => {
  it('returns true for valid formulas', () => {
    expect(validateFormula('SQ*1.10').valid).toBe(true)
    expect(validateFormula('EAVE+RAKE').valid).toBe(true)
    expect(validateFormula('(SQ+5)*2').valid).toBe(true)
  })

  it('returns false for invalid syntax', () => {
    expect(validateFormula('SQ+').valid).toBe(false)
    expect(validateFormula('++5').valid).toBe(false)
    expect(validateFormula('(SQ+5').valid).toBe(false)
  })

  it('returns true for empty formula', () => {
    expect(validateFormula('').valid).toBe(true)
    expect(validateFormula('   ').valid).toBe(true)
  })

  it('extracts required variables', () => {
    expect(validateFormula('SQ*1.10').requiredVariables).toEqual(['SQ'])
    expect(validateFormula('EAVE+RAKE').requiredVariables).toContain('EAVE')
    expect(validateFormula('EAVE+RAKE').requiredVariables).toContain('RAKE')
    expect(validateFormula('F1SQ+F2SQ').requiredVariables).toContain('F1SQ')
  })

  it('deduplicates variables', () => {
    const result = validateFormula('SQ+SQ*2')
    expect(result.requiredVariables).toEqual(['SQ'])
  })

  it('returns error message for invalid formulas', () => {
    const result = validateFormula('SQ+')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('calculateQuantityWithWaste', () => {
  it('calculates quantity from formula', () => {
    const result = calculateQuantityWithWaste('SQ', sampleVariables, 1.0, 0)
    expect(result.quantity).toBe(25)
    expect(result.quantityWithWaste).toBe(25)
    expect(result.formulaUsed).toBe('SQ')
  })

  it('applies waste factor', () => {
    const result = calculateQuantityWithWaste('SQ', sampleVariables, 1.10, 0)
    expect(result.quantity).toBe(25)
    expect(result.quantityWithWaste).toBeCloseTo(27.5, 5)
  })

  it('uses fallback for null formula', () => {
    const result = calculateQuantityWithWaste(null, sampleVariables, 1.0, 50)
    expect(result.quantity).toBe(50)
    expect(result.quantityWithWaste).toBe(50)
    expect(result.formulaUsed).toBeNull()
  })

  it('uses fallback for invalid formula', () => {
    const result = calculateQuantityWithWaste('INVALID_VAR', sampleVariables, 1.0, 100)
    expect(result.quantity).toBe(100)
    expect(result.quantityWithWaste).toBe(100)
    expect(result.formulaUsed).toBeNull()
  })

  it('prevents negative quantities', () => {
    const result = calculateQuantityWithWaste('10-SQ', sampleVariables, 1.0, 0)
    expect(result.quantity).toBe(0) // Would be -15, clamped to 0
    expect(result.quantityWithWaste).toBe(0)
  })
})

describe('formatFormula', () => {
  it('adds spaces around operators', () => {
    expect(formatFormula('SQ+10')).toBe('SQ + 10')
    expect(formatFormula('SQ*1.10')).toBe('SQ \u00d7 1.10') // × symbol
    expect(formatFormula('SF/100')).toBe('SF \u00f7 100') // ÷ symbol
  })

  it('handles subtraction', () => {
    expect(formatFormula('SQ-5')).toBe('SQ - 5')
  })

  it('normalizes whitespace', () => {
    expect(formatFormula('SQ  +   10')).toBe('SQ + 10')
  })
})

describe('getKnownVariables', () => {
  it('returns all known variable names', () => {
    const vars = getKnownVariables()
    expect(vars).toContain('SQ')
    expect(vars).toContain('SF')
    expect(vars).toContain('EAVE')
    expect(vars).toContain('SKYLIGHT_COUNT')
    expect(vars).toContain('F1SQ')
    expect(vars.length).toBeGreaterThan(15)
  })
})

describe('getSuggestedFormula', () => {
  it('returns formula for known categories', () => {
    expect(getSuggestedFormula('shingles')).toBe('SQ')
    expect(getSuggestedFormula('flashing')).toBe('EAVE+RAKE')
    expect(getSuggestedFormula('gutters')).toBe('GUTTER_LF')
    expect(getSuggestedFormula('chimneys')).toBe('CHIMNEY_COUNT')
  })

  it('returns null for unknown categories', () => {
    expect(getSuggestedFormula('unknown_category')).toBeNull()
  })
})

describe('COMMON_FORMULAS', () => {
  it('provides standard formulas', () => {
    expect(COMMON_FORMULAS.squares).toBe('SQ')
    expect(COMMON_FORMULAS.squaresWithWaste10).toBe('SQ*1.10')
    expect(COMMON_FORMULAS.eaveAndRake).toBe('EAVE+RAKE')
    expect(COMMON_FORMULAS.skylights).toBe('SKYLIGHT_COUNT')
  })

  it('formulas can be evaluated', () => {
    expect(evaluateFormula(COMMON_FORMULAS.squares, sampleVariables)).toBe(25)
    expect(evaluateFormula(COMMON_FORMULAS.eaveAndRake, sampleVariables)).toBe(180)
    expect(evaluateFormula(COMMON_FORMULAS.perimeter, sampleVariables)).toBe(200)
  })
})

describe('real-world formula scenarios', () => {
  it('calculates shingles with 10% waste', () => {
    const qty = evaluateFormula('SQ*1.10', sampleVariables)
    expect(qty).toBeCloseTo(27.5, 1)
  })

  it('calculates drip edge from eave and rake', () => {
    const qty = evaluateFormula('EAVE+RAKE', sampleVariables)
    expect(qty).toBe(180)
  })

  it('calculates ice and water shield (3ft from eave)', () => {
    const qty = evaluateFormula('EAVE*3/100', sampleVariables)
    expect(qty).toBe(3) // 100 LF * 3 = 300 SF / 100 = 3 SQ
  })

  it('calculates total slope areas', () => {
    const qty = evaluateFormula('F1SQ+F2SQ', sampleVariables)
    expect(qty).toBe(25)
  })

  it('calculates downspout length (10ft per downspout)', () => {
    const qty = evaluateFormula('DS_COUNT*10', sampleVariables)
    expect(qty).toBe(40)
  })

  it('calculates gutter hangers (1 per 2 LF)', () => {
    const qty = evaluateFormula('GUTTER_LF/2', sampleVariables)
    expect(qty).toBe(50)
  })
})
