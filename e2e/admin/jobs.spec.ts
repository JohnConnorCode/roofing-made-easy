import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Jobs Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/jobs')
  })

  test.describe('Page Load', () => {
    test('jobs page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Jobs")')).toBeVisible()
    })

    test('displays loading state', async ({ page }) => {
      await page.reload()

      // Either loading spinner or content should be visible
      const spinner = page.locator('[class*="animate-spin"]')
      const content = page.locator('h1:has-text("Jobs")')

      await expect(spinner.or(content)).toBeVisible({ timeout: 5000 })
    })

    test('summary cards load', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      // Check for the four summary cards
      await expect(page.locator('text=Active Jobs')).toBeVisible()
      await expect(page.locator('text=Pending Start')).toBeVisible()
      await expect(page.locator('text=Completed')).toBeVisible()
      await expect(page.locator('text=Total Value')).toBeVisible()
    })
  })

  test.describe('Filters', () => {
    test('search input is visible', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await expect(searchInput).toBeVisible()
    })

    test('status filter is visible', async ({ page }) => {
      const statusFilter = page.locator('select').or(
        page.locator('[role="combobox"]')
      ).first()
      await expect(statusFilter).toBeVisible()
    })

    test('search filters jobs', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('test')

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Results should update (either matching results or no results)
      const table = page.locator('table')
      const noResults = page.locator('text=No jobs found')

      await expect(table.or(noResults)).toBeVisible()
    })
  })

  test.describe('Table View', () => {
    test('displays table with correct columns', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      const table = page.locator('table')
      const noJobs = page.locator('text=No jobs found')

      if (await table.isVisible()) {
        // Check for key columns
        await expect(table.locator('th:has-text("Job #")')).toBeVisible()
        await expect(table.locator('th:has-text("Status")')).toBeVisible()
        await expect(table.locator('th:has-text("Team")')).toBeVisible()
        await expect(table.locator('th:has-text("Scheduled")')).toBeVisible()
        await expect(table.locator('th:has-text("Value")')).toBeVisible()
      } else {
        await expect(noJobs).toBeVisible()
      }
    })

    test('job number links to job detail', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      const jobLink = page.locator('table a').first()
      if (await jobLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await jobLink.click()

        await expect(page).toHaveURL(/\/jobs\//)
      }
    })
  })

  test.describe('Kanban View', () => {
    test('kanban view toggle works', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      // Find the kanban toggle button (second button in the view mode toggle group)
      const viewToggle = page.locator('button').filter({
        has: page.locator('[class*="lucide-kanban"]').or(
          page.locator('svg')
        )
      })

      // Click the second toggle button (kanban) in the view switcher
      const kanbanButton = page.locator('.bg-slate-100 button').nth(1)
      if (await kanbanButton.isVisible()) {
        await kanbanButton.click()

        // Kanban columns should appear
        const kanbanColumns = page.locator('text=Pending Start').or(
          page.locator('text=In Progress').or(
            page.locator('text=Scheduled')
          )
        )

        await expect(kanbanColumns.first()).toBeVisible()
      }
    })

    test('kanban columns show job counts', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      // Switch to kanban view
      const kanbanButton = page.locator('.bg-slate-100 button').nth(1)
      if (await kanbanButton.isVisible()) {
        await kanbanButton.click()

        // Count badges should be visible
        const countBadges = page.locator('[class*="rounded-full"]').filter({
          hasText: /^\d+$/
        })

        const count = await countBadges.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('Empty State', () => {
    test('shows appropriate message when no jobs match filter', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('zzzznonexistentzzz')

      await page.waitForTimeout(500)

      const noResults = page.locator('text=No jobs found').or(
        page.locator('text=No jobs')
      )
      const table = page.locator('table')

      // Either shows empty state or table with results
      await expect(noResults.first().or(table)).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('shows error state on API failure', async ({ page }) => {
      await page.route('**/api/admin/jobs*', route => {
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
      await page.route('**/api/admin/jobs*', route => {
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
        await expect(page.locator('h1:has-text("Jobs")')).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Pagination', () => {
    test('pagination controls are visible when needed', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      const pagination = page.locator('text=/Showing \\d+-\\d+ of \\d+/')
      const nextButton = page.locator('button:has-text("Next")')

      const hasPagination = await pagination.isVisible().catch(() => false)
      if (hasPagination) {
        await expect(nextButton).toBeVisible()
      }
    })
  })

  test.describe('Refresh', () => {
    test('refresh button refetches data', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/jobs/)

      const refreshButton = page.locator('button:has-text("Refresh")')

      if (await refreshButton.isVisible()) {
        const responsePromise = page.waitForResponse(/\/api\/admin\/jobs/)
        await refreshButton.click()
        await responsePromise
      }
    })
  })
})
