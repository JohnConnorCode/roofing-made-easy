import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'auth') // Use auth tier for test emails
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Email not configured',
          details: 'RESEND_API_KEY environment variable is not set',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { to } = body

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to,
      subject: 'Test Email - Farrell Roofing Notifications',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="500" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px 40px; background-color: #0c0f14; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                <span style="color: #c9a25c;">Farrell</span> Roofing
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; padding: 8px 16px; background-color: #dcfce7; color: #166534; font-size: 14px; font-weight: 600; border-radius: 20px;">
                  ✓ Email Working
                </span>
              </div>
              <h2 style="margin: 0 0 16px; color: #0c0f14; font-size: 20px; font-weight: 600; text-align: center;">
                Test Email Successful
              </h2>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                Your email notifications are configured correctly. You will receive notifications for:
              </p>
              <ul style="margin: 16px 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 2;">
                <li>New lead submissions</li>
                <li>Estimate generations</li>
                <li>Daily digest summaries (if enabled)</li>
              </ul>
              <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
                Sent at ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                Farrell Roofing LLC · Tupelo, MS
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `
Test Email - Farrell Roofing

Your email notifications are configured correctly!

You will receive notifications for:
- New lead submissions
- Estimate generations
- Daily digest summaries (if enabled)

Sent at ${new Date().toLocaleString()}
      `.trim(),
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${to}`
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
