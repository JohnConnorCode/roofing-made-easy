import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'

const ALLOWED_EVENT_TYPES = new Set([
  'page_view',
  'funnel_step',
  'conversion',
  'cta_click',
  'engagement',
])

const MAX_BATCH_SIZE = 20

// Strip PII patterns from metadata values
function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!metadata) return {}
  const sanitized: Record<string, unknown> = {}
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const phonePattern = /(\+?1?\s*[-.]?\s*)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      sanitized[key] = value.replace(emailPattern, '[redacted]').replace(phonePattern, '[redacted]')
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'analytics')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { events } = body

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Events array required' }, { status: 400 })
    }

    if (events.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} events per batch` },
        { status: 400 }
      )
    }

    // Validate and sanitize events
    const validEvents = events
      .filter(
        (e: Record<string, unknown>) =>
          e &&
          typeof e.session_id === 'string' &&
          e.session_id.length <= 64 &&
          typeof e.event_type === 'string' &&
          ALLOWED_EVENT_TYPES.has(e.event_type) &&
          typeof e.event_name === 'string' &&
          e.event_name.length <= 100 &&
          typeof e.page_path === 'string' &&
          e.page_path.length <= 500
      )
      .map((e: Record<string, unknown>) => ({
        session_id: String(e.session_id).slice(0, 64),
        event_type: String(e.event_type),
        event_name: String(e.event_name).slice(0, 100),
        page_path: String(e.page_path).slice(0, 500),
        referrer: e.referrer ? String(e.referrer).slice(0, 1000) : null,
        lead_id: e.lead_id && typeof e.lead_id === 'string' && isValidUUID(e.lead_id)
          ? e.lead_id
          : null,
        funnel_step:
          typeof e.funnel_step === 'number' && e.funnel_step >= 0 && e.funnel_step <= 10
            ? e.funnel_step
            : null,
        utm_source: e.utm_source ? String(e.utm_source).slice(0, 255) : null,
        utm_medium: e.utm_medium ? String(e.utm_medium).slice(0, 255) : null,
        utm_campaign: e.utm_campaign ? String(e.utm_campaign).slice(0, 255) : null,
        entry_source: e.entry_source ? String(e.entry_source).slice(0, 100) : null,
        time_on_page_ms:
          typeof e.time_on_page_ms === 'number' && e.time_on_page_ms > 0
            ? Math.min(e.time_on_page_ms, 3600000)
            : null,
        metadata: sanitizeMetadata(e.metadata as Record<string, unknown> | undefined),
        device_type: e.device_type ? String(e.device_type).slice(0, 20) : null,
        client_timestamp: e.client_timestamp ? String(e.client_timestamp) : null,
      }))

    if (validEvents.length === 0) {
      return NextResponse.json({ error: 'No valid events' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('analytics_events' as never)
      .insert(validEvents as never)

    if (error) {
      console.error('[Analytics] Insert error:', error.message)
      return NextResponse.json({ error: 'Failed to store events' }, { status: 500 })
    }

    return NextResponse.json({ stored: validEvents.length }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
