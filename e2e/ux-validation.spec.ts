import { test, expect } from '@playwright/test'

/**
 * UX validation sweep for the public site + estimator funnel.
 *
 * - Assertion-based: each public page must have exactly one h1 with
 *   the expected headline and no (filtered) runtime console errors.
 * - Screenshot-based: every key page is captured at both desktop and
 *   mobile viewports so a human can eyeball layout in one place.
 */

const FILTER_NOISE = (err: string) =>
  !err.includes('Failed to load resource') &&
  !err.includes('favicon.ico') &&
  !err.includes('sentry') &&
  !err.includes('chrome-extension') &&
  !err.includes('va.vercel-scripts.com') &&
  !err.includes('vercel-scripts') &&
  !err.includes('Content Security Policy') &&
  !err.includes('Hydration failed') && // dev-mode Turbopack noise
  !err.includes('hydration')

const PUBLIC_PAGES: { path: string; h1: RegExp; eyebrow?: RegExp }[] = [
  { path: '/', h1: /Know what your/, eyebrow: /priced honestly/ },
  { path: '/about', h1: /family roofing business/i },
  { path: '/services', h1: /From repair to replacement/i },
  { path: '/pricing', h1: /What does a roof/i },
  { path: '/contact', h1: /Reach out/i },
  { path: '/financing', h1: /Turn a big number/i },
  { path: '/insurance-help', h1: /Run the claim right/i },
  { path: '/assistance-programs', h1: /Help you didn/i },
  { path: '/portfolio', h1: /Roofs we/i },
  { path: '/service-areas', h1: /roof by roof/i },
  { path: '/blog', h1: /Straight talk/i },
]

test.describe('Public pages — structural sanity', () => {
  for (const { path, h1, eyebrow } of PUBLIC_PAGES) {
    test(`${path}: single h1, correct headline, no errors`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      page.on('pageerror', err => consoleErrors.push(err.message))

      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const h1Count = await page.locator('h1').count()
      expect(h1Count, `${path} should have exactly 1 h1`).toBe(1)

      await expect(page.locator('h1').first()).toContainText(h1)

      if (eyebrow) {
        await expect(page.getByText(eyebrow).first()).toBeVisible()
      }

      const real = consoleErrors.filter(FILTER_NOISE)
      expect(real, `${path} runtime errors`).toEqual([])
    })
  }
})

test.describe('Homepage — section visibility', () => {
  test('every canonical section is visible on desktop', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Know what your/)
    await expect(page.getByRole('button', { name: /Get my free estimate/i }).first()).toBeVisible()
    await expect(page.getByText(/No sales calls/i).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Pick a material/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Real roofs/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Straightforward/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Three steps/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Most homeowners/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /What homeowners/i })).toBeVisible()
  })

  test('hero image loads (LCP signal)', async ({ page }) => {
    const imagePromise = page.waitForResponse(
      resp =>
        (resp.url().includes('replacement-after') ||
          resp.url().includes('_next/image')) &&
        resp.status() === 200
    )
    await page.goto('/')
    const resp = await imagePromise
    expect(resp.ok()).toBe(true)
  })

  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('no horizontal overflow', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(376)
    })

    test('mobile CTA bar appears after scrolling past hero', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => window.scrollTo(0, 1600))
      await page.waitForTimeout(700)
      const mobileBar = page
        .locator('a[aria-label*="Call"]')
        .filter({ hasText: /Call Now/i })
        .first()
      await expect(mobileBar).toBeVisible({ timeout: 3000 })
    })
  })
})

test.describe('Estimator API + shared estimate page', () => {
  test('full funnel via API then public estimate renders', async ({ page, request }) => {
    // Create + complete a lead via API (faster and more stable than driving UI)
    const leadRes = await request.post('/api/leads', { data: { source: 'web_funnel' } })
    const { lead } = await leadRes.json()
    const { id: leadId, share_token } = lead
    expect(leadId).toBeTruthy()
    expect(share_token).toBeTruthy()

    const patchProperty = await request.patch(`/api/leads/${leadId}/intake`, {
      data: {
        current_step: 3,
        property: {
          street_address: '200 Oak Lane',
          city: 'Tupelo',
          state: 'MS',
          zip_code: '38801',
        },
        intake: {
          job_type: 'full_replacement',
          roof_material: 'asphalt_shingle',
          roof_size_sqft: 2200,
          roof_pitch: 'medium',
        },
      },
    })
    expect(patchProperty.ok(), 'intake PATCH').toBe(true)

    const patchContact = await request.patch(`/api/leads/${leadId}/intake`, {
      data: {
        current_step: 4,
        contact: {
          first_name: 'Playwright',
          email: `playwright+${Date.now()}@example.com`,
          phone: '(662) 555-0100',
          preferred_contact_method: 'email',
          consent_terms: true,
        },
      },
    })
    expect(patchContact.ok(), 'contact PATCH').toBe(true)

    const estimate = await request.post(`/api/leads/${leadId}/estimate`, { data: {} })
    expect(estimate.ok(), 'estimate POST').toBe(true)
    const estimateJson = await estimate.json()
    expect(estimateJson.price_low).toBeGreaterThan(0)
    expect(estimateJson.price_likely).toBeGreaterThan(estimateJson.price_low)
    expect(estimateJson.price_high).toBeGreaterThan(estimateJson.price_likely)

    // Public shared estimate — what a spouse / adjuster sees
    await page.goto(`/estimate/${share_token}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Estimate is Ready/i)
    const h1s = await page.locator('h1').count()
    expect(h1s).toBe(1)
    await expect(page.getByText(/Your Estimated Cost/i)).toBeVisible()
  })
})

test.describe('Screenshots — visual regression baseline', () => {
  const SCREENSHOT_PAGES = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/contact',
    '/financing',
    '/insurance-help',
    '/assistance-programs',
    '/portfolio',
    '/service-areas',
    '/blog',
    '/tupelo-roofing',
  ]

  /**
   * Scroll through the entire page, pausing so each IntersectionObserver
   * fires and opacity-0 elements become visible. Without this, a fullPage
   * screenshot captures all the off-screen sections still at opacity-0.
   */
  async function scrollAndSettle(page: import('@playwright/test').Page) {
    await page.evaluate(async () => {
      await new Promise<void>(resolve => {
        const totalHeight = document.body.scrollHeight
        let y = 0
        const step = 400
        const tick = () => {
          window.scrollTo(0, y)
          y += step
          if (y < totalHeight) {
            setTimeout(tick, 60)
          } else {
            window.scrollTo(0, 0)
            setTimeout(resolve, 300)
          }
        }
        tick()
      })
    })
    // Wait past the 2s ScrollAnimate safety timer so any laggard reveal fires
    await page.waitForTimeout(2200)
  }

  // Apply reduced-motion via browser context option so the global CSS
  // short-circuits scroll animations to their final visible state.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const path of SCREENSHOT_PAGES) {
    test(`desktop screenshot ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(path, { waitUntil: 'networkidle' })
      await scrollAndSettle(page)
      const safe = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')
      await page.screenshot({
        path: `screenshots/desktop-${safe}.png`,
        fullPage: true,
      })
    })

    test(`mobile screenshot ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(path, { waitUntil: 'networkidle' })
      await scrollAndSettle(page)
      const safe = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')
      await page.screenshot({
        path: `screenshots/mobile-${safe}.png`,
        fullPage: true,
      })
    })
  }
})
