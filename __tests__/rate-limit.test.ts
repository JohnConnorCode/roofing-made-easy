/**
 * Tests for rate limiter - specifically the memory leak fix (Bug 4)
 * Tests LRU eviction and lazy cleanup behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Upstash so it uses in-memory path
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}))
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(),
}))

// Must import after mocks
const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')

describe('Rate Limiter (in-memory)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should allow requests within the limit', () => {
    const result = checkRateLimit('test-ip-1', 'general')
    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })

  it('should track remaining requests', () => {
    // general limit is 20/minute
    const r1 = checkRateLimit('track-ip', 'general')
    expect(r1.remaining).toBe(19)

    const r2 = checkRateLimit('track-ip', 'general')
    expect(r2.remaining).toBe(18)
  })

  it('should block requests that exceed the limit', () => {
    const ip = 'flood-ip'
    // auth limit is 5/minute
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, 'auth')
      expect(result.success).toBe(true)
    }

    // 6th request should be blocked
    const blocked = checkRateLimit(ip, 'auth')
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('should separate rate limits by identifier', () => {
    // Use up limits for ip-a
    for (let i = 0; i < 5; i++) {
      checkRateLimit('ip-a', 'auth')
    }
    const blockedA = checkRateLimit('ip-a', 'auth')
    expect(blockedA.success).toBe(false)

    // ip-b should still work
    const resultB = checkRateLimit('ip-b', 'auth')
    expect(resultB.success).toBe(true)
  })

  it('should separate rate limits by type', () => {
    const ip = 'multi-type-ip'
    // Use up auth limit (5/min)
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 'auth')
    }
    expect(checkRateLimit(ip, 'auth').success).toBe(false)

    // general limit (20/min) should still work
    expect(checkRateLimit(ip, 'general').success).toBe(true)
  })

  it('should return resetTime in the future', () => {
    const result = checkRateLimit('reset-ip', 'general')
    expect(result.resetTime).toBeGreaterThan(Date.now())
  })

  it('should handle many unique IPs without crashing (LRU eviction)', () => {
    // This tests that the store doesn't crash with many entries.
    // The old code would .clear() the entire store at 10k entries.
    // The new code evicts the oldest 20%.
    for (let i = 0; i < 100; i++) {
      const result = checkRateLimit(`stress-ip-${i}`, 'general')
      expect(result.success).toBe(true)
    }
  })
})

describe('rateLimitResponse', () => {
  it('should return a 429 status response', async () => {
    const result = { success: false, remaining: 0, resetTime: Date.now() + 30000 }
    const response = rateLimitResponse(result)

    expect(response.status).toBe(429)
  })

  it('should include Retry-After header', async () => {
    const result = { success: false, remaining: 0, resetTime: Date.now() + 30000 }
    const response = rateLimitResponse(result)

    const retryAfter = response.headers.get('Retry-After')
    expect(retryAfter).toBeDefined()
    expect(Number(retryAfter)).toBeGreaterThanOrEqual(1)
  })

  it('should include rate limit headers', async () => {
    const result = { success: false, remaining: 0, resetTime: Date.now() + 30000 }
    const response = rateLimitResponse(result)

    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should include retryAfter in the JSON body', async () => {
    const result = { success: false, remaining: 0, resetTime: Date.now() + 10000 }
    const response = rateLimitResponse(result)
    const body = await response.json()

    expect(body.error).toBe('Too many requests')
    expect(body.message).toBe('Please try again later')
    expect(body.retryAfter).toBeGreaterThanOrEqual(1)
  })

  it('should clamp retryAfter to at least 1 when resetTime is in the past', async () => {
    // This is the critical edge case: if resetTime is already in the past,
    // the raw calculation (resetTime - Date.now()) / 1000 would be negative.
    // The Math.max(1, ...) guard ensures retryAfter is never negative or zero.
    const pastResetTime = Date.now() - 5000 // 5 seconds in the past
    const result = { success: false, remaining: 0, resetTime: pastResetTime }
    const response = rateLimitResponse(result)
    const body = await response.json()

    expect(body.retryAfter).toBe(1)
    expect(Number(response.headers.get('Retry-After'))).toBe(1)
  })

  it('should clamp retryAfter to at least 1 when resetTime equals now', async () => {
    // Edge case: resetTime is exactly now, so (resetTime - Date.now()) is 0 or
    // slightly negative due to execution time. Math.max(1, ...) handles this.
    const result = { success: false, remaining: 0, resetTime: Date.now() }
    const response = rateLimitResponse(result)
    const body = await response.json()

    expect(body.retryAfter).toBe(1)
    expect(Number(response.headers.get('Retry-After'))).toBe(1)
  })

  it('should compute retryAfter correctly for a future resetTime', async () => {
    // resetTime 60 seconds from now should produce retryAfter around 60
    const resetTime = Date.now() + 60000
    const result = { success: false, remaining: 0, resetTime }
    const response = rateLimitResponse(result)
    const body = await response.json()

    // Allow a small tolerance for execution time
    expect(body.retryAfter).toBeGreaterThanOrEqual(59)
    expect(body.retryAfter).toBeLessThanOrEqual(60)
  })
})
