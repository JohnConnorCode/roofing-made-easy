/**
 * In-memory rate limiter for API routes
 * Uses a sliding window algorithm to track requests per IP
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  lastCleanup = now
}

// Pre-configured rate limiters
export const RATE_LIMITS = {
  leadCreation: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  estimateCalculation: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  general: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute for API routes
  auth: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute for auth routes
  ai: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 AI requests per minute (cost protection)
  aiVision: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 vision requests per minute (higher cost)
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param limitType - Type of rate limit to apply
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  limitType: RateLimitType
): RateLimitResult {
  cleanup()

  const config = RATE_LIMITS[limitType]
  const key = `${limitType}:${identifier}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  // No existing entry or window expired - create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback for development
  return '127.0.0.1'
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  }
}

/**
 * Helper to create a 429 Too Many Requests response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        ...createRateLimitHeaders(result),
      },
    }
  )
}
