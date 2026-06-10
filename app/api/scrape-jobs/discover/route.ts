import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobLinks, ScraperSelectors } from '@/lib/scraper'
import { discoverWorkableJobs, WorkableSourceConfig } from '@/lib/workable-adapter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scraper-secret')
  if (secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown>[] = []

  try {
    const { data: sources, error: sourcesError } = await supabase
      .from('scraper_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError
    if (!sources || sources.length === 0) {
      return NextResponse.json({ message: 'No active sources configured', queued: 0 })
    }

    for (const source of sources) {
      const sourceResult = {
        source_id: source.source_id,
        found: 0,
        queued: 0,
        error: null as string | null,
      }

      try {
        const config = source.selectors as { type?: string }
        let discovered: { job_url: string; partial_data: { title?: string; location?: string } }[]

        if (config.type === 'workable') {
          // ── Workable API adapter ─────────────────────────────────────────
          discovered = await discoverWorkableJobs(source.selectors as WorkableSourceConfig)
        } else {
          // ── Standard HTML scraper ────────────────────────────────────────
          const html = await fetchHtml(source.base_url)
          discovered = extractJobLinks(html, source.base_url, source.selectors as ScraperSelectors)
        }

        sourceResult.found = discovered.length

        if (discovered.length === 0) {
          results.push(sourceResult)
          continue
        }

        // Filter out URLs already known
        const urls = discovered.map(j => j.job_url)

        const [{ data: alreadyQueued }, { data: alreadyPublished }] = await Promise.all([
          supabase.from('scrape_queue').select('job_url').in('job_url', urls),
          supabase.from('scraped_job_sources').select('job_url').in('job_url', urls),
        ])

        const knownUrls = new Set([
          ...(alreadyQueued || []).map((r: { job_url: string }) => r.job_url),
          ...(alreadyPublished || []).map((r: { job_url: string }) => r.job_url),
        ])

        const newJobs = discovered.filter(j => !knownUrls.has(j.job_url))

        if (newJobs.length === 0) {
          results.push(sourceResult)
          continue
        }

        const { error: insertError } = await supabase.from('scrape_queue').insert(
          newJobs.map(j => ({
            source_id: source.source_id,
            job_url: j.job_url,
            status: 'pending',
            partial_data: j.partial_data,
          }))
        )

        if (insertError) throw insertError

        sourceResult.queued = newJobs.length

        await supabase
          .from('scraper_sources')
          .update({ last_discovered_at: new Date().toISOString() })
          .eq('source_id', source.source_id)

      } catch (err: unknown) {
        sourceResult.error = err instanceof Error ? err.message : String(err)
        console.error(`[discover] Error on source ${source.source_id}:`, sourceResult.error)
      }

      results.push(sourceResult)
    }

    const totalQueued = results.reduce((sum, r) => sum + ((r.queued as number) || 0), 0)

    return NextResponse.json({
      success: true,
      sources_processed: sources.length,
      total_queued: totalQueued,
      results,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[discover] Fatal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
