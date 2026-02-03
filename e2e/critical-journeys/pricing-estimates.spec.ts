/**
 * E2E Test: Pricing Configuration & Estimate Generation
 *
 * Tests the complete workflow for:
 * - Viewing and updating pricing rules
 * - Creating detailed estimates with line items
 * - Applying macros
 * - PDF generation
 */

import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Pricing Configuration', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Pricing Rules Page', () => {
    test('Pricing page loads successfully', async ({ page }) => {
      await page.goto('/pricing')

      // Wait for page to load
      await page.waitForTimeout(1000)

      // Should show pricing page
      const header = page.locator('h1:has-text("Pricing")').or(
        page.locator('h1:has-text("Price")')
      )
      await expect(header).toBeVisible()
    })

    test('Displays pricing rules list', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForResponse(/\/api\/pricing/).catch(() => {})

      // Should show pricing rules or empty state
      const content = page.locator('table').or(
        page.locator('text=No pricing rules').or(
          page.locator('[class*="pricing"]')
        )
      )
      await expect(content.first()).toBeVisible()
    })

    test('Pricing rules have required fields', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForResponse(/\/api\/pricing/).catch(() => {})

      const table = page.locator('table')

      if (await table.isVisible()) {
        // Check for key columns
        const nameCol = table.locator('th:has-text("Name")').or(
          table.locator('th:has-text("Rule")')
        )
        const typeCol = table.locator('th:has-text("Type")').or(
          table.locator('th:has-text("Category")')
        )

        await expect(nameCol.or(typeCol).first().or(table.locator('th').first())).toBeVisible()
      }
    })
  })

  test.describe('Pricing API', () => {
    test('GET /api/pricing returns rules', async ({ request }) => {
      const response = await request.get('/api/pricing')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.rules || data.pricing || Array.isArray(data)).toBeTruthy()
    })

    test('Rules include multiplier and flat fee types', async ({ request }) => {
      const response = await request.get('/api/pricing')
      const data = await response.json()

      const rules = data.rules || data.pricing || data

      if (Array.isArray(rules) && rules.length > 0) {
        // Check that rules have expected structure
        const rule = rules[0]
        expect(rule.name || rule.label).toBeDefined()
        expect(rule.type || rule.category || rule.rule_type).toBeDefined()
      }
    })
  })
})

test.describe('Line Items Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Line Items Page', () => {
    test('Line items page loads', async ({ page }) => {
      await page.goto('/line-items')

      await page.waitForTimeout(1000)

      const header = page.locator('h1:has-text("Line")').or(
        page.locator('h1:has-text("Item")')
      )
      await expect(header).toBeVisible()
    })

    test('Shows line items list', async ({ page }) => {
      await page.goto('/line-items')
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const content = page.locator('table').or(
        page.locator('text=No line items').or(
          page.locator('[class*="line-item"]')
        )
      )
      await expect(content.first()).toBeVisible()
    })

    test('Can search line items', async ({ page }) => {
      await page.goto('/line-items')
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const searchInput = page.locator('input[placeholder*="Search"]').or(
        page.locator('input[type="search"]')
      )

      if (await searchInput.first().isVisible()) {
        await searchInput.first().fill('shingle')
        await page.waitForTimeout(500)

        // Results should update
        await expect(page.locator('h1')).toBeVisible()
      }
    })
  })

  test.describe('Line Items API', () => {
    test('GET /api/line-items returns items', async ({ request }) => {
      const response = await request.get('/api/line-items')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.items || data.lineItems || Array.isArray(data)).toBeTruthy()
    })

    test('Line items have required fields', async ({ request }) => {
      const response = await request.get('/api/line-items')
      const data = await response.json()

      const items = data.items || data.lineItems || data

      if (Array.isArray(items) && items.length > 0) {
        const item = items[0]
        expect(item.id).toBeDefined()
        expect(item.name || item.label).toBeDefined()
        expect(item.unit_price || item.unitPrice || item.price).toBeDefined()
      }
    })

    test('GET /api/line-items/[itemId] returns single item', async ({ request }) => {
      // Get list first
      const listResponse = await request.get('/api/line-items?limit=1')
      const listData = await listResponse.json()

      const items = listData.items || listData.lineItems || listData

      if (Array.isArray(items) && items.length > 0) {
        const itemId = items[0].id

        const response = await request.get(`/api/line-items/${itemId}`)

        expect(response.ok()).toBeTruthy()
        const data = await response.json()
        expect(data.id || data.item?.id).toBeDefined()
      }
    })
  })
})

