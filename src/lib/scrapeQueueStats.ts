import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Items left in `processing` after a killed Vercel invocation never get
 * picked again (picker only reads `pending`). Reclaim stale ones.
 */
export async function reclaimStuckScrapeQueueItems(
  supabase: SupabaseClient,
  olderThanMs: number = 30 * 60 * 1000
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs).toISOString()
  const { data, error } = await supabase
    .from('scrape_queue')
    .update({
      status: 'pending',
      error_message: 'Reclaimed from stuck processing',
    })
    .eq('status', 'processing')
    .lt('queued_at', cutoff)
    .select('id')

  if (error) {
    console.error('[scrape-queue] Failed to reclaim stuck items:', error.message)
    return 0
  }
  return data?.length || 0
}

export interface QueueStatusCounts {
  pending: number
  processing: number
  done: number
  failed: number
}

export function emptyQueueStats(): QueueStatusCounts {
  return { pending: 0, processing: 0, done: 0, failed: 0 }
}

export function aggregateQueueStats(
  rows: Array<{ source_id: string; status: string }>
): Record<string, QueueStatusCounts> {
  const map: Record<string, QueueStatusCounts> = {}

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

/**
 * Page through scrape_queue — PostgREST/Supabase defaults to max 1000 rows per
 * request, which under-counts pending after a large Discover backlog and leaves
 * the admin "Process queue" button stuck disabled.
 */
export async function fetchAllQueueStatusRows(
  supabase: SupabaseClient,
  pageSize: number = 1000
): Promise<Array<{ source_id: string; status: string }>> {
  const all: Array<{ source_id: string; status: string }> = []
  let from = 0

  for (;;) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('scrape_queue')
      .select('source_id, status')
      .order('queued_at', { ascending: true })
      .range(from, to)

    if (error) throw error
    if (!data || data.length === 0) break

    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return all
}

export function sumQueueStats(
  bySource: Record<string, QueueStatusCounts>
): QueueStatusCounts {
  return Object.values(bySource).reduce(
    (acc, stats) => {
      acc.pending += stats.pending
      acc.processing += stats.processing
      acc.done += stats.done
      acc.failed += stats.failed
      return acc
    },
    emptyQueueStats()
  )
}
