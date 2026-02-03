/**
 * Credential Loader
 *
 * Loads API credentials from database (with fallback to environment variables).
 * Includes 1-minute caching to avoid DB round-trips on every request.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { decrypt, isEncryptionConfigured } from '@/lib/crypto/encryption'

// Credential types for each service
export interface ResendCredentials {
  apiKey: string
}

export interface StripeCredentials {
  secretKey: string
  publishableKey?: string
  webhookSecret?: string
}

export interface TwilioCredentials {
  accountSid: string
  authToken: string
  phoneNumber: string
}

export interface OpenAICredentials {
  apiKey: string
}

// Cache structure
interface CacheEntry<T> {
  data: T | null
  timestamp: number
  source: 'db' | 'env' | 'none'
}

// Cache TTL: 1 minute
const CACHE_TTL_MS = 60 * 1000

// In-memory cache
const credentialCache = new Map<string, CacheEntry<unknown>>()

/**
 * Get cached credentials or fetch from DB
 */
async function getCachedCredentials<T>(
  serviceId: string,
  envFallback: () => T | null,
  parseDbCredentials: (json: Record<string, string>) => T
): Promise<{ credentials: T | null; source: 'db' | 'env' | 'none' }> {
  // Check cache first
  const cached = credentialCache.get(serviceId) as CacheEntry<T> | undefined
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { credentials: cached.data, source: cached.source }
  }

  // Check if encryption is configured (required for DB credentials)
  if (!isEncryptionConfigured()) {
    // Fall back to env vars only
    const envCreds = envFallback()
    const source = envCreds ? 'env' : 'none'
    credentialCache.set(serviceId, {
      data: envCreds,
      timestamp: Date.now(),
      source,
    })
    return { credentials: envCreds, source }
  }

  try {
    // Try to fetch from database
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('api_credentials' as never)
      .select('encrypted_key')
      .eq('service_id', serviceId)
      .single()

    if (error || !data) {
      // DB fetch failed, use env fallback
      const envCreds = envFallback()
      const source = envCreds ? 'env' : 'none'
      credentialCache.set(serviceId, {
        data: envCreds,
        timestamp: Date.now(),
        source,
      })
      return { credentials: envCreds, source }
    }

    const row = data as { encrypted_key: string }

    // Check if DB has credentials configured
    if (row.encrypted_key) {
      try {
        const decrypted = decrypt(row.encrypted_key)
        const parsed = JSON.parse(decrypted) as Record<string, string>
        const dbCreds = parseDbCredentials(parsed)

        // DB credentials found - cache and return
        credentialCache.set(serviceId, {
          data: dbCreds,
          timestamp: Date.now(),
          source: 'db',
        })
        return { credentials: dbCreds, source: 'db' }
      } catch {
        // Decryption or parsing failed, use env fallback
        console.error(`Failed to decrypt credentials for ${serviceId}`)
      }
    }

    // No DB credentials, use env fallback
    const envCreds = envFallback()
    const source = envCreds ? 'env' : 'none'
    credentialCache.set(serviceId, {
      data: envCreds,
      timestamp: Date.now(),
      source,
    })
    return { credentials: envCreds, source }
  } catch (error) {
    // DB error, use env fallback
    console.error(`Error fetching credentials for ${serviceId}:`, error)
    const envCreds = envFallback()
    const source = envCreds ? 'env' : 'none'
    credentialCache.set(serviceId, {
      data: envCreds,
      timestamp: Date.now(),
      source,
    })
    return { credentials: envCreds, source }
  }
}

/**
 * Invalidate cache for a specific service (call after saving credentials)
 */
export function invalidateCredentialCache(serviceId?: string): void {
  if (serviceId) {
    credentialCache.delete(serviceId)
  } else {
    credentialCache.clear()
  }
}

/**
 * Get Resend credentials
 */
export async function getResendCredentials(): Promise<{
  credentials: ResendCredentials | null
  source: 'db' | 'env' | 'none'
}> {
  return getCachedCredentials<ResendCredentials>(
    'resend',
    () => {
      const apiKey = process.env.RESEND_API_KEY
      return apiKey ? { apiKey } : null
    },
    (json) => ({
      apiKey: json.apiKey || json.api_key,
    })
  )
}

/**
 * Get Stripe credentials
 */
export async function getStripeCredentials(): Promise<{
  credentials: StripeCredentials | null
  source: 'db' | 'env' | 'none'
}> {
  return getCachedCredentials<StripeCredentials>(
    'stripe',
    () => {
      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) return null
      return {
        secretKey,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      }
    },
    (json) => ({
      secretKey: json.secretKey || json.secret_key,
      publishableKey: json.publishableKey || json.publishable_key,
      webhookSecret: json.webhookSecret || json.webhook_secret,
    })
  )
}

/**
 * Get Twilio credentials
 */
export async function getTwilioCredentials(): Promise<{
  credentials: TwilioCredentials | null
  source: 'db' | 'env' | 'none'
}> {
  return getCachedCredentials<TwilioCredentials>(
    'twilio',
    () => {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER
      if (!accountSid || !authToken || !phoneNumber) return null
      return { accountSid, authToken, phoneNumber }
    },
    (json) => ({
      accountSid: json.accountSid || json.account_sid,
      authToken: json.authToken || json.auth_token,
      phoneNumber: json.phoneNumber || json.phone_number,
    })
  )
}

/**
 * Get OpenAI credentials
 */
export async function getOpenAICredentials(): Promise<{
  credentials: OpenAICredentials | null
  source: 'db' | 'env' | 'none'
}> {
  return getCachedCredentials<OpenAICredentials>(
    'openai',
    () => {
      const apiKey = process.env.OPENAI_API_KEY
      return apiKey ? { apiKey } : null
    },
    (json) => ({
      apiKey: json.apiKey || json.api_key,
    })
  )
}

/**
 * Check if any credentials are configured for a service
 */
export async function isServiceConfigured(
  serviceId: 'resend' | 'stripe' | 'twilio' | 'openai'
): Promise<{ configured: boolean; source: 'db' | 'env' | 'none' }> {
  let result: { credentials: unknown; source: 'db' | 'env' | 'none' }

  switch (serviceId) {
    case 'resend':
      result = await getResendCredentials()
      break
    case 'stripe':
      result = await getStripeCredentials()
      break
    case 'twilio':
      result = await getTwilioCredentials()
      break
    case 'openai':
      result = await getOpenAICredentials()
      break
    default:
      return { configured: false, source: 'none' }
  }

  return {
    configured: result.credentials !== null,
    source: result.source,
  }
}

/**
 * Get credential status for all services
 */
export async function getAllCredentialStatus(): Promise<
  Record<
    'resend' | 'stripe' | 'twilio' | 'openai',
    { configured: boolean; source: 'db' | 'env' | 'none' }
  >
> {
  const [resend, stripe, twilio, openai] = await Promise.all([
    isServiceConfigured('resend'),
    isServiceConfigured('stripe'),
    isServiceConfigured('twilio'),
    isServiceConfigured('openai'),
  ])

  return { resend, stripe, twilio, openai }
}
