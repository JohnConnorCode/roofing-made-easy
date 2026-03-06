/**
 * Tests for the blog auto-publish pipeline:
 * 1. Daily cron publishScheduledBlogPosts
 * 2. /api/revalidate endpoint
 * 3. Blog data functions (lib/data/blog.ts)
 * 4. Schedule timing alignment
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Helpers ──

function createRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string> } = {}
) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: options.headers || {},
  })
}

function mockQueryBuilder(overrides: {
  selectData?: unknown[]
  selectError?: { message: string } | null
} = {}) {
  const { selectData = [], selectError = null } = overrides

  const builder: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'update', 'insert', 'delete', 'eq', 'neq',
    'lte', 'gte', 'lt', 'in', 'is', 'contains', 'order', 'limit', 'single',
  ]
  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }
  builder.then = vi.fn((resolve: (v: unknown) => void) =>
    resolve({ data: selectData, error: selectError })
  )
  return builder
}

function setupCronMocks() {
  const mockFrom = vi.fn()
  const mockClient = { from: mockFrom }

  vi.doMock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => mockClient),
    createAdminClient: vi.fn(async () => mockClient),
  }))
  vi.doMock('@/lib/communication/send-email', () => ({
    sendEmail: vi.fn(async () => ({ success: true })),
  }))
  vi.doMock('@/lib/communication/send-sms', () => ({
    sendSMS: vi.fn(async () => ({ success: true })),
  }))
  vi.doMock('@/lib/email/templates', () => ({
    emailWrapper: vi.fn(async (body: string) => `<html>${body}</html>`),
  }))
  vi.doMock('@/lib/notifications', () => ({
    notifyUser: vi.fn(async () => {}),
  }))
  vi.doMock('@/lib/email/notifications', () => ({
    sendConsultationReminderEmail: vi.fn(async () => {}),
  }))
  vi.doMock('@/lib/sms/twilio', () => ({
    sendConsultationReminder: vi.fn(async () => {}),
  }))
  vi.doMock('@/lib/logger', () => ({
    logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
  }))
  vi.doMock('@/lib/utils', () => ({
    safeCompare: (a: string, b: string) => a === b,
  }))

  return mockFrom
}

// ── Tests ──

describe('Blog Auto-Publish Pipeline', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('Daily Cron - publishScheduledBlogPosts', () => {
    it('returns 401 without valid cron secret', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      setupCronMocks()

      const { GET } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        headers: { authorization: 'Bearer wrong-secret' },
      })

      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('returns 503 when CRON_SECRET not configured', async () => {
      // Don't stub CRON_SECRET — leave it undefined
      setupCronMocks()

      const { GET } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        headers: { authorization: 'Bearer anything' },
      })

      const response = await GET(request)
      expect(response.status).toBe(503)
    })

    it('publishes scheduled blog posts and triggers revalidation', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.example.com')
      vi.stubEnv('INDEXNOW_KEY', 'test-indexnow-key')
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))

      const mockFrom = setupCronMocks()

      const scheduledPosts = [
        { id: 'post-1', slug: 'test-post-1' },
        { id: 'post-2', slug: 'test-post-2' },
      ]

      const tableBuilders: Record<string, ReturnType<typeof mockQueryBuilder>> = {
        scheduled_messages: mockQueryBuilder({ selectData: [] }),
        calendar_events: mockQueryBuilder({ selectData: [] }),
        uploads: mockQueryBuilder({ selectData: [] }),
        blog_posts: mockQueryBuilder({ selectData: scheduledPosts }),
      }

      mockFrom.mockImplementation((table: string) => {
        return tableBuilders[table] || mockQueryBuilder()
      })

      const { GET } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)

      const blogResult = body.results.find(
        (r: { task: string }) => r.task === 'publish_blog_posts'
      )
      expect(blogResult).toBeDefined()
      expect(blogResult.success).toBe(true)
      expect(blogResult.details.published).toBe(2)
      expect(blogResult.details.slugs).toEqual(['test-post-1', 'test-post-2'])

      // Verify IndexNow was called
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.indexnow.org/IndexNow',
        expect.objectContaining({ method: 'POST' })
      )

      // Verify revalidation was triggered
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://www.example.com/api/revalidate',
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer test-cron-secret' },
        })
      )
    })

    it('handles zero scheduled posts gracefully', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      const mockFrom = setupCronMocks()

      const tableBuilders: Record<string, ReturnType<typeof mockQueryBuilder>> = {
        scheduled_messages: mockQueryBuilder({ selectData: [] }),
        calendar_events: mockQueryBuilder({ selectData: [] }),
        uploads: mockQueryBuilder({ selectData: [] }),
        blog_posts: mockQueryBuilder({ selectData: [] }),
      }

      mockFrom.mockImplementation((table: string) => {
        return tableBuilders[table] || mockQueryBuilder()
      })

      const { GET } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)

      const blogResult = body.results.find(
        (r: { task: string }) => r.task === 'publish_blog_posts'
      )
      expect(blogResult.success).toBe(true)
      expect(blogResult.details.published).toBe(0)
      expect(blogResult.details.slugs).toEqual([])
    })

    it('returns 207 when blog publish task fails', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      const mockFrom = setupCronMocks()

      const tableBuilders: Record<string, ReturnType<typeof mockQueryBuilder>> = {
        scheduled_messages: mockQueryBuilder({ selectData: [] }),
        calendar_events: mockQueryBuilder({ selectData: [] }),
        uploads: mockQueryBuilder({ selectData: [] }),
        blog_posts: mockQueryBuilder({
          selectError: { message: 'DB connection failed' },
        }),
      }

      mockFrom.mockImplementation((table: string) => {
        return tableBuilders[table] || mockQueryBuilder()
      })

      const { GET } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(207)
      expect(body.status).toBe('completed_with_errors')

      const blogResult = body.results.find(
        (r: { task: string }) => r.task === 'publish_blog_posts'
      )
      expect(blogResult.success).toBe(false)
      expect(blogResult.error).toContain('DB connection failed')
    })

    it('also supports POST method', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      const mockFrom = setupCronMocks()

      mockFrom.mockImplementation(() => mockQueryBuilder({ selectData: [] }))

      const { POST } = await import('@/app/api/cron/daily/route')
      const request = createRequest('/api/cron/daily', {
        method: 'POST',
        headers: { authorization: 'Bearer test-cron-secret' },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })

  describe('/api/revalidate endpoint', () => {
    it('revalidates blog paths on valid request', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      vi.doMock('@/lib/utils', () => ({
        safeCompare: (a: string, b: string) => a === b,
      }))

      const { POST } = await import('@/app/api/revalidate/route')
      const { revalidatePath } = await import('next/cache')

      const request = createRequest('/api/revalidate', {
        method: 'POST',
        headers: { authorization: 'Bearer test-cron-secret' },
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.revalidated).toBe(true)
      expect(body.timestamp).toBeDefined()
      expect(revalidatePath).toHaveBeenCalledWith('/blog')
      expect(revalidatePath).toHaveBeenCalledWith('/blog/[slug]', 'page')
      expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml')
      expect(revalidatePath).toHaveBeenCalledWith('/feed.xml')
      expect(revalidatePath).toHaveBeenCalledWith('/image-sitemap.xml')
    })

    it('rejects unauthorized requests', async () => {
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
      vi.doMock('@/lib/utils', () => ({
        safeCompare: (a: string, b: string) => a === b,
      }))

      const { POST } = await import('@/app/api/revalidate/route')

      const request = createRequest('/api/revalidate', {
        method: 'POST',
        headers: { authorization: 'Bearer wrong-secret' },
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('returns 503 when CRON_SECRET not set', async () => {
      // Don't stub CRON_SECRET
      vi.doMock('@/lib/utils', () => ({
        safeCompare: (a: string, b: string) => a === b,
      }))

      const { POST } = await import('@/app/api/revalidate/route')

      const request = createRequest('/api/revalidate', {
        method: 'POST',
        headers: { authorization: 'Bearer anything' },
      })

      const response = await POST(request)
      expect(response.status).toBe(503)
    })
  })

  describe('Blog Data Functions', () => {
    it('getAllBlogPosts filters by published status', async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

      const mockOrder = vi.fn().mockReturnValue({
        then: (resolve: (v: unknown) => void) =>
          resolve({
            data: [
              {
                id: '1',
                slug: 'test-post',
                title: 'Test Post',
                excerpt: 'Test excerpt',
                content: 'Test content',
                category: 'maintenance',
                author: 'Mike Farrell',
                published_at: '2026-03-01T12:00:00Z',
                created_at: '2026-02-28T12:00:00Z',
                read_time: 5,
                featured: false,
                tags: ['test'],
                image: null,
              },
            ],
            error: null,
          }),
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockClientFrom = vi.fn().mockReturnValue({ select: mockSelect })

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(() => ({ from: mockClientFrom })),
      }))

      const { getAllBlogPosts } = await import('@/lib/data/blog')
      const posts = await getAllBlogPosts()

      expect(mockClientFrom).toHaveBeenCalledWith('blog_posts')
      expect(mockEq).toHaveBeenCalledWith('status', 'published')
      expect(posts).toHaveLength(1)
      expect(posts[0].slug).toBe('test-post')
      expect(posts[0].publishedAt).toBe('2026-03-01T12:00:00Z')
      expect(posts[0].tags).toEqual(['test'])
    })

    it('getBlogPostBySlug returns undefined for non-existent post', async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

      const mockSingle = vi.fn().mockReturnValue({
        then: (resolve: (v: unknown) => void) =>
          resolve({
            data: null,
            error: { code: 'PGRST116', message: 'Not found' },
          }),
      })
      const mockEqStatus = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEqSlug = vi.fn().mockReturnValue({ eq: mockEqStatus })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSlug })
      const mockClientFrom = vi.fn().mockReturnValue({ select: mockSelect })

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(() => ({ from: mockClientFrom })),
      }))

      const { getBlogPostBySlug } = await import('@/lib/data/blog')
      const post = await getBlogPostBySlug('nonexistent')

      expect(post).toBeUndefined()
    })

    it('rowToPost uses published_at with fallback to created_at', async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

      const mockOrder = vi.fn().mockReturnValue({
        then: (resolve: (v: unknown) => void) =>
          resolve({
            data: [
              {
                id: '1',
                slug: 'no-publish-date',
                title: 'No Publish Date',
                excerpt: 'Test',
                content: 'Test',
                category: 'tips',
                author: 'Mike Farrell',
                published_at: null,
                created_at: '2026-01-15T12:00:00Z',
                read_time: 3,
                featured: false,
                tags: [],
                image: null,
              },
            ],
            error: null,
          }),
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockClientFrom = vi.fn().mockReturnValue({ select: mockSelect })

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(() => ({ from: mockClientFrom })),
      }))

      const { getAllBlogPosts } = await import('@/lib/data/blog')
      const posts = await getAllBlogPosts()

      expect(posts[0].publishedAt).toBe('2026-01-15T12:00:00Z')
    })

    it('handles null image and tags gracefully', async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

      const mockOrder = vi.fn().mockReturnValue({
        then: (resolve: (v: unknown) => void) =>
          resolve({
            data: [
              {
                id: '1',
                slug: 'minimal-post',
                title: 'Minimal',
                excerpt: 'Test',
                content: 'Test',
                category: 'tips',
                author: 'Mike Farrell',
                published_at: '2026-01-15T12:00:00Z',
                created_at: '2026-01-15T12:00:00Z',
                read_time: 3,
                featured: false,
                tags: null,
                image: null,
              },
            ],
            error: null,
          }),
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockClientFrom = vi.fn().mockReturnValue({ select: mockSelect })

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(() => ({ from: mockClientFrom })),
      }))

      const { getAllBlogPosts } = await import('@/lib/data/blog')
      const posts = await getAllBlogPosts()

      expect(posts[0].tags).toEqual([])
      expect(posts[0].image).toBeUndefined()
    })
  })
})

describe('Schedule Timing Alignment', () => {
  it('schedule script uses time before 8am UTC cron', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const scriptContent = fs.readFileSync(
      path.resolve(__dirname, '../../scripts/blog/schedule-posts.ts'),
      'utf-8'
    )

    const timeMatch = scriptContent.match(/T(\d{2}):(\d{2}):\d{2}Z/)
    expect(timeMatch).not.toBeNull()

    const hour = parseInt(timeMatch![1], 10)
    expect(hour).toBeLessThan(8)
  })

  it('vercel.json cron is configured for daily execution', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf-8')
    )

    const dailyCron = vercelConfig.crons?.find(
      (c: { path: string }) => c.path === '/api/cron/daily'
    )
    expect(dailyCron).toBeDefined()
    expect(dailyCron.schedule).toBe('0 8 * * *')
  })
})
