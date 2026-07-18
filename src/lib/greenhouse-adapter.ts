/**
 * Greenhouse Job Board API Adapter
 *
 * Public API — no authentication required.
 * Docs: https://developers.greenhouse.io/job-board.html
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "greenhouse",
 *   "slug": "oneacrefund",
 *   "filterCountry": "Kenya"
 * }
 */

import { generateContentHash, NormalizedJob } from './scraper'

const LIST_API = (slug: string) =>
  `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`

const DETAIL_API = (slug: string, jobId: string | number) =>
  `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${jobId}`

export interface GreenhouseSourceConfig {
  type: 'greenhouse'
  slug: string
  filterCountry?: string
  category?: string
}

interface GreenhouseLocation {
  name?: string
}

interface GreenhouseJob {
  id: number
  title: string
  absolute_url?: string
  location?: GreenhouseLocation
  updated_at?: string
  content?: string
  departments?: Array<{ name?: string }>
  offices?: Array<{ name?: string; location?: string }>
  metadata?: Array<{ name?: string; value?: unknown }>
}

interface GreenhouseListResponse {
  jobs?: GreenhouseJob[]
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms)
}

function matchesCountry(job: GreenhouseJob, filterCountry?: string): boolean {
  if (!filterCountry) return true
  const needle = filterCountry.toLowerCase()
  const haystacks = [
    job.location?.name,
    ...(job.offices || []).flatMap(o => [o.name, o.location]),
  ]
    .filter(Boolean)
    .map(s => String(s).toLowerCase())

  if (haystacks.length === 0) return true
  return haystacks.some(h => h.includes(needle) || (needle === 'kenya' && h.includes('ke')))
}

export async function discoverGreenhouseJobs(
  config: GreenhouseSourceConfig
): Promise<Array<{ job_url: string; partial_data: { title: string; location: string } }>> {
  if (!config.slug) {
    throw new Error('Greenhouse source is missing selectors.slug')
  }

  const response = await fetch(LIST_API(config.slug), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
    },
    signal: withTimeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Greenhouse API error ${response.status} for slug "${config.slug}"`)
  }

  const data = (await response.json()) as GreenhouseListResponse
  const jobs = (data.jobs || []).filter(job => matchesCountry(job, config.filterCountry))

  return jobs.map(job => ({
    job_url: job.absolute_url || `https://boards.greenhouse.io/${config.slug}/jobs/${job.id}`,
    partial_data: {
      title: job.title,
      location: job.location?.name || '',
    },
  }))
}

export function extractGreenhouseSlug(jobUrl: string): string | null {
  try {
    const url = new URL(jobUrl)
    // boards.greenhouse.io/{slug}/jobs/{id}
    const pathMatch = url.pathname.match(/^\/([^/]+)\/jobs\/\d+/i)
    if (url.hostname.includes('greenhouse.io') && pathMatch) return pathMatch[1]
    return null
  } catch {
    return null
  }
}

export function extractGreenhouseJobId(jobUrl: string): string | null {
  const pathMatch = jobUrl.match(/\/jobs\/(\d+)/i)
  if (pathMatch) return pathMatch[1]
  try {
    const ghJid = new URL(jobUrl).searchParams.get('gh_jid')
    if (ghJid && /^\d+$/.test(ghJid)) return ghJid
  } catch {
    /* ignore */
  }
  return null
}

export async function fetchGreenhouseJobDetails(
  slug: string,
  jobId: string
): Promise<GreenhouseJob> {
  const response = await fetch(DETAIL_API(slug, jobId), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
    },
    signal: withTimeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Greenhouse detail API error ${response.status} for job ${jobId}`)
  }

  return (await response.json()) as GreenhouseJob
}

export function normalizeGreenhouseJob(
  job: GreenhouseJob,
  companyName: string
): NormalizedJob {
  const descriptionHtml = job.content || ''
  const location = job.location?.name || 'Kenya'

  return {
    title: job.title?.trim() || 'Untitled role',
    company: companyName,
    description: descriptionHtml || `<p>${job.title}</p>`,
    responsibilities: '',
    required_qualifications: '',
    employment_type: 'FULL_TIME',
    job_location_type: /remote/i.test(location) ? 'REMOTE' : 'ON_SITE',
    job_location_country: /kenya/i.test(location) ? 'Kenya' : 'Kenya',
    job_location_county: '',
    job_location_city: location.split(',')[0]?.trim() || '',
    location,
    apply_link: job.absolute_url || '',
    application_url: job.absolute_url || '',
    valid_through: null,
    salary_min: null,
    salary_max: null,
    salary_currency: 'KES',
    salary_period: 'MONTH',
    salary_visibility: 'Hide',
    experience_level: 'Mid',
    minimum_experience: null,
    industry: job.departments?.[0]?.name || null,
    status: 'active',
    posted_by: 'admin',
    tags: [job.departments?.[0]?.name, 'Greenhouse'].filter(Boolean).join(','),
  }
}

export function greenhouseContentHash(job: GreenhouseJob, companyName: string): string {
  return generateContentHash(
    job.title || '',
    companyName,
    job.location?.name || ''
  )
}
