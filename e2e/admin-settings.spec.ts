import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || ''

test.describe('Admin Settings', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
  })

  test('integrations section loads without stuck spinner', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })
    await page.click('button:has-text("Integrations")')
    
    // Wait for integrations content
    await expect(page.locator('text=API Integrations')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Resend')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Stripe')).toBeVisible()
    await expect(page.locator('text=Twilio')).toBeVisible()
    await expect(page.locator('text=OpenAI')).toBeVisible()
  })

  test('integration cards show correct status', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForSelector('h1:has-text("Settings")', { timeout: 30000 })
    await page.click('button:has-text("Integrations")')
    await page.waitForSelector('text=API Integrations', { timeout: 15000 })
    
    // Should have status badges
    const badges = page.locator('text=Connected').or(page.locator('text=Not configured'))
    await expect(badges.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin Settings - Unauthenticated', () => {
  test('redirects to login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
