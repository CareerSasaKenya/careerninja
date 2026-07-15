import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runScrapeProcessBatch } from '@/lib/scrapeProcess'

export const maxDuration = 60

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const maxJobs = parseInt(request.nextUrl.searchParams.get('max') || '1', 10)
    const { processed, results, stopped_early } = await runScrapeProcessBatch(getServiceClient(), {
      maxJobs: Math.min(Math.max(1, maxJobs), 5),
      budgetMs: 45_000,
    })

    return NextResponse.json({
      success: true,
      processed,
      stopped_early: stopped_early || null,
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
