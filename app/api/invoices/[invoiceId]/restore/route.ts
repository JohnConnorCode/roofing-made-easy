/**
 * Restore a soft-deleted invoice.
 * POST /api/invoices/[invoiceId]/restore
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdminMutation } from '@/lib/api/auth'
import { ActivityLogger } from '@/lib/team/activity-logger'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await requireAdminMutation(request)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoiceId } = await params
    const supabase = await createClient()

    // Look up deleted invoice — bypass the default filter via explicit
    // .not('deleted_at', 'is', null).
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, deleted_at')
      .eq('id', invoiceId)
      .not('deleted_at', 'is', null)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Deleted invoice not found' },
        { status: 404 }
      )
    }

    const { error: restoreError } = await supabase
      .from('invoices')
      .update({ deleted_at: null } as never)
      .eq('id', invoiceId)

    if (restoreError) {
      logger.error('Error restoring invoice', { error: String(restoreError) })
      return NextResponse.json({ error: 'Failed to restore invoice' }, { status: 500 })
    }

    const row = invoice as { invoice_number: string; total: number }
    // Uses the same audit event as deletion — the actor + delta tells the
    // story. (We could add a dedicated `invoice_restored` action; keeping it
    // in the existing taxonomy for now.)
    ActivityLogger.invoiceUpdated(
      user,
      invoiceId,
      row.invoice_number,
      { deleted_at: 'set' },
      { deleted_at: null }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Invoice restore error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
