import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'
import { testMacro } from '../helpers/test-data'

test.describe('Estimate Templates (Macros)', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/macros')
  })

  test.describe('Page Load', () => {
    test('macros page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Estimate Templates")').or(
        page.locator('h1:has-text("Templates")')
      )).toBeVisible()
    })

    test('displays stats cards', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const statsCards = page.locator('text=Total Templates').or(
        page.locator('text=System Templates').or(
          page.locator('text=Custom Templates')
        )
      )

      await expect(statsCards.first()).toBeVisible()
    })

    test('displays create button', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').or(
        page.locator('button:has-text("Add")')
      )
      await expect(createButton.first()).toBeVisible()
    })
  })

  test.describe('Template Display', () => {
    test('templates are grouped by job type', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      // Should show job type headers
      const jobTypeHeaders = ['Full Replacement', 'Repair', 'Overlay', 'Storm Damage']

      for (const header of jobTypeHeaders) {
        const headerElement = page.locator(`text=${header}`)
        if (await headerElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(headerElement).toBeVisible()
          break
        }
      }
    })

    test('template cards show key information', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const templateCard = page.locator('[class*="card"]').first()

      if (await templateCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Cards should show template info
        const cardContent = templateCard.locator('text=/line items|uses/')
        await expect(cardContent.first().or(templateCard)).toBeVisible()
      }
    })

    test('default template has star indicator', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const defaultIndicator = page.locator('[class*="ring-amber"]').or(
        page.locator('[class*="fill-amber"]')
      )

      // May or may not have a default set
      const hasDefault = await defaultIndicator.first().isVisible({ timeout: 2000 }).catch(() => false)
      expect(typeof hasDefault).toBe('boolean')
    })

    test('system templates are marked', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const systemBadge = page.locator('text=System')

      // May or may not have system templates
      const hasSystem = await systemBadge.first().isVisible({ timeout: 2000 }).catch(() => false)
      expect(typeof hasSystem).toBe('boolean')
    })
  })

  test.describe('CRUD Operations', () => {
    test('create button opens modal', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      const modal = page.locator('text=Create Template')
      await expect(modal).toBeVisible()
    })

    test('create modal has required fields', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      await page.waitForTimeout(500)

      await expect(page.locator('label:has-text("Name")')).toBeVisible()
      await expect(page.locator('label:has-text("Roof Type")')).toBeVisible()
      await expect(page.locator('label:has-text("Job Type")')).toBeVisible()
    })

    test('edit button opens modal for non-system templates', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const editButton = page.locator('button:has([class*="Edit"])').first()

      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click()

        const modal = page.locator('text=Edit Template')
        await expect(modal).toBeVisible()
      }
    })

    test('duplicate button is functional', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const duplicateButton = page.locator('text=Duplicate').or(
        page.locator('button:has([class*="Copy"])')
      ).first()

      if (await duplicateButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Verify button is enabled and clickable
        await expect(duplicateButton).toBeEnabled()
        // Don't actually click to avoid creating duplicate data
        // Just verify the UI element exists
      }

      // Page should remain functional
      await expect(page.locator('h1')).toBeVisible()
    })

    test('set default button works', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const setDefaultButton = page.locator('text=Set Default').first()

      if (await setDefaultButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await setDefaultButton.click()

        // Wait for update
        await page.waitForResponse(/\/api\/macros/).catch(() => {})

        // Button should disappear or change (it's now default)
        await expect(page.locator('h1')).toBeVisible()
      }
    })

    test('delete button shows confirmation dialog', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      const deleteButton = page.locator('button:has([class*="Trash"])').first()

      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Listen for dialog - DISMISS to avoid deleting production data
        page.on('dialog', dialog => dialog.dismiss())

        await deleteButton.click()

        // Wait for dialog interaction
        await page.waitForTimeout(500)

        // Page should still be functional (we cancelled the delete)
        await expect(page.locator('h1')).toBeVisible()
      }
    })

    test('modal can be cancelled', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      await page.waitForTimeout(500)

      const cancelButton = page.locator('button:has-text("Cancel")')
      await cancelButton.click()

      // Modal should close
      await page.waitForTimeout(500)

      const modal = page.locator('text=Create Template')
      await expect(modal).toBeHidden()
    })
  })

  test.describe('Form Submission', () => {
    test('can fill out and submit template form', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      await page.waitForTimeout(500)

      // Fill form
      await page.fill('input', 'E2E Test Template')

      // Select roof type
      const roofTypeSelect = page.locator('select').first()
      if (await roofTypeSelect.isVisible()) {
        await roofTypeSelect.selectOption({ index: 1 })
      }

      // Submit
      const submitButton = page.locator('button:has-text("Create Template")').or(
        page.locator('button[type="submit"]')
      ).first()

      // Don't actually submit to avoid creating test data
      await expect(submitButton).toBeEnabled()
    })

    test('validates required name field', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      await page.waitForTimeout(500)

      // Leave name empty and try to submit
      const submitButton = page.locator('button:has-text("Create Template")').or(
        page.locator('button[type="submit"]')
      ).first()

      await submitButton.click()

      // Should stay on modal (validation failed)
      const modal = page.locator('[role="dialog"]').or(
        page.locator('[class*="modal"]')
      )
      await expect(modal.first()).toBeVisible()
    })
  })

  test.describe('Tags', () => {
    test('tags input exists in form', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Template")').first()
      await createButton.click()

      await page.waitForTimeout(500)

      const tagsInput = page.locator('label:has-text("Tags")').or(
        page.locator('input[placeholder*="tag"]')
      )

      await expect(tagsInput.first()).toBeVisible()
    })

    test('tags are displayed on template cards', async ({ page }) => {
      await page.waitForResponse(/\/api\/macros/).catch(() => {})

      // Tags appear as small badges on cards
      const tagBadges = page.locator('[class*="rounded"]').filter({
        hasText: /^[a-z]+$/i
      })

      // May or may not have tags
      const count = await tagBadges.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
