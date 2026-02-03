/**
 * Tests for integration connection testers
 */

import { describe, it, expect } from 'vitest'
import {
  testServiceConnection,
  getServiceFields,
} from '@/lib/integrations/testers'

describe('integration testers', () => {
  describe('testServiceConnection - input validation', () => {
    it('returns error for missing required fields - resend', async () => {
      const result = await testServiceConnection('resend', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('API key is required')
    })

    it('returns error for missing required fields - stripe', async () => {
      const result = await testServiceConnection('stripe', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Secret key is required')
    })

    it('returns error for missing required fields - twilio (partial)', async () => {
      const result = await testServiceConnection('twilio', { accountSid: 'AC123' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Account SID, Auth Token, and Phone Number are all required')
    })

    it('returns error for missing required fields - twilio (empty)', async () => {
      const result = await testServiceConnection('twilio', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Account SID, Auth Token, and Phone Number are all required')
    })

    it('returns error for missing required fields - openai', async () => {
      const result = await testServiceConnection('openai', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('API key is required')
    })

    it('returns error for unknown service', async () => {
      const result = await testServiceConnection('unknown' as never, {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown service')
    })
  })

  describe('getServiceFields', () => {
    it('returns correct fields for resend', () => {
      const fields = getServiceFields('resend')

      expect(fields).toHaveLength(1)
      expect(fields[0]).toEqual({
        key: 'apiKey',
        label: 'API Key',
        required: true,
        placeholder: 're_xxxxxxxxxx',
        sensitive: true,
      })
    })

    it('returns correct fields for stripe', () => {
      const fields = getServiceFields('stripe')

      expect(fields).toHaveLength(3)
      expect(fields.map((f) => f.key)).toEqual(['secretKey', 'publishableKey', 'webhookSecret'])

      // Secret key required
      expect(fields[0].required).toBe(true)
      expect(fields[0].sensitive).toBe(true)

      // Publishable key optional, not sensitive
      expect(fields[1].required).toBe(false)
      expect(fields[1].sensitive).toBe(false)

      // Webhook secret optional, sensitive
      expect(fields[2].required).toBe(false)
      expect(fields[2].sensitive).toBe(true)
    })

    it('returns correct fields for twilio', () => {
      const fields = getServiceFields('twilio')

      expect(fields).toHaveLength(3)
      expect(fields.map((f) => f.key)).toEqual(['accountSid', 'authToken', 'phoneNumber'])

      // All required
      expect(fields.every((f) => f.required)).toBe(true)

      // Account SID not sensitive, auth token sensitive, phone not sensitive
      expect(fields[0].sensitive).toBe(false)
      expect(fields[1].sensitive).toBe(true)
      expect(fields[2].sensitive).toBe(false)
    })

    it('returns correct fields for openai', () => {
      const fields = getServiceFields('openai')

      expect(fields).toHaveLength(1)
      expect(fields[0]).toEqual({
        key: 'apiKey',
        label: 'API Key',
        required: true,
        placeholder: 'sk-xxxxxxxxxx',
        sensitive: true,
      })
    })

    it('returns empty array for unknown service', () => {
      const fields = getServiceFields('unknown' as never)

      expect(fields).toEqual([])
    })
  })

  describe('field placeholders', () => {
    it('has appropriate placeholder formats', () => {
      const resendFields = getServiceFields('resend')
      const stripeFields = getServiceFields('stripe')
      const twilioFields = getServiceFields('twilio')
      const openaiFields = getServiceFields('openai')

      // Resend starts with re_
      expect(resendFields[0].placeholder).toMatch(/^re_/)

      // Stripe secret key starts with sk_
      expect(stripeFields[0].placeholder).toMatch(/^sk_/)

      // Stripe publishable key starts with pk_
      expect(stripeFields[1].placeholder).toMatch(/^pk_/)

      // Stripe webhook secret starts with whsec_
      expect(stripeFields[2].placeholder).toMatch(/^whsec_/)

      // Twilio account SID starts with AC
      expect(twilioFields[0].placeholder).toMatch(/^AC/)

      // Twilio phone number starts with +
      expect(twilioFields[2].placeholder).toMatch(/^\+/)

      // OpenAI starts with sk-
      expect(openaiFields[0].placeholder).toMatch(/^sk-/)
    })
  })
})
