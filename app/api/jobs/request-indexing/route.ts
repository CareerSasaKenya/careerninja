import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminServiceClient } from '@/lib/adminAuth'
import {
  buildJobUrlPath,
  enqueueJobIndexingNotification,
  type IndexingNotificationType,
} from '@/lib/googleIndexing'

export const runtime = 'nodejs'

/**
 * POST /api/jobs/request-indexing
 *
 * Enqueue a Google Indexing API notification for a job page.
 * Use after meaningful updates to an already-active job (status transitions
 * are handled automatically by the DB trigger).
 *
 * Auth: Bearer access token. Caller must be admin OR the job's owner.
 * Body: { job_id: string, type?: 'URL_UPDATED' | 'URL_DELETED' }
 */
export async function POST(request: NextRequest) {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const jobId =
      typeof body.job_id === 'string' && body.job_id.trim()
        ? body.job_id.trim()
        : null
    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 })
    }

    const requestedType = body.type as IndexingNotificationType | undefined
    if (
      requestedType &&
      requestedType !== 'URL_UPDATED' &&
      requestedType !== 'URL_DELETED'
    ) {
      return NextResponse.json(
        { error: "type must be 'URL_UPDATED' or 'URL_DELETED'" },
        { status: 400 }
      )
    }

    const adminClient = getAdminServiceClient()
    const { data: job, error: jobError } = await adminClient
      .from('jobs')
      .select('id, user_id, status, job_slug, slug')
      .eq('id', jobId)
      .maybeSingle()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin'
    const isOwner = job.user_id === user.id
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const notificationType: IndexingNotificationType =
      requestedType ||
      (job.status === 'active' ? 'URL_UPDATED' : 'URL_DELETED')

    if (!requestedType && job.status !== 'active' && job.status !== 'expired') {
      return NextResponse.json(
        {
          error: `Job status '${job.status}' is not indexable. Publish the job first.`,
        },
        { status: 400 }
      )
    }

    const result = await enqueueJobIndexingNotification(
      adminClient,
      job,
      notificationType
    )

    if (!result.enqueued) {
      return NextResponse.json(
        { error: result.error || 'Failed to enqueue indexing request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      queue_id: result.id,
      job_id: job.id,
      url_path: buildJobUrlPath(job),
      type: notificationType,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[jobs/request-indexing] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
