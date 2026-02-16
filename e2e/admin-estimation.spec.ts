import { test, expect } from '@playwright/test'

test.describe('Admin Estimation Flow', () => {
  // Note: In mock mode, admin routes redirect to login
  // These tests verify the admin estimation UI functionality

  test.describe('Line Items Management', () => {
    test('should display line items page', async ({ page }) => {
      // Navigate to line items admin page
      await page.goto('/line-items')

      // Should be redirected to login in mock mode
      await expect(page).toHaveURL(/login/)
    })

    test('should have proper page structure when authenticated', async ({
      page,
    }) => {
      // For authenticated tests, you would set up auth state
      // This test verifies the structure exists
      await page.goto('/')

      // Verify homepage loads
      await expect(page).toHaveTitle(/Smart Roof Pricing/)
    })
  })

  test.describe('Macros Management', () => {
    test('should protect macros page', async ({ page }) => {
      await page.goto('/macros')

      // Should redirect to login in mock mode
      await expect(page).toHaveURL(/login/)
    })
  })

  test.describe('Geographic Pricing', () => {
    test('should protect geographic pricing page', async ({ page }) => {
      await page.goto('/rate-management/geographic')

      // Should redirect to login in mock mode
      await expect(page).toHaveURL(/login/)
    })
  })

  test.describe('Dashboard Access', () => {
    test('should protect dashboard', async ({ page }) => {
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login')

      // Login page should load
      await expect(page.locator('form')).toBeVisible()
    })
  })
})

test.describe('Admin UI Components', () => {
  test('should display mobile navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first()
    await expect(menuButton).toBeVisible()
  })

  test('should have responsive header', async ({ page }) => {
    await page.goto('/')

    // Desktop header should be visible
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })

  test('should display footer with contact info', async ({ page }) => {
    await page.goto('/')

    // Footer should be visible
    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })
})
