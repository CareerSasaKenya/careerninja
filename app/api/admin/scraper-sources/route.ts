import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'

interface QueueStatRow {
  source_id: string
  status: string
}

/**
 * GET /api/admin/scraper-sources
 * Admin-only: list scraper sources with queue stats.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.ok === false) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const { adminClient } = auth

    const [{ data: sources, error: sourcesError }, { data: queueStats, error: queueError }] =
      await Promise.all([
        adminClient
          .from('scraper_sources')
          .select('*')
          .order('name', { ascending: true }),
        adminClient.from('scrape_queue').select('source_id, status'),
      ])

    if (sourcesError) {
      return NextResponse.json({ error: sourcesError.message }, { status: 500 })
    }
    if (queueError) {
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    const statsBySource = aggregateQueueStats(queueStats || [])

    const enriched = (sources || []).map(source => ({
      ...source,
      queue_stats: statsBySource[source.source_id] || emptyQueueStats(),
    }))

    const totals = enriched.reduce(
      (acc, source) => {
        acc.pending += source.queue_stats.pending
        acc.processing += source.queue_stats.processing
        acc.done += source.queue_stats.done
        acc.failed += source.queue_stats.failed
        return acc
      },
      { pending: 0, processing: 0, done: 0, failed: 0 }
    )

    return NextResponse.json({
      sources: enriched,
      totals,
      active_count: enriched.filter(s => s.is_active).length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[admin/scraper-sources] GET failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function aggregateQueueStats(rows: QueueStatRow[]): Record<string, ReturnType<typeof emptyQueueStats>> {
  const map: Record<string, ReturnType<typeof emptyQueueStats>> = {}

  for (const row of rows) {
    if (!map[row.source_id]) map[row.source_id] = emptyQueueStats()
    const bucket = map[row.source_id]
    if (row.status === 'pending') bucket.pending++
    else if (row.status === 'processing') bucket.processing++
    else if (row.status === 'done') bucket.done++
    else if (row.status === 'failed') bucket.failed++
  }

  return map
}

function emptyQueueStats() {
  return { pending: 0, processing: 0, done: 0, failed: 0 }
}
