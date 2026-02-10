/**
 * Standardized API error response helpers
 */

import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'

/**
 * Return a standardized JSON error response
 */
export function apiError(
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  const body: { error: string; details?: unknown } = { error: message }
  if (details !== undefined) {
    body.details = details
  }
  return NextResponse.json(body, { status })
}

/**
 * Return a 400 response with Zod validation errors
 */
export function apiValidationError(zodError: ZodError): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation error',
      details: zodError.flatten().fieldErrors,
    },
    { status: 400 }
  )
}
