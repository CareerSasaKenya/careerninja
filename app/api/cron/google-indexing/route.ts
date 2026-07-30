import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processGoogleIndexingQueue } from '@/lib/googleIndexing'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * GET /api/cron/google-indexing
 *
 * Drains pending Google Indexing API notifications for job pages.
 * Auth: Authorization: Bearer ${CRON_SECRET}
 * Query: ?max=20 (1–100)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const maxParam = parseInt(request.nextUrl.searchParams.get('max') || '20', 10)
    const limit = Number.isFinite(maxParam) ? maxParam : 20

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const result = await processGoogleIndexingQueue(supabase, { limit })

    if (!result.configured) {
      return NextResponse.json({
        success: true,
        configured: false,
        message:
          'Google Indexing API credentials not configured. Set GOOGLE_INDEXING_CLIENT_EMAIL + GOOGLE_INDEXING_PRIVATE_KEY (or GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON).',
        processed: 0,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      configured: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/google-indexing] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
