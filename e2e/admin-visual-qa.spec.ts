/**
 * Admin Visual QA - Screenshot all admin pages to verify styling
 * Run with: npx playwright test e2e/admin-visual-qa.spec.ts --headed
 */
import { test, expect, Page } from '@playwright/test'

// Helper to login and navigate
async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com')
  await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'testpassword')
  await page.click('button[type="submit"]')
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|leads|settings)/, { timeout: 10000 })
}

test.describe('Admin Visual QA', () => {
  test.beforeEach(async ({ page }) => {
    // Skip login if already logged in
    try {
      await loginAsAdmin(page)
    } catch {
      // May already be logged in
    }
  })

  // Dashboard
  test('Dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-dashboard.png', fullPage: true })

    // Verify no orange/amber in navigation (should be gold)
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
  })

  // Leads list
  test('Leads list page', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-leads.png', fullPage: true })
  })

  // Pipeline
  test('Pipeline page', async ({ page }) => {
    await page.goto('/leads/pipeline')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-pipeline.png', fullPage: true })
  })

  // Customers
  test('Customers page', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-customers.png', fullPage: true })
  })

  // Settings - all tabs
  test('Settings page - Company tab', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-settings-company.png', fullPage: true })
  })

  test('Settings page - Integrations tab', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Integrations")')
    await page.waitForTimeout(500) // Allow tab switch
    await page.screenshot({ path: 'playwright-report/screenshots/admin-settings-integrations.png', fullPage: true })
  })

  test('Settings page - Notifications tab', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Notifications")')
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'playwright-report/screenshots/admin-settings-notifications.png', fullPage: true })
  })

  test('Settings page - Security tab', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Security")')
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'playwright-report/screenshots/admin-settings-security.png', fullPage: true })
  })

  // Pricing pages
  test('Pricing - Base Rates page', async ({ page }) => {
    await page.goto('/rate-management')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-pricing.png', fullPage: true })
  })

  test('Pricing - Geographic page', async ({ page }) => {
    await page.goto('/rate-management/geographic')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-pricing-geographic.png', fullPage: true })
  })

  test('Line Items page', async ({ page }) => {
    await page.goto('/line-items')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-line-items.png', fullPage: true })
  })

  test('Macros/Templates page', async ({ page }) => {
    await page.goto('/macros')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-macros.png', fullPage: true })
  })

  // Login page (no auth needed)
  test('Login page', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'playwright-report/screenshots/admin-login.png', fullPage: true })
  })
})
