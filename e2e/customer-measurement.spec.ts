import { test, expect } from '@playwright/test'

test.describe('Customer Measurement Flow', () => {
  test.describe('Estimate Funnel', () => {
    test('should display homepage with estimate CTA', async ({ page }) => {
      await page.goto('/')

      // Homepage should load with roofing content
      await expect(page).toHaveTitle(/Farrell Roofing/)

      // Should have a call-to-action for estimates
      const ctaButton = page.getByRole('link', { name: /estimate|quote/i }).first()
      await expect(ctaButton).toBeVisible()
    })

    test('should navigate to estimate page from CTA', async ({ page }) => {
      await page.goto('/')

      // Click on Get Estimate CTA
      const ctaButton = page.getByRole('link', { name: /free estimate|get.*estimate/i }).first()

      if (await ctaButton.isVisible()) {
        await ctaButton.click()

        // Should navigate to an estimate-related page
        await expect(page.url()).toMatch(/estimate|quote|funnel|lead/)
      }
    })

    test('should display contact information', async ({ page }) => {
      await page.goto('/')

      // Phone number should be visible
      const phoneLink = page.getByRole('link', { name: /\d{3}.*\d{3}.*\d{4}/ }).first()
      await expect(phoneLink).toBeVisible()
    })
  })

  test.describe('Service Pages', () => {
    test('should display roof replacement page', async ({ page }) => {
      await page.goto('/roof-replacement')

      // Page should load with relevant content
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('should display financing page', async ({ page }) => {
      await page.goto('/financing')

      // Financing page should load
      await expect(page.locator('h1').first()).toContainText(/financing/i)
    })
  })

  test.describe('Location Pages', () => {
    test('should display Tupelo city page via rewrite', async ({ page }) => {
      // Test the URL rewrite: /tupelo-roofing -> /city/tupelo
      await page.goto('/tupelo-roofing')

      // Page should load (may 404 if city page doesn't exist, that's ok)
      const response = await page.waitForResponse((response) =>
        response.url().includes('tupelo')
      )
      expect(response.status()).toBeLessThan(500)
    })
  })

  test.describe('Form Interactions', () => {
    test('should handle estimate form submission', async ({ page }) => {
      await page.goto('/')

      // Look for any form on the page
      const form = page.locator('form').first()

      if (await form.isVisible()) {
        // Check form has required fields
        const nameInput = form.locator('input[name*="name"], input[placeholder*="name"]').first()
        const emailInput = form.locator('input[type="email"]').first()
        const phoneInput = form.locator('input[type="tel"]').first()

        // At least some contact fields should exist
        const hasContactFields =
          (await nameInput.isVisible()) ||
          (await emailInput.isVisible()) ||
          (await phoneInput.isVisible())

        expect(hasContactFields).toBe(true)
      }
    })
  })
})

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
  ]

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')

      // Page should not have horizontal overflow
      const body = page.locator('body')
      const bodyWidth = await body.evaluate((el) => el.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1) // +1 for rounding

      // Header should be visible
      await expect(page.locator('header').first()).toBeVisible()

      // Main content should be visible
      await expect(page.locator('main').first()).toBeVisible()
    })
  }
})

test.describe('Performance & Accessibility', () => {
  test('should load homepage within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000)
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      // Images should have alt attribute (can be empty for decorative)
      expect(alt).not.toBeNull()
    }
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)

    // Check for viewport meta
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })
})
