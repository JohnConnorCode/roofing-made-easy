import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatJobType(jobType: string): string {
  const jobTypeMap: Record<string, string> = {
    replacement: 'Roof Replacement',
    repair: 'Roof Repair',
    inspection: 'Roof Inspection',
    storm_damage: 'Storm Damage Repair',
    maintenance: 'Roof Maintenance',
    gutter: 'Gutter Services',
  }
  return jobTypeMap[jobType] || jobType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const price = searchParams.get('price')
  const city = searchParams.get('city') || ''
  const jobType = searchParams.get('jobType') || ''
  const name = searchParams.get('name') || ''

  const formattedPrice = price ? formatPrice(parseInt(price, 10)) : null
  const formattedJobType = jobType ? formatJobType(jobType) : ''

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

            {/* Estimate badge */}
            <div
              style={{
                backgroundColor: '#c9a25c',
                color: '#0c0f14',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Personalized Estimate
            </div>
          </div>

          {/* Main content - Estimate details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {name && (
              <p
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  margin: 0,
                }}
              >
                Prepared for {name}
              </p>
            )}

            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#f1f5f9',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Your Roofing Estimate
            </h1>

            {/* Price display */}
            {formattedPrice && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '80px',
                    fontWeight: 800,
                    color: '#c9a25c',
                    lineHeight: 1,
                  }}
                >
                  {formattedPrice}
                </span>
                <span
                  style={{
                    fontSize: '24px',
                    color: '#64748b',
                  }}
                >
                  estimated
                </span>
              </div>
            )}

            {/* Details row */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
                marginTop: '8px',
              }}
            >
              {formattedJobType && (
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
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="#94a3b8"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: '20px',
                      color: '#94a3b8',
                    }}
                  >
                    {formattedJobType}
                  </span>
                </div>
              )}
              {city && (
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
                      fontSize: '20px',
                      color: '#94a3b8',
                    }}
                  >
                    {city}, MS
                  </span>
                </div>
              )}
            </div>
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
                  color: '#94a3b8',
                }}
              >
                View Full Details
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
