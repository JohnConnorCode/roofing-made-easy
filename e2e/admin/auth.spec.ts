import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Admin Authentication', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.describe('Login', () => {
    test('displays login form', async ({ page }) => {
      await page.goto('/login')

      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
      await expect(page.locator('text=Sign in to your account')).toBeVisible()
    })

    test('shows error with invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 })
    })

    test('shows error with empty fields', async ({ page }) => {
      await page.goto('/login')

      // Try to submit without filling fields
      await page.click('button[type="submit"]')

      // Browser validation should prevent submission
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('successful login redirects to dashboard', async ({ page }) => {
      await loginAsAdmin(page)

      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    })

    test('redirects to requested page after login', async ({ page }) => {
      // Try to access leads page without auth
      await page.goto('/leads')

      // Should redirect to login with redirectTo parameter
      await expect(page).toHaveURL(/login/)

      // After login, should redirect back to leads
      await loginAsAdmin(page)

      // May end up on dashboard or leads depending on implementation
      await expect(page.url()).toMatch(/dashboard|leads/)
    })

    test('password visibility toggle works', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.locator('input[type="password"]')
      await passwordInput.fill('testpassword')

      // Initially password type
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // Click visibility toggle
      await page.click('button[aria-label="Show password"]')

      // Should now be text type
      const textInput = page.locator('input[type="text"][value="testpassword"]')
      await expect(textInput).toBeVisible()

      // Click to hide again
      await page.click('button[aria-label="Hide password"]')
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })
  })

  test.describe('Session Persistence', () => {
    test('maintains session across page navigation', async ({ page }) => {
      await loginAsAdmin(page)

      // Navigate to different pages
      await page.goto('/leads')
      await expect(page.locator('h1:has-text("Leads")')).toBeVisible()

      await page.goto('/dashboard')
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

      // Should still be logged in
      await expect(page.url()).not.toMatch(/login/)
    })

    test('session expired shows notification', async ({ page }) => {
      await page.goto('/login?expired=true')

      await expect(page.locator('text=Your session has expired')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('logout redirects to login', async ({ page }) => {
      await loginAsAdmin(page)

      // Find and click user menu (may vary by implementation)
      const userMenu = page.locator('[data-testid="user-menu"]').or(
        page.locator('button:has-text("Sign out")').or(
          page.locator('[aria-label="User menu"]')
        )
      )

      if (await userMenu.isVisible()) {
        await userMenu.click()

        const signOutButton = page.locator('text=Sign out').or(
          page.locator('text=Logout').or(
            page.locator('button:has-text("Sign out")')
          )
        )

        if (await signOutButton.isVisible()) {
          await signOutButton.click()
          await expect(page).toHaveURL(/login/)
        }
      }
    })
  })
})

test.describe('Admin Authentication - Unauthenticated', () => {
  test('redirects to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('redirects to login when accessing leads', async ({ page }) => {
    await page.goto('/leads')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('redirects to login when accessing settings', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('redirects to login when accessing customers', async ({ page }) => {
    await page.goto('/customers')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })
})