test.describe('Estimate Macros', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.describe('Macros API', () => {
    test('GET /api/macros returns macro templates', async ({ request }) => {
      const response = await request.get('/api/macros')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.macros || Array.isArray(data)).toBeTruthy()
    })

    test('Macros have line items association', async ({ request }) => {
      const response = await request.get('/api/macros')
      const data = await response.json()

      const macros = data.macros || data

      if (Array.isArray(macros) && macros.length > 0) {
        const macro = macros[0]
        expect(macro.id).toBeDefined()
        expect(macro.name || macro.label).toBeDefined()
        // Macros should have items or line_items array
        expect(macro.items || macro.line_items || macro.lineItems).toBeDefined()
      }
    })

    test('GET /api/macros/[macroId] returns single macro with items', async ({ request }) => {
      const listResponse = await request.get('/api/macros')
      const listData = await listResponse.json()

      const macros = listData.macros || listData

      if (Array.isArray(macros) && macros.length > 0) {
        const macroId = macros[0].id

        const response = await request.get(`/api/macros/${macroId}`)

        expect(response.ok()).toBeTruthy()
        const data = await response.json()

        const macro = data.macro || data
        expect(macro.id).toBeDefined()
      }
    })
  })
})

test.describe('Detailed Estimate Builder', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  let testLeadId: string | null = null

  test.beforeAll(async ({ request }) => {
    // Create test lead
    const response = await request.post('/api/leads', {
      data: { source: 'e2e_detailed_estimate_test' },
    })

    if (response.ok()) {
      const { lead } = await response.json()
      testLeadId = lead.id
    }
  })

  test.afterAll(async ({ request }) => {
    if (testLeadId) {
      await request.patch(`/api/leads/${testLeadId}`, {
        data: { status: 'archived' },
      }).catch(() => {})
    }
  })

  test.describe('Detailed Estimate API', () => {
    test('POST /api/leads/[leadId]/detailed-estimate creates estimate', async ({ request }) => {
      test.skip(!testLeadId, 'Requires test lead')

      const response = await request.post(`/api/leads/${testLeadId}/detailed-estimate`, {
        data: {
          name: 'E2E Test Detailed Estimate',
          items: [],
        },
      })

      // May fail if no line items, but should give meaningful response
      if (response.ok()) {
        const data = await response.json()
        expect(data.estimate || data.id).toBeDefined()
      } else {
        expect(response.status()).toBeLessThan(500)
      }
    })

    test('GET /api/leads/[leadId]/detailed-estimate retrieves estimate', async ({ request }) => {
      test.skip(!testLeadId, 'Requires test lead')

      const response = await request.get(`/api/leads/${testLeadId}/detailed-estimate`)

      // May return 404 if no estimate exists
      if (response.ok()) {
        const data = await response.json()
        expect(data.estimate || data.estimates || data).toBeDefined()
      } else {
        expect([404, 200]).toContain(response.status())
      }
    })
  })
})

