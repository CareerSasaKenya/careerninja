import { runScrapeDiscover } from '../../src/lib/scrapeDiscover'
import { runScrapeProcessBatch } from '../../src/lib/scrapeProcess'
import { enrichJobsNeedingEnrichment } from '../../src/lib/enrichJobById'
import { runReenrichScrapedJobs } from '../../src/lib/reenrichScrapedJobs'
import { createServiceRoleClient } from '../../src/lib/supabaseServiceClient'
import { env } from './env'

/**
 * Discover new jobs from all active scraper sources and queue them.
 * Reuses the exact same logic as the Vercel discover route (via the shared
 * src/lib/scrapeDiscover.ts), so behaviour matches the app.
 */
export async function runDiscover(sourceId?: string) {
  const supabase = createServiceRoleClient()
  const result = await runScrapeDiscover(supabase, {
    sourceId,
    // GitHub Actions has no 300s Vercel limit — use a generous sweep budget
    // so one discover run can cover all sources (default 10 min).
    budgetMs: env.discoverBudgetMs,
  })
  return result
}

/**
 * Process up to batch queue items (fetch detail → AI enrich → publish).
 * Reuses the same logic as the Vercel process route via src/lib/scrapeProcess.
 */
export async function runProcess(batch = 10) {
  const supabase = createServiceRoleClient()
  const result = await runScrapeProcessBatch(supabase, {
    maxJobs: batch,
    budgetMs: env.processBudgetMs,
  })
  return result
}

/**
 * Enrich jobs with AI normalize.
 * - mode 'sparse': active jobs missing fields from ANY intake path (the old
 *   Vercel enrich-jobs cron behavior).
 * - mode 'scraped': re-normalize published scraped jobs from stored raw_data,
 *   optionally limited to one source (the admin "Enrich scraped" behavior).
 */
export async function runEnrich(
  options: { mode?: 'scraped' | 'sparse'; limit?: number; sourceId?: string } = {}
) {
  const { mode = 'scraped', limit = 10, sourceId } = options
  const supabase = createServiceRoleClient()

  if (mode === 'sparse') {
    return enrichJobsNeedingEnrichment(supabase, { limit, apply: true })
  }

  return runReenrichScrapedJobs(supabase, {
    limit,
    sourceFilter: sourceId || null,
    apply: true,
  })
}
