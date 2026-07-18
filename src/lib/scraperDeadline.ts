/**
 * Deadline / expiry helpers for scraped jobs.
 *
 * Rules:
 * - No deadline found → default to 30 days after publication
 * - Deadline already in the past → do not publish
 */

import { getDefaultValidThrough } from './jobParseNormalization'

/** Normalize a date-ish string to YYYY-MM-DD, or null if unparseable. */
export function parseDeadlineDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // ISO datetime
  const iso = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T\s]/)
  if (iso) return iso[1]

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().split('T')[0]
}

/** True when the deadline day is fully in the past (UTC date comparison). */
export function isDeadlineExpired(
  validThrough: string | null | undefined,
  now = new Date()
): boolean {
  const day = parseDeadlineDate(validThrough)
  if (!day) return false
  const today = now.toISOString().split('T')[0]
  return day < today
}

export type ScrapedDeadlineResult =
  | { action: 'use'; validThrough: string; source: 'explicit' | 'default' }
  | { action: 'skip_expired'; validThrough: string }

/**
 * Resolve the deadline for a scraped job.
 * - Missing / unparseable → 30 days from postingDate
 * - Explicit future (or today) → use it
 * - Explicit past → skip_expired (caller must not publish)
 */
export function resolveScrapedDeadline(
  rawDeadline: string | null | undefined,
  postingDate = new Date()
): ScrapedDeadlineResult {
  const parsed = parseDeadlineDate(rawDeadline)
  if (!parsed) {
    return {
      action: 'use',
      validThrough: getDefaultValidThrough(postingDate),
      source: 'default',
    }
  }

  if (isDeadlineExpired(parsed, postingDate)) {
    return { action: 'skip_expired', validThrough: parsed }
  }

  return { action: 'use', validThrough: parsed, source: 'explicit' }
}

/** expires_at timestamptz at end of the valid_through day (UTC). */
export function expiresAtFromValidThrough(validThrough: string): string {
  const day = parseDeadlineDate(validThrough) || validThrough.slice(0, 10)
  return `${day}T23:59:59.999Z`
}

/** Canonical form for scrape URL dedupe. */
export function normalizeJobUrl(url: string): string {
  try {
    const u = new URL(url.trim())
    u.hash = ''
    u.hostname = u.hostname.toLowerCase()
    u.pathname = u.pathname.replace(/\/+$/, '') || '/'
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(
      key => u.searchParams.delete(key)
    )
    return u.toString()
  } catch {
    return url.trim().replace(/\/+$/, '')
  }
}
