import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'

const INDEXNOW_KEY = 'e77cc4f3ce62757d9fcbf2d1e621c803'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://smartroofpricing.com'

export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

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
