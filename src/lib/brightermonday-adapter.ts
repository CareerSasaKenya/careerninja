/**
 * BrighterMonday Kenya job-board adapter
 *
 * No public API — discovers listing URLs from /jobs pages and parses
 * schema.org JobPosting JSON-LD on each /listings/{slug} detail page.
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "brightermonday",
 *   "category": "other",
 *   "maxPages": 5
 * }
 */

import { generateContentHash, NormalizedJob } from './scraper'

const DEFAULT_BASE = 'https://www.brightermonday.co.ke'
const LISTING_PATH = '/jobs'
const LISTING_PATH_RE = /\/listings\/[a-z0-9-]+/gi

export interface BrighterMondaySourceConfig {
  type: 'brightermonday'
  category?: string
  maxPages?: number
  baseHost?: string
}

export interface BrighterMondayJobDetail {
  jobUrl: string
  title: string
  company: string
  location: string
  descriptionHtml: string
  employmentType: string
  industry: string | null
  occupationalCategory: string | null
  qualifications: string | null
  datePosted: string | null
  validThrough: string | null
  salaryCurrency: string
  salaryMin: number | null
  salaryMax: number | null
  salaryPeriod: string
  minimumExperienceYears: number | null
  addressLocality: string | null
  addressRegion: string | null
  addressCountry: string | null
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms)
}

function originFromBaseUrl(baseUrl?: string, baseHost?: string): string {
  if (baseHost) {
    return baseHost.startsWith('http') ? baseHost.replace(/\/$/, '') : `https://${baseHost}`
  }
  if (baseUrl) {
    try {
      return new URL(baseUrl).origin
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_BASE
}

async function fetchPageHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
      'Accept-Language': 'en-KE,en;q=0.9',
    },
    signal: withTimeout(20000),
  })

  if (!response.ok) {
    throw new Error(`BrighterMonday HTTP ${response.status} fetching ${url}`)
  }

  return response.text()
}

function listingPageUrls(origin: string, maxPages: number): string[] {
  const pages = Math.max(1, Math.min(maxPages, 10))
  const first = `${origin}${LISTING_PATH}`
  const urls = [first]
  for (let page = 2; page <= pages; page++) {
    urls.push(`${first}?page=${page}`)
  }
  return urls
}

function extractListingUrls(html: string, origin: string): string[] {
  const found = new Set<string>()
  LISTING_PATH_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = LISTING_PATH_RE.exec(html)) !== null) {
    found.add(`${origin}${match[0]}`)
  }
  return [...found]
}

export async function discoverBrighterMondayJobs(
  config: BrighterMondaySourceConfig,
  baseUrl?: string
): Promise<Array<{ job_url: string; partial_data: { title?: string; location?: string } }>> {
  const origin = originFromBaseUrl(baseUrl, config.baseHost)
  const maxPages = typeof config.maxPages === 'number' ? config.maxPages : 5
  const pageUrls = listingPageUrls(origin, maxPages)
  const seen = new Set<string>()

  for (const pageUrl of pageUrls) {
    const html = await fetchPageHtml(pageUrl)
    for (const jobUrl of extractListingUrls(html, origin)) {
      seen.add(jobUrl)
    }
  }

  return [...seen].map(job_url => ({
    job_url,
    partial_data: {},
  }))
}

function findById(graph: Array<Record<string, unknown>>, id: unknown): Record<string, unknown> | null {
  if (typeof id !== 'string' || !Array.isArray(graph)) return null
  return graph.find(node => node && node['@id'] === id) || null
}

function resolveRef(
  graph: Array<Record<string, unknown>>,
  value: unknown
): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === 'string') return findById(graph, value)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if (typeof obj['@id'] === 'string' && Object.keys(obj).length === 1) {
      return findById(graph, obj['@id']) || obj
    }
    return obj
  }
  return null
}

