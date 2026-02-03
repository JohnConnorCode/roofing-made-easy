import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllCredentialStatus } from '@/lib/credentials/loader'
import { isEncryptionConfigured } from '@/lib/crypto/encryption'
import { getServiceFields } from '@/lib/integrations/testers'

export interface IntegrationStatus {
  name: string
  id: string
  configured: boolean
  configuredVia: 'db' | 'env' | 'none'
  description: string
  envVars: string[]
  docsUrl?: string
  keyHint?: string
  lastTestedAt?: string
  lastTestSuccess?: boolean
  lastTestError?: string
  fields: Array<{
    key: string
    label: string
    required: boolean
    placeholder: string
    sensitive: boolean
  }>
}

export async function GET() {
  // Require admin authentication
  const { error } = await requireAdmin()
  if (error) return error

  // Get credential status from DB/ENV
  const credentialStatus = await getAllCredentialStatus()

  // Get additional info from database
  let dbCredentials: Record<string, {
    key_hint?: string
    last_tested_at?: string
    last_test_success?: boolean
    last_test_error?: string
  }> = {}

  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('api_credentials' as never)
      .select('service_id, key_hint, last_tested_at, last_test_success, last_test_error')

    if (data) {
      for (const row of data as Array<{
        service_id: string
        key_hint: string
        last_tested_at: string
        last_test_success: boolean
        last_test_error: string
      }>) {
        dbCredentials[row.service_id] = {
          key_hint: row.key_hint,
          last_tested_at: row.last_tested_at,
          last_test_success: row.last_test_success,
          last_test_error: row.last_test_error,
        }
      }
    }
  } catch {
    // If table doesn't exist yet, continue with empty data
  }

  const integrations: IntegrationStatus[] = [
    {
      name: 'Resend (Email)',
      id: 'resend',
      configured: credentialStatus.resend.configured,
      configuredVia: credentialStatus.resend.source,
      description: 'Send transactional emails to customers and admins',
      envVars: ['RESEND_API_KEY'],
      docsUrl: 'https://resend.com/docs',
      keyHint: dbCredentials['resend']?.key_hint,
      lastTestedAt: dbCredentials['resend']?.last_tested_at,
      lastTestSuccess: dbCredentials['resend']?.last_test_success,
      lastTestError: dbCredentials['resend']?.last_test_error,
      fields: getServiceFields('resend'),
    },
    {
      name: 'Stripe (Payments)',
      id: 'stripe',
      configured: credentialStatus.stripe.configured,
      configuredVia: credentialStatus.stripe.source,
      description: 'Accept deposits and payments from customers',
      envVars: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
      docsUrl: 'https://stripe.com/docs',
      keyHint: dbCredentials['stripe']?.key_hint,
      lastTestedAt: dbCredentials['stripe']?.last_tested_at,
      lastTestSuccess: dbCredentials['stripe']?.last_test_success,
      lastTestError: dbCredentials['stripe']?.last_test_error,
      fields: getServiceFields('stripe'),
    },
    {
      name: 'Twilio (SMS)',
      id: 'twilio',
      configured: credentialStatus.twilio.configured,
      configuredVia: credentialStatus.twilio.source,
      description: 'Send SMS notifications to customers',
      envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
      docsUrl: 'https://www.twilio.com/docs',
      keyHint: dbCredentials['twilio']?.key_hint,
      lastTestedAt: dbCredentials['twilio']?.last_tested_at,
      lastTestSuccess: dbCredentials['twilio']?.last_test_success,
      lastTestError: dbCredentials['twilio']?.last_test_error,
      fields: getServiceFields('twilio'),
    },
    {
      name: 'OpenAI (AI Features)',
      id: 'openai',
      configured: credentialStatus.openai.configured,
      configuredVia: credentialStatus.openai.source,
      description: 'Generate estimate explanations and analyze photos',
      envVars: ['OPENAI_API_KEY'],
      docsUrl: 'https://platform.openai.com/docs',
      keyHint: dbCredentials['openai']?.key_hint,
      lastTestedAt: dbCredentials['openai']?.last_tested_at,
      lastTestSuccess: dbCredentials['openai']?.last_test_success,
      lastTestError: dbCredentials['openai']?.last_test_error,
      fields: getServiceFields('openai'),
    },
    {
      name: 'Supabase',
      id: 'supabase',
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      configuredVia: 'env', // Supabase is always configured via ENV (required for this to work)
      description: 'Database, authentication, and storage',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
      docsUrl: 'https://supabase.com/docs',
      fields: [], // Not configurable via UI
    },
  ]

  const configuredCount = integrations.filter(i => i.configured).length
  const totalCount = integrations.length

  return NextResponse.json({
    integrations,
    summary: {
      configured: configuredCount,
      total: totalCount,
      allConfigured: configuredCount === totalCount,
    },
    encryptionConfigured: isEncryptionConfigured(),
  })
}
