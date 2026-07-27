/**
 * Google Indexing API helpers for job posting URLs.
 *
 * Uses a service-account JWT to call urlNotifications:publish.
 * Requests are enqueued in `google_indexing_queue` (via DB trigger or
 * enqueueJobIndexingNotification) and drained by the cron processor.
 *
 * Env (server-only):
 *   GOOGLE_INDEXING_CLIENT_EMAIL
 *   GOOGLE_INDEXING_PRIVATE_KEY  (PEM; \n escaped OK)
 *   Or GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON (full JSON key)
 *   SITE_URL / NEXT_PUBLIC_SITE_URL — must match Search Console property
 */

import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type IndexingNotificationType = 'URL_UPDATED' | 'URL_DELETED'

export type GoogleIndexingQueueRow = {
  id: string
  job_id: string | null
  url_path: string
  notification_type: IndexingNotificationType
  status: 'pending' | 'processing' | 'done' | 'failed' | 'skipped'
  attempts: number
  last_error: string | null
  created_at: string
  updated_at: string
  processed_at: string | null
}

type ServiceAccountCredentials = {
  client_email: string
  private_key: string
}

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const PUBLISH_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

let cachedToken: { accessToken: string; expiresAtMs: number } | null = null

export function getIndexingSiteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.careersasa.co.ke'
  return raw.replace(/\/$/, '')
}

export function buildJobUrlPath(job: {
  id: string
  job_slug?: string | null
  slug?: string | null
}): string {
  const slug = (job.job_slug || job.slug || job.id).trim()
  return `/jobs/${slug}`
}

export function buildJobIndexingUrl(job: {
  id: string
  job_slug?: string | null
  slug?: string | null
}): string {
  return `${getIndexingSiteUrl()}${buildJobUrlPath(job)}`
}

export function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n').trim()
}

export function parseServiceAccountJson(
  raw: string
): ServiceAccountCredentials | null {
  try {
    const parsed = JSON.parse(raw) as {
      client_email?: string
      private_key?: string
    }
    if (!parsed.client_email || !parsed.private_key) return null
    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    }
  } catch {
    return null
  }
}

export function getGoogleIndexingCredentials(): ServiceAccountCredentials | null {
  const json = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON
  if (json?.trim()) {
    const fromJson = parseServiceAccountJson(json)
    if (fromJson) return fromJson
  }

  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY
  if (!clientEmail || !privateKey?.trim()) return null

  return {
    client_email: clientEmail,
    private_key: normalizePrivateKey(privateKey),
  }
}

export function isGoogleIndexingConfigured(): boolean {
  return getGoogleIndexingCredentials() !== null
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function createServiceAccountJwt(credentials: ServiceAccountCredentials): string {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: credentials.client_email,
      scope: INDEXING_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    })
  )
  const unsigned = `${header}.${claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = signer
    .sign(credentials.private_key)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${unsigned}.${signature}`
}

export async function getGoogleIndexingAccessToken(
  credentials: ServiceAccountCredentials = getGoogleIndexingCredentials()!
): Promise<string> {
  if (!credentials) {
    throw new Error('Google Indexing API credentials are not configured')
  }

  if (cachedToken && cachedToken.expiresAtMs > Date.now() + 60_000) {
    return cachedToken.accessToken
  }

  const assertion = createServiceAccountJwt(credentials)
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  }

  if (!response.ok || !body.access_token) {
    throw new Error(
      body.error_description ||
        body.error ||
        `Failed to obtain Google Indexing access token (${response.status})`
    )
  }

  cachedToken = {
    accessToken: body.access_token,
    expiresAtMs: Date.now() + (body.expires_in || 3600) * 1000,
  }
  return body.access_token
}

/** Test helper — clears cached OAuth token. */
export function clearGoogleIndexingTokenCache(): void {
  cachedToken = null
}

export async function publishUrlNotification(
  url: string,
  type: IndexingNotificationType
): Promise<{ urlNotificationMetadata?: unknown }> {
  const accessToken = await getGoogleIndexingAccessToken()
  const response = await fetch(PUBLISH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      (body as { error?: { message?: string } })?.error?.message ||
      (body as { error_description?: string })?.error_description ||
      `Google Indexing API error (${response.status})`
    throw new Error(message)
  }

  return body as { urlNotificationMetadata?: unknown }
}

