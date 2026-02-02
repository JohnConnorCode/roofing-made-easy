import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzePhoto } from '@/lib/ai'
import type { Upload } from '@/lib/supabase/types'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'
import { requireLeadOwnership } from '@/lib/api/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Require authentication with lead ownership check
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    // Rate limiting for vision AI (higher cost)
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'aiVision')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { uploadId } = body

    if (!uploadId) {
      return NextResponse.json(
        { error: 'uploadId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the upload record
    const { data, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('lead_id', leadId)
      .single()

    const upload = data as Upload | null

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Get the image URL from storage
    const { data: signedUrl } = await supabase.storage
      .from('photos')
      .createSignedUrl(upload.storage_path, 3600) // 1 hour expiry

    if (!signedUrl?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to get image URL' },
        { status: 500 }
      )
    }

    // Analyze the photo
    const result = await analyzePhoto({
      imageUrl: signedUrl.signedUrl,
    })

    // Update the upload record with analysis results
    const { error: updateError } = await supabase
      .from('uploads')
      .update({
        ai_analyzed: true,
        ai_analysis_result: result.data || null,
        ai_detected_issues: result.data?.detectedIssues || [],
        ai_confidence_score: result.data?.confidence || null,
        ai_provider: result.provider,
        ai_analyzed_at: new Date().toISOString(),
        status: result.success ? 'analyzed' : 'failed',
      } as never)
      .eq('id', uploadId)

    if (updateError) {
      console.error('Error updating upload:', updateError)
    }

    // Log AI output
    await supabase.from('ai_outputs').insert({
      lead_id: leadId,
      upload_id: uploadId,
      provider: result.provider,
      operation: 'analyze_photo',
      model: result.model,
      input_data: { imageUrl: signedUrl.signedUrl },
      output_data: result.data || null,
      error_message: result.error || null,
      latency_ms: result.latencyMs,
      success: result.success,
    } as never)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Analysis failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: result.data,
      provider: result.provider,
    })
  } catch (error) {
    console.error('Error in POST /api/leads/[leadId]/ai-analyze:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
