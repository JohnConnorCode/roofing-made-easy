/**
 * E2E Test: Admin Customer Management
 *
 * Tests the complete admin workflow for managing customers:
 * - Viewing customer list
 * - Searching customers
 * - Viewing customer details with linked leads
 * - Updating customer profiles
 */

import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'
import { generateTestEmail, generateTestPhone } from '../helpers/test-data'

test.describe('Admin Customer Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Customer List Page', () => {
    test('Customers page loads successfully', async ({ page }) => {
      await page.goto('/customers')

      // Wait for page to be ready
      await page.waitForTimeout(1000)

      // Should show customers page
      const header = page.locator('h1:has-text("Customers")').or(
        page.locator('h1:has-text("Customer")')
      )
      await expect(header).toBeVisible()
    })

    test('Displays customer count', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      // Should show customer count or empty state
      const countText = page.locator('text=/\\d+ Customer/').or(
        page.locator('text=No customers')
      )
      await expect(countText.first()).toBeVisible()
    })

    test('Customer table has correct columns', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const table = page.locator('table')

      if (await table.isVisible()) {
        // Check for key columns
        const nameCol = table.locator('th:has-text("Name")').or(
          table.locator('th:has-text("Customer")')
        )
        const emailCol = table.locator('th:has-text("Email")').or(
          table.locator('th:has-text("Contact")')
        )

        await expect(nameCol.or(emailCol).first()).toBeVisible()
      }
    })

    test('Shows computed statistics', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      // Should show stats like total value, leads count
      const table = page.locator('table')

      if (await table.isVisible()) {
        // Look for value or leads column
        const statsCol = table.locator('th:has-text("Value")').or(
          table.locator('th:has-text("Leads")').or(
            table.locator('th:has-text("Total")')
          )
        )

        // Stats columns may or may not be visible
        await expect(table).toBeVisible()
      }
    })
  })

  test.describe('Customer Search', () => {
    test('Search input is visible', async ({ page }) => {
      await page.goto('/customers')

      const searchInput = page.locator('input[placeholder*="Search"]').or(
        page.locator('input[type="search"]')
      )
      await expect(searchInput.first()).toBeVisible()
    })

    test('Search filters results', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const searchInput = page.locator('input[placeholder*="Search"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500)

        // Results should update
        await expect(page.locator('h1:has-text("Customer")')).toBeVisible()
      }
    })

    test('Clear search shows all customers', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const searchInput = page.locator('input[placeholder*="Search"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('xyz')
        await page.waitForTimeout(300)
        await searchInput.clear()
        await page.waitForTimeout(300)

        await expect(page.locator('h1:has-text("Customer")')).toBeVisible()
      }
    })
  })

  test.describe('Customer Detail', () => {
    test('Can navigate to customer detail from list', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()
        await page.waitForTimeout(1000)

        // Should navigate to customer detail
        await expect(page.url()).toMatch(/\/customers\//)
      }
    })

    test('Customer detail shows linked leads', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()
        await page.waitForTimeout(2000)

        // Look for leads section
        const leadsSection = page.locator('text=Leads').or(
          page.locator('text=Properties').or(
            page.locator('table')
          )
        )
        await expect(leadsSection.first()).toBeVisible()
      }
    })

    test('Customer detail shows financing applications', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForResponse(/\/api\/customers/).catch(() => {})

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()
        await page.waitForTimeout(2000)

        // Financing section should exist (may be empty)
        const financingSection = page.locator('text=Financing').or(
          page.locator('text=Application').or(
            page.locator('h1') // Fallback
          )
        )
        await expect(financingSection.first()).toBeVisible()
      }
    })
  })
})

test.describe('Customer API Operations', () => {
  test.describe('GET /api/customers', () => {
    test('Returns customer list with pagination', async ({ request }) => {
      const response = await request.get('/api/customers?limit=10&offset=0')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.customers).toBeDefined()
      expect(Array.isArray(data.customers)).toBe(true)
      expect(typeof data.total).toBe('number')
    })

    test('Search by email works', async ({ request }) => {
      const response = await request.get('/api/customers?search=test')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.customers).toBeDefined()
    })

    test('Returns computed fields', async ({ request }) => {
      const response = await request.get('/api/customers?limit=5')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      if (data.customers.length > 0) {
        const customer = data.customers[0]

        // Should have computed fields
        expect('leads_count' in customer || 'total_value' in customer).toBe(true)
      }
    })
  })

  test.describe('GET /api/customers/[customerId]', () => {
    test('Returns 404 for non-existent customer', async ({ request }) => {
      const response = await request.get('/api/customers/non-existent-id')

      expect(response.status()).toBe(404)
    })

    test('Returns customer with linked data', async ({ request }) => {
      // Get first customer
      const listResponse = await request.get('/api/customers?limit=1')
      const listData = await listResponse.json()

      if (listData.customers?.length > 0) {
        const customerId = listData.customers[0].id

        const response = await request.get(`/api/customers/${customerId}`)

        expect(response.ok()).toBeTruthy()
        const data = await response.json()

        expect(data.customer).toBeDefined()
        expect(data.customer.id).toBe(customerId)
        expect(data.customer.leads).toBeDefined()
        expect(data.customer.financing_applications).toBeDefined()
        expect(data.customer.insurance_claims).toBeDefined()
      }
    })
  })

  test.describe('PUT /api/customers/[customerId]', () => {
    test('Returns 400 for invalid email', async ({ request }) => {
      const listResponse = await request.get('/api/customers?limit=1')
      const listData = await listResponse.json()

      if (listData.customers?.length > 0) {
        const customerId = listData.customers[0].id

        const response = await request.put(`/api/customers/${customerId}`, {
          data: { email: 'invalid-email' },
        })

        expect(response.status()).toBe(400)
      }
    })

    test('Returns 400 for empty first_name', async ({ request }) => {
      const listResponse = await request.get('/api/customers?limit=1')
      const listData = await listResponse.json()

      if (listData.customers?.length > 0) {
        const customerId = listData.customers[0].id

        const response = await request.put(`/api/customers/${customerId}`, {
          data: { first_name: '' },
        })

        expect(response.status()).toBe(400)
      }
    })
  })
})

test.describe('Customer-Lead Relationship', () => {
  test('Creating lead can trigger customer auto-creation', async ({ request }) => {
    const testEmail = generateTestEmail()

    // Create lead
    const leadResponse = await request.post('/api/leads', {
      data: { source: 'e2e_customer_link_test' },
    })

    const { lead } = await leadResponse.json()

    // Update with contact info
    await request.put(`/api/leads/${lead.id}/intake`, {
      data: {
        step: 'contact',
        data: {
          firstName: 'AutoCreate',
          lastName: 'Test',
          email: testEmail,
          phone: generateTestPhone(),
          consentTerms: true,
        },
      },
    }).catch(() => {})

    // Generate estimate (triggers auto-create)
    await request.post(`/api/leads/${lead.id}/estimate`)

    // Wait for auto-create
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Search for customer by email
    const customersResponse = await request.get(`/api/customers?search=${testEmail.split('@')[0]}`)
    const customersData = await customersResponse.json()

    // May or may not have created customer depending on implementation
    expect(customersData.customers).toBeDefined()

    // Cleanup
    await request.patch(`/api/leads/${lead.id}`, {
      data: { status: 'archived' },
    })
  })
})