function cleanText(value: unknown): string | null {
  if (value == null) return null
  const text = String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text || null
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function parseEmploymentType(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return 'FULL_TIME'
  const t = String(raw).toUpperCase().replace(/[\s-]+/g, '_')
  if (t.includes('PART')) return 'PART_TIME'
  if (t.includes('CONTRACT')) return 'CONTRACTOR'
  if (t.includes('INTERN')) return 'INTERN'
  if (t.includes('TEMP')) return 'TEMPORARY'
  if (t.includes('VOLUNTEER')) return 'VOLUNTEER'
  if (t.includes('FULL')) return 'FULL_TIME'
  return 'FULL_TIME'
}

export function parseBrighterMondayJobHtml(html: string, jobUrl: string): BrighterMondayJobDetail {
  const ldMatch = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  )
  if (!ldMatch) {
    throw new Error(`No JSON-LD found on BrighterMonday page: ${jobUrl}`)
  }

  let payload: unknown
  try {
    payload = JSON.parse(ldMatch[1])
  } catch {
    throw new Error(`Invalid JSON-LD on BrighterMonday page: ${jobUrl}`)
  }

  const graph: Array<Record<string, unknown>> = Array.isArray(
    (payload as { '@graph'?: unknown })?.['@graph']
  )
    ? ((payload as { '@graph': Array<Record<string, unknown>> })['@graph'])
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [payload as Record<string, unknown>]

  const posting = graph.find(node => {
    const type = node?.['@type']
    return type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))
  })

  if (!posting) {
    throw new Error(`No JobPosting JSON-LD on BrighterMonday page: ${jobUrl}`)
  }

  const org = resolveRef(graph, posting.hiringOrganization)
  const place = resolveRef(graph, posting.jobLocation)
  const address = place ? resolveRef(graph, place.address) || (place.address as Record<string, unknown>) || {} : {}
  const salary = (posting.baseSalary as Record<string, unknown>) || {}
  const salaryValue = (salary.value as Record<string, unknown>) || {}
  const experience = (posting.experienceRequirements as Record<string, unknown>) || {}
  const months = toNumber(experience.monthsOfExperience)

  const company =
    cleanText(org?.name) ||
    cleanText(org?.legalName) ||
    'Company Name Not Available'

  const locality = cleanText(address.addressLocality)
  const region = cleanText(address.addressRegion)
  const country = cleanText(address.addressCountry) || 'Kenya'
  const location = [...new Set([locality, region, country].filter(Boolean))].join(', ') || 'Kenya'

  return {
    jobUrl,
    title: cleanText(posting.title) || 'Untitled Position',
    company,
    location,
    descriptionHtml: typeof posting.description === 'string' ? posting.description : '',
    employmentType: parseEmploymentType(posting.employmentType),
    industry: cleanText(posting.industry),
    occupationalCategory: cleanText(posting.occupationalCategory),
    qualifications: cleanText(posting.qualifications),
    datePosted: typeof posting.datePosted === 'string' ? posting.datePosted : null,
    validThrough: typeof posting.validThrough === 'string' ? posting.validThrough : null,
    salaryCurrency: cleanText(salary.currency) || 'KES',
    salaryMin: toNumber(salaryValue.minValue ?? salaryValue.value),
    salaryMax: toNumber(salaryValue.maxValue ?? salaryValue.value),
    salaryPeriod: cleanText(salaryValue.unitText) || 'MONTH',
    minimumExperienceYears: months != null ? Math.round(months / 12) : null,
    addressLocality: locality,
    addressRegion: region,
    addressCountry: country,
  }
}

export async function fetchBrighterMondayJobDetails(jobUrl: string): Promise<BrighterMondayJobDetail> {
  const html = await fetchPageHtml(jobUrl)
  return parseBrighterMondayJobHtml(html, jobUrl)
}

const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Kiambu',
  'Machakos',
  'Kajiado',
  'Kilifi',
  'Kwale',
  'Uasin Gishu',
  'Kisii',
  'Nyeri',
]

function inferCounty(detail: BrighterMondayJobDetail): string {
  const haystack = `${detail.addressLocality || ''} ${detail.addressRegion || ''} ${detail.location || ''}`
  for (const county of KENYAN_COUNTIES) {
    if (haystack.toLowerCase().includes(county.toLowerCase())) return county
  }
  return ''
}

export function normalizeBrighterMondayJob(detail: BrighterMondayJobDetail): NormalizedJob {
  const hasSalary = detail.salaryMin != null || detail.salaryMax != null
  const county = inferCounty(detail)
  const city = detail.addressLocality && detail.addressLocality !== 'Kenya'
    ? detail.addressLocality
    : county

  return {
    title: detail.title,
    company: detail.company,
    description: detail.descriptionHtml || `<p>${detail.title}</p>`,
    responsibilities: '',
    required_qualifications: detail.qualifications || '',
    employment_type: detail.employmentType,
    job_location_type: /remote/i.test(detail.location) ? 'REMOTE' : 'ON_SITE',
    job_location_country: 'Kenya',
    job_location_county: county,
    job_location_city: city || '',
    location: detail.location,
    apply_link: detail.jobUrl,
    application_url: detail.jobUrl,
    valid_through: detail.validThrough,
    salary_min: detail.salaryMin,
    salary_max: detail.salaryMax,
    salary_currency: detail.salaryCurrency || 'KES',
    salary_period: detail.salaryPeriod || 'MONTH',
    salary_visibility: hasSalary ? 'Show' : 'Hide',
    experience_level: detail.qualifications || 'Mid',
    minimum_experience: detail.minimumExperienceYears,
    industry: detail.industry,
    status: 'active',
    posted_by: 'admin',
    tags: [detail.occupationalCategory, detail.industry, 'BrighterMonday']
      .filter(Boolean)
      .join(','),
  }
}

export function brighterMondayContentHash(detail: BrighterMondayJobDetail): string {
  return generateContentHash(detail.title, detail.company, detail.location)
}
