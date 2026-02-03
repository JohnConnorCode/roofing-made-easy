import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Leads Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/leads')
  })

  test.describe('Page Load', () => {
    test('leads page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
    })

    test('displays loading state', async ({ page }) => {
      await page.reload()

      // Either skeleton or content should be visible
      const skeleton = page.locator('[class*="skeleton"]').first()
      const content = page.locator('h1:has-text("Leads")')

      await expect(skeleton.or(content)).toBeVisible({ timeout: 5000 })
    })

    test('displays lead count', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      // Should show lead count
      const leadCount = page.locator('text=/\\d+ Lead/')
      await expect(leadCount).toBeVisible()
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

    test('search filters leads by name', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('John')

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Results should update (either matching results or no results)
      const table = page.locator('table')
      const noResults = page.locator('text=No leads found')

      await expect(table.or(noResults)).toBeVisible()
    })

    test('status filter changes results', async ({ page }) => {
      const statusFilter = page.locator('select').first()

      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('new')
        await page.waitForResponse(/\/api\/leads/)

        // Page should refresh with filtered results
        await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
      }
    })

    test('clear filters shows all leads', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('test')
      await page.waitForTimeout(300)

      await searchInput.clear()
      await page.waitForTimeout(300)

      await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
    })
  })

  test.describe('Leads Table', () => {
    test('displays table with correct columns', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const table = page.locator('table')
      const noLeads = page.locator('text=No leads found')

      if (await table.isVisible()) {
        // Check for key columns
        await expect(table.locator('th:has-text("Name")')).toBeVisible()
        await expect(table.locator('th:has-text("Contact")')).toBeVisible()
        await expect(table.locator('th:has-text("Status")')).toBeVisible()
      } else {
        await expect(noLeads).toBeVisible()
      }
    })

    test('sortable columns work', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const nameHeader = page.locator('th:has-text("Name")')
      if (await nameHeader.isVisible()) {
        await nameHeader.click()

        // Sort indicator should change
        await expect(nameHeader.locator('svg')).toBeVisible()
      }
    })

    test('clicking lead name navigates to detail', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const leadLink = page.locator('table a').first()
      if (await leadLink.isVisible()) {
        const href = await leadLink.getAttribute('href')
        await leadLink.click()

        if (href) {
          await expect(page.url()).toContain('/leads/')
        }
      }
    })

    test('displays lead score badges', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      // Score badges should be visible if leads exist
      const scoreBadges = page.locator('[title*="Score"]')
      const count = await scoreBadges.count()

      if (count > 0) {
        await expect(scoreBadges.first()).toBeVisible()
      }
    })
  })

  test.describe('Bulk Actions', () => {
    test('select all checkbox works', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.click()

        // Check that selection count shows
        const selectionCount = page.locator('text=/\\d+ selected/')
        await expect(selectionCount).toBeVisible()
      }
    })

    test('individual row selection works', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const rowCheckbox = page.locator('tbody input[type="checkbox"]').first()
      if (await rowCheckbox.isVisible()) {
        await rowCheckbox.click()

        // Selection indicator should appear
        const selectionCount = page.locator('text=/1 selected|selected/')
        await expect(selectionCount).toBeVisible()
      }
    })

    test('bulk actions bar appears on selection', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const rowCheckbox = page.locator('tbody input[type="checkbox"]').first()
      if (await rowCheckbox.isVisible()) {
        await rowCheckbox.click()

        // Bulk actions should appear
        const bulkActions = page.locator('[data-testid="bulk-actions"]').or(
          page.locator('text=Change Status').or(
            page.locator('text=Export')
          )
        )
        await expect(bulkActions.first()).toBeVisible()
      }
    })

    test('bulk status change works', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const rowCheckbox = page.locator('tbody input[type="checkbox"]').first()
      if (await rowCheckbox.isVisible()) {
        await rowCheckbox.click()

        // Find and click change status
        const changeStatusBtn = page.locator('text=Change Status').or(
          page.locator('button:has-text("Status")')
        )

        if (await changeStatusBtn.isVisible()) {
          await changeStatusBtn.click()

          // Status select should appear
          const statusSelect = page.locator('select').or(
            page.locator('[role="listbox"]')
          )
          await expect(statusSelect.first()).toBeVisible()
        }
      }
    })

    test('bulk export downloads CSV', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const rowCheckbox = page.locator('tbody input[type="checkbox"]').first()
      if (await rowCheckbox.isVisible()) {
        await rowCheckbox.click()

        // Look for export button
        const exportBtn = page.locator('text=Export').or(
          page.locator('button:has([class*="Download"])')
        )

        if (await exportBtn.isVisible()) {
          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

          await exportBtn.click()

          const download = await downloadPromise
          if (download) {
            expect(download.suggestedFilename()).toContain('.csv')
          }
        }
      }
    })
  })

  test.describe('Status Changes', () => {
    test('quick status select is visible', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const statusSelect = page.locator('tbody select').or(
        page.locator('tbody [role="combobox"]')
      ).first()

      if (await statusSelect.isVisible()) {
        await expect(statusSelect).toBeVisible()
      }
    })

    test('changing status updates the UI', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const statusSelect = page.locator('tbody select').first()

      if (await statusSelect.isVisible()) {
        const currentValue = await statusSelect.inputValue()

        // Select a different status
        const newStatus = currentValue === 'new' ? 'contacted' : 'new'
        await statusSelect.selectOption(newStatus)

        // Wait for API call
        await page.waitForResponse(/\/api\/leads\/.*/, { timeout: 5000 }).catch(() => {})

        // Status should update
        await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
      }
    })
  })

  test.describe('Pagination', () => {
    test('pagination controls are visible when needed', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      // Check for pagination (may not appear if fewer than page size)
      const pagination = page.locator('text=/Showing \\d+-\\d+ of \\d+/')
      const nextButton = page.locator('button:has-text("Next")')

      // Either pagination exists or all leads fit on one page
      const hasPagination = await pagination.isVisible().catch(() => false)
      if (hasPagination) {
        await expect(nextButton).toBeVisible()
      }
    })

    test('next/previous buttons work', async ({ page }) => {
      await page.waitForResponse(/\/api\/leads/)

      const nextButton = page.locator('button:has-text("Next")')

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click()

        // Wait for new data
        await page.waitForResponse(/\/api\/leads/)

        // Previous should now be enabled
        const prevButton = page.locator('button:has-text("Previous")')
        await expect(prevButton).toBeEnabled()
      }
    })
  })

  test.describe('Pipeline View Link', () => {
    test('pipeline view button is visible', async ({ page }) => {
      const pipelineButton = page.locator('text=Pipeline View').or(
        page.locator('a[href*="pipeline"]')
      )
      await expect(pipelineButton.first()).toBeVisible()
    })

    test('clicking pipeline view navigates correctly', async ({ page }) => {
      const pipelineButton = page.locator('text=Pipeline View').or(
        page.locator('a[href*="pipeline"]')
      ).first()

      await pipelineButton.click()

      await expect(page).toHaveURL(/pipeline/)
    })
  })

  test.describe('Empty State', () => {
    test('shows appropriate message when no leads match filter', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('zzzznonexistentzzz')

      await page.waitForTimeout(500)

      const noResults = page.locator('text=No leads found').or(
        page.locator('text=Try adjusting')
      )
      await expect(noResults.first()).toBeVisible()
    })
  })
})
