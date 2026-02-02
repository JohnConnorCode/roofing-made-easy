/**
 * Formula Parser for Quantity Calculations
 *
 * Safely evaluates mathematical expressions with variable substitution.
 * Examples: "SQ*1.10", "EAVE+RAKE", "F1SQ+F2SQ+F3SQ", "(SQ-5)*0.9"
 */

import type { RoofVariables, SlopeVariables } from '@/lib/supabase/types'

// Token types for lexer
type TokenType =
  | 'NUMBER'
  | 'VARIABLE'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF'

interface Token {
  type: TokenType
  value: string | number
}

// AST node types
type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'Variable'; name: string }
  | { type: 'BinaryOp'; op: string; left: ASTNode; right: ASTNode }
  | { type: 'UnaryOp'; op: string; operand: ASTNode }

/**
 * Tokenizer - converts formula string into tokens
 */
function tokenize(formula: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  const input = formula.trim()

  while (pos < input.length) {
    const char = input[pos]

    // Skip whitespace
    if (/\s/.test(char)) {
      pos++
      continue
    }

    // Numbers (including decimals)
    if (/[\d.]/.test(char)) {
      let numStr = ''
      while (pos < input.length && /[\d.]/.test(input[pos])) {
        numStr += input[pos]
        pos++
      }
      const value = parseFloat(numStr)
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${numStr}`)
      }
      tokens.push({ type: 'NUMBER', value })
      continue
    }

    // Variables (letters, numbers, underscores)
    if (/[a-zA-Z_]/.test(char)) {
      let varName = ''
      while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
        varName += input[pos]
        pos++
      }
      tokens.push({ type: 'VARIABLE', value: varName.toUpperCase() })
      continue
    }

    // Operators
    if (['+', '-', '*', '/'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char })
      pos++
      continue
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' })
      pos++
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' })
      pos++
      continue
    }

    throw new Error(`Unexpected character: ${char} at position ${pos}`)
  }

  tokens.push({ type: 'EOF', value: '' })
  return tokens
}

/**
 * Parser - converts tokens into AST using recursive descent
 * Grammar:
 *   expression = term (('+' | '-') term)*
 *   term = factor (('*' | '/') factor)*
 *   factor = NUMBER | VARIABLE | '(' expression ')' | '-' factor
 */
class Parser {
  private tokens: Token[]
  private pos: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private current(): Token {
    return this.tokens[this.pos]
  }

  private advance(): Token {
    const token = this.current()
    if (token.type !== 'EOF') {
      this.pos++
    }
    return token
  }

  private expect(type: TokenType): Token {
    const token = this.current()
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`)
    }
    return this.advance()
  }

  parse(): ASTNode {
    const result = this.expression()
    if (this.current().type !== 'EOF') {
      throw new Error(`Unexpected token: ${this.current().value}`)
    }
    return result
  }

  private expression(): ASTNode {
    let left = this.term()

    while (
      this.current().type === 'OPERATOR' &&
      ['+', '-'].includes(this.current().value as string)
    ) {
      const op = this.advance().value as string
      const right = this.term()
      left = { type: 'BinaryOp', op, left, right }
    }

    return left
  }

  private term(): ASTNode {
    let left = this.factor()

    while (
      this.current().type === 'OPERATOR' &&
      ['*', '/'].includes(this.current().value as string)
    ) {
      const op = this.advance().value as string
      const right = this.factor()
      left = { type: 'BinaryOp', op, left, right }
    }

    return left
  }

  private factor(): ASTNode {
    const token = this.current()

    // Unary minus
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.advance()
      const operand = this.factor()
      return { type: 'UnaryOp', op: '-', operand }
    }

    // Number
    if (token.type === 'NUMBER') {
      this.advance()
      return { type: 'Number', value: token.value as number }
    }

    // Variable
    if (token.type === 'VARIABLE') {
      this.advance()
      return { type: 'Variable', name: token.value as string }
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      this.advance()
      const expr = this.expression()
      this.expect('RPAREN')
      return expr
    }

    throw new Error(`Unexpected token: ${token.type} (${token.value})`)
  }
}

/**
 * Evaluator - evaluates AST with variable bindings
 */
function evaluate(node: ASTNode, variables: Map<string, number>): number {
  switch (node.type) {
    case 'Number':
      return node.value

    case 'Variable': {
      const value = variables.get(node.name)
      if (value === undefined) {
        throw new Error(`Unknown variable: ${node.name}`)
      }
      return value
    }

    case 'BinaryOp': {
      const left = evaluate(node.left, variables)
      const right = evaluate(node.right, variables)

      switch (node.op) {
        case '+':
          return left + right
        case '-':
          return left - right
        case '*':
          return left * right
        case '/':
          if (right === 0) {
            throw new Error('Division by zero')
          }
          return left / right
        default:
          throw new Error(`Unknown operator: ${node.op}`)
      }
    }

    case 'UnaryOp': {
      const operand = evaluate(node.operand, variables)
      if (node.op === '-') {
        return -operand
      }
      throw new Error(`Unknown unary operator: ${node.op}`)
    }

    default:
      throw new Error('Unknown node type')
  }
}

/**
 * Build variable map from RoofVariables
 */
