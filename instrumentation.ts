/**
 * Next.js Instrumentation
 * Runs when the Next.js server starts up
 * Used for startup validation and monitoring setup
 */

export async function register() {
  // Only validate in production runtime (not during build)
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    validateProductionEnv()
  }
}

/**
 * Validate critical environment variables in production
 * Fails fast with clear error messages
 */
function validateProductionEnv() {
  const errors: string[] = []
  const warnings: string[] = []

  // Supabase - Required for database access (fatal if missing)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  // Important but non-fatal vars (warn, don't crash)
  if (!process.env.CRON_SECRET) {
    warnings.push('CRON_SECRET not set - cron endpoints will be insecure')
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    warnings.push('NEXT_PUBLIC_BASE_URL not set - email links may be broken')
  }

  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set - AI features will be disabled')
  }

  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY not set - Email sending will be disabled')
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    warnings.push('Twilio credentials not set - SMS sending will be disabled')
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('[Startup] Environment warnings:')
    warnings.forEach(w => console.warn(`  - ${w}`))
  }

  // Fail on critical errors
  if (errors.length > 0) {
    console.error('='.repeat(60))
    console.error('FATAL: Missing required environment variables')
    console.error('='.repeat(60))
    errors.forEach(e => console.error(`  ✗ ${e}`))
    console.error('='.repeat(60))
    console.error('The application cannot start without these variables.')
    console.error('Please configure them in your environment or Vercel dashboard.')
    console.error('='.repeat(60))

    // In production, throw to prevent startup
    throw new Error(`Missing required environment variables: ${errors.join(', ')}`)
  }

  console.log('[Startup] Environment validation passed')
}
