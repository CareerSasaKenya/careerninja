function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

export async function triggerScrapeDiscover(): Promise<Record<string, unknown>> {
  const secret = process.env.SCRAPER_SECRET
  if (!secret) throw new Error('SCRAPER_SECRET is not configured')

  const response = await fetch(`${getAppBaseUrl()}/api/scrape-jobs/discover`, {
    method: 'POST',
    headers: { 'x-scraper-secret': secret },
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error || `Discover failed with status ${response.status}`)
  }
  return body
}

export async function triggerScrapeProcess(): Promise<Record<string, unknown>> {
  const secret = process.env.SCRAPER_SECRET
  if (!secret) throw new Error('SCRAPER_SECRET is not configured')

  const response = await fetch(`${getAppBaseUrl()}/api/scrape-jobs/process`, {
    method: 'POST',
    headers: { 'x-scraper-secret': secret },
  })

  const body = await response.json()
  if (!response.ok && response.status !== 200) {
    throw new Error(body.error || `Process failed with status ${response.status}`)
  }
  return body
}

/** Process up to maxJobs pending queue items (one per API call). */
export async function triggerScrapeProcessBatch(maxJobs: number = 5): Promise<{
  processed: number
  results: Record<string, unknown>[]
}> {
  const results: Record<string, unknown>[] = []
  let processed = 0

  for (let i = 0; i < maxJobs; i++) {
    const result = await triggerScrapeProcess()

    if (result.processed === 0 || result.message === 'No pending jobs in queue') {
      break
    }

    results.push(result)
    processed++

    if (result.message === 'Duplicate job skipped') {
      continue
    }
    if (result.success) {
      continue
    }
    if (result.error) {
      break
    }
  }

  return { processed, results }
}
