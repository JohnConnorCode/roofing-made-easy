import { describe, it, expect } from 'vitest'
import { createLeadSchema } from '../schemas'

describe('createLeadSchema', () => {
  it('accepts a minimal valid body (empty object)', () => {
    const result = createLeadSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts source and valid referrerUrl', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
      referrerUrl: 'https://google.com/search?q=roofing',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.referrerUrl).toBe('https://google.com/search?q=roofing')
    }
  })

  it('accepts empty string referrerUrl (document.referrer when no referrer)', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
      referrerUrl: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts undefined referrerUrl', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
      referrerUrl: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('accepts missing referrerUrl key entirely', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid referrerUrl that is not a URL or empty', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
      referrerUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all optional UTM fields', () => {
    const result = createLeadSchema.safeParse({
      source: 'google_ads',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'spring_sale',
      referrerUrl: 'https://ads.google.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.utmSource).toBe('google')
      expect(result.data.utmMedium).toBe('cpc')
      expect(result.data.utmCampaign).toBe('spring_sale')
    }
  })

  it('strips unknown fields', () => {
    const result = createLeadSchema.safeParse({
      source: 'web_funnel',
      malicious: '<script>alert("xss")</script>',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>).malicious).toBeUndefined()
    }
  })
})
