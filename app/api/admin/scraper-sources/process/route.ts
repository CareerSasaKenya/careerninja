import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { runScrapeProcessBatch } from '@/lib/scrapeProcess'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * POST /api/admin/scraper-sources/process
 * Admin-only: process up to max pending queue items in-process.
 * Body: { max?: number } — default 5, capped at 10
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const requested = typeof body.max === 'number' ? body.max : 5
    const maxJobs = Math.min(Math.max(1, Math.floor(requested)), 10)

    const { processed, results } = await runScrapeProcessBatch(auth.adminClient, maxJobs)

    const published = results.filter(r => r.success && !r.pdf_document).length
    const pdfBatches = results.filter(r => r.pdf_document)
    const pdfPublished = pdfBatches.reduce(
      (sum, r) => sum + (typeof r.published === 'number' ? r.published : 0),
      0
    )
    const skipped = results.filter(r => r.message === 'Duplicate job skipped').length
    const errors = results.filter(r => r.error).length

    return NextResponse.json({
      processed,
      published: published + pdfPublished,
      skipped,
      errors,
      results,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[admin/scraper-sources/process] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
