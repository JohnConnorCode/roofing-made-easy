import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

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

    // Optional leadId filter
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    // Build query for jobs
    let query = supabase
      .from('jobs' as never)
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    const { data: jobs, error: jobsError } = await query

    if (jobsError) {
      throw jobsError
    }

    // Fetch status history for each job (last 5 entries)
    const jobIds = ((jobs as Array<{ id: string }>) || []).map((j) => j.id)

    let statusHistory: Record<string, unknown>[] = []
    if (jobIds.length > 0) {
      const { data: history } = await supabase
        .from('job_status_history' as never)
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })

      statusHistory = (history as Record<string, unknown>[]) || []
    }

    // Group status history by job_id and limit to 5
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
