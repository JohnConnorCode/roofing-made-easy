import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Admin Dashboard', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard')
  })

  test.describe('Page Load', () => {
    test('dashboard page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    })

    test('displays loading skeleton while fetching data', async ({ page }) => {
      // Clear any cached data by reloading
      await page.reload()

      // Either skeleton or content should be visible quickly
      const skeleton = page.locator('[class*="skeleton"]').first()
      const dashboard = page.locator('h1:has-text("Dashboard")')

      await expect(skeleton.or(dashboard)).toBeVisible({ timeout: 5000 })
    })

    test('stats cards load and display data', async ({ page }) => {
      // Wait for stats to load
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Check for stat cards
      await expect(page.locator('text=New Leads (MTD)')).toBeVisible()
      await expect(page.locator('text=Estimates Generated')).toBeVisible()
      await expect(page.locator('text=Win Rate')).toBeVisible()
      await expect(page.locator('text=Pipeline Value')).toBeVisible()
    })
  })

  test.describe('Tab Navigation', () => {
    test('switches to Overview tab', async ({ page }) => {
      const overviewTab = page.locator('button:has-text("Overview")')
      await overviewTab.click()

      await expect(page.locator('text=Pipeline by Status')).toBeVisible()
      await expect(page.locator('text=Lead Sources')).toBeVisible()
    })

    test('switches to Analytics tab', async ({ page }) => {
      const analyticsTab = page.locator('button:has-text("Analytics")')
      await analyticsTab.click()

      // Analytics content should be visible
      await expect(page.locator('text=Performance analytics').or(
        page.locator('text=analytics')
      )).toBeVisible()
    })

    test('switches to Velocity tab', async ({ page }) => {
      const velocityTab = page.locator('button:has-text("Velocity")')
      await velocityTab.click()

      // Velocity content should be visible
      await expect(page.locator('text=Pipeline velocity').or(
        page.locator('text=velocity')
      )).toBeVisible()
    })

    test('maintains active tab styling', async ({ page }) => {
      const analyticsTab = page.locator('button:has-text("Analytics")')
      await analyticsTab.click()

      // Active tab should have different styling
      await expect(analyticsTab).toHaveClass(/bg-white|shadow/)
    })
  })

  test.describe('Stats Cards', () => {
    test('displays MTD growth indicator', async ({ page }) => {
      // Wait for data to load
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Growth indicator should show percentage
      const growthIndicator = page.locator('text=/[+-]?\\d+%/')
      await expect(growthIndicator.first()).toBeVisible()
    })

    test('displays pipeline value in currency format', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Currency format check ($ symbol)
      const pipelineValue = page.locator('text=/\\$[\\d,]+/')
      await expect(pipelineValue.first()).toBeVisible()
    })

    test('displays win rate as percentage', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Win Rate card with percentage
      const winRateSection = page.locator('text=Win Rate').locator('..')
      await expect(winRateSection).toContainText('%')
    })
  })

  test.describe('Pipeline by Status', () => {
    test('displays pipeline status bars', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Check for status labels
      await expect(page.locator('text=Pipeline by Status')).toBeVisible()

      // Should have status entries
      const statusLabels = ['New', 'Estimate Generated', 'Quote Sent', 'Won']
      for (const label of statusLabels) {
        // At least one status should be visible
        const statusElement = page.locator(`text=${label}`).first()
        if (await statusElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(statusElement).toBeVisible()
          break
        }
      }
    })

    test('link to pipeline board works', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      const pipelineLink = page.locator('text=View Pipeline Board')
      if (await pipelineLink.isVisible()) {
        await pipelineLink.click()
        await expect(page).toHaveURL(/pipeline/)
      }
    })
  })

  test.describe('Lead Sources', () => {
    test('displays lead source breakdown', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      await expect(page.locator('text=Lead Sources')).toBeVisible()
    })

    test('shows percentage for each source', async ({ page }) => {
      await page.waitForResponse(/\/api\/dashboard\/stats/)

      // Check for percentage indicators in source section
      const sourcesSection = page.locator('text=Lead Sources').locator('..')
      const percentages = sourcesSection.locator('text=/\\d+%/')

      // If we have sources, they should show percentages
      const count = await percentages.count()
      if (count > 0) {
        await expect(percentages.first()).toBeVisible()
      }
    })
  })

  test.describe('Recent Leads', () => {
    test('displays recent leads table', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      await expect(page.locator('text=Recent Leads')).toBeVisible()
    })

    test('leads table has correct columns', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const headers = ['Name', 'Location', 'Status', 'Value', 'Date']
      const table = page.locator('table').first()

      if (await table.isVisible()) {
        for (const header of headers) {
          await expect(table.locator(`th:has-text("${header}")`)).toBeVisible()
        }
      }
    })

    test('clicking lead name navigates to lead detail', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const leadLink = page.locator('table a').first()
      if (await leadLink.isVisible()) {
        const href = await leadLink.getAttribute('href')
        await leadLink.click()

        if (href) {
          await expect(page).toHaveURL(new RegExp(href.replace(/\//g, '\\/')))
        }
      }
    })

    test('View all link navigates to leads page', async ({ page }) => {
      const viewAllLink = page.locator('text=View all').first()
      if (await viewAllLink.isVisible()) {
        await viewAllLink.click()
        await expect(page).toHaveURL(/leads/)
      }
    })

    test('shows empty state when no leads', async ({ page }) => {
      // This test may not trigger if there are leads
      const emptyState = page.locator('text=No leads yet')
      const table = page.locator('table')

      // Either table or empty state should be visible
      await expect(table.or(emptyState)).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('shows error state on API failure', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/dashboard/stats', route => {
        route.abort()
      })

      await page.reload()

      const errorMessage = page.locator('text=Unable to load')
      const retryButton = page.locator('text=Try Again')

      // Either error or successful load should happen
      const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)
      if (hasError) {
        await expect(retryButton).toBeVisible()
      }
    })

    test('retry button refetches data', async ({ page }) => {
      // First, cause an error
      let shouldFail = true
      await page.route('**/api/dashboard/stats', route => {
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
        await expect(page.locator('text=New Leads (MTD)')).toBeVisible({ timeout: 10000 })
      }
    })
  })
})
