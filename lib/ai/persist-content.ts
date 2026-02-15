/**
 * Fire-and-forget persistence of AI-generated content to customer_ai_content table.
 * Uses admin client to bypass RLS (customers have read-only access).
 */

import { createAdminClient } from '@/lib/supabase/server'

export type AiContentType = 'advisor_message' | 'insurance_letter' | 'financing_guidance' | 'program_guidance'

interface PersistAiContentParams {
  customerId: string
  leadId?: string
  contentType: AiContentType
  topic?: string
  content: Record<string, unknown>
  provider?: string
  inputContext?: Record<string, unknown>
}

/**
 * Persist AI content in the background. Does not throw — logs errors silently.
 */
export function persistAiContent(params: PersistAiContentParams): void {
  // Fire-and-forget — don't block the response
  void (async () => {
    try {
      const supabase = await createAdminClient()
      // Admin client bypasses RLS — TypeScript types require cast since no INSERT policy exists
      const { error } = await supabase.from('customer_ai_content').insert({
        customer_id: params.customerId,
        lead_id: params.leadId || null,
        content_type: params.contentType,
        topic: params.topic || null,
        content: params.content,
        provider: params.provider || null,
        input_context: params.inputContext || null,
      } as never)
      if (error) {
        console.error('[AI Persist] Insert error:', error.message)
      }
    } catch (err) {
      console.error('[AI Persist] Failed to save AI content:', err instanceof Error ? err.message : err)
    }
  })()
}
