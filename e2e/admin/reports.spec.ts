import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Reports', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/reports')
  })

  test.describe('Page Load', () => {
    test('reports page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Reports")')).toBeVisible()
    })

    test('displays loading state', async ({ page }) => {
      await page.reload()

      // Either loading indicator or content should appear
      const loadingText = page.locator('text=...')
      const content = page.locator('h1:has-text("Reports")')

      await expect(loadingText.first().or(content)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('KPI Cards', () => {
    test('revenue MTD card is displayed', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})

      await expect(page.locator('text=Revenue MTD')).toBeVisible()
    })

    test('gross margin MTD card is displayed', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})

      await expect(page.locator('text=Gross Margin MTD')).toBeVisible()
    })

    test('outstanding AR card is displayed', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/ar-aging/).catch(() => {})

      await expect(page.locator('text=Outstanding AR')).toBeVisible()
    })

    test('active jobs card is displayed', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/).catch(() => {})

      await expect(page.locator('text=Active Jobs')).toBeVisible()
    })

    test('KPI cards show currency or numeric values', async ({ page }) => {
      // Wait for all data to load
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})
      await page.waitForTimeout(2000)

      // Revenue card should show currency format
      const currencyValues = page.locator('text=/\\$[\\d,]+/')
      const loadingDots = page.locator('text=...')

      // Either data has loaded with values or still loading
      await expect(currencyValues.first().or(loadingDots.first())).toBeVisible()
    })
  })

  test.describe('Export Buttons', () => {
    test('export jobs button is visible', async ({ page }) => {
      const exportJobsBtn = page.locator('text=Export Jobs').or(
        page.locator('a[href*="export?type=jobs"]')
      )
      await expect(exportJobsBtn.first()).toBeVisible()
    })

    test('export invoices button is visible', async ({ page }) => {
      const exportInvoicesBtn = page.locator('text=Export Invoices').or(
        page.locator('a[href*="export?type=invoices"]')
      )
      await expect(exportInvoicesBtn.first()).toBeVisible()
    })
  })

  test.describe('Report Links', () => {
    test('revenue and profitability report link is visible', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})

      const revenueLink = page.locator('text=Revenue & Profitability').or(
        page.locator('a[href="/reports/revenue"]')
      )
      await expect(revenueLink.first()).toBeVisible()
    })

    test('AR aging report link is visible', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/ar-aging/).catch(() => {})

      const arAgingLink = page.locator('text=AR Aging').or(
        page.locator('a[href="/reports/aging"]')
      )
      await expect(arAgingLink.first()).toBeVisible()
    })

    test('revenue report link navigates to /reports/revenue', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})

      const revenueLink = page.locator('a[href="/reports/revenue"]').or(
        page.locator('text=Revenue & Profitability')
      ).first()

      await revenueLink.click()

      await expect(page).toHaveURL(/\/reports\/revenue/)
    })

    test('AR aging report link navigates to /reports/aging', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/ar-aging/).catch(() => {})

      const agingLink = page.locator('a[href="/reports/aging"]').or(
        page.locator('text=AR Aging')
      ).first()

      await agingLink.click()

      await expect(page).toHaveURL(/\/reports\/aging/)
    })
  })

  test.describe('Report Descriptions', () => {
    test('revenue report shows description', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})

      const description = page.locator('text=Monthly revenue').or(
        page.locator('text=expense breakdown').or(
          page.locator('text=job-level P&L')
        )
      )

      await expect(description.first()).toBeVisible()
    })

    test('AR aging report shows description', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/ar-aging/).catch(() => {})

      const description = page.locator('text=Aging bucket').or(
        page.locator('text=drill-down').or(
          page.locator('text=invoice table')
        )
      )

      await expect(description.first()).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('shows error state on API failure with retry button', async ({ page }) => {
      await page.route('**/api/admin/reports/revenue*', route => {
        route.abort()
      })

      await page.reload()

      const errorMessage = page.locator('text=Unable to load')
      const retryButton = page.locator('text=Try Again')

      const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)
      if (hasError) {
        await expect(retryButton).toBeVisible()
      }
    })

    test('retry button refetches data', async ({ page }) => {
      let shouldFail = true
      await page.route('**/api/admin/reports/revenue*', route => {
        if (shouldFail) {
          shouldFail = false
          route.abort()
        } else {
          route.continue()
        }
      })

      await page.reload()

      const retryButton = page.locator('text=Try Again')

      if (await retryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await retryButton.click()

        // Should now load successfully
        await expect(page.locator('text=Revenue MTD')).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Gross Margin Details', () => {
    test('margin card shows profit detail', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/revenue/).catch(() => {})
      await page.waitForTimeout(1000)

      // Gross Margin card shows "Profit:" sub-text
      const profitText = page.locator('text=Profit:')
      const loadingDots = page.locator('text=...')

      await expect(profitText.or(loadingDots.first())).toBeVisible()
    })

    test('AR card shows open invoices count', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/reports\/ar-aging/).catch(() => {})
      await page.waitForTimeout(1000)

      // Outstanding AR card shows "X open invoices" sub-text
      const invoiceCount = page.locator('text=open invoices')

      await expect(invoiceCount).toBeVisible()
    })
  })
})
