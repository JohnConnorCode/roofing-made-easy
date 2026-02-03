/**
 * API Connection Test Endpoint
 *
 * POST /api/admin/integrations/[serviceId]/test - Test credentials before saving
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { testServiceConnection, getServiceFields } from '@/lib/integrations/testers'

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
 * POST - Test credentials before saving
 */
export async function POST(request: NextRequest, context: RouteContext) {
  // Require admin authentication
  const { error: authError } = await requireAdmin()
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
        success: false,
        error: 'Missing required fields',
        fields: missingFields.map((f) => f.label),
      },
      { status: 400 }
    )
  }

  try {
    // Test the connection
    const result = await testServiceConnection(serviceId, credentials)

    // Update test result in database
    const supabase = await createAdminClient()
    await supabase
      .from('api_credentials' as never)
      .update({
        last_tested_at: new Date().toISOString(),
        last_test_success: result.success,
        last_test_error: result.success ? null : result.error,
      } as never)
      .eq('service_id', serviceId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        details: result.details,
        message: `Connection to ${serviceId} verified successfully`,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: `Connection to ${serviceId} failed`,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
