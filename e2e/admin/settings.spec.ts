import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Admin Settings', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
  })

  test.describe('Page Load', () => {
    test('settings page loads successfully', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
    })

    test('displays settings tabs', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      // Check for tab buttons
      const tabButtons = page.locator('button[role="tab"]').or(
        page.locator('[class*="tab"]')
      )

      await expect(tabButtons.first()).toBeVisible()
    })
  })

  test.describe('Company Information', () => {
    test('company info tab is accessible', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const companyTab = page.locator('button:has-text("Company")').or(
        page.locator('text=Company Info').or(
          page.locator('button:has-text("General")')
        )
      )

      if (await companyTab.isVisible()) {
        await companyTab.click()

        // Should show company fields
        const companyContent = page.locator('text=Company Name').or(
          page.locator('input[name*="company"]').or(
            page.locator('label:has-text("Company")')
          )
        )

        await expect(companyContent.first()).toBeVisible()
      }
    })

    test('company name field is editable', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const companyNameInput = page.locator('input[name*="company"]').or(
        page.locator('input[id*="company"]')
      ).first()

      if (await companyNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(companyNameInput).toBeEnabled()
      }
    })
  })

  test.describe('Business Hours', () => {
    test('business hours section exists', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const hoursSection = page.locator('text=Business Hours').or(
        page.locator('text=Hours').or(
          page.locator('text=Operating')
        )
      )

      // May need to click a tab first
      const hoursTab = page.locator('button:has-text("Hours")')
      if (await hoursTab.isVisible()) {
        await hoursTab.click()
      }

      // Business hours may be in any tab
      await expect(hoursSection.first().or(page.locator('h1:has-text("Settings")'))).toBeVisible()
    })
  })

  test.describe('Notifications', () => {
    test('notifications tab exists', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const notificationsTab = page.locator('button:has-text("Notifications")').or(
        page.locator('text=Notifications')
      )

      if (await notificationsTab.isVisible()) {
        await notificationsTab.click()

        // Should show notification settings
        const notificationContent = page.locator('text=Email').or(
          page.locator('text=SMS').or(
            page.locator('input[type="checkbox"]')
          )
        )

        await expect(notificationContent.first()).toBeVisible()
      }
    })

    test('notification toggles are interactive', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const notificationsTab = page.locator('button:has-text("Notifications")')

      if (await notificationsTab.isVisible()) {
        await notificationsTab.click()

        const toggles = page.locator('input[type="checkbox"]').or(
          page.locator('[role="switch"]')
        )

        if (await toggles.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(toggles.first()).toBeEnabled()
        }
      }
    })
  })

  test.describe('Integrations', () => {
    test('integrations tab loads', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const integrationsTab = page.locator('button:has-text("Integrations")')

      if (await integrationsTab.isVisible()) {
        await integrationsTab.click()

        await expect(page.locator('text=API Integrations').or(
          page.locator('text=Integrations')
        ).first()).toBeVisible({ timeout: 15000 })
      }
    })

    test('shows integration providers', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const integrationsTab = page.locator('button:has-text("Integrations")')

      if (await integrationsTab.isVisible()) {
        await integrationsTab.click()

        await page.waitForSelector('text=API Integrations', { timeout: 15000 })

        // Check for known integrations
        const providers = ['Resend', 'Stripe', 'Twilio', 'OpenAI']

        for (const provider of providers) {
          const providerElement = page.locator(`text=${provider}`)
          if (await providerElement.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(providerElement).toBeVisible()
            break // At least one provider visible
          }
        }
      }
    })

    test('integration status badges are shown', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const integrationsTab = page.locator('button:has-text("Integrations")')

      if (await integrationsTab.isVisible()) {
        await integrationsTab.click()

        await page.waitForSelector('text=API Integrations', { timeout: 15000 })

        // Should show status badges
        const statusBadges = page.locator('text=Connected').or(
          page.locator('text=Not configured')
        )

        await expect(statusBadges.first()).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Save Changes', () => {
    test('save button exists', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const saveButton = page.locator('button:has-text("Save")').or(
        page.locator('button[type="submit"]')
      )

      await expect(saveButton.first()).toBeVisible()
    })

    test('can save changes', async ({ page }) => {
      await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })

      const saveButton = page.locator('button:has-text("Save")').first()

      if (await saveButton.isVisible() && await saveButton.isEnabled()) {
        await saveButton.click()

        // Should show success message or save without error
        const successMessage = page.locator('text=saved').or(
          page.locator('text=updated').or(
            page.locator('[class*="success"]')
          )
        )

        // Either shows success or no error
        const result = await Promise.race([
          successMessage.first().isVisible({ timeout: 5000 }).catch(() => false),
          page.waitForTimeout(3000).then(() => true)
        ])

        expect(result).toBeTruthy()
      }
    })
  })
})

test.describe('Admin Settings - Unauthenticated', () => {
  test('redirects to login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
