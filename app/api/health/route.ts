import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureConfigured } from '@/lib/env-validation'

/**
 * Health Check Endpoint
 *
 * Public: Returns overall status only (for load balancers).
 * Admin: Returns detailed checks (pass ?detail=1 with admin auth).
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  const url = new URL(request.url)
  const wantsDetail = url.searchParams.get('detail') === '1'

  // Single client for both auth check and DB ping
  const supabase = await createClient()

  let isAdmin = false
  if (wantsDetail) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const role = user.user_metadata?.role || user.app_metadata?.role
        isAdmin = role === 'admin'
      }
    } catch {
      // Not admin
    }
  }

  // Database health check
  let dbOk = false
  let dbMessage: string | undefined
  try {
    const { error } = await supabase.from('leads').select('id').limit(1)
    dbOk = !error
    if (error) dbMessage = error.message
  } catch (err) {
    dbMessage = err instanceof Error ? err.message : 'Connection failed'
  }

  const responseTime = Date.now() - startTime
  const overallStatus = dbOk ? 'healthy' : 'unhealthy'

  // Public response: minimal info
  if (!isAdmin) {
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    }, {
      status: dbOk ? 200 : 503,
    })
  }

  // Admin response: detailed checks
  const checks: Record<string, { status: 'ok' | 'degraded' | 'error'; message?: string }> = {}

  checks.database = dbOk
    ? { status: 'ok' }
    : { status: 'error', message: dbMessage }

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

  const hasError = Object.values(checks).some(c => c.status === 'error')
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded')

  return NextResponse.json({
    status: hasError ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'development',
    checks,
  }, {
    status: hasError ? 503 : 200,
  })
}
