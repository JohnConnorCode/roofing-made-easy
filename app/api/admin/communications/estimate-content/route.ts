/**
 * Estimate Content API
 * GET - List all estimate content (warranties, scope, terms)
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/team/permissions'
import { getAllEstimateContent } from '@/lib/communications/estimate-content-service'

// GET /api/admin/communications/estimate-content
export async function GET() {
  try {
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const content = await getAllEstimateContent()

    // Group by content type
    const warranties = content.filter(c => c.content_type === 'warranty')
    const scope = content.filter(c => c.content_type === 'scope')
    const terms = content.filter(c => c.content_type === 'terms')
    const paymentTerms = content.filter(c => c.content_type === 'payment_terms')

    return NextResponse.json({
      content,
      grouped: {
        warranties,
        scope,
        terms,
        paymentTerms,
      },
      total: content.length,
    })
  } catch (error) {
    console.error('Estimate content GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
