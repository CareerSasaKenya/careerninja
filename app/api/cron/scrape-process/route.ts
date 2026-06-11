import { NextRequest, NextResponse } from 'next/server'
import { triggerScrapeProcessBatch } from '@/lib/scraperCron'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const maxJobs = parseInt(request.nextUrl.searchParams.get('max') || '5', 10)
    const { processed, results } = await triggerScrapeProcessBatch(maxJobs)

    return NextResponse.json({
      success: true,
      processed,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/scrape-process] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
