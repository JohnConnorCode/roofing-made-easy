import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const city = searchParams.get('city') || 'Northeast Mississippi'
  const county = searchParams.get('county') || ''
  const state = searchParams.get('state') || 'MS'

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

        {/* Background pattern - subtle grid */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1f2e 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Top section with logo */}
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
                Smart Roof Pricing
              </span>
            </div>

            {/* Location badge */}
            <div
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Service Area
            </div>
          </div>

          {/* Main content - City prominently displayed */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
              }}
            >
              <h1
                style={{
                  fontSize: city.length > 15 ? '72px' : '88px',
                  fontWeight: 800,
                  color: '#f1f5f9',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {city}
              </h1>
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  color: '#c9a25c',
                }}
              >
                {state}
              </span>
            </div>

            {county && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="#94a3b8"
                  />
                </svg>
                <span
                  style={{
                    fontSize: '24px',
                    color: '#94a3b8',
                  }}
                >
                  {county} County
                </span>
              </div>
            )}

            <p
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                margin: 0,
                marginTop: '8px',
              }}
            >
              Professional Roofing Services
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
              smartroofpricing.com
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#c9a25c',
                padding: '14px 28px',
                borderRadius: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  color: '#0c0f14',
                  fontWeight: 700,
                }}
              >
                Free Estimate Available
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
