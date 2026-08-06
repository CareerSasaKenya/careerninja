import { NextRequest, NextResponse } from 'next/server'
import { runScrapeProcessBatch } from '@/lib/scrapeProcess'
import { createServiceRoleClient } from '@/lib/supabaseServiceClient'

/** Pro plan: up to 300s for heavy PDF/AI scrape processing. */
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Cheap early-exit: if nothing is pending, skip the full worker boot.
    // The count query is ~ms of compute vs spinning up the whole batch path
    // (which still costs an invocation). Same quality — when the queue has
    // work, we process it exactly as before.
    const { count } = await supabase
      .from('scrape_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (typeof count === 'number' && count === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        stopped_early: null,
        queue_empty: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Default 20 / cap 25 — denser batches + every-30m cron drain Discover waves
    // faster (e.g. MyJobMag Mon/Tue spikes). Soft budget still stops before the
    // Vercel 300s hard kill.
    const maxJobs = parseInt(request.nextUrl.searchParams.get('max') || '20', 10)
    const { processed, results, stopped_early } = await runScrapeProcessBatch(supabase, {
      maxJobs: Math.min(Math.max(1, maxJobs), 25),
      budgetMs: 270_000,
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
