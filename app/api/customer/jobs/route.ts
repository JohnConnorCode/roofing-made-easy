import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

// Only expose customer-safe columns — never notes, internal_notes, costs, or team IDs
const JOB_SELECT = `
  id, job_number, lead_id, customer_id, status,
  scheduled_start, scheduled_end, actual_start, actual_end,
  contract_amount, property_address, property_city, property_state, property_zip,
  warranty_start_date, warranty_end_date, warranty_type,
  created_at, updated_at
`

// Exclude notes — admin staff may write sensitive info in status history notes
const HISTORY_SELECT = 'id, job_id, old_status, new_status, created_at'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers' as never)
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const customerId = (customer as { id: string }).id

    // Optional leadId filter (validated as UUID)
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (leadId && !UUID_RE.test(leadId)) {
      return NextResponse.json(
        { error: 'Invalid leadId format' },
        { status: 400 }
      )
    }

    // Build query for jobs — explicit column list
    let query = supabase
      .from('jobs' as never)
      .select(JOB_SELECT)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    const { data: jobs, error: jobsError } = await query

    if (jobsError) {
      throw jobsError
    }

    // Fetch status history for each job (in-memory cap of 5 per job)
    // No global .limit() — customer typically has 1-5 jobs, history is bounded
    const jobIds = ((jobs as Array<{ id: string }>) || []).map((j) => j.id)

    let statusHistory: Record<string, unknown>[] = []
    if (jobIds.length > 0) {
      const { data: history } = await supabase
        .from('job_status_history' as never)
        .select(HISTORY_SELECT)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })

      statusHistory = (history as Record<string, unknown>[]) || []
    }

    // Group status history by job_id and limit to 5 per job
    const historyByJob: Record<string, Record<string, unknown>[]> = {}
    for (const entry of statusHistory) {
      const jobId = entry.job_id as string
      if (!historyByJob[jobId]) {
        historyByJob[jobId] = []
      }
      if (historyByJob[jobId].length < 5) {
        historyByJob[jobId].push(entry)
      }
    }

    // Attach history to jobs
    const jobsWithHistory = ((jobs as Array<Record<string, unknown>>) || []).map((job) => ({
      ...job,
      status_history: historyByJob[job.id as string] || [],
    }))

    return NextResponse.json({ jobs: jobsWithHistory })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
