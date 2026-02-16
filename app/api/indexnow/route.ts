import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 })
  }

  // Collect all important URLs to submit
  const urls = [
    BASE_URL,
    `${BASE_URL}/services`,
    `${BASE_URL}/service-areas`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/about`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/portfolio`,
    `${BASE_URL}/financing`,
    `${BASE_URL}/insurance-help`,
    `${BASE_URL}/assistance-programs`,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/pricing/roof-replacement-cost`,
    `${BASE_URL}/pricing/metal-roof-cost`,
    `${BASE_URL}/pricing/roof-repair-cost`,
    `${BASE_URL}/blog/new-roof-cost-mississippi-2026`,
    `${BASE_URL}/blog/metal-roof-vs-shingles-cost`,
    `${BASE_URL}/blog/roof-replacement-cost-factors`,
    `${BASE_URL}/blog/free-roof-inspection-what-to-expect`,
    `${BASE_URL}/blog/mississippi-storm-damage-insurance-coverage`,
  ]

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(BASE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    return NextResponse.json({
      status: response.status,
      submitted: urls.length,
      message: response.ok ? 'URLs submitted to IndexNow (Bing, Yandex, Seznam, Naver)' : 'Submission may have failed',
    })
  } catch (err) {
    return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 500 })
  }
}
