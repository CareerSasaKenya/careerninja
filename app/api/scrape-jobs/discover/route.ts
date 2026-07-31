import { NextRequest, NextResponse } from 'next/server'
import { runScrapeDiscover } from '@/lib/scrapeDiscover'
import { createServiceRoleClient } from '@/lib/supabaseServiceClient'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scraper-secret')
  if (secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runScrapeDiscover(createServiceRoleClient())
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[discover] Fatal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
