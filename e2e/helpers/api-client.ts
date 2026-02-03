/**
 * API client for E2E tests - creates and cleans up test data
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

interface TestDataTracker {
  lineItems: string[]
  macros: string[]
  leads: string[]
}

// Track created test data for cleanup
const createdData: TestDataTracker = {
  lineItems: [],
  macros: [],
  leads: [],
}

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  // For E2E tests, we use the admin session cookie
  // The tests should be run with an authenticated session
  return {
    'Content-Type': 'application/json',
  }
}

/**
 * Create a test line item
 */
export async function createTestLineItem(data: {
  item_code: string
  name: string
  category: string
  unit_type: string
  material_cost: number
  labor_cost: number
}): Promise<{ id: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/line-items`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.item?.id) {
        createdData.lineItems.push(result.item.id)
        return { id: result.item.id }
      }
    }
  } catch (e) {
    console.error('Failed to create test line item:', e)
  }
  return null
}

/**
 * Create a test macro/template
 */
export async function createTestMacro(data: {
  name: string
  roof_type: string
  job_type: string
  line_item_ids?: string[]
}): Promise<{ id: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/macros`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.macro?.id) {
        createdData.macros.push(result.macro.id)
        return { id: result.macro.id }
      }
    }
  } catch (e) {
    console.error('Failed to create test macro:', e)
  }
  return null
}

/**
 * Delete a line item by ID
 */
export async function deleteLineItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/line-items/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    })
    return response.ok
  } catch (e) {
    console.error('Failed to delete line item:', e)
    return false
  }
}

/**
 * Delete a macro by ID
 */
export async function deleteMacro(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/macros/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    })
    return response.ok
  } catch (e) {
    console.error('Failed to delete macro:', e)
    return false
  }
}

/**
 * Clean up all test data created during this test run
 */
export async function cleanupAllTestData(): Promise<void> {
  // Clean up line items
  for (const id of createdData.lineItems) {
    await deleteLineItem(id)
  }
  createdData.lineItems = []

  // Clean up macros
  for (const id of createdData.macros) {
    await deleteMacro(id)
  }
  createdData.macros = []

  // Clean up leads
  for (const id of createdData.leads) {
    try {
      await fetch(`${BASE_URL}/api/leads/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      })
    } catch (e) {
      console.error('Failed to delete lead:', e)
    }
  }
  createdData.leads = []
}

/**
 * Get the IDs of created test data (for manual cleanup if needed)
 */
export function getCreatedTestData(): TestDataTracker {
  return { ...createdData }
}

/**
 * Generate a unique test identifier
 */
export function uniqueTestId(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}
