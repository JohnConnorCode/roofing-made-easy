/**
 * Formula Parser Edge Case Tests
 *
 * Tests for boundary conditions, error handling, and edge cases
 * that could cause issues in production.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateFormula,
  validateFormula,
  calculateQuantityWithWaste,
} from '@/lib/estimation/formula-parser'
import type { RoofVariables } from '@/lib/supabase/types'

// Standard test variables
const standardVariables: RoofVariables = {
  SQ: 25,
  SF: 2500,
  P: 200,
  EAVE: 100,
  R: 50,
  VAL: 20,
  HIP: 0,
  RAKE: 80,
  SKYLIGHT_COUNT: 1,
  CHIMNEY_COUNT: 1,
  PIPE_COUNT: 4,
  VENT_COUNT: 3,
  GUTTER_LF: 100,
  DS_COUNT: 4,
  slopes: {
    F1: { SQ: 12.5, SF: 1250, PITCH: 5, EAVE: 50, RIDGE: 25, VALLEY: 10, HIP: 0, RAKE: 40 },
    F2: { SQ: 12.5, SF: 1250, PITCH: 5, EAVE: 50, RIDGE: 25, VALLEY: 10, HIP: 0, RAKE: 40 },
  },
}

// Variables with extreme values
const extremeVariables: RoofVariables = {
  SQ: 1000000, // Very large
  SF: 100000000,
  P: 50000,
  EAVE: 25000,
  R: 10000,
  VAL: 5000,
  HIP: 5000,
  RAKE: 20000,
  SKYLIGHT_COUNT: 100,
  CHIMNEY_COUNT: 50,
  PIPE_COUNT: 200,
  VENT_COUNT: 150,
  GUTTER_LF: 25000,
  DS_COUNT: 100,
  slopes: {},
}

// Variables with small values
const tinyVariables: RoofVariables = {
  SQ: 0.001,
  SF: 0.1,
  P: 0.5,
  EAVE: 0.25,
  R: 0.125,
  VAL: 0.0625,
  HIP: 0,
  RAKE: 0.25,
  SKYLIGHT_COUNT: 0,
  CHIMNEY_COUNT: 0,
  PIPE_COUNT: 1,
  VENT_COUNT: 1,
  GUTTER_LF: 0.5,
  DS_COUNT: 1,
  slopes: {},
}

describe('Large Number Handling', () => {
  it('should handle large roof sizes without overflow', () => {
    const result = evaluateFormula('SF', extremeVariables)
    expect(result).toBe(100000000)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('should handle large multiplication without overflow', () => {
    const result = evaluateFormula('SQ*1000', extremeVariables)
    expect(result).toBe(1000000000) // 1 billion
    expect(Number.isFinite(result)).toBe(true)
  })

  it('should handle large nested calculations', () => {
    const result = evaluateFormula('(SQ*100)+(SF*10)', extremeVariables)
    expect(result).toBe(100000000 + 1000000000) // 1.1 billion
    expect(Number.isFinite(result)).toBe(true)
  })

  it('should handle product of large numbers', () => {
    // This could overflow in some implementations
    const result = evaluateFormula('SF*SF/1000000', extremeVariables)
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBe(10000000000) // 10 billion
  })

  it('should not overflow with typical worst-case estimate calculation', () => {
    // Simulate a complex estimate calculation
    const result = evaluateFormula(
      '((SQ*250)+(EAVE*15)+(RAKE*15)+(R*20))*1.15*1.25*1.5',
      extremeVariables
    )
    expect(Number.isFinite(result)).toBe(true)
  })
})

describe('Very Small Number Handling', () => {
  it('should handle very small roof measurements', () => {
    const result = evaluateFormula('SQ', tinyVariables)
    expect(result).toBe(0.001)
  })

  it('should handle multiplication with small numbers', () => {
    const result = evaluateFormula('SQ*1.10', tinyVariables)
    expect(result).toBeCloseTo(0.0011, 6)
  })

  it('should handle division with small numbers', () => {
    const result = evaluateFormula('SF/100', tinyVariables)
    expect(result).toBeCloseTo(0.001, 6)
  })

  it('should handle addition of small numbers', () => {
    const result = evaluateFormula('SQ+SF+P', tinyVariables)
    expect(result).toBeCloseTo(0.601, 6)
  })

  it('should not underflow to zero unexpectedly', () => {
    const result = evaluateFormula('SQ*0.001', tinyVariables)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeCloseTo(0.000001, 9)
  })
})

describe('Complex Nested Formulas', () => {
  it('should handle 5 levels of nesting', () => {
    const result = evaluateFormula('((((SQ+5)*2)-10)/2)+5', standardVariables)
    // ((((25+5)*2)-10)/2)+5 = (((30*2)-10)/2)+5 = ((60-10)/2)+5 = (50/2)+5 = 25+5 = 30
    expect(result).toBe(30)
  })

  it('should handle 8 levels of nesting', () => {
    const result = evaluateFormula('(((((((SQ))))+1)*2)/2)-1', standardVariables)
    // SQ = 25, +1 = 26, *2 = 52, /2 = 26, -1 = 25
    expect(result).toBe(25)
  })

  it('should handle multiple nested groups at same level', () => {
    const result = evaluateFormula('(SQ+5)*(EAVE-50)/(R+10)', standardVariables)
    // (25+5)*(100-50)/(50+10) = 30*50/60 = 1500/60 = 25
    expect(result).toBe(25)
  })

  it('should handle nested operations with all operators', () => {
    const result = evaluateFormula('((SQ+10)*(R-10))/(EAVE/10)', standardVariables)
    // ((25+10)*(50-10))/(100/10) = (35*40)/10 = 1400/10 = 140
    expect(result).toBe(140)
  })
})

describe('Operator Precedence Edge Cases', () => {
  it('should evaluate left-to-right for same precedence (addition/subtraction)', () => {
    const result = evaluateFormula('100-50+25-10', standardVariables)
    // Left to right: 100-50=50, 50+25=75, 75-10=65
    expect(result).toBe(65)
  })

  it('should evaluate left-to-right for same precedence (multiplication/division)', () => {
    const result = evaluateFormula('100/10*5/2', standardVariables)
    // Left to right: 100/10=10, 10*5=50, 50/2=25
    expect(result).toBe(25)
  })

  it('should prioritize multiplication over addition', () => {
    const result = evaluateFormula('10+5*3', standardVariables)
    expect(result).toBe(25) // 10+(5*3)=10+15=25
  })

  it('should prioritize division over subtraction', () => {
    const result = evaluateFormula('20-10/2', standardVariables)
    expect(result).toBe(15) // 20-(10/2)=20-5=15
  })

  it('should handle mixed operators correctly', () => {
    const result = evaluateFormula('10+20*3-40/2+5', standardVariables)
    // 10 + (20*3) - (40/2) + 5 = 10 + 60 - 20 + 5 = 55
    expect(result).toBe(55)
  })

  it('should handle parentheses overriding precedence', () => {
    const result = evaluateFormula('(10+20)*3', standardVariables)
    expect(result).toBe(90) // (10+20)*3=30*3=90
  })
})

describe('Unary Minus Edge Cases', () => {
  it('should handle unary minus at start', () => {
    expect(evaluateFormula('-10', standardVariables)).toBe(-10)
  })

  it('should handle unary minus with variable', () => {
    expect(evaluateFormula('-SQ', standardVariables)).toBe(-25)
  })

  it('should handle unary minus after operator', () => {
    expect(evaluateFormula('10+-5', standardVariables)).toBe(5)
    expect(evaluateFormula('10--5', standardVariables)).toBe(15)
    expect(evaluateFormula('10*-5', standardVariables)).toBe(-50)
    expect(evaluateFormula('10/-5', standardVariables)).toBe(-2)
  })

  it('should handle double unary minus', () => {
    expect(evaluateFormula('--10', standardVariables)).toBe(10)
  })

  it('should handle unary minus in parentheses', () => {
    expect(evaluateFormula('(-SQ)', standardVariables)).toBe(-25)
    expect(evaluateFormula('10+(-5)', standardVariables)).toBe(5)
    expect(evaluateFormula('SQ*(-1)', standardVariables)).toBe(-25)
  })

  it('should handle negative result that becomes positive', () => {
    expect(evaluateFormula('(-10)*(-5)', standardVariables)).toBe(50)
  })
})

describe('Zero and Division Edge Cases', () => {
  it('should throw on explicit division by zero', () => {
    expect(() => evaluateFormula('SQ/0', standardVariables)).toThrow('Division by zero')
  })

  it('should throw when dividing by a variable that is zero', () => {
    expect(() => evaluateFormula('SQ/HIP', standardVariables)).toThrow('Division by zero')
  })

  it('should handle zero in numerator', () => {
    expect(evaluateFormula('0/SQ', standardVariables)).toBe(0)
    expect(evaluateFormula('HIP/SQ', standardVariables)).toBe(0)
  })

  it('should handle zero in multiplication', () => {
    expect(evaluateFormula('SQ*0', standardVariables)).toBe(0)
    expect(evaluateFormula('0*SQ', standardVariables)).toBe(0)
    expect(evaluateFormula('SQ*HIP', standardVariables)).toBe(0)
  })

  it('should handle zero in addition/subtraction', () => {
    expect(evaluateFormula('SQ+0', standardVariables)).toBe(25)
    expect(evaluateFormula('0+SQ', standardVariables)).toBe(25)
    expect(evaluateFormula('SQ-0', standardVariables)).toBe(25)
    expect(evaluateFormula('0-SQ', standardVariables)).toBe(-25)
  })
})

describe('Formula Validation Edge Cases', () => {
  it('should reject unclosed parentheses', () => {
    expect(validateFormula('(SQ+5').valid).toBe(false)
    expect(validateFormula('SQ+5)').valid).toBe(false)
    expect(validateFormula('((SQ+5)').valid).toBe(false)
  })

  it('should reject consecutive operators', () => {
    expect(validateFormula('SQ++5').valid).toBe(false)
    expect(validateFormula('SQ**5').valid).toBe(false)
    expect(validateFormula('SQ//5').valid).toBe(false)
  })

  it('should reject trailing operator', () => {
    expect(validateFormula('SQ+').valid).toBe(false)
    expect(validateFormula('SQ*').valid).toBe(false)
    expect(validateFormula('SQ/').valid).toBe(false)
  })

  it('should reject leading operator (except minus)', () => {
    expect(validateFormula('+SQ').valid).toBe(false)
    expect(validateFormula('*SQ').valid).toBe(false)
    expect(validateFormula('/SQ').valid).toBe(false)
    // Unary minus is valid
    expect(validateFormula('-SQ').valid).toBe(true)
  })

  it('should accept empty parentheses as invalid', () => {
    expect(validateFormula('()').valid).toBe(false)
    expect(validateFormula('SQ+()').valid).toBe(false)
  })

  it('should extract all unique variables', () => {
    const result = validateFormula('SQ+EAVE+SQ*RAKE+EAVE')
    expect(result.valid).toBe(true)
    expect(result.requiredVariables).toContain('SQ')
    expect(result.requiredVariables).toContain('EAVE')
    expect(result.requiredVariables).toContain('RAKE')
    expect(result.requiredVariables.filter(v => v === 'SQ').length).toBe(1)
    expect(result.requiredVariables.filter(v => v === 'EAVE').length).toBe(1)
  })
})

describe('Quantity with Waste Calculation', () => {
  it('should clamp negative results to zero', () => {
    const result = calculateQuantityWithWaste('10-SQ', standardVariables, 1.0, 0)
    // 10-25 = -15, should clamp to 0
    expect(result.quantity).toBe(0)
    expect(result.quantityWithWaste).toBe(0)
  })

  it('should apply waste factor correctly', () => {
    const result = calculateQuantityWithWaste('SQ', standardVariables, 1.15, 0)
    expect(result.quantity).toBe(25)
    expect(result.quantityWithWaste).toBeCloseTo(28.75, 5) // 25 * 1.15
  })

  it('should use fallback when formula is null', () => {
    const result = calculateQuantityWithWaste(null, standardVariables, 1.0, 100)
    expect(result.quantity).toBe(100)
    expect(result.quantityWithWaste).toBe(100)
    expect(result.formulaUsed).toBeNull()
  })

  it('should use fallback when formula throws', () => {
    const result = calculateQuantityWithWaste('INVALID_VAR', standardVariables, 1.0, 50)
    expect(result.quantity).toBe(50)
    expect(result.formulaUsed).toBeNull()
  })

  it('should use fallback when formula divides by zero', () => {
    const result = calculateQuantityWithWaste('SQ/HIP', standardVariables, 1.0, 25)
    // Division by zero should fall back
    expect(result.quantity).toBe(25)
    expect(result.formulaUsed).toBeNull()
  })

  it('should handle zero waste factor', () => {
    const result = calculateQuantityWithWaste('SQ', standardVariables, 0, 0)
    expect(result.quantity).toBe(25)
    expect(result.quantityWithWaste).toBe(0) // 25 * 0
  })

  it('should handle large waste factor', () => {
    const result = calculateQuantityWithWaste('SQ', standardVariables, 2.0, 0)
    expect(result.quantity).toBe(25)
    expect(result.quantityWithWaste).toBe(50) // 25 * 2
  })
})

describe('Security and Injection Prevention', () => {
  it('should reject JavaScript code injection attempts', () => {
    expect(() => evaluateFormula('eval("1+1")', standardVariables)).toThrow()
    expect(() => evaluateFormula('Function("return 1")()', standardVariables)).toThrow()
  })

  it('should reject method call attempts', () => {
    expect(() => evaluateFormula('Math.pow(2,3)', standardVariables)).toThrow()
    expect(() => evaluateFormula('console.log(1)', standardVariables)).toThrow()
    expect(() => evaluateFormula('process.exit(1)', standardVariables)).toThrow()
  })

  it('should reject property access attempts', () => {
    expect(() => evaluateFormula('SQ.toString()', standardVariables)).toThrow()
    expect(() => evaluateFormula('constructor', standardVariables)).toThrow()
  })

  it('should reject semicolons', () => {
    expect(() => evaluateFormula('SQ;5', standardVariables)).toThrow()
    expect(() => evaluateFormula('SQ;alert(1)', standardVariables)).toThrow()
  })

  it('should reject assignment operators', () => {
    expect(() => evaluateFormula('SQ=10', standardVariables)).toThrow()
    expect(() => evaluateFormula('SQ+=5', standardVariables)).toThrow()
  })

  it('should reject comparison operators', () => {
    expect(() => evaluateFormula('SQ>10', standardVariables)).toThrow()
    expect(() => evaluateFormula('SQ<10', standardVariables)).toThrow()
    expect(() => evaluateFormula('SQ==10', standardVariables)).toThrow()
  })

  it('should reject string literals', () => {
    expect(() => evaluateFormula('"test"', standardVariables)).toThrow()
    expect(() => evaluateFormula("'test'", standardVariables)).toThrow()
    expect(() => evaluateFormula('`test`', standardVariables)).toThrow()
  })

  it('should reject square brackets', () => {
    expect(() => evaluateFormula('SQ[0]', standardVariables)).toThrow()
    expect(() => evaluateFormula('[1,2,3]', standardVariables)).toThrow()
  })

  it('should reject curly braces', () => {
    expect(() => evaluateFormula('{a:1}', standardVariables)).toThrow()
  })
})

describe('Whitespace Handling', () => {
  it('should handle leading whitespace', () => {
    expect(evaluateFormula('  SQ', standardVariables)).toBe(25)
    expect(evaluateFormula('\tSQ', standardVariables)).toBe(25)
    expect(evaluateFormula('\nSQ', standardVariables)).toBe(25)
  })

  it('should handle trailing whitespace', () => {
    expect(evaluateFormula('SQ  ', standardVariables)).toBe(25)
    expect(evaluateFormula('SQ\t', standardVariables)).toBe(25)
    expect(evaluateFormula('SQ\n', standardVariables)).toBe(25)
  })

  it('should handle whitespace between tokens', () => {
    expect(evaluateFormula('SQ + 10', standardVariables)).toBe(35)
    expect(evaluateFormula('SQ  +  10', standardVariables)).toBe(35)
    expect(evaluateFormula('SQ\t+\t10', standardVariables)).toBe(35)
  })

  it('should handle whitespace around parentheses', () => {
    expect(evaluateFormula('( SQ + 5 ) * 2', standardVariables)).toBe(60)
    expect(evaluateFormula('(  SQ  +  5  )  *  2', standardVariables)).toBe(60)
  })

  it('should handle only whitespace as empty formula', () => {
    expect(evaluateFormula('   ', standardVariables)).toBe(0)
    expect(evaluateFormula('\t\n', standardVariables)).toBe(0)
  })
})

describe('Decimal Number Precision', () => {
  it('should handle decimal multiplication accurately', () => {
    const result = evaluateFormula('SQ*1.05', standardVariables)
    expect(result).toBeCloseTo(26.25, 10)
  })

  it('should handle small decimal numbers', () => {
    const result = evaluateFormula('0.001*1000', standardVariables)
    expect(result).toBeCloseTo(1, 10)
  })

  it('should handle repeating decimal results', () => {
    const result = evaluateFormula('10/3', standardVariables)
    expect(result).toBeCloseTo(3.333333333, 5)
  })

  it('should maintain precision through multiple operations', () => {
    const result = evaluateFormula('((1.5*2.5)+0.25)/0.5', standardVariables)
    // (3.75+0.25)/0.5 = 4/0.5 = 8
    expect(result).toBe(8)
  })
})

describe('Variable Name Edge Cases', () => {
  it('should be case insensitive', () => {
    expect(evaluateFormula('sq', standardVariables)).toBe(25)
    expect(evaluateFormula('Sq', standardVariables)).toBe(25)
    expect(evaluateFormula('sQ', standardVariables)).toBe(25)
    expect(evaluateFormula('SKYLIGHT_COUNT', standardVariables)).toBe(1)
    expect(evaluateFormula('skylight_count', standardVariables)).toBe(1)
  })

  it('should handle slope variables with numbers', () => {
    expect(evaluateFormula('F1SQ', standardVariables)).toBe(12.5)
    expect(evaluateFormula('F2SF', standardVariables)).toBe(1250)
    expect(evaluateFormula('F1PITCH', standardVariables)).toBe(5)
  })

  it('should throw for undefined variables', () => {
    expect(() => evaluateFormula('UNDEFINED', standardVariables)).toThrow('Unknown variable')
    expect(() => evaluateFormula('XYZ', standardVariables)).toThrow('Unknown variable')
    expect(() => evaluateFormula('F99SQ', standardVariables)).toThrow('Unknown variable')
  })

  it('should handle all standard variables', () => {
    expect(evaluateFormula('SQ', standardVariables)).toBe(25)
    expect(evaluateFormula('SF', standardVariables)).toBe(2500)
    expect(evaluateFormula('P', standardVariables)).toBe(200)
    expect(evaluateFormula('EAVE', standardVariables)).toBe(100)
    expect(evaluateFormula('R', standardVariables)).toBe(50)
    expect(evaluateFormula('VAL', standardVariables)).toBe(20)
    expect(evaluateFormula('HIP', standardVariables)).toBe(0)
    expect(evaluateFormula('RAKE', standardVariables)).toBe(80)
    expect(evaluateFormula('SKYLIGHT_COUNT', standardVariables)).toBe(1)
    expect(evaluateFormula('CHIMNEY_COUNT', standardVariables)).toBe(1)
    expect(evaluateFormula('PIPE_COUNT', standardVariables)).toBe(4)
    expect(evaluateFormula('VENT_COUNT', standardVariables)).toBe(3)
    expect(evaluateFormula('GUTTER_LF', standardVariables)).toBe(100)
    expect(evaluateFormula('DS_COUNT', standardVariables)).toBe(4)
  })
})
