import { test } from '@playwright/test'

/**
 * Diagnostic-only — prints every console error and network failure on
 * each page so we can see what's actually wrong.
 */
const pages = ['/services', '/pricing', '/portfolio', '/service-areas', '/blog']

for (const path of pages) {
  test(`diagnose: ${path}`, async ({ page }) => {
    const errors: string[] = []
    const failedRequests: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
    })
    page.on('pageerror', err => {
      errors.push(`[pageerror] ${err.message}`)
    })
    page.on('requestfailed', req => {
      failedRequests.push(`[failed] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`)
    })

    await page.goto(path, { waitUntil: 'networkidle' })

    console.log(`\n====== ${path} ======`)
    if (errors.length === 0 && failedRequests.length === 0) {
      console.log('  (no errors)')
    }
    for (const e of errors) console.log(e)
    for (const e of failedRequests) console.log(e)
  })
}
