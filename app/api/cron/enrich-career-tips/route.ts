import { NextRequest, NextResponse } from 'next/server'
import { backfillCareerTipsForRecentJobs } from '@/lib/enrichJobById'
import { createServiceRoleClient } from '@/lib/supabaseServiceClient'

/** Pro plan: backfill career tips on jobs posted in the last week. */
export const maxDuration = 300
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function authorize(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

function intParam(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = parseInt(String(value ?? ''), 10)
  const n = Number.isFinite(parsed) ? parsed : fallback
  return Math.min(Math.max(min, n), max)
}

async function handle(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = request.nextUrl
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {}
    const dryRun = body.dryRun === true || url.searchParams.get('dryRun') === '1'
    const batch = await backfillCareerTipsForRecentJobs(createServiceRoleClient(), {
      days: intParam(body.days ?? url.searchParams.get('days'), 7, 1, 30),
      limit: intParam(body.limit ?? url.searchParams.get('limit'), 20, 1, 40),
      apply: !dryRun,
      concurrency: 2,
      budgetMs: 270_000,
    })
    return NextResponse.json({
      success: true,
      mode: 'tips',
      ...batch,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/enrich-career-tips] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
