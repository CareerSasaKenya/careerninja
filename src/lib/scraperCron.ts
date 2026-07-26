import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { runScrapeDiscover } from '@/lib/scrapeDiscover'
import { runScrapeProcessBatch, runScrapeProcessOne } from '@/lib/scrapeProcess'

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase service credentials are not configured')
  }
  return createClient(url, key)
}

/**
 * Run discover in-process (no HTTP self-fetch).
 * HTTP loopback via NEXT_PUBLIC_SITE_URL often returns HTML (e.g. CDN/WAF pages),
 * which breaks JSON parsing in admin and cron callers.
 */
export async function triggerScrapeDiscover() {
  return runScrapeDiscover(getServiceClient())
}

export async function triggerScrapeProcess(): Promise<Record<string, unknown>> {
  return runScrapeProcessOne(getServiceClient())
}

/** Process up to maxJobs pending queue items (one per in-process call). */
export async function triggerScrapeProcessBatch(maxJobs: number = 15): Promise<{
  processed: number
  results: Record<string, unknown>[]
  stopped_early?: string
}> {
  return runScrapeProcessBatch(getServiceClient(), { maxJobs, budgetMs: 270_000 })
}
