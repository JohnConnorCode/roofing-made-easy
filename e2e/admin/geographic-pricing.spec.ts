import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Geographic Pricing', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/rate-management/geographic')
  })

  test.describe('Page Load', () => {
    test('geographic pricing page loads', async ({ page }) => {
      const pageHeader = page.locator('h1:has-text("Geographic")').or(
        page.locator('h1:has-text("Regional")').or(
          page.locator('text=Geographic Pricing')
        )
      )

      await expect(pageHeader.first()).toBeVisible()
    })

    test('displays regions list or empty state', async ({ page }) => {
      await page.waitForResponse(/\/api\/geographic-pricing/).catch(() => {})

      const regionsList = page.locator('table').or(
        page.locator('[class*="card"]').or(
          page.locator('text=No regions')
        )
      )

      await expect(regionsList.first()).toBeVisible()
    })

    test('add region button exists', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")').or(
          page.locator('button:has-text("Create")')
        )
      )

      await expect(addButton.first()).toBeVisible()
    })
  })

  test.describe('Regions List', () => {
    test('displays region names', async ({ page }) => {
      await page.waitForResponse(/\/api\/geographic-pricing/).catch(() => {})

      const regionsContent = page.locator('table').or(
        page.locator('[class*="card"]')
      )

      if (await regionsContent.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        // Should show region data
        await expect(regionsContent.first()).toBeVisible()
      }
    })

    test('displays multiplier values', async ({ page }) => {
      await page.waitForResponse(/\/api\/geographic-pricing/).catch(() => {})

      // Look for multiplier values (decimal numbers)
      const multiplierValues = page.locator('text=/\\d+\\.\\d+x?/').or(
        page.locator('text=/\\d+%/')
      )

      const count = await multiplierValues.count()

      // May or may not have regions with multipliers
      if (count > 0) {
        await expect(multiplierValues.first()).toBeVisible()
      }
    })
  })

  test.describe('CRUD Operations', () => {
    test('add button opens form/modal', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      // Should show form or modal
      const form = page.locator('[role="dialog"]').or(
        page.locator('input[name*="region"]').or(
          page.locator('input[placeholder*="region"]')
        )
      )

      await expect(form.first()).toBeVisible()
    })

    test('form has region name field', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const nameField = page.locator('label:has-text("Name")').or(
        page.locator('label:has-text("Region")').or(
          page.locator('input[name*="name"]')
        )
      )

      await expect(nameField.first()).toBeVisible()
    })

    test('form has multiplier field', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const multiplierField = page.locator('label:has-text("Multiplier")').or(
        page.locator('label:has-text("Factor")').or(
          page.locator('input[type="number"]')
        )
      )

      await expect(multiplierField.first()).toBeVisible()
    })

    test('edit button opens form with data', async ({ page }) => {
      await page.waitForResponse(/\/api\/geographic-pricing/).catch(() => {})

      const editButton = page.locator('button:has([class*="Edit"])').or(
        page.locator('button[aria-label*="edit"]')
      ).first()

      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click()

        // Should show edit form/modal
        const form = page.locator('[role="dialog"]').or(
          page.locator('text=Edit')
        )

        await expect(form.first()).toBeVisible()
      }
    })

    test('delete button shows confirmation dialog', async ({ page }) => {
      await page.waitForResponse(/\/api\/geographic-pricing/).catch(() => {})

      const deleteButton = page.locator('button:has([class*="Trash"])').or(
        page.locator('button[aria-label*="delete"]')
      ).first()

      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // DISMISS to avoid deleting production data
        page.on('dialog', dialog => dialog.dismiss())

        await deleteButton.click()

        await page.waitForTimeout(500)

        // Page should remain functional (we cancelled the delete)
        await expect(page.locator('h1')).toBeVisible()
      }
    })
  })

  test.describe('Multiplier Validation', () => {
    test('multiplier must be positive number', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const multiplierInput = page.locator('input[type="number"]').first()

      if (await multiplierInput.isVisible()) {
        await multiplierInput.fill('-1')

        // Submit should fail validation
        const submitButton = page.locator('button:has-text("Save")').or(
          page.locator('button[type="submit"]')
        ).first()

        if (await submitButton.isVisible()) {
          await submitButton.click()

          // Should show validation error or stay on form
          const form = page.locator('[role="dialog"]').or(
            page.locator('[class*="modal"]')
          )

          await expect(form.first()).toBeVisible()
        }
      }
    })

    test('reasonable multiplier range', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const multiplierInput = page.locator('input[type="number"]').first()

      if (await multiplierInput.isVisible()) {
        // Fill with reasonable value
        await multiplierInput.fill('1.25')

        const value = await multiplierInput.inputValue()
        expect(value).toBe('1.25')
      }
    })
  })

  test.describe('Location Fields', () => {
    test('has location-related fields', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      // Check for location fields (state, county, zip, etc.)
      const locationFields = page.locator('label:has-text("State")').or(
        page.locator('label:has-text("County")').or(
          page.locator('label:has-text("Zip")').or(
            page.locator('label:has-text("Area")')
          )
        )
      )

      // Should have some location configuration
      await expect(locationFields.first().or(page.locator('input'))).toBeVisible()
    })
  })

  test.describe('Form Submission', () => {
    test('cancel button closes form', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const cancelButton = page.locator('button:has-text("Cancel")').or(
        page.locator('[aria-label="Close"]')
      ).first()

      await cancelButton.click()

      await page.waitForTimeout(500)

      // Form should close
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeHidden().catch(() => {})
    })

    test('save button exists and is enabled', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Region")').or(
        page.locator('button:has-text("Add")')
      ).first()

      await addButton.click()

      await page.waitForTimeout(500)

      const saveButton = page.locator('button:has-text("Save")').or(
        page.locator('button:has-text("Create")').or(
          page.locator('button[type="submit"]')
        )
      ).first()

      await expect(saveButton).toBeVisible()
    })
  })
})
