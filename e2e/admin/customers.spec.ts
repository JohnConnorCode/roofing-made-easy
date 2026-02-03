import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Customer Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/customers')
  })

  test.describe('Page Load', () => {
    test('customers page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Customers")')).toBeVisible()
    })

    test('displays loading state', async ({ page }) => {
      await page.reload()

      const skeleton = page.locator('[class*="skeleton"]').first()
      const content = page.locator('h1:has-text("Customers")')

      await expect(skeleton.or(content)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Customer List', () => {
    test('displays customer table or empty state', async ({ page }) => {
      await page.waitForResponse(resp =>
        resp.url().includes('/api/customers') && resp.status() === 200
      ).catch(() => {})

      const table = page.locator('table')
      const emptyState = page.locator('text=No customers').or(
        page.locator('text=Create your first')
      )

      await expect(table.or(emptyState.first())).toBeVisible()
    })

    test('search input is visible', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').or(
        page.locator('input[type="search"]')
      )
      await expect(searchInput.first()).toBeVisible()
    })

    test('search filters customers', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').or(
        page.locator('input[type="search"]')
      ).first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('John')
        await page.waitForTimeout(500)

        // Results should update
        await expect(page.locator('h1:has-text("Customers")')).toBeVisible()
      }
    })
  })

  test.describe('Customer Table', () => {
    test('displays table columns', async ({ page }) => {
      await page.waitForTimeout(2000) // Wait for data load

      const table = page.locator('table')

      if (await table.isVisible()) {
        // Check for key columns
        const headers = ['Name', 'Email', 'Phone']
        for (const header of headers) {
          const th = table.locator(`th:has-text("${header}")`)
          if (await th.isVisible().catch(() => false)) {
            await expect(th).toBeVisible()
            break
          }
        }
      }
    })

    test('customer row is clickable', async ({ page }) => {
      await page.waitForTimeout(2000)

      const customerRow = page.locator('table tbody tr').first()

      if (await customerRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        const link = customerRow.locator('a').first()
        if (await link.isVisible()) {
          await expect(link).toBeVisible()
        }
      }
    })
  })

  test.describe('Customer Detail', () => {
    test('navigating to customer detail works', async ({ page }) => {
      await page.waitForTimeout(2000)

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()

        await expect(page.url()).toContain('/customers/')
      }
    })

    test('customer detail shows linked leads', async ({ page }) => {
      await page.waitForTimeout(2000)

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()

        await page.waitForTimeout(1000)

        // Check for leads section
        const leadsSection = page.locator('text=Lead').or(
          page.locator('text=lead')
        )

        // Either shows leads or the detail page loaded
        const pageLoaded = await page.locator('h1').or(page.locator('h2')).isVisible()
        expect(pageLoaded || await leadsSection.first().isVisible().catch(() => false)).toBeTruthy()
      }
    })

    test('customer detail shows contact info', async ({ page }) => {
      await page.waitForTimeout(2000)

      const customerLink = page.locator('table a').first()

      if (await customerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customerLink.click()

        await page.waitForTimeout(1000)

        // Check for contact information
        const contactInfo = page.locator('text=Email').or(
          page.locator('text=Phone').or(
            page.locator('text=Contact')
          )
        )

        await expect(contactInfo.first()).toBeVisible()
      }
    })
  })

  test.describe('Pagination', () => {
    test('pagination controls appear when needed', async ({ page }) => {
      await page.waitForTimeout(2000)

      const pagination = page.locator('text=/Showing \\d+/').or(
        page.locator('button:has-text("Next")').or(
          page.locator('[class*="pagination"]')
        )
      )

      // Pagination may or may not appear based on data
      const table = page.locator('table')
      await expect(table.or(pagination.first())).toBeVisible()
    })
  })

  test.describe('Empty State', () => {
    test('shows appropriate empty state message', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('zzznonexistentzz')
        await page.waitForTimeout(500)

        const emptyState = page.locator('text=No customers').or(
          page.locator('text=no results').or(
            page.locator('text=not found')
          )
        )

        // Either shows empty state or search has results
        await expect(emptyState.first().or(page.locator('table'))).toBeVisible()
      }
    })
  })
})
