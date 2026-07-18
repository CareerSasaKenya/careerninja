import { SupabaseClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobLinks, ScraperSelectors } from './scraper'
import { discoverWorkableJobs, WorkableSourceConfig } from './workable-adapter'
import { discoverSmartRecruitersJobs, SmartRecruitersSourceConfig } from './smartrecruiters-adapter'
import { discoverPscJobs } from './psc-adapter'
import { discoverPscPdfDocuments, PscPdfSourceConfig } from './psc-pdf-adapter'
import { normalizeJobUrl } from './scraperDeadline'

export interface DiscoverSourceResult {
  source_id: string
  found: number
  queued: number
  error: string | null
}

export interface DiscoverRunResult {
  success: boolean
  sources_processed: number
  total_queued: number
  results: DiscoverSourceResult[]
}

export async function runScrapeDiscover(
  supabase: SupabaseClient,
  options?: { sourceId?: string }
): Promise<DiscoverRunResult> {
  let query = supabase.from('scraper_sources').select('*').eq('is_active', true)

  if (options?.sourceId) {
    query = supabase.from('scraper_sources').select('*').eq('source_id', options.sourceId)
  }

  const { data: sources, error: sourcesError } = await query

  if (sourcesError) throw sourcesError
  if (!sources || sources.length === 0) {
    return {
      success: true,
      sources_processed: 0,
      total_queued: 0,
      results: [],
    }
  }

  const results: DiscoverSourceResult[] = []

  for (const source of sources) {
    const sourceResult: DiscoverSourceResult = {
      source_id: source.source_id,
      found: 0,
      queued: 0,
      error: null,
    }

    try {
      if (!source.is_active && options?.sourceId) {
        throw new Error('Source is not active')
      }

      const config = source.selectors as { type?: string }
      let discovered: Array<{ job_url: string; partial_data: Record<string, unknown> }>

      if (config.type === 'workable') {
        discovered = await discoverWorkableJobs(source.selectors as WorkableSourceConfig)
      } else if (config.type === 'smartrecruiters') {
        discovered = await discoverSmartRecruitersJobs(source.selectors as SmartRecruitersSourceConfig)
      } else if (config.type === 'psc') {
        discovered = await discoverPscJobs(source.base_url)
      } else if (config.type === 'psc_pdf') {
        discovered = await discoverPscPdfDocuments(source.base_url, source.selectors as PscPdfSourceConfig)
      } else {
        const html = await fetchHtml(source.base_url)
        discovered = extractJobLinks(html, source.base_url, source.selectors as ScraperSelectors)
      }

      sourceResult.found = discovered.length

      if (discovered.length === 0) {
        results.push(sourceResult)
        continue
      }

      // Canonicalize URLs so trailing slashes / tracking params don't bypass dedupe
      const discoveredNormalized = discovered.map(j => ({
        ...j,
        job_url: normalizeJobUrl(j.job_url),
      }))
      const urls = [...new Set(discoveredNormalized.map(j => j.job_url))]

      const [{ data: alreadyQueued }, { data: alreadyPublished }] = await Promise.all([
        supabase.from('scrape_queue').select('job_url').in('job_url', urls),
        supabase.from('scraped_job_sources').select('job_url').in('job_url', urls),
      ])

      const knownUrls = new Set([
        ...(alreadyQueued || []).map((r: { job_url: string }) => normalizeJobUrl(r.job_url)),
        ...(alreadyPublished || []).map((r: { job_url: string }) => normalizeJobUrl(r.job_url)),
      ])

      const newJobs = discoveredNormalized.filter(j => !knownUrls.has(j.job_url))

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

  const totalQueued = results.reduce((sum, r) => sum + r.queued, 0)

  return {
    success: true,
    sources_processed: sources.length,
    total_queued: totalQueued,
    results,
  }
}
