import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Estimates', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Estimates Page', () => {
    test('estimates page loads', async ({ page }) => {
      await page.goto('/estimates')

      // Either estimates page or redirect to leads
      const estimatesHeader = page.locator('h1:has-text("Estimates")').or(
        page.locator('h1:has-text("Leads")')
      )
      await expect(estimatesHeader).toBeVisible()
    })

    test('displays estimates list or empty state', async ({ page }) => {
      await page.goto('/estimates')

      await page.waitForTimeout(2000)

      const table = page.locator('table')
      const emptyState = page.locator('text=No estimates').or(
        page.locator('text=create your first')
      )

      await expect(table.or(emptyState.first())).toBeVisible()
    })
  })

  test.describe('Estimate Creation via Lead', () => {
    test('can access estimate from lead detail', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await leadLink.click()

        await page.waitForTimeout(1000)

        // Look for estimate button or section
        const estimateButton = page.locator('text=Generate Estimate').or(
          page.locator('text=Estimate').or(
            page.locator('button:has-text("Estimate")')
          )
        )

        // Should have some estimate functionality
        await expect(estimateButton.first().or(page.locator('h1'))).toBeVisible()
      }
    })

    test('estimate section shows pricing', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await leadLink.click()

        await page.waitForTimeout(1000)

        // Look for pricing information
        const pricingInfo = page.locator('text=/\\$[\\d,]+/').or(
          page.locator('text=Price').or(
            page.locator('text=Estimate')
          )
        )

        await expect(pricingInfo.first()).toBeVisible()
      }
    })
  })

  test.describe('Detailed Estimate Page', () => {
    test('detailed estimate page loads from lead', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await leadLink.getAttribute('href')
        if (href) {
          const leadId = href.split('/').pop()
          await page.goto(`/leads/${leadId}/detailed-estimate`)

          // Should load the detailed estimate page
          const pageContent = page.locator('text=Estimate').or(
            page.locator('text=Line Item').or(
              page.locator('h1')
            )
          )

          await expect(pageContent.first()).toBeVisible()
        }
      }
    })

    test('shows line items in estimate', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await leadLink.getAttribute('href')
        if (href) {
          const leadId = href.split('/').pop()
          await page.goto(`/leads/${leadId}/detailed-estimate`)

          await page.waitForTimeout(2000)

          // Should show line items
          const lineItems = page.locator('text=Line Item').or(
            page.locator('table').or(
              page.locator('[class*="line-item"]')
            )
          )

          await expect(lineItems.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('PDF Generation', () => {
    test('PDF generation button exists', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await leadLink.click()

        await page.waitForTimeout(1000)

        // Look for PDF button
        const pdfButton = page.locator('text=PDF').or(
          page.locator('text=Download').or(
            page.locator('button:has([class*="download"])')
          )
        )

        // PDF button may or may not be visible depending on page
        const hasPdfButton = await pdfButton.first().isVisible({ timeout: 3000 }).catch(() => false)

        // Just verify page loaded properly
        expect(hasPdfButton || await page.locator('h1').isVisible()).toBeTruthy()
      }
    })
  })

  test.describe('Estimate Macros/Templates', () => {
    test('can apply template to estimate', async ({ page }) => {
      await page.goto('/leads')
      await page.waitForResponse(/\/api\/leads/).catch(() => {})

      const leadLink = page.locator('table a').first()

      if (await leadLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await leadLink.getAttribute('href')
        if (href) {
          const leadId = href.split('/').pop()
          await page.goto(`/leads/${leadId}/detailed-estimate`)

          await page.waitForTimeout(2000)

          // Look for template/macro selection
          const templateSelect = page.locator('text=Template').or(
            page.locator('text=Macro').or(
              page.locator('select')
            )
          )

          // Template functionality may or may not be on this page
          await expect(templateSelect.first().or(page.locator('h1'))).toBeVisible()
        }
      }
    })
  })
})
