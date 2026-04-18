import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { safeCompare } from '@/lib/utils'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization') || ''
  if (!safeCompare(authHeader, `Bearer ${CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
  revalidatePath('/image-sitemap.xml')

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
