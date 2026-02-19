/**
 * API Credentials Management Endpoint
 *
 * PUT /api/admin/integrations/[serviceId]/credentials - Save encrypted credentials
 * DELETE /api/admin/integrations/[serviceId]/credentials - Remove DB credentials
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { encrypt, maskKey, isEncryptionConfigured } from '@/lib/crypto/encryption'
import { invalidateCredentialCache } from '@/lib/credentials/loader'
import { getServiceFields } from '@/lib/integrations/testers'
import { logger } from '@/lib/logger'

// Valid service IDs
const VALID_SERVICES = ['resend', 'stripe', 'twilio', 'openai'] as const
type ServiceId = (typeof VALID_SERVICES)[number]

function isValidServiceId(id: string): id is ServiceId {
  return VALID_SERVICES.includes(id as ServiceId)
}

interface RouteContext {
  params: Promise<{ serviceId: string }>
}

/**
 * PUT - Save encrypted credentials
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  // Require admin authentication
  const { user, error: authError } = await requireAdmin()
  if (authError) return authError

  // Validate service ID
  const params = await context.params
  const serviceId = params.serviceId
  if (!isValidServiceId(serviceId)) {
    return NextResponse.json(
      { error: `Invalid service ID: ${serviceId}` },
      { status: 400 }
    )
  }

  // Check encryption is configured
  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      {
        error: 'Encryption not configured',
        details:
          'Set API_KEYS_ENCRYPTION_KEY environment variable. Generate with: openssl rand -base64 32',
      },
      { status: 500 }
    )
  }

  // Parse request body
  let credentials: Record<string, string>
  try {
    credentials = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields
  const fields = getServiceFields(serviceId)
  const requiredFields = fields.filter((f) => f.required)
  const missingFields = requiredFields.filter((f) => !credentials[f.key])

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required fields',
        fields: missingFields.map((f) => f.label),
      },
      { status: 400 }
    )
  }

  try {
    // Encrypt credentials
    const encryptedKey = encrypt(JSON.stringify(credentials))

    // Get key hint (last 4 chars of primary key)
    const primaryField = fields.find((f) => f.key === 'apiKey' || f.key === 'secretKey')
    const primaryKey = primaryField ? credentials[primaryField.key] : Object.values(credentials)[0]
    const keyHint = maskKey(primaryKey || '')

    // Update in database
    const supabase = await createAdminClient()
    const { error: dbError } = await supabase
      .from('api_credentials')
      .update({
        encrypted_key: encryptedKey,
        key_hint: keyHint,
        configured_by: user!.id,
        configured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('service_id', serviceId)

    if (dbError) {
      logger.error('Database error saving credentials', { error: String(dbError) })
      return NextResponse.json(
        { error: 'Failed to save credentials' },
        { status: 500 }
      )
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'credentials_updated',
      table_name: 'api_credentials',
      record_id: serviceId,
      details: {
        service: serviceId,
        key_hint: keyHint,
      },
      user_id: user!.id,
      user_email: user!.email,
    } as never)

    // Invalidate cache
    invalidateCredentialCache(serviceId)

    return NextResponse.json({
      success: true,
      keyHint,
      message: `${serviceId} credentials saved successfully`,
    })
  } catch (error) {
    logger.error('Error saving credentials', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove DB credentials (revert to ENV vars)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  // Require admin authentication
  const { user, error: authError } = await requireAdmin()
  if (authError) return authError

  // Validate service ID
  const params = await context.params
  const serviceId = params.serviceId
  if (!isValidServiceId(serviceId)) {
    return NextResponse.json(
      { error: `Invalid service ID: ${serviceId}` },
      { status: 400 }
    )
  }

  try {
    // Clear credentials in database
    const supabase = await createAdminClient()
    const { error: dbError } = await supabase
      .from('api_credentials')
      .update({
        encrypted_key: '',
        key_hint: '',
        configured_by: null,
        configured_at: null,
        last_tested_at: null,
        last_test_success: null,
        last_test_error: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('service_id', serviceId)

    if (dbError) {
      logger.error('Database error clearing credentials', { error: String(dbError) })
      return NextResponse.json(
        { error: 'Failed to clear credentials' },
        { status: 500 }
      )
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'credentials_removed',
      table_name: 'api_credentials',
      record_id: serviceId,
      details: {
        service: serviceId,
      },
      user_id: user!.id,
      user_email: user!.email,
    } as never)

    // Invalidate cache
    invalidateCredentialCache(serviceId)

    return NextResponse.json({
      success: true,
      message: `${serviceId} credentials removed. Will fall back to environment variables if configured.`,
    })
  } catch (error) {
    logger.error('Error clearing credentials', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to clear credentials' },
      { status: 500 }
    )
  }
}
