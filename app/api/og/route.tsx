import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') || 'Farrell Roofing'
  const subtitle = searchParams.get('subtitle') || 'Northeast Mississippi\'s Trusted Roofing Experts'
  const type = searchParams.get('type') || 'website'

  // Type badge colors
  const badgeColors: Record<string, { bg: string; text: string }> = {
    blog: { bg: '#c9a25c', text: '#0c0f14' },
    service: { bg: '#3b82f6', text: '#ffffff' },
    location: { bg: '#22c55e', text: '#ffffff' },
    estimate: { bg: '#c9a25c', text: '#0c0f14' },
    website: { bg: '#64748b', text: '#ffffff' },
  }

  const badge = badgeColors[type] || badgeColors.website

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0c0f14',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Gold accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #c9a25c 0%, #b5893a 50%, #c9a25c 100%)',
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          {/* Top section with logo and badge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            {/* Company name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#c9a25c',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: '#0c0f14' }}
                >
                  <path
                    d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"
                    fill="#0c0f14"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  letterSpacing: '-0.5px',
                }}
              >
                Farrell Roofing
              </span>
            </div>

            {/* Type badge */}
            {type !== 'website' && (
              <div
                style={{
                  backgroundColor: badge.bg,
                  color: badge.text,
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {type}
              </div>
            )}
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? '48px' : '56px',
                fontWeight: 800,
                color: '#f1f5f9',
                lineHeight: 1.1,
                margin: 0,
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                margin: 0,
                maxWidth: '700px',
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <span
              style={{
                fontSize: '18px',
                color: '#64748b',
              }}
            >
              farrellroofing.com
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1a1f2e',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: '#c9a25c',
                  fontWeight: 600,
                }}
              >
                Free Estimates Available
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
