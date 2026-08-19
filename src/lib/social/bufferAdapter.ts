/**
 * Buffer adapter — the ONLY module that talks to the Buffer GraphQL API.
 *
 * Careersasa talks to this adapter (via the Social Post Service); Buffer can
 * later be swapped for a native Careersasa publishing engine by replacing
 * this file with an adapter that implements the same surface.
 *
 * Buffer GraphQL API (2026):
 *   Base URL : https://api.buffer.com   (always POST)
 *   Auth     : Authorization: Bearer <personal API key>
 *   Key      : generated at publish.buffer.com/settings/api
 *
 * The key is resolved server-side only: first from the BUFFER_API_KEY env var
 * (recommended), then from the service-role buffer_config table. It is never
 * exposed to the browser.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  BufferAccountInfo,
  BufferChannel,
} from './types'

const BUFFER_API_BASE = 'https://api.buffer.com'
const BUFFER_TIMEOUT_MS = 15000

export class BufferApiError extends Error {
  status: number
  code: string | null

  constructor(message: string, opts: { status?: number; code?: string | null } = {}) {
    super(message)
    this.name = 'BufferApiError'
    this.status = opts.status ?? 0
    this.code = opts.code ?? null
  }
}

/** Friendly, action-oriented error mapping for common Buffer failures. */
function friendlyMessage(message: string, channelName?: string | null): string {
  const m = message.toLowerCase()
  if (m.includes('unauthorized') || m.includes('invalid api key') || m.includes('401')) {
    return 'Buffer rejected the API key. Check the key in Buffer Settings (publish.buffer.com/settings/api) and reconnect.'
  }
  if (m.includes('queue limit') || m.includes('queue is full')) {
    return `Buffer queue limit reached${channelName ? ` for ${channelName}` : ''}. Publish now, add to queue, or use a custom schedule instead.`
  }
  if (m.includes('not found') || m.includes('invalid channel')) {
    return `Buffer channel${channelName ? ` "${channelName}"` : ''} is invalid or no longer connected. Refresh channels in Buffer Settings.`
  }
  if (m.includes('rate limit') || m.includes('429')) {
    return 'Buffer rate limit reached. Wait a few minutes before sending more posts.'
  }
  if (
    /\btext\b/.test(m) &&
    (m.includes('required') || m.includes('expect') || m.includes('missing') || m.includes('empty'))
  ) {
    return `Buffer rejected the ${channelName ? `${channelName} ` : ''}post because the caption text was missing. Edit the post, add text, and send again.`
  }
  if (m.includes('parameter message')) {
    return `Facebook needs a caption before this can be published${channelName ? ` to ${channelName}` : ''}. Add post text and try again.`
  }
  return message
}

export interface BufferResolvedKey {
  apiKey: string
  source: 'env' | 'db'
}

/**
 * Resolve the active Buffer API key.
 * Priority: BUFFER_API_KEY env var → buffer_config.api_key.
 * Requires an adminClient for the DB fallback.
 */
export async function resolveBufferApiKey(
  adminClient: SupabaseClient
): Promise<BufferResolvedKey | null> {
  const fromEnv = process.env.BUFFER_API_KEY?.trim()
  if (fromEnv) return { apiKey: fromEnv, source: 'env' }

  const { data, error } = await adminClient
    .from('buffer_config')
    .select('api_key')
    .eq('id', 1)
    .maybeSingle()
  if (error) {
    console.error('[bufferAdapter] buffer_config read error:', error.message)
    return null
  }
  const key = data?.api_key?.trim()
  if (!key) return null
  return { apiKey: key, source: 'db' }
}

