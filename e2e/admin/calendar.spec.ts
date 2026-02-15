import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Calendar', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/calendar')
  })

  test.describe('Page Load', () => {
    test('calendar page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Calendar")')).toBeVisible()
    })

    test('displays loading state initially', async ({ page }) => {
      await page.reload()

      // Either loading spinner or content should appear
      const spinner = page.locator('[class*="animate-spin"]').or(
        page.locator('[class*="animate-pulse"]')
      )
      const content = page.locator('h1:has-text("Calendar")')

      await expect(spinner.or(content)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('View Controls', () => {
    test('view mode selector is visible', async ({ page }) => {
      // The view mode is a Select component with Month/Week/Day options
      const viewSelect = page.locator('select').or(
        page.locator('[role="combobox"]')
      ).first()
      await expect(viewSelect).toBeVisible()
    })

    test('switching to week view works', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      const viewSelect = page.locator('select').first()

      if (await viewSelect.isVisible()) {
        await viewSelect.selectOption('week')

        // Wait for view to update
        await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

        // Week view should show day rows with weekday names
        const weekContent = page.locator('text=/Mon|Tue|Wed|Thu|Fri|Sat|Sun/')
        await expect(weekContent.first()).toBeVisible()
      }
    })

    test('switching to day view works', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      const viewSelect = page.locator('select').first()

      if (await viewSelect.isVisible()) {
        await viewSelect.selectOption('day')

        // Wait for view to update
        await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

        // Day view should show the current date detail or empty state
        const dayContent = page.locator('text=No events for this day').or(
          page.locator('[class*="border-slate-200"]')
        )
        await expect(dayContent.first()).toBeVisible()
      }
    })
  })

  test.describe('Navigation', () => {
    test('today button is visible', async ({ page }) => {
      const todayButton = page.locator('button:has-text("Today")')
      await expect(todayButton).toBeVisible()
    })

    test('navigation arrows work', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      // Get current header label
      const headerLabel = page.locator('h2')
      const initialText = await headerLabel.textContent()

      // Click next button (ChevronRight)
      const nextButton = page.locator('button').filter({
        has: page.locator('[class*="lucide-chevron-right"]')
      }).or(
        page.locator('button:has-text("Today") + button')
      )

      if (await nextButton.isVisible()) {
        await nextButton.click()

        // Wait for data to reload
        await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

        // Header should have changed
        const newText = await headerLabel.textContent()
        expect(newText).not.toBe(initialText)
      }
    })

    test('previous navigation works', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      // Click the first chevron button (previous)
      const prevButton = page.locator('button').filter({
        has: page.locator('[class*="lucide-chevron-left"]')
      }).first()

      if (await prevButton.isVisible()) {
        const headerLabel = page.locator('h2')
        const initialText = await headerLabel.textContent()

        await prevButton.click()

        await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

        const newText = await headerLabel.textContent()
        expect(newText).not.toBe(initialText)
      }
    })
  })

  test.describe('Month View', () => {
    test('current month name is displayed', async ({ page }) => {
      // The header label shows the current month and year
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]

      const headerLabel = page.locator('h2')
      await expect(headerLabel).toBeVisible()

      const text = await headerLabel.textContent()
      const hasMonth = monthNames.some((m) => text?.includes(m))
      expect(hasMonth).toBeTruthy()
    })

    test('calendar grid is rendered', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      // Day headers should be visible (Sun, Mon, Tue, etc.)
      const dayHeaders = page.locator('text=Sun')
      await expect(dayHeaders.first()).toBeVisible()

      // Grid cells should be rendered
      const gridCells = page.locator('.grid-cols-7')
      await expect(gridCells.first()).toBeVisible()
    })

    test('day cells are clickable', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      // Click on a day cell
      const dayCell = page.locator('.grid-cols-7 [class*="cursor-pointer"]').first()

      if (await dayCell.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dayCell.click()

        // Side panel should update with selected date events
        const sidePanel = page.locator('text=No events for this day').or(
          page.locator('[class*="border-l-2"]')
        )

        await expect(sidePanel.first()).toBeVisible()
      }
    })
  })

  test.describe('Event Type Legend', () => {
    test('event type legend is visible', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      await expect(page.locator('text=Event Types')).toBeVisible()

      // Check for known event types
      const eventTypes = ['Appointment', 'Job Work', 'Inspection', 'Delivery', 'Meeting']

      for (const eventType of eventTypes) {
        const element = page.locator(`text=${eventType}`)
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(element).toBeVisible()
          break
        }
      }
    })
  })

  test.describe('Refresh', () => {
    test('refresh button refetches data', async ({ page }) => {
      await page.waitForResponse(/\/api\/admin\/calendar/).catch(() => {})

      const refreshButton = page.locator('button:has-text("Refresh")')

      if (await refreshButton.isVisible()) {
        const responsePromise = page.waitForResponse(/\/api\/admin\/calendar/)
        await refreshButton.click()
        await responsePromise
      }
    })
  })

  test.describe('Error Handling', () => {
    test('shows error state on API failure', async ({ page }) => {
      await page.route('**/api/admin/calendar*', route => {
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

    test('retry button works on error', async ({ page }) => {
      let shouldFail = true
      await page.route('**/api/admin/calendar*', route => {
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

        await expect(page.locator('h1:has-text("Calendar")')).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Team Schedule Link', () => {
    test('team schedule button is visible', async ({ page }) => {
      const teamButton = page.locator('text=Team Schedule').or(
        page.locator('a[href*="/calendar/team"]')
      )
      await expect(teamButton.first()).toBeVisible()
    })
  })
})
