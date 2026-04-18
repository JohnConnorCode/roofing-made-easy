import { test } from '@playwright/test'

test('homepage section visibility diagnostic', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })

  // Scroll through
  await page.evaluate(async () => {
    await new Promise<void>(resolve => {
      const total = document.body.scrollHeight
      let y = 0
      const tick = () => {
        window.scrollTo(0, y)
        y += 400
        if (y < total) setTimeout(tick, 80)
        else setTimeout(resolve, 400)
      }
      tick()
    })
  })
  await page.waitForTimeout(500)

  const sections = await page.evaluate(() => {
    const out: Array<{ tag: string; id: string; ariaLabel: string; top: number; height: number; opacity: string; text: string }> = []
    document.querySelectorAll('section, main > div, main > *').forEach(el => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      if (rect.height > 50) {
        out.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          ariaLabel: el.getAttribute('aria-label') || '',
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
          opacity: style.opacity,
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
        })
      }
    })
    return out
  })

  console.log('\n=== Section layout ===')
  for (const s of sections) {
    console.log(
      `  ${s.tag}#${s.id || '-'} [${s.ariaLabel || '-'}] top=${s.top} h=${s.height} opacity=${s.opacity}`
    )
    console.log(`    text: ${s.text}`)
  }

  // Look specifically for ScrollAnimate-wrapped divs still at opacity-0
  const invisibleCount = await page.evaluate(() => {
    let hidden = 0
    document.querySelectorAll('[class*="opacity-0"]').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.height > 10) hidden++
    })
    return hidden
  })
  console.log(`\n  Still-hidden elements (opacity-0) with height > 10px: ${invisibleCount}`)
})
