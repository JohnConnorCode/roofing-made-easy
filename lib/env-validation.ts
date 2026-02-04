/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set at startup.
 * Run this early in the application lifecycle to fail fast.
 */

interface EnvVar {
  name: string
  required: boolean
  description: string
}

// Define all environment variables used by the application
const ENV_VARS: EnvVar[] = [
  // Supabase - Required
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key' },

  // AI - Required for AI features
  { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for AI features' },

  // Google - Required for address autocomplete
  { name: 'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY', required: false, description: 'Google Places API key' },

  // Base URL - Required for email links
  { name: 'NEXT_PUBLIC_BASE_URL', required: true, description: 'Base URL for the application' },

  // Email - Required for email notifications
  { name: 'RESEND_API_KEY', required: false, description: 'Resend API key for emails' },

  // Payments - Required for payment processing
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook secret' },

  // SMS - Required for SMS notifications
  { name: 'TWILIO_ACCOUNT_SID', required: false, description: 'Twilio account SID' },
  { name: 'TWILIO_AUTH_TOKEN', required: false, description: 'Twilio auth token' },
  { name: 'TWILIO_PHONE_NUMBER', required: false, description: 'Twilio phone number' },

  // Cron - Required for scheduled tasks
  { name: 'CRON_SECRET', required: false, description: 'Secret for cron job authentication' },

  // Encryption - Required for API key storage
  { name: 'API_KEYS_ENCRYPTION_KEY', required: false, description: 'Encryption key for API credentials' },
]

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`Missing required env var: ${envVar.name} - ${envVar.description}`)
      } else if (isProduction) {
        warnings.push(`Missing optional env var: ${envVar.name} - ${envVar.description}`)
      }
    }
  }

  // Additional validation for specific variables
  if (process.env.API_KEYS_ENCRYPTION_KEY) {
    // Check if encryption key is valid base64 and proper length
    try {
      const decoded = Buffer.from(process.env.API_KEYS_ENCRYPTION_KEY, 'base64')
      if (decoded.length < 32) {
        errors.push('API_KEYS_ENCRYPTION_KEY must be at least 32 bytes (use: openssl rand -base64 32)')
      }
    } catch {
      errors.push('API_KEYS_ENCRYPTION_KEY must be valid base64 (use: openssl rand -base64 32)')
    }
  }

  if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 32) {
    warnings.push('CRON_SECRET should be at least 32 characters for security')
  }

  if (process.env.NEXT_PUBLIC_BASE_URL?.endsWith('/')) {
    warnings.push('NEXT_PUBLIC_BASE_URL should not have a trailing slash')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Run validation and log results
 * Call this at application startup
 */
export function runEnvValidation(): void {
  const result = validateEnv()

  if (result.errors.length > 0) {
    console.error('\n' + '='.repeat(60))
    console.error('ENVIRONMENT VARIABLE ERRORS')
    console.error('='.repeat(60))
    result.errors.forEach((error) => console.error(`  ❌ ${error}`))
    console.error('='.repeat(60) + '\n')

    // In production, throw to prevent startup with missing critical vars
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.errors.join(', ')}`)
    }
  }

  if (result.warnings.length > 0) {
    console.warn('\n' + '='.repeat(60))
    console.warn('ENVIRONMENT VARIABLE WARNINGS')
    console.warn('='.repeat(60))
    result.warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`))
    console.warn('='.repeat(60) + '\n')
  }
}

/**
 * Check if a specific feature is configured
 */
export function isFeatureConfigured(feature: 'email' | 'sms' | 'payments' | 'ai' | 'cron'): boolean {
  switch (feature) {
    case 'email':
      return !!process.env.RESEND_API_KEY
    case 'sms':
      return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
    case 'payments':
      return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
    case 'ai':
      return !!process.env.OPENAI_API_KEY
    case 'cron':
      return !!process.env.CRON_SECRET
    default:
      return false
  }
}