async function bufferGraphQl<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BUFFER_TIMEOUT_MS)
  try {
    const res = await fetch(BUFFER_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    if (res.status === 429) {
      throw new BufferApiError('Buffer rate limit exceeded (HTTP 429)', {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
      })
    }
    if (res.status === 401 || res.status === 403) {
      throw new BufferApiError('Buffer rejected the API key (unauthorized)', {
        status: res.status,
        code: 'UNAUTHORIZED',
      })
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new BufferApiError(`Buffer API HTTP ${res.status}: ${body.slice(0, 200)}`, {
        status: res.status,
      })
    }

    const json = (await res.json()) as {
      data?: T
      errors?: { message?: string; extensions?: { code?: string } }[]
    }

    if (json.errors && json.errors.length > 0) {
      const msg = json.errors
        .map((e) => e.message || e.extensions?.code || 'Unknown error')
        .join('; ')
      throw new BufferApiError(friendlyMessage(msg))
    }
    if (json.data === undefined) {
      throw new BufferApiError('Buffer API returned an empty response')
    }
    return json.data
  } catch (err: unknown) {
    if (err instanceof BufferApiError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new BufferApiError('Buffer API request timed out. Try again.', { status: 408 })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** GET /account + organizations — used to validate a key on connect. */
export async function bufferGetAccount(apiKey: string): Promise<BufferAccountInfo> {
  const data = await bufferGraphQl<{ account: BufferAccountInfo | null }>(
    apiKey,
    `query {
      account {
        id
        email
        name
        organizations { id name }
      }
    }`
  )
  if (!data?.account) {
    throw new BufferApiError('Buffer API key is valid but returned no account data')
  }
  return data.account
}

/** List connected social channels for an organization. */
export async function bufferListChannels(
  apiKey: string,
  organizationId: string
): Promise<BufferChannel[]> {
  const data = await bufferGraphQl<{ channels: BufferChannel[] | null }>(
    apiKey,
    `query Channels($orgId: OrganizationId!) {
      channels(input: { organizationId: $orgId }) {
        id
        name
        service
        avatar
        isQueuePaused
      }
    }`,
    { orgId: organizationId }
  )
  return data?.channels ?? []
}

export interface CreatePostInput {
  channelId: string
  text: string
  mode: 'now' | 'schedule' | 'queue'
  dueAt?: string | null
  channelName?: string | null
  /** Buffer channel.service (facebook, linkedin, instagram, …). */
  service?: string | null
  /** Public HTTPS image URL, used as a Buffer image asset when present. */
  mediaUrl?: string | null
}

const FIRST_URL_RE = /https?:\/\/[^\s)>\]]+/i

export function extractFirstUrl(text: string): string | null {
  const match = text.match(FIRST_URL_RE)
  return match ? match[0] : null
}

function channelService(service?: string | null): string {
  return (service ?? '').trim().toLowerCase()
}

/**
 * Build the GraphQL CreatePostInput object.
 * Facebook in particular rejects posts that arrive without a caption (`text`)
 * or without an explicit post type — Buffer then surfaces "Text is required".
 */
export function buildCreatePostVariables(input: CreatePostInput): Record<string, unknown> {
  const text = (input.text ?? '').trim()
  if (!text) {
    throw new BufferApiError(
      'Post text is required. Add a caption before sending to Buffer.'
    )
  }

  const mode =
    input.mode === 'now'
      ? 'shareNow'
      : input.mode === 'schedule'
        ? 'customScheduled'
        : 'addToQueue'

  const assets: Record<string, unknown>[] = []
  const mediaUrl = input.mediaUrl?.trim()
  if (mediaUrl) {
    assets.push({ image: { url: mediaUrl } })
  }

  const payload: Record<string, unknown> = {
    channelId: input.channelId,
    text,
    assets,
    schedulingType: 'automatic',
    mode,
    needsApproval: false,
  }

  if (input.mode === 'schedule') {
    if (!input.dueAt) {
      throw new BufferApiError('A scheduled time is required when scheduling a post')
    }
    payload.dueAt = input.dueAt
  }

  const service = channelService(input.service)
  if (service.includes('facebook')) {
    const facebook: Record<string, unknown> = { type: 'post' }
    const link = extractFirstUrl(text)
    // Link cards are mutually exclusive with a non-empty assets array.
    if (link && assets.length === 0) {
      facebook.linkAttachment = { url: link }
    }
    payload.metadata = { facebook }
  }

  return payload
}

export interface CreatedBufferPost {
  id: string
  dueAt: string | null
  status: string | null
}

/**
 * Create a post on Buffer.
 * mode: 'now' → shareNow, 'schedule' → customScheduled (dueAt required), 'queue' → addToQueue.
 */
export async function bufferCreatePost(
  apiKey: string,
  input: CreatePostInput
): Promise<CreatedBufferPost> {
  const variables = { input: buildCreatePostVariables(input) }

  const query = `mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post { id text status dueAt }
      }
      ... on InvalidInputError { message }
      ... on MutationError { message }
    }
  }`

  const data = await bufferGraphQl<{
    createPost: { post?: CreatedBufferPost; message?: string } | null
  }>(apiKey, query, variables)

  const result = data?.createPost
  if (!result) {
    throw new BufferApiError('Buffer returned no result for createPost')
  }
  if (result.message || !result.post) {
    throw new BufferApiError(
      friendlyMessage(result.message || 'Buffer could not create the post', input.channelName)
    )
  }
  return result.post
}

/** Delete a post on Buffer by its Buffer post id (used when cancelling queued posts). */
export async function bufferDeletePost(apiKey: string, bufferPostId: string): Promise<void> {
  const query = `mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      ... on DeletePostSuccess { id }
      ... on VoidMutationError { message }
    }
  }`
  const data = await bufferGraphQl<{
    deletePost: { id?: string; message?: string } | null
  }>(apiKey, query, { input: { id: bufferPostId } })

  const result = data?.deletePost
  if (result && 'message' in (result ?? {}) && (result as { message?: string }).message) {
    throw new BufferApiError(
      friendlyMessage((result as { message: string }).message, null)
    )
  }
}
