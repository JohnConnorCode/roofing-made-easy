/**
 * Advanced Roofing Estimation System
 *
 * Xactimate-competitive roofing estimation with:
 * - Variables (SQ, SF, P, EAVE, R, VAL, HIP, RAKE)
 * - Formula parser for quantity calculations
 * - Line item-based detailed estimates
 * - Macros (pre-built line item bundles)
 * - Geographic pricing adjustments
 */

// Variables Calculator
export {
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
} from './variables'

// Formula Parser
export {
  evaluateFormula,
  validateFormula,
  calculateQuantityWithWaste,
  formatFormula,
  getKnownVariables,
  getSuggestedFormula,
  COMMON_FORMULAS,
} from './formula-parser'

// Detailed Pricing Engine
export {
  DetailedPricingEngine,
  formatCurrency,
  formatQuantity,
  groupLineItems,
  calculateCostPerSquare,
  generateEstimateSummary,
  calculationToEstimate,
  calculatedToEstimateLineItem,
  createDefaultEngine,
  type EstimateInput,
  type LineItemInput,
  type CalculatedLineItem,
  type EstimateCalculation,
} from './detailed-engine'
