/**
 * Resolve an employer's official website domain when the known-brand map misses.
 *
 * Uses Gemini/Groq/OpenRouter (same stack as job parsing) — never generates logos.
 * Suggested domains are always verified later via fetchCompanyLogoUrl().
 */

import { callAI, hasAIConfigured } from './aiProviders'
import { extractDomain, lookupBrand, resolveCompanyDomain } from './companyLogo'

export type DomainLookupResult = {
  domain: string | null
  source: 'known_brand' | 'heuristic' | 'ai' | 'none'
  confidence?: 'high' | 'medium' | 'low'
}

const memoryCache = new Map<string, DomainLookupResult>()

const DOMAIN_LOOKUP_PROMPT = `You find the official public website domain for an employer/organization.
Return ONLY valid JSON (no markdown).

Rules:
1. Prefer the organization's primary official website (not LinkedIn, Facebook, Wikipedia, Glassdoor, or job boards).
2. Prefer country-specific domains when the org is clearly Kenyan/East African (.co.ke, .or.ke, .go.ke, .ac.ke).
3. domain must be hostname only, lowercase, no protocol, no path, no www. (e.g. "amref.org")
4. If you are not reasonably sure, return domain null.
5. Never invent a domain that does not exist.

JSON shape:
{"domain":"example.com"|"null as JSON null","confidence":"high"|"medium"|"low","reason":"short"}`

function cacheKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function sanitizeDomain(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let value = raw.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, '').replace(/^www\./, '')
  value = value.split('/')[0].split('?')[0].replace(/\.$/, '')
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(value)) {
    return null
  }
  // Reject social / job-board domains — not employer logos
  const blocked = [
    'linkedin.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'wikipedia.org',
    'glassdoor.com',
    'indeed.com',
    'brightermonday.co.ke',
    'myjobmag.co.ke',
    'fuzu.com',
    'smartrecruiters.com',
    'workable.com',
    'greenhouse.io',
    'lever.co',
  ]
  if (blocked.some(b => value === b || value.endsWith(`.${b}`))) return null
  return value
}

/**
 * Resolve domain without AI (known brands + optional website hint).
 */
export function resolveDomainLocally(
  companyName: string,
  websiteHint?: string | null
): DomainLookupResult {
  const fromHint = extractDomain(websiteHint || null)
  if (fromHint) return { domain: fromHint, source: 'heuristic' }

  const brand = lookupBrand(companyName)
  if (brand?.domain) return { domain: brand.domain, source: 'known_brand' }

  const heuristic = resolveCompanyDomain(companyName, null)
  if (heuristic) return { domain: heuristic, source: 'heuristic' }

  return { domain: null, source: 'none' }
}

/**
 * Resolve domain with optional AI assist when local maps miss.
 */
export async function resolveCompanyDomainSmart(
  companyName: string,
  options?: { websiteHint?: string | null; allowAI?: boolean }
): Promise<DomainLookupResult> {
  const name = companyName?.trim()
  if (!name) return { domain: null, source: 'none' }

  const key = cacheKey(name)
  const cached = memoryCache.get(key)
  if (cached) return cached

  const local = resolveDomainLocally(name, options?.websiteHint)
  if (local.domain) {
    memoryCache.set(key, local)
    return local
  }

  const allowAI = options?.allowAI !== false
  if (!allowAI || !hasAIConfigured()) {
    memoryCache.set(key, local)
    return local
  }

  try {
    const result = await callAI(
      `COMPANY / ORGANIZATION NAME: ${name}\nCOUNTRY CONTEXT: Kenya / East Africa (prefer local official site when applicable)`,
      {
        systemPrompt: DOMAIN_LOOKUP_PROMPT,
        json: true,
        temperature: 0,
        maxTokens: 200,
      }
    )

    const parsed = (result.parsed || {}) as {
      domain?: string | null
      confidence?: 'high' | 'medium' | 'low'
    }
    const domain = sanitizeDomain(parsed.domain)
    const confidence = parsed.confidence || 'low'

    // Only accept medium/high confidence suggestions
    if (domain && (confidence === 'high' || confidence === 'medium')) {
      const aiResult: DomainLookupResult = { domain, source: 'ai', confidence }
      memoryCache.set(key, aiResult)
      return aiResult
    }
  } catch (err) {
    console.warn(
      '[companyDomainLookup] AI domain lookup failed for',
      name,
      err instanceof Error ? err.message : err
    )
  }

  memoryCache.set(key, local)
  return local
}
