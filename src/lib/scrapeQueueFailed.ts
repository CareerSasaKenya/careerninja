import { SupabaseClient } from '@supabase/supabase-js'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SOURCE_ID_RE = /^[a-z0-9][a-z0-9._-]{0,120}$/i
const MAX_IDS = 200
const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 50
const WRITE_PAGE_SIZE = 500

export interface FailedQueueItem {
  id: string
  source_id: string
  source_name: string | null
  job_url: string
  title: string
  location: string | null
  error_message: string | null
  attempts: number
  queued_at: string | null
  processed_at: string | null
}

export type FailedQueueScope =
  | { kind: 'ids'; ids: string[] }
  | { kind: 'source'; source_id: string }
  | { kind: 'all' }

export type FailedQueueAction = 'retry' | 'delete'

export interface FailedQueueListOptions {
  sourceId?: string
  limit?: number
  offset?: number
}

export interface FailedQueueListResult {
  items: FailedQueueItem[]
  total: number
  limit: number
  offset: number
}

export interface FailedQueueMutationResult {
  action: FailedQueueAction
  affected: number
}

type FailedQueueRow = {
  id: string
  source_id: string
  job_url: string
  error_message: string | null
  attempts: number | null
  queued_at: string | null
  processed_at: string | null
  partial_data: unknown
  scraper_sources?: { name?: string | null } | { name?: string | null }[] | null
}

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function parseFailedQueueScope(body: unknown): FailedQueueScope | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body is required' }
  }

  const raw = body as Record<string, unknown>

  if (Array.isArray(raw.ids)) {
    if (raw.ids.length === 0) return { error: 'ids must not be empty' }
    if (raw.ids.length > MAX_IDS) return { error: `ids is capped at ${MAX_IDS}` }
    if (!raw.ids.every(id => typeof id === 'string' && isUuid(id))) {
      return { error: 'ids must be queue item UUIDs' }
    }
    return { kind: 'ids', ids: [...new Set(raw.ids as string[])] }
  }

  if (typeof raw.source_id === 'string' && raw.source_id.trim()) {
    const sourceId = raw.source_id.trim()
    if (!SOURCE_ID_RE.test(sourceId)) return { error: 'Invalid source_id' }
    return { kind: 'source', source_id: sourceId }
  }

  if (raw.all === true) return { kind: 'all' }

  return { error: 'Provide ids, source_id, or all: true' }
}

export function parseFailedQueueAction(value: unknown): FailedQueueAction | { error: string } {
  if (value === 'retry' || value === 'delete') return value
  return { error: 'action must be retry or delete' }
}

export function parseFailedQueueListOptions(searchParams: URLSearchParams): FailedQueueListOptions | { error: string } {
  const sourceId = searchParams.get('source_id')?.trim() || undefined
  if (sourceId && !SOURCE_ID_RE.test(sourceId)) {
    return { error: 'Invalid source_id' }
  }

  const rawLimit = searchParams.get('limit')
  const rawOffset = searchParams.get('offset')
  const limit = rawLimit == null || rawLimit === '' ? DEFAULT_PAGE_SIZE : Number(rawLimit)
  const offset = rawOffset == null || rawOffset === '' ? 0 : Number(rawOffset)

  if (!Number.isFinite(limit) || limit < 1) return { error: 'limit must be a positive number' }
  if (!Number.isFinite(offset) || offset < 0) return { error: 'offset must be 0 or greater' }

  return {
    sourceId,
    limit: Math.min(Math.floor(limit), MAX_PAGE_SIZE),
    offset: Math.floor(offset),
  }
}

export function failedJobDisplayTitle(partialData: unknown, jobUrl: string): string {
  if (partialData && typeof partialData === 'object') {
    const title = (partialData as Record<string, unknown>).title
    if (typeof title === 'string' && title.trim()) return title.trim()
  }

  try {
    const last = new URL(jobUrl).pathname.split('/').filter(Boolean).pop()
    if (last) {
      const decoded = decodeURIComponent(last).replace(/[-_]+/g, ' ').trim()
      if (decoded) return decoded
    }
  } catch {
    // keep fallback
  }

  return jobUrl
}