/**
 * Upsert a pending queue row for a job. Latest notification type wins for
 * the same pending job_id (partial unique index).
 */
export async function enqueueJobIndexingNotification(
  supabase: SupabaseClient,
  job: { id: string; job_slug?: string | null; slug?: string | null },
  notificationType: IndexingNotificationType
): Promise<{ enqueued: boolean; id?: string; error?: string }> {
  const urlPath = buildJobUrlPath(job)

  // Prefer RPC if present; fall back to direct upsert-style enqueue.
  const { data: rpcId, error: rpcError } = await supabase.rpc(
    'enqueue_google_indexing',
    {
      p_job_id: job.id,
      p_url_path: urlPath,
      p_notification_type: notificationType,
    }
  )

  if (!rpcError) {
    return { enqueued: true, id: rpcId as string }
  }

  // Fallback without RPC: cancel prior pending, then insert.
  console.warn(
    '[googleIndexing] enqueue_google_indexing RPC unavailable, using fallback:',
    rpcError.message
  )

  await supabase
    .from('google_indexing_queue')
    .update({
      status: 'skipped',
      last_error: 'superseded',
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', job.id)
    .eq('status', 'pending')

  const { data, error } = await supabase
    .from('google_indexing_queue')
    .insert({
      job_id: job.id,
      url_path: urlPath,
      notification_type: notificationType,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return { enqueued: false, error: error.message }
  }

  return { enqueued: true, id: data.id }
}

export async function processGoogleIndexingQueue(
  supabase: SupabaseClient,
  options: { limit?: number } = {}
): Promise<{
  configured: boolean
  processed: number
  succeeded: number
  failed: number
  skipped: number
  results: Array<{
    id: string
    job_id: string | null
    url: string
    type: IndexingNotificationType
    status: string
    error?: string
  }>
}> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100)
  const results: Array<{
    id: string
    job_id: string | null
    url: string
    type: IndexingNotificationType
    status: string
    error?: string
  }> = []

  if (!isGoogleIndexingConfigured()) {
    return {
      configured: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      results,
    }
  }

  const { data: pending, error: fetchError } = await supabase
    .from('google_indexing_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (fetchError) {
    throw new Error(`Failed to fetch indexing queue: ${fetchError.message}`)
  }

  let succeeded = 0
  let failed = 0
  let skipped = 0

  for (const row of (pending || []) as GoogleIndexingQueueRow[]) {
    const url = `${getIndexingSiteUrl()}${row.url_path.startsWith('/') ? '' : '/'}${row.url_path}`

    const attempts = (row.attempts || 0) + 1
    const { data: claimed } = await supabase
      .from('google_indexing_queue')
      .update({
        status: 'processing',
        attempts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (!claimed) {
      skipped += 1
      continue
    }

    try {
      await publishUrlNotification(url, row.notification_type)

      await supabase
        .from('google_indexing_queue')
        .update({
          status: 'done',
          last_error: null,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)

      if (row.job_id) {
        if (row.notification_type === 'URL_UPDATED') {
          await supabase
            .from('jobs')
            .update({ google_indexed: true })
            .eq('id', row.job_id)
        } else {
          await supabase
            .from('jobs')
            .update({ google_indexed: false })
            .eq('id', row.job_id)
        }
      }

      succeeded += 1
      results.push({
        id: row.id,
        job_id: row.job_id,
        url,
        type: row.notification_type,
        status: 'done',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Soft-fail permanent auth/config errors as skipped so they don't retry forever.
      const permanent =
        /not configured|invalid_grant|unauthorized_client|access_denied|Permission denied|forbidden/i.test(
          message
        )
      const giveUp = permanent || attempts >= 5

      await supabase
        .from('google_indexing_queue')
        .update({
          status: giveUp ? (permanent ? 'skipped' : 'failed') : 'pending',
          last_error: message.slice(0, 1000),
          updated_at: new Date().toISOString(),
          ...(giveUp ? { processed_at: new Date().toISOString() } : {}),
        })
        .eq('id', row.id)

      if (giveUp && permanent) skipped += 1
      else failed += 1

      results.push({
        id: row.id,
        job_id: row.job_id,
        url,
        type: row.notification_type,
        status: giveUp ? (permanent ? 'skipped' : 'failed') : 'pending',
        error: message,
      })
    }
  }

  return {
    configured: true,
    processed: results.length,
    succeeded,
    failed,
    skipped,
    results,
  }
}
