import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureConfigured } from '@/lib/env-validation'

/**
 * Health Check Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used for monitoring, load balancer checks, and debugging.
 */
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'degraded' | 'error'; message?: string }> = {}

  // Check database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').select('id').limit(1)
    if (error) {
      checks.database = { status: 'error', message: error.message }
    } else {
      checks.database = { status: 'ok' }
    }
  } catch (err) {
    checks.database = {
      status: 'error',
      message: err instanceof Error ? err.message : 'Connection failed'
    }
  }

  // Check feature configurations
  checks.email = {
    status: isFeatureConfigured('email') ? 'ok' : 'degraded',
    message: isFeatureConfigured('email') ? undefined : 'Email not configured',
  }

  checks.sms = {
    status: isFeatureConfigured('sms') ? 'ok' : 'degraded',
    message: isFeatureConfigured('sms') ? undefined : 'SMS not configured',
  }

  checks.payments = {
    status: isFeatureConfigured('payments') ? 'ok' : 'degraded',
    message: isFeatureConfigured('payments') ? undefined : 'Payments not configured',
  }

  checks.ai = {
    status: isFeatureConfigured('ai') ? 'ok' : 'degraded',
    message: isFeatureConfigured('ai') ? undefined : 'AI features not configured',
  }

  checks.cron = {
    status: isFeatureConfigured('cron') ? 'ok' : 'degraded',
    message: isFeatureConfigured('cron') ? undefined : 'Cron jobs not secured',
  }

  // Determine overall status
  const hasError = Object.values(checks).some(c => c.status === 'error')
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded')

  const overallStatus = hasError ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy'
  const responseTime = Date.now() - startTime

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'development',
    checks,
  }, {
    status: hasError ? 503 : 200,
  })
}
