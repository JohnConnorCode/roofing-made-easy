'use client'

interface AnalyticsEvent {
  session_id: string
  event_type: string
  event_name: string
  page_path: string
  referrer?: string
  lead_id?: string
  funnel_step?: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  entry_source?: string
  time_on_page_ms?: number
  metadata?: Record<string, unknown>
  device_type?: string
  client_timestamp: string
}

const BATCH_SIZE = 10
const FLUSH_INTERVAL_MS = 5000
const SESSION_KEY = 'analytics_session_id'
const SESSION_ACTIVITY_KEY = 'analytics_last_activity'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const UTM_KEY = 'analytics_utm'

function generateId(): string {
  return crypto.randomUUID()
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  const now = Date.now()
  const lastActivity = sessionStorage.getItem(SESSION_ACTIVITY_KEY)
  const isExpired = lastActivity && (now - parseInt(lastActivity, 10)) > SESSION_TIMEOUT_MS

  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id || isExpired) {
    id = generateId()
    sessionStorage.setItem(SESSION_KEY, id)
  }

  // Update last activity timestamp
  sessionStorage.setItem(SESSION_ACTIVITY_KEY, now.toString())
  return id
}

interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

function captureUTM(): UTMParams {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utm: UTMParams = {}
  const source = params.get('utm_source')
  const medium = params.get('utm_medium')
  const campaign = params.get('utm_campaign')
  if (source) utm.utm_source = source
  if (medium) utm.utm_medium = medium
  if (campaign) utm.utm_campaign = campaign
  // Persist UTM params for the session
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm))
  }
  return utm
}

function getStoredUTM(): UTMParams {
  if (typeof window === 'undefined') return {}
  try {
    const stored = sessionStorage.getItem(UTM_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

class AnalyticsTracker {
  private queue: AnalyticsEvent[] = []
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private sessionId: string = ''
  private utm: UTMParams = {}
  private initialized = false

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.sessionId = getSessionId()
    this.utm = { ...getStoredUTM(), ...captureUTM() }
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS)
    // Flush on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush()
      }
    })
    this.initialized = true
  }

  track(event: {
    event_type: string
    event_name: string
    lead_id?: string
    funnel_step?: number
    entry_source?: string
    time_on_page_ms?: number
    metadata?: Record<string, unknown>
  }) {
    if (typeof window === 'undefined') return
    if (!this.initialized) this.init()

    const analyticsEvent: AnalyticsEvent = {
      session_id: this.sessionId,
      event_type: event.event_type,
      event_name: event.event_name,
      page_path: window.location.pathname,
      referrer: document.referrer || undefined,
      lead_id: event.lead_id,
      funnel_step: event.funnel_step,
      utm_source: this.utm.utm_source,
      utm_medium: this.utm.utm_medium,
      utm_campaign: this.utm.utm_campaign,
      entry_source: event.entry_source,
      time_on_page_ms: event.time_on_page_ms,
      metadata: event.metadata,
      device_type: getDeviceType(),
      client_timestamp: new Date().toISOString(),
    }

    this.queue.push(analyticsEvent)

    if (this.queue.length >= BATCH_SIZE) {
      this.flush()
    }
  }

  flush() {
    if (this.queue.length === 0) return
    const events = this.queue.splice(0, BATCH_SIZE)
    const payload = JSON.stringify({ events })

    // Use sendBeacon for reliable delivery (non-blocking)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/events', blob)
    } else {
      // Fallback to fetch
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent failure — analytics should never break the app
      })
    }
  }

  destroy() {
    this.flush()
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.initialized = false
  }
}

// Singleton instance
export const tracker = new AnalyticsTracker()
