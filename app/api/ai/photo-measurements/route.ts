import { NextResponse } from 'next/server'
import {
  analyzePhotoForMeasurements,
  analyzeMultiplePhotos,
  type PhotoMeasurementInput,
} from '@/lib/ai'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'
import { requireAuth } from '@/lib/api/auth'

export async function POST(request: Request) {
  try {
    // Require authentication for AI endpoints (cost protection)
    const { error: authError } = await requireAuth()
    if (authError) return authError

    // Rate limiting for vision AI (higher cost)
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'aiVision')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()

    // Single photo or multiple photos
    if (Array.isArray(body.photos)) {
      // Multiple photos
      const inputs: PhotoMeasurementInput[] = body.photos.map(
        (photo: { imageUrl?: string; imageBase64?: string; photoType?: string }) => ({
          imageUrl: photo.imageUrl,
          imageBase64: photo.imageBase64,
          photoType: photo.photoType || 'unknown',
          knownDimensions: body.knownDimensions,
        })
      )

      const result = await analyzeMultiplePhotos(inputs)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to analyze photos' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        measurements: result.data,
        provider: result.provider,
        latencyMs: result.latencyMs,
      })
    } else {
      // Single photo
      const input: PhotoMeasurementInput = {
        imageUrl: body.imageUrl,
        imageBase64: body.imageBase64,
        photoType: body.photoType || 'unknown',
        knownDimensions: body.knownDimensions,
      }

      if (!input.imageUrl && !input.imageBase64) {
        return NextResponse.json(
          { error: 'Either imageUrl or imageBase64 is required' },
          { status: 400 }
        )
      }

      const result = await analyzePhotoForMeasurements(input)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to analyze photo' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        measurements: result.data,
        provider: result.provider,
        latencyMs: result.latencyMs,
      })
    }
  } catch (error) {
    console.error('Photo measurement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
