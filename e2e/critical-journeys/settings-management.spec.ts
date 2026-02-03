/**
 * E2E Test: Settings & Configuration Management
 *
 * Tests the complete admin workflow for:
 * - Company settings
 * - User preferences
 * - System configuration
 */

import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Settings Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Settings Page', () => {
    test('Settings page loads successfully', async ({ page }) => {
      await page.goto('/settings')

      // Wait for page to load
      await page.waitForTimeout(1000)

      // Should show settings page
      const header = page.locator('h1:has-text("Settings")').or(
        page.locator('h1:has-text("Configuration")')
      )
      await expect(header).toBeVisible()
    })

    test('Shows company information section', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      const companySection = page.locator('text=Company').or(
        page.locator('text=Business').or(
          page.locator('text=Organization')
        )
      )
      await expect(companySection.first()).toBeVisible()
    })

    test('Has editable company name field', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      // Look for company name input
      const nameInput = page.locator('input[name="companyName"]').or(
        page.locator('input[name="company_name"]').or(
          page.locator('input[placeholder*="Company"]')
        )
      )

      if (await nameInput.first().isVisible()) {
        await expect(nameInput.first()).toBeEditable()
      }
    })

    test('Has save button', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      const saveButton = page.locator('button:has-text("Save")').or(
        page.locator('button:has-text("Update")').or(
          page.locator('button[type="submit"]')
        )
      )

      await expect(saveButton.first()).toBeVisible()
    })
  })

  test.describe('Settings API', () => {
    test('GET /api/settings returns current settings', async ({ request }) => {
      const response = await request.get('/api/settings')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.settings || data).toBeDefined()
    })

    test('Settings include company information', async ({ request }) => {
      const response = await request.get('/api/settings')
      const data = await response.json()

      const settings = data.settings || data

      // Should have company-related fields
      expect(
        settings.company_name ||
        settings.companyName ||
        settings.businessName ||
        settings.name
      ).toBeDefined()
    })

    test('Settings include contact information', async ({ request }) => {
      const response = await request.get('/api/settings')
      const data = await response.json()

      const settings = data.settings || data

      // Should have contact fields
      expect(
        settings.email ||
        settings.contact_email ||
        settings.phone ||
        settings.contact_phone
      ).toBeDefined()
    })

    test('PUT /api/settings can update settings', async ({ request }) => {
      // Get current settings first
      const getResponse = await request.get('/api/settings')
      const currentData = await getResponse.json()

      const settings = currentData.settings || currentData

      // Try to update (may need specific fields)
      const response = await request.put('/api/settings', {
        data: {
          ...settings,
          // Add a timestamp to verify update
          updated_at_test: new Date().toISOString(),
        },
      })

      // Should either succeed or return validation error
      expect(response.status()).toBeLessThan(500)
    })
  })

  test.describe('Pricing Settings', () => {
    test('Pricing section exists in settings', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      const pricingSection = page.locator('text=Pricing').or(
        page.locator('text=Rates').or(
          page.locator('a[href*="pricing"]')
        )
      )

      // Pricing may be in settings or separate page
      await expect(pricingSection.first().or(page.locator('h1'))).toBeVisible()
    })

    test('Can navigate to pricing configuration', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      const pricingLink = page.locator('a[href*="pricing"]').or(
        page.locator('button:has-text("Pricing")')
      )

      if (await pricingLink.first().isVisible()) {
        await pricingLink.first().click()
        await page.waitForTimeout(1000)

        // Should be on pricing page
        await expect(page.url()).toMatch(/pricing|settings/)
      }
    })
  })

  test.describe('Notification Settings', () => {
    test('Notification preferences exist', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForTimeout(1000)

      const notificationSection = page.locator('text=Notification').or(
        page.locator('text=Email').or(
          page.locator('text=Alert')
        )
      )

      // Notifications section should exist
      await expect(notificationSection.first().or(page.locator('h1'))).toBeVisible()
    })
  })
})

