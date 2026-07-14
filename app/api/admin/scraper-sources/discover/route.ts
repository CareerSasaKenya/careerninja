import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { runScrapeDiscover } from '@/lib/scrapeDiscover'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * POST /api/admin/scraper-sources/discover
 * Admin-only: run scrape discover for all active sources or one source.
 * Body: { source_id?: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const sourceId = typeof body.source_id === 'string' ? body.source_id : undefined

    const result = await runScrapeDiscover(auth.adminClient, { sourceId })

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[admin/scraper-sources/discover] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
