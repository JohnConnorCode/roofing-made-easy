/**
 * Tests for credential loader
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}))

// Mock encryption
vi.mock('@/lib/crypto/encryption', () => ({
  decrypt: vi.fn((ciphertext: string) => ciphertext), // Pass through for testing
  isEncryptionConfigured: vi.fn(() => true),
}))

describe('credential loader', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear cache between tests
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('getResendCredentials', () => {
    it('returns env credentials when RESEND_API_KEY is set', async () => {
      process.env.RESEND_API_KEY = 'env-resend-key'

      // Mock Supabase to return no DB credentials
      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getResendCredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      // Clear cache
      invalidateCredentialCache()

      const result = await getResendCredentials()

      expect(result.credentials).toEqual({ apiKey: 'env-resend-key' })
      expect(result.source).toBe('env')
    })

    it('returns null when no credentials configured', async () => {
      delete process.env.RESEND_API_KEY

      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getResendCredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      invalidateCredentialCache()

      const result = await getResendCredentials()

      expect(result.credentials).toBeNull()
      expect(result.source).toBe('none')
    })
  })

  describe('getStripeCredentials', () => {
    it('returns env credentials when STRIPE_SECRET_KEY is set', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_456'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_789'

      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getStripeCredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      invalidateCredentialCache()

      const result = await getStripeCredentials()

      expect(result.credentials).toEqual({
        secretKey: 'sk_test_123',
        publishableKey: 'pk_test_456',
        webhookSecret: 'whsec_789',
      })
      expect(result.source).toBe('env')
    })
  })

  describe('getTwilioCredentials', () => {
    it('returns env credentials when all Twilio vars are set', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123'
      process.env.TWILIO_AUTH_TOKEN = 'token456'
      process.env.TWILIO_PHONE_NUMBER = '+15551234567'

      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getTwilioCredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      invalidateCredentialCache()

      const result = await getTwilioCredentials()

      expect(result.credentials).toEqual({
        accountSid: 'AC123',
        authToken: 'token456',
        phoneNumber: '+15551234567',
      })
      expect(result.source).toBe('env')
    })

    it('returns null when Twilio vars are incomplete', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123'
      delete process.env.TWILIO_AUTH_TOKEN
      delete process.env.TWILIO_PHONE_NUMBER

      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getTwilioCredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      invalidateCredentialCache()

      const result = await getTwilioCredentials()

      expect(result.credentials).toBeNull()
      expect(result.source).toBe('none')
    })
  })

  describe('getOpenAICredentials', () => {
    it('returns env credentials when OPENAI_API_KEY is set', async () => {
      process.env.OPENAI_API_KEY = 'sk-openai-123'

      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { encrypted_key: '' }, error: null }),
            }),
          }),
        }),
      } as never)

      const { getOpenAICredentials, invalidateCredentialCache } = await import(
        '@/lib/credentials/loader'
      )

      invalidateCredentialCache()

      const result = await getOpenAICredentials()

      expect(result.credentials).toEqual({ apiKey: 'sk-openai-123' })
      expect(result.source).toBe('env')
    })
  })

  describe('invalidateCredentialCache', () => {
    it('clears cache for specific service', async () => {
      const { invalidateCredentialCache } = await import('@/lib/credentials/loader')

      // Should not throw
      expect(() => invalidateCredentialCache('resend')).not.toThrow()
    })

    it('clears all cache when no service specified', async () => {
      const { invalidateCredentialCache } = await import('@/lib/credentials/loader')

      // Should not throw
      expect(() => invalidateCredentialCache()).not.toThrow()
    })
  })
})
