/**
 * Reset Estimate Content to Default API
 * POST - Reset content to its default value
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/team/permissions'
import { resetEstimateContent } from '@/lib/communications/estimate-content-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/communications/estimate-content/[id]/reset
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError

    const resetContent = await resetEstimateContent(id)

    if (!resetContent) {
      return NextResponse.json(
        { error: 'Failed to reset content or content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      content: resetContent,
      message: 'Content reset to default successfully',
    })
  } catch (error) {
    console.error('Estimate content reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
