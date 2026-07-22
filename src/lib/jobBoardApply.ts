/**
 * Shared apply-method resolution for job-board / portal sources
 * (BrighterMonday, MyJobMag, and future aggregators).
 *
 * These platforms are not employers. Prefer the real employer's apply
 * link or email from the posting body; only fall back to the board
 * listing URL when neither is present.
 */

export interface JobBoardApplyResolution {
  /** Employer career/apply URL when found; otherwise board listing fallback or null if email-only */
  application_url: string | null
  /** Same as employer URL when found; never the board listing URL */
  apply_link: string | null
  /** Employer apply email when found in the posting */
  apply_email: string | null
  /** True when application_url is the board listing fallback */
  used_board_fallback: boolean
}

export interface ResolveJobBoardApplyInput {
  boardJobUrl: string
  descriptionHtml?: string | null
  /** Explicit external apply URL from the board (e.g. BrighterMonday linkout_url) */
  linkoutUrl?: string | null
  /** Hostnames treated as the board itself (blocked as employer apply targets) */
  boardHosts?: string[]
}

const DEFAULT_BOARD_HOSTS = [
  'brightermonday.co.ke',
  'myjobmag.co.ke',
  'jobberman.com',
  'fuzu.com',
]

const SOCIAL_OR_TRACKING_HOSTS = [
  'facebook.com',
  'fb.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'whatsapp.com',
  'wa.me',
  't.me',
  'googletagmanager.com',
  'google-analytics.com',
  'cookielaw.org',
  'onetrust.com',
  'i.roamcdn.net',
  'webvitalize.io',
  'sentry.io',
  'hotjar.com',
  'sail-horizon.com',
  'hexagon.build',
]

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const HREF_RE = /href=["'](https?:\/\/[^"']+)["']/gi
const BARE_URL_RE = /https?:\/\/[^\s<>"'\\)]+/gi
/** MyJobMag-style CTA: "Go to Employer on careers.example.com to apply" */
const ON_HOST_RE =
  /\bon\s+([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)\b/gi
const ANCHOR_RE = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
/** Hostname-ish token inside anchor/link text (e.g. pscims.publicservice.go.ke) */
const HOST_IN_TEXT_RE =
  /\b([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?){1,})\b/gi

const BLOCKED_EMAIL_LOCAL = new Set([
  'anonymous',
  'example',
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
])

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return null
  }
}

function isBlockedHost(hostname: string, boardHosts: string[]): boolean {
  const host = hostname.toLowerCase()
  return [...boardHosts, ...SOCIAL_OR_TRACKING_HOSTS].some(
    blocked => host === blocked || host.endsWith(`.${blocked}`)
  )
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeHostname(value: string): boolean {
  const host = value.trim().toLowerCase().replace(/^www\./, '')
  if (!host || host.length > 253) return false
  if (!/^[a-z0-9.-]+$/.test(host)) return false
  if (!host.includes('.')) return false
  if (host.startsWith('.') || host.endsWith('.') || host.includes('..')) return false
  // Require a plausible TLD (ke, com, org, go.ke via multi-label already covered)
  const labels = host.split('.')
  const tld = labels[labels.length - 1]
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) return false
  // Skip version-like / IP-ish noise
  if (/^\d+(\.\d+)+$/.test(host)) return false
  return true
}

function hostnameToHttpsUrl(hostname: string): string | null {
  if (!looksLikeHostname(hostname)) return null
  return `https://${hostname.replace(/^www\./i, '').toLowerCase()}/`
}

/** Drop common board tracking params from employer destinations. */
export function stripBoardTrackingParams(url: string): string {
  // String surgery avoids URL() re-encoding query values (e.g. kpx=138/2026).
  const stripped = url
    .replace(/([?&])(utm_[^=&#]*|fbclid|gclid)=[^&#]*/gi, '$1')
    .replace(/[?&]+$/, '')
    .replace(/\?&+/g, '?')
    .replace(/&&+/g, '&')
  return stripped.endsWith('?') ? stripped.slice(0, -1) : stripped
}

function normalizeCandidateUrl(raw: string): string | null {
  if (!raw) return null
  let url = raw.trim()
  url = url.replace(/&amp;/gi, '&')
  url = url.replace(/[),.;]+$/g, '')
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    return stripBoardTrackingParams(parsed.toString())
  } catch {
    return null
  }
}

function hostsFromPlainText(text: string, boardHosts: string[]): string[] {
  const found: string[] = []
  const seen = new Set<string>()

  ON_HOST_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = ON_HOST_RE.exec(text)) !== null) {
    const host = match[1].toLowerCase()
    if (!looksLikeHostname(host)) continue
    if (isBlockedHost(host, boardHosts)) continue
    if (seen.has(host)) continue
    seen.add(host)
    found.push(host)
  }

  return found
}

function hostsFromAnchorText(descriptionHtml: string, boardHosts: string[]): string[] {
  const found: string[] = []
  const seen = new Set<string>()

  ANCHOR_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = ANCHOR_RE.exec(descriptionHtml)) !== null) {
    const href = match[1] || ''
    const text = stripHtml(match[2] || '')
    if (!text) continue

    // Prefer "on example.com" inside the anchor label
    for (const host of hostsFromPlainText(text, boardHosts)) {
      if (seen.has(host)) continue
      seen.add(host)
      found.push(host)
    }

    // Absolute employer href already handled by HREF_RE; for relative/board
    // redirects, harvest hostnames mentioned in the visible label.
    const hrefHost = hostnameOf(href.startsWith('http') ? href : '')
    if (hrefHost && !isBlockedHost(hrefHost, boardHosts)) continue

    HOST_IN_TEXT_RE.lastIndex = 0
    let hostMatch: RegExpExecArray | null
    while ((hostMatch = HOST_IN_TEXT_RE.exec(text)) !== null) {
      const host = hostMatch[1].toLowerCase()
      if (!looksLikeHostname(host)) continue
      if (isBlockedHost(host, boardHosts)) continue
      if (seen.has(host)) continue
      seen.add(host)
      found.push(host)
    }
  }

  return found
}

