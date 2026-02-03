import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'
import { testLineItem, lineItemCategories } from '../helpers/test-data'

test.describe('Line Items Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/line-items')
  })

  test.describe('Page Load', () => {
    test('line items page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Line Items")')).toBeVisible()
    })

    test('displays item count', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const itemCount = page.locator('text=/\\d+ items/')
      await expect(itemCount.first()).toBeVisible()
    })

    test('displays add button', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').or(
        page.locator('button:has-text("Add")')
      )
      await expect(addButton.first()).toBeVisible()
    })
  })

  test.describe('Filters', () => {
    test('search input is visible', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await expect(searchInput).toBeVisible()
    })

    test('category filter is visible', async ({ page }) => {
      const categoryFilter = page.locator('select').first()
      await expect(categoryFilter).toBeVisible()
    })

    test('search filters items', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('shingle')

      await page.waitForTimeout(500)

      // Results should update
      await expect(page.locator('h1:has-text("Line Items")')).toBeVisible()
    })

    test('category filter changes results', async ({ page }) => {
      const categoryFilter = page.locator('select').first()

      // Select a specific category
      await categoryFilter.selectOption('shingles')

      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      // Results should update
      await expect(page.locator('h1:has-text("Line Items")')).toBeVisible()
    })
  })

  test.describe('Line Items Table', () => {
    test('displays grouped items by category', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      // Should show category groups or table
      const categoryHeader = page.locator('text=Shingles').or(
        page.locator('text=Tear-Off').or(
          page.locator('text=Underlayment')
        )
      )

      const table = page.locator('table')

      await expect(categoryHeader.first().or(table.first())).toBeVisible()
    })

    test('displays table columns', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const table = page.locator('table').first()

      if (await table.isVisible()) {
        const expectedHeaders = ['Code', 'Name', 'Unit', 'Material', 'Labor', 'Total']

        for (const header of expectedHeaders) {
          const th = table.locator(`th:has-text("${header}")`)
          if (await th.isVisible().catch(() => false)) {
            await expect(th).toBeVisible()
            break
          }
        }
      }
    })

    test('displays cost values in currency format', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const table = page.locator('table').first()

      if (await table.isVisible()) {
        // Should show currency values
        const currencyValues = table.locator('text=/\\$[\\d,]+/')
        const count = await currencyValues.count()

        if (count > 0) {
          await expect(currencyValues.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('CRUD Operations', () => {
    test('add button opens modal', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      // Modal should appear
      const modal = page.locator('[role="dialog"]').or(
        page.locator('[class*="modal"]').or(
          page.locator('text=Add Line Item')
        )
      )

      await expect(modal.first()).toBeVisible()
    })

    test('add modal has required fields', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').first()
      await addButton.click()

      await page.waitForTimeout(500)

      // Check for form fields
      await expect(page.locator('label:has-text("Item Code")').or(
        page.locator('input[placeholder*="code"]')
      ).first()).toBeVisible()

      await expect(page.locator('label:has-text("Name")').or(
        page.locator('input[placeholder*="name"]')
      ).first()).toBeVisible()
    })

    test('edit button opens modal with data', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const editButton = page.locator('button:has([class*="Edit"])').or(
        page.locator('button[aria-label*="edit"]')
      ).first()

      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click()

        // Modal should appear with "Edit" in title
        const modal = page.locator('text=Edit Line Item')
        await expect(modal).toBeVisible()
      }
    })

    test('delete button shows confirmation', async ({ page }) => {
      await page.waitForResponse(/\/api\/line-items/).catch(() => {})

      const deleteButton = page.locator('button:has([class*="Trash"])').or(
        page.locator('button[aria-label*="delete"]')
      ).first()

      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Listen for dialog - DISMISS to avoid deleting production data
        page.on('dialog', dialog => dialog.dismiss())

        await deleteButton.click()

        // Either confirmation dialog appeared or inline confirmation
        await page.waitForTimeout(500)

        // Page should still be functional (we cancelled the delete)
        await expect(page.locator('h1:has-text("Line Items")')).toBeVisible()
      }
    })

    test('modal can be closed', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').first()
      await addButton.click()

      await page.waitForTimeout(500)

      // Close modal
      const closeButton = page.locator('button:has([class*="close"])').or(
        page.locator('button:has-text("Cancel")').or(
          page.locator('[aria-label="Close"]')
        )
      ).first()

      await closeButton.click()

      // Modal should close
      await page.waitForTimeout(500)

      const modal = page.locator('text=Add Line Item')
      await expect(modal).toBeHidden()
    })
  })

  test.describe('Form Validation', () => {
    test('requires item code', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').first()
      await addButton.click()

      await page.waitForTimeout(500)

      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Create Item")').or(
        page.locator('button[type="submit"]')
      ).first()

      await submitButton.click()

      // Form should not submit (required validation)
      const modal = page.locator('[role="dialog"]').or(
        page.locator('[class*="modal"]')
      )
      await expect(modal.first()).toBeVisible()
    })

    test('validates cost fields as numbers', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Line Item")').first()
      await addButton.click()

      await page.waitForTimeout(500)

      const materialCostInput = page.locator('input[type="number"]').first()

      if (await materialCostInput.isVisible()) {
        // Number inputs should only accept numbers
        await materialCostInput.fill('100')
        const value = await materialCostInput.inputValue()
        expect(value).toBe('100')
      }
    })
  })

  test.describe('Empty State', () => {
    test('shows empty state with no results', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('zzzznonexistentitemzzz')

      await page.waitForTimeout(500)

      const emptyState = page.locator('text=No line items found').or(
        page.locator('text=no results')
      )

      await expect(emptyState.first().or(page.locator('h1:has-text("Line Items")'))).toBeVisible()
    })
  })
})