function buildVariableMap(roofVars: RoofVariables): Map<string, number> {
  const map = new Map<string, number>()

  // Main variables
  map.set('SQ', roofVars.SQ)
  map.set('SF', roofVars.SF)
  map.set('P', roofVars.P)
  map.set('EAVE', roofVars.EAVE)
  map.set('R', roofVars.R)
  map.set('VAL', roofVars.VAL)
  map.set('HIP', roofVars.HIP)
  map.set('RAKE', roofVars.RAKE)

  // Feature counts
  map.set('SKYLIGHT_COUNT', roofVars.SKYLIGHT_COUNT)
  map.set('CHIMNEY_COUNT', roofVars.CHIMNEY_COUNT)
  map.set('PIPE_COUNT', roofVars.PIPE_COUNT)
  map.set('VENT_COUNT', roofVars.VENT_COUNT)

  // Gutter-related
  map.set('GUTTER_LF', roofVars.GUTTER_LF)
  map.set('DS_COUNT', roofVars.DS_COUNT)

  // Per-slope variables (F1SQ, F1SF, F2SQ, etc.)
  if (roofVars.slopes) {
    for (const [key, slope] of Object.entries(roofVars.slopes)) {
      map.set(`${key}SQ`, slope.SQ)
      map.set(`${key}SF`, slope.SF)
      map.set(`${key}PITCH`, slope.PITCH)
      map.set(`${key}EAVE`, slope.EAVE)
      map.set(`${key}RIDGE`, slope.RIDGE)
      map.set(`${key}VALLEY`, slope.VALLEY)
      map.set(`${key}HIP`, slope.HIP)
      map.set(`${key}RAKE`, slope.RAKE)
    }
  }

  return map
}

/**
 * Parse and evaluate a formula with roof variables
 */
export function evaluateFormula(
  formula: string,
  variables: RoofVariables
): number {
  if (!formula || formula.trim() === '') {
    return 0
  }

  try {
    const tokens = tokenize(formula)
    const parser = new Parser(tokens)
    const ast = parser.parse()
    const varMap = buildVariableMap(variables)
    return evaluate(ast, varMap)
  } catch (error) {
    console.error(`Formula evaluation error: ${error}`)
    throw error
  }
}

/**
 * Validate a formula without evaluating
 * Returns list of required variables
 */
export function validateFormula(formula: string): {
  valid: boolean
  error?: string
  requiredVariables: string[]
} {
  if (!formula || formula.trim() === '') {
    return { valid: true, requiredVariables: [] }
  }

  try {
    const tokens = tokenize(formula)
    const parser = new Parser(tokens)
    parser.parse()

    // Extract variable names
    const variables = tokens
      .filter((t) => t.type === 'VARIABLE')
      .map((t) => t.value as string)

    return {
      valid: true,
      requiredVariables: [...new Set(variables)],
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid formula',
      requiredVariables: [],
    }
  }
}

/**
 * Calculate quantity with waste factor
 */
export function calculateQuantityWithWaste(
  formula: string | null,
  variables: RoofVariables,
  wasteFactor: number = 1.0,
  fallbackQuantity: number = 0
): {
  quantity: number
  quantityWithWaste: number
  formulaUsed: string | null
} {
  let quantity = fallbackQuantity
  let formulaUsed: string | null = null

  if (formula) {
    try {
      quantity = evaluateFormula(formula, variables)
      formulaUsed = formula
    } catch {
      // Use fallback if formula fails
      quantity = fallbackQuantity
    }
  }

  return {
    quantity: Math.max(0, quantity),
    quantityWithWaste: Math.max(0, quantity * wasteFactor),
    formulaUsed,
  }
}

/**
 * Format a formula for display (add spaces around operators)
 */
export function formatFormula(formula: string): string {
  return formula
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' - ')
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get all known variable names
 */
export function getKnownVariables(): string[] {
  return [
    'SQ',
    'SF',
    'P',
    'EAVE',
    'R',
    'VAL',
    'HIP',
    'RAKE',
    'SKYLIGHT_COUNT',
    'CHIMNEY_COUNT',
    'PIPE_COUNT',
    'VENT_COUNT',
    'GUTTER_LF',
    'DS_COUNT',
    // Per-slope examples
    'F1SQ',
    'F1SF',
    'F1EAVE',
    'F2SQ',
    'F2SF',
    'F2EAVE',
  ]
}

/**
 * Common formula patterns
 */
export const COMMON_FORMULAS = {
  // Area-based
  squares: 'SQ',
  squaresWithWaste10: 'SQ*1.10',
  squaresWithWaste15: 'SQ*1.15',

  // Linear measurements
  eave: 'EAVE',
  eaveAndRake: 'EAVE+RAKE',
  ridge: 'R',
  ridgeAndHip: 'R+HIP',
  valley: 'VAL',
  perimeter: 'P',

  // Ice & water shield (3ft from eave)
  iceAndWater: 'EAVE*3/100',
  iceAndWaterValley: 'VAL',

  // Feature-based
  skylights: 'SKYLIGHT_COUNT',
  chimneys: 'CHIMNEY_COUNT',
  pipeBoots: 'PIPE_COUNT',
  vents: 'VENT_COUNT',

  // Gutter-related
  gutters: 'GUTTER_LF',
  downspouts: 'DS_COUNT',
  downspoutLength: 'DS_COUNT*10',
  gutterHangers: 'GUTTER_LF/2',
} as const

/**
 * Get suggested formula based on line item category
 */
export function getSuggestedFormula(category: string): string | null {
  const suggestions: Record<string, string> = {
    tear_off: 'SQ',
    underlayment: 'SQ',
    shingles: 'SQ',
    metal_roofing: 'SQ',
    tile_roofing: 'SQ',
    flat_roofing: 'SQ',
    flashing: 'EAVE+RAKE',
    ventilation: 'R',
    gutters: 'GUTTER_LF',
    skylights: 'SKYLIGHT_COUNT',
    chimneys: 'CHIMNEY_COUNT',
    disposal: 'SQ',
  }

  return suggestions[category] || null
}
