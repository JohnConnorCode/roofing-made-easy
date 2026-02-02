import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Fetch all leads with related data for pipeline view
    // Exclude archived by default, unless specifically requested
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'

    let query = supabase
      .from('leads')
      .select(`
        id,
        status,
        created_at,
        current_step,
        contacts(first_name, last_name, email, phone),
        properties(city, state, street_address),
        intakes(job_type, timeline_urgency, roof_size_sqft),
        estimates(price_likely)
      `)
      .order('created_at', { ascending: false })

    if (!includeArchived) {
      query = query.not('status', 'eq', 'archived')
    }

    const { data: rawLeads, error } = await query

    if (error) {
      console.error('Error fetching pipeline leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pipeline data' },
        { status: 500 }
      )
    }

    // Type the leads properly
    interface PipelineLead {
      id: string
      status: string
      created_at: string
      current_step: number
      contacts: Record<string, string>[]
      properties: Record<string, string>[]
      intakes: Record<string, unknown>[]
      estimates: { price_likely: number }[] | null
    }
    const leads = (rawLeads || []) as PipelineLead[]

    // Group leads by status with counts and totals
    const pipeline = leads.reduce((acc, lead) => {
      const status = lead.status
      if (!acc[status]) {
        acc[status] = {
          leads: [],
          count: 0,
          totalValue: 0
        }
      }
      acc[status].leads.push(lead)
      acc[status].count++
      const estimateValue = lead.estimates?.[0]?.price_likely || 0
      acc[status].totalValue += estimateValue
      return acc
    }, {} as Record<string, { leads: PipelineLead[]; count: number; totalValue: number }>)

    // Calculate overall stats
    const stats = {
      totalLeads: leads.length,
      totalPipelineValue: leads.reduce((sum, lead) => {
        return sum + (lead.estimates?.[0]?.price_likely || 0)
      }, 0),
      byStatus: Object.entries(pipeline).map(([status, data]) => ({
        status,
        count: data.count,
        value: data.totalValue
      }))
    }

    return NextResponse.json({
      leads: leads || [],
      pipeline,
      stats
    })
  } catch (error) {
    console.error('Error in GET /api/leads/pipeline:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
