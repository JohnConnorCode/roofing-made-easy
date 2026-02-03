import { Page, expect } from '@playwright/test'

/**
 * Shared authentication fixture for admin E2E tests.
 * Handles login flow and session management.
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || ''

/**
 * Login as admin user and wait for dashboard to load.
 * Throws an error if credentials are not configured.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are required'
    )
  }

  await page.goto('/login')

  // Wait for page to be ready
  await page.waitForLoadState('networkidle')

  // Fill in credentials
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)

  // Submit form - use text selector for reliability
  await page.click('button:has-text("Sign In")')

  // Wait for dashboard to load (allow time for auth)
  await page.waitForURL(/dashboard/, { timeout: 30000 })
}

/**
 * Check if admin credentials are configured.
 */
export function hasAdminCredentials(): boolean {
  return Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)
}

/**
 * Logout the current user.
 */
export async function logout(page: Page): Promise<void> {
  // Click on the user menu and logout button
  const userMenu = page.locator('[data-testid="user-menu"]')
  if (await userMenu.isVisible()) {
    await userMenu.click()
    await page.click('text=Sign out')
    await page.waitForURL(/login/)
  }
}

/**
 * Check if user is logged in by looking for dashboard elements.
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Navigate to an admin page with authentication.
 */
export async function navigateAsAdmin(page: Page, path: string): Promise<void> {
  if (!(await isLoggedIn(page))) {
    await loginAsAdmin(page)
  }
  if (!page.url().endsWith(path)) {
    await page.goto(path)
  }
}
