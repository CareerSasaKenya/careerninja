import { runScrapeDiscover } from '../../src/lib/scrapeDiscover'
import { runScrapeProcessBatch } from '../../src/lib/scrapeProcess'
import { createServiceRoleClient } from '../../src/lib/supabaseServiceClient'
import { env } from './env'

/**
 * Discover new jobs from all active scraper sources and queue them.
 * Reuses the exact same logic as the Vercel discover route (via the shared
 * src/lib/scrapeDiscover.ts), so behaviour matches the app.
 */
export async function runDiscover(sourceId?: string) {
  const supabase = createServiceRoleClient()
  const result = await runScrapeDiscover(supabase, { sourceId })
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