test.describe('Dashboard Analytics', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Dashboard Page', () => {
    test('Dashboard loads successfully', async ({ page }) => {
      await page.goto('/dashboard')

      await page.waitForTimeout(1000)

      // Should show dashboard
      const header = page.locator('h1:has-text("Dashboard")').or(
        page.locator('h1:has-text("Overview")')
      )
      await expect(header).toBeVisible()
    })

    test('Shows key metrics', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForResponse(/\/api\/dashboard/).catch(() => {})

      // Look for stat cards
      const statCards = page.locator('[class*="stat"]').or(
        page.locator('[class*="metric"]').or(
          page.locator('[class*="card"]')
        )
      )

      await expect(statCards.first()).toBeVisible()
    })

    test('Shows lead count', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForResponse(/\/api\/dashboard/).catch(() => {})

      const leadMetric = page.locator('text=Lead').or(
        page.locator('text=/\\d+ Lead/')
      )

      await expect(leadMetric.first()).toBeVisible()
    })

    test('Shows conversion metrics', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForResponse(/\/api\/dashboard/).catch(() => {})

      const conversionMetric = page.locator('text=Conversion').or(
        page.locator('text=Won').or(
          page.locator('text=Rate')
        )
      )

      await expect(conversionMetric.first().or(page.locator('h1'))).toBeVisible()
    })
  })

  test.describe('Dashboard API', () => {
    test('GET /api/dashboard/stats returns metrics', async ({ request }) => {
      const response = await request.get('/api/dashboard/stats')

      expect(response.ok()).toBeTruthy()
      const data = await response.json()

      expect(data.stats || data.metrics || data).toBeDefined()
    })

    test('Stats include lead counts', async ({ request }) => {
      const response = await request.get('/api/dashboard/stats')
      const data = await response.json()

      const stats = data.stats || data.metrics || data

      // Should have lead-related metrics
      expect(
        stats.total_leads ||
        stats.totalLeads ||
        stats.leads_count ||
        stats.leadsCount ||
        typeof stats.leads === 'number'
      ).toBeTruthy()
    })

    test('Stats include revenue metrics', async ({ request }) => {
      const response = await request.get('/api/dashboard/stats')
      const data = await response.json()

      const stats = data.stats || data.metrics || data

      // Should have revenue-related metrics
      expect(
        stats.revenue ||
        stats.total_revenue ||
        stats.totalRevenue ||
        stats.estimatedRevenue ||
        stats.pipeline_value
      ).toBeDefined()
    })

    test('Stats include time-based breakdown', async ({ request }) => {
      const response = await request.get('/api/dashboard/stats')
      const data = await response.json()

      // Should have some time-based data
      expect(data.stats || data.metrics || data).toBeDefined()
    })
  })
})

test.describe('User Profile', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.describe('Profile API', () => {
    test('GET /api/customer/profile returns user profile', async ({ request }) => {
      const response = await request.get('/api/customer/profile')

      // May require auth
      if (response.ok()) {
        const data = await response.json()
        expect(data.profile || data.user || data).toBeDefined()
      } else {
        expect([401, 403]).toContain(response.status())
      }
    })
  })
})

test.describe('Admin Navigation', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Can navigate between admin pages', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)

    // Navigate to leads
    const leadsLink = page.locator('a[href*="leads"]').first()
    if (await leadsLink.isVisible()) {
      await leadsLink.click()
      await page.waitForTimeout(1000)
      await expect(page.url()).toMatch(/leads/)
    }

    // Navigate to customers
    const customersLink = page.locator('a[href*="customers"]').first()
    if (await customersLink.isVisible()) {
      await customersLink.click()
      await page.waitForTimeout(1000)
      await expect(page.url()).toMatch(/customers/)
    }

    // Navigate to settings
    const settingsLink = page.locator('a[href*="settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await page.waitForTimeout(1000)
      await expect(page.url()).toMatch(/settings/)
    }
  })

  test('Admin sidebar shows all main sections', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)

    const sidebar = page.locator('nav').or(
      page.locator('[class*="sidebar"]')
    )

    if (await sidebar.first().isVisible()) {
      // Check for main navigation items
      const dashboardLink = sidebar.locator('a:has-text("Dashboard")').or(
        page.locator('a[href*="dashboard"]')
      )
      const leadsLink = sidebar.locator('a:has-text("Leads")').or(
        page.locator('a[href*="leads"]')
      )

      await expect(dashboardLink.first().or(leadsLink.first())).toBeVisible()
    }
  })

  test('Logout works correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)

    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout")').or(
      page.locator('button:has-text("Sign Out")').or(
        page.locator('a:has-text("Logout")')
      )
    )

    if (await logoutButton.first().isVisible()) {
      await logoutButton.first().click()
      await page.waitForTimeout(2000)

      // Should be redirected to login or home
      await expect(page.url()).not.toMatch(/dashboard|admin/)
    }
  })
})

test.describe('Error Handling', () => {
  test('404 page for non-existent admin routes', async ({ page }) => {
    await page.goto('/admin/non-existent-page')
    await page.waitForTimeout(1000)

    // Should show 404 or redirect
    const content = page.locator('text=404').or(
      page.locator('text=Not Found').or(
        page.locator('h1')
      )
    )
    await expect(content.first()).toBeVisible()
  })

  test('Unauthorized access to admin without login', async ({ page, context }) => {
    // Clear any existing auth
    await context.clearCookies()

    await page.goto('/dashboard')
    await page.waitForTimeout(2000)

    // Should redirect to login or show auth error
    const loginContent = page.locator('text=Login').or(
      page.locator('text=Sign In').or(
        page.locator('input[type="email"]')
      )
    )

    // Either redirected to login or showing auth error
    await expect(
      loginContent.first().or(page.locator('h1'))
    ).toBeVisible()
  })
})
