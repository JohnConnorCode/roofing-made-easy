/**
 * Lien Waiver PDF Generation API
 * GET - Generate and return lien waiver PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { generateLienWaiverPdf } from '@/lib/pdf/lien-waiver-pdf'
import type { LienWaiverPDFData } from '@/lib/pdf/lien-waiver-pdf'
import { logger } from '@/lib/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string; waiverId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, waiverId } = await params
    const supabase = await createClient()

    // Get waiver with job info
    const { data: waiver } = await supabase
      .from('lien_waivers')
      .select(`
        *,
        invoice:invoice_id(id, invoice_number)
      `)
      .eq('id', waiverId)
      .eq('job_id', jobId)
      .single()

    if (!waiver) {
      return NextResponse.json({ error: 'Lien waiver not found' }, { status: 404 })
    }

    // Get job details for property info
    const { data: job } = await supabase
      .from('jobs')
      .select('job_number, property_address, property_city, property_state, property_zip')
      .eq('id', jobId)
      .single()

    const w = waiver as Record<string, unknown>
    const j = job as Record<string, unknown> | null

    const pdfData: LienWaiverPDFData = {
      waiver_type: w.waiver_type as 'conditional' | 'unconditional',
      through_date: w.through_date as string,
      amount: w.amount as number,
      claimant_name: (w.claimant_name as string) || null,
      owner_name: (w.owner_name as string) || null,
      property_description: (w.property_description as string) ||
        (j ? `${j.property_address || ''}, ${j.property_city || ''}, ${j.property_state || ''} ${j.property_zip || ''}`.trim() : null),
      job_number: j?.job_number as string || '',
    }

    const pdfBuffer = await generateLienWaiverPdf(pdfData)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="lien-waiver-${w.id}.pdf"`,
      },
    })
  } catch (error) {
    logger.error('Lien waiver PDF error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
