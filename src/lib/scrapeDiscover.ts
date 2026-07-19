import { SupabaseClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobLinks, ScraperSelectors } from './scraper'
import { discoverWorkableJobs, WorkableSourceConfig } from './workable-adapter'
import { discoverSmartRecruitersJobs, SmartRecruitersSourceConfig } from './smartrecruiters-adapter'
import { discoverGreenhouseJobs, GreenhouseSourceConfig } from './greenhouse-adapter'
import { discoverTaleoJobs, TaleoSourceConfig } from './taleo-adapter'
import { discoverTaleoBeJobs, TaleoBeSourceConfig } from './taleo-be-adapter'
import {
  discoverOracleCloudJobs,
  OracleCloudSourceConfig,
} from './oracle-cloud-adapter'
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
  stopped_early?: string
}

export interface DiscoverRunOptions {
  sourceId?: string
  /**
   * Soft time budget in ms. Stop before starting another source once exceeded.
   * Prevents Vercel hard timeouts that return HTML error pages instead of JSON.
   */
  budgetMs?: number
}

const SUPPORTED_TYPES = new Set([
  'workable',
  'smartrecruiters',
  'greenhouse',
  'taleo',
  'taleo_be',
  'oracle_cloud',
  'psc',
  'psc_pdf',
  'html',
])

export async function runScrapeDiscover(
  supabase: SupabaseClient,
  options?: DiscoverRunOptions
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

  const budgetMs = options?.budgetMs ?? 240_000
  const startedAt = Date.now()
  const results: DiscoverSourceResult[] = []
  let stoppedEarly: string | undefined

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    const elapsed = Date.now() - startedAt
    if (i > 0 && elapsed >= budgetMs) {
      stoppedEarly = `Stopped after ${results.length} source(s) to stay within Vercel time limits (${Math.round(elapsed / 1000)}s elapsed). Run Discover again or per-source.`
      break
    }

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
      const adapterType = config.type || 'html'

      if (!SUPPORTED_TYPES.has(adapterType)) {
        throw new Error(
          `Unsupported scraper type "${adapterType}". Supported: ${[...SUPPORTED_TYPES].join(', ')}`
        )
      }

      let discovered: Array<{ job_url: string; partial_data: Record<string, unknown> }>

      if (adapterType === 'workable') {
        discovered = await discoverWorkableJobs(source.selectors as WorkableSourceConfig)
      } else if (adapterType === 'smartrecruiters') {
        discovered = await discoverSmartRecruitersJobs(source.selectors as SmartRecruitersSourceConfig)
      } else if (adapterType === 'greenhouse') {
        discovered = await discoverGreenhouseJobs(source.selectors as GreenhouseSourceConfig)
      } else if (adapterType === 'taleo') {
        discovered = await discoverTaleoJobs(
          source.selectors as TaleoSourceConfig,
          source.base_url
        )
      } else if (adapterType === 'taleo_be') {
        discovered = await discoverTaleoBeJobs(
          source.selectors as TaleoBeSourceConfig,
          source.base_url
        )
      } else if (adapterType === 'oracle_cloud') {
        discovered = await discoverOracleCloudJobs(
          source.selectors as OracleCloudSourceConfig,
          source.base_url
        )
      } else if (adapterType === 'psc') {
        discovered = await discoverPscJobs(source.base_url)
      } else if (adapterType === 'psc_pdf') {
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

      // Supabase .in() caps around ~100–200 items; chunk to avoid errors
      const knownUrls = new Set<string>()
      const chunkSize = 100
      for (let c = 0; c < urls.length; c += chunkSize) {
        const chunk = urls.slice(c, c + chunkSize)
        const [{ data: alreadyQueued }, { data: alreadyPublished }] = await Promise.all([
          supabase.from('scrape_queue').select('job_url').in('job_url', chunk),
          supabase.from('scraped_job_sources').select('job_url').in('job_url', chunk),
        ])
        for (const r of alreadyQueued || []) knownUrls.add(normalizeJobUrl(r.job_url))
        for (const r of alreadyPublished || []) knownUrls.add(normalizeJobUrl(r.job_url))
      }

      const newJobs = discoveredNormalized.filter(j => !knownUrls.has(j.job_url))

      if (newJobs.length === 0) {
        results.push(sourceResult)
        await supabase
          .from('scraper_sources')
          .update({ last_discovered_at: new Date().toISOString() })
          .eq('source_id', source.source_id)
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
    sources_processed: results.length,
    total_queued: totalQueued,
    results,
    ...(stoppedEarly ? { stopped_early: stoppedEarly } : {}),
  }
}
