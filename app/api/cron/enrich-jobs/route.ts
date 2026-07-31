import { NextRequest, NextResponse } from 'next/server'
import { enrichJobsNeedingEnrichment } from '@/lib/enrichJobById'
import { createServiceRoleClient } from '@/lib/supabaseServiceClient'

/** Pro plan: AI-enrich sparse active jobs from ANY intake path. */
export const maxDuration = 300
export const runtime = 'nodejs'

function authorize(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

async function handle(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = request.nextUrl
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {}
    const limit = Math.min(
      Math.max(
        1,
        parseInt(String(body.limit ?? url.searchParams.get('limit') ?? '10'), 10) ||
          10
      ),
      25
    )
    const dryRun = body.dryRun === true || url.searchParams.get('dryRun') === '1'

    const batch = await enrichJobsNeedingEnrichment(createServiceRoleClient(), {
      limit,
      apply: !dryRun,
    })

    return NextResponse.json({
      success: true,
      examined: batch.examined,
      updated: batch.results.filter(r => r.status === 'updated').length,
      failed: batch.results.filter(r => r.status === 'failed').length,
      skipped: batch.results.filter(r => r.status === 'skipped').length,
      results: batch.results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/enrich-jobs] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
