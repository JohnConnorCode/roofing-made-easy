/**
 * Logging wrapper for direct email/SMS sends (not via workflow engine).
 * Fire-and-forget — errors are logged, never thrown.
 */

import { createClient } from '@/lib/supabase/server'

interface LogCommunicationParams {
  channel: 'email' | 'sms'
  to: string
  subject?: string
  body?: string
  leadId?: string
  customerId?: string
  category: string
  status?: 'sent' | 'failed'
  errorMessage?: string
}

export async function logCommunication(params: LogCommunicationParams): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('communication_logs').insert({
      lead_id: params.leadId || null,
      customer_id: params.customerId || null,
      channel: params.channel,
      direction: 'outbound',
      recipient_email: params.channel === 'email' ? params.to : null,
      recipient_phone: params.channel === 'sms' ? params.to : null,
      subject: params.subject || null,
      body: params.body || null,
      status: params.status || 'sent',
      metadata: {
        category: params.category,
        ...(params.errorMessage ? { error: params.errorMessage } : {}),
      },
    } as never)
  } catch (error) {
    console.error('[CommunicationLog] Failed to log direct send:', error)
  }
}