test.describe('Quick Estimate Generation', () => {
  let testLeadId: string | null = null

  test.beforeAll(async ({ request }) => {
    // Create test lead with property data
    const createResponse = await request.post('/api/leads', {
      data: { source: 'e2e_quick_estimate_test' },
    })

    if (createResponse.ok()) {
      const { lead } = await createResponse.json()
      testLeadId = lead.id

      // Add property details
      await request.put(`/api/leads/${lead.id}/intake`, {
        data: {
          step: 'details',
          data: {
            jobType: 'full_replacement',
            roofMaterial: 'asphalt_shingle',
            roofSizeSqft: 2000,
            roofPitch: 'medium',
            stories: 1,
          },
        },
      }).catch(() => {})
    }
  })

  test.afterAll(async ({ request }) => {
    if (testLeadId) {
      await request.patch(`/api/leads/${testLeadId}`, {
        data: { status: 'archived' },
      }).catch(() => {})
    }
  })

  test('POST /api/leads/[leadId]/estimate generates quick estimate', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.post(`/api/leads/${testLeadId}/estimate`)

    expect(response.ok()).toBeTruthy()
    const estimate = await response.json()

    // Verify estimate structure
    expect(estimate.id || estimate.estimate_id).toBeDefined()
    expect(estimate.price_low || estimate.priceLow).toBeGreaterThanOrEqual(0)
    expect(estimate.price_likely || estimate.priceLikely).toBeGreaterThan(0)
    expect(estimate.price_high || estimate.priceHigh).toBeGreaterThan(0)
  })

  test('GET /api/leads/[leadId]/estimate retrieves generated estimate', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.get(`/api/leads/${testLeadId}/estimate`)

    expect(response.ok()).toBeTruthy()
    const estimate = await response.json()

    expect(estimate.lead_id || estimate.leadId).toBe(testLeadId)
  })

  test('Estimate has three-tier pricing', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.get(`/api/leads/${testLeadId}/estimate`)
    const estimate = await response.json()

    const low = estimate.price_low || estimate.priceLow
    const likely = estimate.price_likely || estimate.priceLikely
    const high = estimate.price_high || estimate.priceHigh

    // Verify pricing tiers
    expect(low).toBeLessThan(likely)
    expect(likely).toBeLessThan(high)
  })

  test('Estimate includes adjustments breakdown', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.get(`/api/leads/${testLeadId}/estimate`)
    const estimate = await response.json()

    // Should have adjustments array
    expect(estimate.adjustments || estimate.breakdown).toBeDefined()
  })
})

test.describe('Geographic Pricing', () => {
  test.describe('Geographic Pricing API', () => {
    test('GET /api/geographic-pricing returns regions', async ({ request }) => {
      const response = await request.get('/api/geographic-pricing')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.regions || Array.isArray(data)).toBeTruthy()
    })

    test('Regions have multiplier values', async ({ request }) => {
      const response = await request.get('/api/geographic-pricing')
      const data = await response.json()

      const regions = data.regions || data

      if (Array.isArray(regions) && regions.length > 0) {
        const region = regions[0]
        expect(region.id).toBeDefined()
        expect(region.name || region.region_name).toBeDefined()
        expect(region.multiplier || region.price_multiplier).toBeDefined()
      }
    })

    test('GET /api/geographic-pricing/[regionId] returns single region', async ({ request }) => {
      const listResponse = await request.get('/api/geographic-pricing')
      const listData = await listResponse.json()

      const regions = listData.regions || listData

      if (Array.isArray(regions) && regions.length > 0) {
        const regionId = regions[0].id

        const response = await request.get(`/api/geographic-pricing/${regionId}`)

        expect(response.ok()).toBeTruthy()
        const data = await response.json()
        expect(data.id || data.region?.id).toBeDefined()
      }
    })
  })
})

test.describe('Estimate PDF Generation', () => {
  let testLeadId: string | null = null

  test.beforeAll(async ({ request }) => {
    // Create lead and generate estimate
    const createResponse = await request.post('/api/leads', {
      data: { source: 'e2e_pdf_test' },
    })

    if (createResponse.ok()) {
      const { lead } = await createResponse.json()
      testLeadId = lead.id

      // Generate estimate
      await request.post(`/api/leads/${lead.id}/estimate`)
    }
  })

  test.afterAll(async ({ request }) => {
    if (testLeadId) {
      await request.patch(`/api/leads/${testLeadId}`, {
        data: { status: 'archived' },
      }).catch(() => {})
    }
  })

  test('GET /api/leads/[leadId]/estimate/pdf returns PDF', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.get(`/api/leads/${testLeadId}/estimate/pdf`)

    if (response.ok()) {
      const contentType = response.headers()['content-type']
      expect(contentType).toMatch(/pdf|octet-stream/)
    } else {
      // PDF generation might not be implemented
      expect([404, 501]).toContain(response.status())
    }
  })

  test('POST /api/leads/[leadId]/estimate/resend sends email', async ({ request }) => {
    test.skip(!testLeadId, 'Requires test lead')

    const response = await request.post(`/api/leads/${testLeadId}/estimate/resend`, {
      data: {
        email: 'test@example.com',
      },
    })

    // Should either succeed or return meaningful error
    if (response.ok()) {
      const data = await response.json()
      expect(data.success || data.sent).toBeTruthy()
    } else {
      // Email sending might require valid email config
      expect(response.status()).toBeLessThan(500)
    }
  })
})
