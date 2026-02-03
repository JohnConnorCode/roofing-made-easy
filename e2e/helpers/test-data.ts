/**
 * Test data creation utilities for E2E tests.
 */

/**
 * Generate a unique email for testing.
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * Generate a unique phone number for testing.
 */
export function generateTestPhone(): string {
  const random = Math.floor(Math.random() * 9000000) + 1000000
  return `555${random}`
}

/**
 * Test lead data.
 */
export const testLead = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '5551234567',
  address: '123 Test Street',
  city: 'Tupelo',
  state: 'MS',
  zipCode: '38801',
}

/**
 * Test line item data.
 */
export const testLineItem = {
  itemCode: 'TEST-001',
  name: 'Test Shingle',
  description: 'Test description',
  category: 'shingles',
  unitType: 'SQ',
  materialCost: 100,
  laborCost: 50,
  equipmentCost: 25,
}

/**
 * Test macro/template data.
 */
export const testMacro = {
  name: 'Test Template',
  description: 'Test template description',
  roofType: 'asphalt_shingle',
  jobType: 'full_replacement',
  tags: ['test', 'e2e'],
}

/**
 * Status options available in the system.
 */
export const statusOptions = [
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived',
]

/**
 * Line item categories.
 */
export const lineItemCategories = [
  'tear_off',
  'underlayment',
  'shingles',
  'metal_roofing',
  'tile_roofing',
  'flat_roofing',
  'flashing',
  'ventilation',
  'gutters',
  'skylights',
  'chimneys',
  'decking',
  'insulation',
  'labor',
  'equipment',
  'disposal',
  'permits',
  'miscellaneous',
]

/**
 * Wait for API response helper.
 */
export function waitForApiPattern(pattern: string | RegExp): RegExp {
  if (typeof pattern === 'string') {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  }
  return pattern
}