export function failedJobLocation(partialData: unknown): string | null {
  if (!partialData || typeof partialData !== 'object') return null
  const location = (partialData as Record<string, unknown>).location
  if (typeof location === 'string' && location.trim()) return location.trim()
  return null
}

function sourceNameFromJoin(
  joined: FailedQueueRow['scraper_sources']
): string | null {
  if (!joined) return null
  const row = Array.isArray(joined) ? joined[0] : joined
  const name = row?.name
  return typeof name === 'string' && name.trim() ? name : null
}

export function mapFailedQueueRow(row: FailedQueueRow): FailedQueueItem {
  return {
    id: row.id,
    source_id: row.source_id,
    source_name: sourceNameFromJoin(row.scraper_sources),
    job_url: row.job_url,
    title: failedJobDisplayTitle(row.partial_data, row.job_url),
    location: failedJobLocation(row.partial_data),
    error_message: row.error_message,
    attempts: row.attempts || 0,
    queued_at: row.queued_at,
    processed_at: row.processed_at,
  }
}

const FAILED_SELECT =
  'id, source_id, job_url, error_message, attempts, queued_at, processed_at, partial_data, scraper_sources(name)'

export async function listFailedQueueItems(
  supabase: SupabaseClient,
  options: FailedQueueListOptions = {}
): Promise<FailedQueueListResult> {
  const limit = options.limit ?? DEFAULT_PAGE_SIZE
  const offset = options.offset ?? 0

  let query = supabase
    .from('scrape_queue')
    .select(FAILED_SELECT, { count: 'exact' })
    .eq('status', 'failed')
    .order('processed_at', { ascending: false })
    .order('queued_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options.sourceId) {
    query = query.eq('source_id', options.sourceId)
  }

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: ((data || []) as FailedQueueRow[]).map(mapFailedQueueRow),
    total: count ?? 0,
    limit,
    offset,
  }
}

function applyScope<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  scope: FailedQueueScope
): T {
  if (scope.kind === 'source') return query.eq('source_id', scope.source_id)
  return query
}

export async function retryFailedQueueItems(
  supabase: SupabaseClient,
  scope: FailedQueueScope
): Promise<number> {
  const patch = {
    status: 'pending',
    error_message: 'Requeued by admin after failure',
    attempts: 0,
    processed_at: null,
  }

  if (scope.kind === 'ids') {
    const { data, error } = await supabase
      .from('scrape_queue')
      .update(patch)
      .eq('status', 'failed')
      .in('id', scope.ids)
      .select('id')
    if (error) throw error
    return data?.length || 0
  }

  let affected = 0
  for (;;) {
    const { data, error } = await applyScope(
      supabase.from('scrape_queue').update(patch).eq('status', 'failed'),
      scope
    )
      .select('id')
      .limit(WRITE_PAGE_SIZE)
    if (error) throw error
    const n = data?.length || 0
    affected += n
    if (n < WRITE_PAGE_SIZE) break
  }
  return affected
}

export async function deleteFailedQueueItems(
  supabase: SupabaseClient,
  scope: FailedQueueScope
): Promise<number> {
  if (scope.kind === 'ids') {
    const { data, error } = await supabase
      .from('scrape_queue')
      .delete()
      .eq('status', 'failed')
      .in('id', scope.ids)
      .select('id')
    if (error) throw error
    return data?.length || 0
  }

  let affected = 0
  for (;;) {
    const { data, error } = await applyScope(
      supabase.from('scrape_queue').delete().eq('status', 'failed'),
      scope
    )
      .select('id')
      .limit(WRITE_PAGE_SIZE)
    if (error) throw error
    const n = data?.length || 0
    affected += n
    if (n < WRITE_PAGE_SIZE) break
  }
  return affected
}

export async function mutateFailedQueueItems(
  supabase: SupabaseClient,
  action: FailedQueueAction,
  scope: FailedQueueScope
): Promise<FailedQueueMutationResult> {
  const affected =
    action === 'retry'
      ? await retryFailedQueueItems(supabase, scope)
      : await deleteFailedQueueItems(supabase, scope)
  return { action, affected }
}
