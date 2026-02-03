import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireLeadOwnership } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

// Activity types visible to customers (exclude internal notes)
const CUSTOMER_VISIBLE_TYPES = [
  'status_change',
  'estimate_generated',
  'quote_sent',
  'appointment_scheduled',
]

interface ActivityRow {
  id: string
  lead_id: string
  type: string
  content: string
  metadata: Record<string, unknown>
  is_system_generated: boolean
  created_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Verify customer owns this lead
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Fetch only customer-visible activities
    const { data, error } = await supabase
      .from('lead_activities')
      .select('id, lead_id, type, content, metadata, is_system_generated, created_at')
      .eq('lead_id', leadId)
      .in('type', CUSTOMER_VISIBLE_TYPES)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ activities: [] })
      }
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Transform activities for customer view (hide internal details)
    const activities = ((data || []) as ActivityRow[]).map((activity) => ({
      id: activity.id,
      type: activity.type,
      content: getCustomerFriendlyContent(activity),
      created_at: activity.created_at,
    }))

    return NextResponse.json({ activities })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Transform activity content into customer-friendly messages
 */
function getCustomerFriendlyContent(activity: ActivityRow): string {
  switch (activity.type) {
    case 'status_change': {
      const newStatus = (activity.metadata?.new_status as string || '').replace(/_/g, ' ')
      const statusMessages: Record<string, string> = {
        'estimate generated': 'Your estimate has been prepared',
        'consultation scheduled': 'Your consultation has been scheduled',
        'quote sent': 'Your official quote has been sent',
        'won': 'Your project has been confirmed',
        'in progress': 'Work on your project has begun',
        'completed': 'Your project has been completed',
      }
      return statusMessages[newStatus] || `Your project status has been updated`
    }
    case 'estimate_generated':
      return 'Your personalized estimate has been generated'
    case 'quote_sent':
      return 'Your official quote has been sent'
    case 'appointment_scheduled':
      return 'Your consultation has been scheduled'
    default:
      return 'Your project has been updated'
  }
}
