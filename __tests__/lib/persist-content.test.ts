import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock insert result - declared before vi.mock so hoisting works
const mockInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        insert: mockInsert,
      })),
    })
  ),
}))

// Import after mocks
import { persistAiContent } from '@/lib/ai/persist-content'

describe('persistAiContent', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: insert succeeds
    mockInsert.mockResolvedValue({ error: null })
    // Suppress console.error in all tests to keep output clean
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  /**
   * Helper to flush the fire-and-forget async IIFE inside persistAiContent.
   * The function uses `void (async () => { ... })()` so we need to yield
   * the microtask queue to let the promise settle.
   */
  async function flush() {
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled()
    })
  }

  it('calls supabase insert with correct fields', async () => {
    persistAiContent({
      customerId: 'cust-001',
      leadId: 'lead-001',
      contentType: 'advisor_message',
      topic: 'roof-damage',
      content: { message: 'Your roof needs repair.' },
      provider: 'openai',
      inputContext: { question: 'Is my roof damaged?' },
    })

    await flush()

    expect(mockInsert).toHaveBeenCalledOnce()
    expect(mockInsert).toHaveBeenCalledWith({
      customer_id: 'cust-001',
      lead_id: 'lead-001',
      content_type: 'advisor_message',
      topic: 'roof-damage',
      content: { message: 'Your roof needs repair.' },
      provider: 'openai',
      input_context: { question: 'Is my roof damaged?' },
    })
  })

  it('sets optional fields to null when not provided', async () => {
    persistAiContent({
      customerId: 'cust-002',
      contentType: 'financing_guidance',
      content: { guidance: 'Consider FHA loans.' },
    })

    await flush()

    expect(mockInsert).toHaveBeenCalledOnce()
    expect(mockInsert).toHaveBeenCalledWith({
      customer_id: 'cust-002',
      lead_id: null,
      content_type: 'financing_guidance',
      topic: null,
      content: { guidance: 'Consider FHA loans.' },
      provider: null,
      input_context: null,
    })
  })

  it('does not throw when insert fails', async () => {
    mockInsert.mockResolvedValue({
      error: { message: 'duplicate key value' },
    })

    // Should not throw
    expect(() =>
      persistAiContent({
        customerId: 'cust-003',
        contentType: 'insurance_letter',
        content: { letter: 'Dear insurance company...' },
      })
    ).not.toThrow()

    await flush()
  })

  it('logs error when insert returns an error', async () => {
    mockInsert.mockResolvedValue({
      error: { message: 'relation does not exist' },
    })

    persistAiContent({
      customerId: 'cust-004',
      contentType: 'program_guidance',
      content: { programs: [] },
    })

    await flush()

    expect(consoleSpy).toHaveBeenCalledWith(
      '[AI Persist] Insert error:',
      'relation does not exist'
    )
  })

  it('logs error when createAdminClient throws', async () => {
    // Override createAdminClient to reject
    const { createAdminClient } = await import('@/lib/supabase/server')
    vi.mocked(createAdminClient).mockRejectedValueOnce(
      new Error('Supabase unavailable')
    )

    persistAiContent({
      customerId: 'cust-005',
      contentType: 'advisor_message',
      content: { message: 'test' },
    })

    // Wait for the error path to execute
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[AI Persist] Failed to save AI content:',
      'Supabase unavailable'
    )
  })

  it('does not throw when createAdminClient throws', async () => {
    const { createAdminClient } = await import('@/lib/supabase/server')
    vi.mocked(createAdminClient).mockRejectedValueOnce(
      new Error('connection refused')
    )

    expect(() =>
      persistAiContent({
        customerId: 'cust-006',
        contentType: 'advisor_message',
        content: { message: 'test' },
      })
    ).not.toThrow()

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
  })
})