function scoreApplyUrl(url: string): number {
  const lower = url.toLowerCase()
  let score = 0
  if (/\/(apply|application|applications)\b/.test(lower)) score += 50
  if (/\b(careers?|jobs?|vacancies|recruit|hiring)\b/.test(lower)) score += 30
  if (/forms\.gle|docs\.google\.com\/forms|forms\.office\.com|typeform\.com|airtable\.com|lever\.co|greenhouse\.io|workable\.com|smartrecruiters\.com|taleo\.net|oraclecloud\.com/.test(lower)) {
    score += 40
  }
  if (/\b(apply|application)\b/.test(lower)) score += 15
  // Prefer shorter clean career paths over deep tracking URLs
  try {
    const u = new URL(url)
    if (u.searchParams.size === 0) score += 5
    if (u.pathname.split('/').filter(Boolean).length <= 3) score += 5
  } catch {
    /* ignore */
  }
  return score
}

export function extractJobBoardEmails(
  descriptionHtml: string | null | undefined,
  boardHosts: string[] = DEFAULT_BOARD_HOSTS
): string[] {
  if (!descriptionHtml) return []
  const text = stripHtml(descriptionHtml)
  const seen = new Set<string>()
  const emails: string[] = []

  EMAIL_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = EMAIL_RE.exec(text)) !== null) {
    const email = match[0].toLowerCase()
    const [local, domain] = email.split('@')
    if (!local || !domain) continue
    if (BLOCKED_EMAIL_LOCAL.has(local)) continue
    if (boardHosts.some(h => domain === h || domain.endsWith(`.${h}`))) continue
    if (seen.has(email)) continue
    seen.add(email)
    emails.push(email)
  }

  return emails
}

export function extractJobBoardApplyUrls(
  descriptionHtml: string | null | undefined,
  boardHosts: string[] = DEFAULT_BOARD_HOSTS
): string[] {
  if (!descriptionHtml) return []
  const found = new Set<string>()

  HREF_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = HREF_RE.exec(descriptionHtml)) !== null) {
    const url = normalizeCandidateUrl(match[1])
    if (!url) continue
    const host = hostnameOf(url)
    if (!host || isBlockedHost(host, boardHosts)) continue
    found.add(url)
  }

  const text = stripHtml(descriptionHtml)
  BARE_URL_RE.lastIndex = 0
  while ((match = BARE_URL_RE.exec(text)) !== null) {
    const url = normalizeCandidateUrl(match[0])
    if (!url) continue
    const host = hostnameOf(url)
    if (!host || isBlockedHost(host, boardHosts)) continue
    found.add(url)
  }

  // Employer hostnames embedded in CTA / anchor text (no absolute href).
  // Example: <a href="/apply-now/123">PSCK on pscims.publicservice.go.ke</a>
  for (const host of [
    ...hostsFromAnchorText(descriptionHtml, boardHosts),
    ...hostsFromPlainText(text, boardHosts),
  ]) {
    const url = hostnameToHttpsUrl(host)
    if (url) found.add(url)
  }

  return [...found].sort((a, b) => scoreApplyUrl(b) - scoreApplyUrl(a))
}

/**
 * Resolve how candidates should apply for a job scraped from a portal.
 *
 * Priority:
 * 1. Explicit linkout / external apply URL from the board
 * 2. Employer apply/career URL found in the job description
 * 3. Employer apply email found in the job description
 * 4. Board listing URL (last resort)
 */
export function resolveJobBoardApplication(
  input: ResolveJobBoardApplyInput
): JobBoardApplyResolution {
  const boardHosts = (input.boardHosts?.length ? input.boardHosts : DEFAULT_BOARD_HOSTS).map(h =>
    h.replace(/^www\./i, '').toLowerCase()
  )

  const linkout = normalizeCandidateUrl(input.linkoutUrl || '')
  const linkoutHost = linkout ? hostnameOf(linkout) : null
  const explicitExternal =
    linkout && linkoutHost && !isBlockedHost(linkoutHost, boardHosts) ? linkout : null

  const urls = extractJobBoardApplyUrls(input.descriptionHtml, boardHosts)
  const emails = extractJobBoardEmails(input.descriptionHtml, boardHosts)

  const employerUrl = explicitExternal || urls[0] || null
  const applyEmail = emails[0] || null

  if (employerUrl) {
    return {
      application_url: employerUrl,
      apply_link: employerUrl,
      apply_email: applyEmail,
      used_board_fallback: false,
    }
  }

  if (applyEmail) {
    return {
      application_url: null,
      apply_link: null,
      apply_email: applyEmail,
      used_board_fallback: false,
    }
  }

  return {
    application_url: input.boardJobUrl,
    apply_link: null,
    apply_email: null,
    used_board_fallback: true,
  }
}

/** Adapter types / selector flag for portal scrapers (not employer ATS). */
export function isJobBoardSource(selectors: unknown): boolean {
  const config = (selectors || {}) as { type?: string; sourceKind?: string }
  if (config.sourceKind === 'job_board') return true
  return (
    config.type === 'brightermonday' ||
    config.type === 'myjobmag' ||
    config.type === 'fuzu'
  )
}
