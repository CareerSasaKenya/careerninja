/**
 * Greenhouse Job Board API Adapter
 *
 * Public boards API — no authentication required.
 * Docs: https://developers.greenhouse.io/job-board.html
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "greenhouse",
 *   "slug": "oneacrefund",
 *   "filterCountry": "Kenya",   // match location/office text (case-insensitive)
 *   "category": "ngo"
 * }
 */

import { generateContentHash, NormalizedJob } from './scraper'

const LIST_API = (slug: string) =>
  `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`

const DETAIL_API = (slug: string, jobId: string | number) =>
  `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${jobId}`

const BOARD_JOB_URL = (slug: string, jobId: string | number) =>
  `https://boards.greenhouse.io/${slug}/jobs/${jobId}`

export interface GreenhouseSourceConfig {
  type: 'greenhouse'
  slug: string
  /** Substring match against location name + office names (e.g. "Kenya") */
  filterCountry?: string
  category?: string
}

interface GreenhouseOffice {
  id?: number
  name?: string
  location?: string
}

interface GreenhouseDepartment {
  id?: number
  name?: string
}

export interface GreenhouseJobListing {
  id: number
  title: string
  updated_at?: string
  absolute_url?: string
  location?: { name?: string }
  departments?: GreenhouseDepartment[]
  offices?: GreenhouseOffice[]
  metadata?: Array<{ name?: string; value?: unknown }>
}

export interface GreenhouseJobDetail extends GreenhouseJobListing {
  content?: string
  first_published?: string
}

interface ListResponse {
  jobs?: GreenhouseJobListing[]
}

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function locationHaystack(job: GreenhouseJobListing): string {
  const parts = [
    job.location?.name || '',
    ...(job.offices || []).flatMap(o => [o.name || '', o.location || '']),
  ]
  return parts.join(' ').toLowerCase()
}

function matchesCountryFilter(job: GreenhouseJobListing, filterCountry?: string): boolean {
  if (!filterCountry) return true
  const hay = locationHaystack(job)
  const needle = filterCountry.toLowerCase()
  if (hay.includes(needle)) return true
  // Common Kenya city fallbacks when filter is "Kenya"
  if (needle === 'kenya') {
    return (
      hay.includes('nairobi') ||
      hay.includes('mombasa') ||
      hay.includes('kisumu') ||
      hay.includes('nakuru') ||
      hay.includes('eldoret')
    )
  }
  return false
}

function pickKenyaLocationLabel(job: GreenhouseJobListing, filterCountry?: string): string {
  const raw = job.location?.name?.trim() || ''
  if (raw) return raw

  const offices = job.offices || []
  if (filterCountry) {
    const needle = filterCountry.toLowerCase()
    const match = offices.find(o =>
      [o.name, o.location].some(v => (v || '').toLowerCase().includes(needle))
    )
    if (match?.name || match?.location) {
      return [match.name, match.location].filter(Boolean).join(', ')
    }
  }
  return offices.map(o => o.name || o.location).filter(Boolean).join(', ') || 'Kenya'
}

function parseCityCounty(locationLabel: string): { city: string; county: string } {
  // e.g. "Nairobi, Kenya" | "Nairobi, Nairobi, Kenya, Lagos, Nigeria"
  const parts = locationLabel
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .filter(p => !/^kenya$/i.test(p))

  const city = parts[0] || ''
  const countyCandidate = parts[1] || ''
  const county =
    countyCandidate && !/^(rwanda|uganda|tanzania|nigeria|ethiopia|ghana|south africa)$/i.test(countyCandidate)
      ? countyCandidate.replace(/\s+county$/i, '').trim()
      : ''

  return { city, county }
}

function metadataValue(detail: GreenhouseJobDetail, name: string): string | null {
  const entry = detail.metadata?.find(
    m => (m.name || '').toLowerCase() === name.toLowerCase()
  )
  if (!entry || entry.value == null) return null
  if (typeof entry.value === 'string') return entry.value
  if (typeof entry.value === 'number' || typeof entry.value === 'boolean') {
    return String(entry.value)
  }
  return null
}

function normalizeEmploymentType(raw?: string | null): string {
  const v = (raw || '').toLowerCase()
  if (v.includes('part')) return 'PART_TIME'
  if (v.includes('intern')) return 'INTERN'
  if (v.includes('contract') || v.includes('fixed') || v.includes('temporary') || v.includes('temp')) {
    return 'CONTRACTOR'
  }
  if (v.includes('volunteer')) return 'VOLUNTEER'
  return 'FULL_TIME'
}

export async function discoverGreenhouseJobs(
  config: GreenhouseSourceConfig
): Promise<
  Array<{
    job_url: string
    partial_data: { title: string; location: string; greenhouse_job_id: string }
  }>
> {
  const response = await fetch(LIST_API(config.slug), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Greenhouse API error ${response.status} for slug "${config.slug}"`)
  }

  const data: ListResponse = await response.json()
  const jobs = (data.jobs || []).filter(job => matchesCountryFilter(job, config.filterCountry))

  return jobs.map(job => {
    const location = pickKenyaLocationLabel(job, config.filterCountry)
    return {
      job_url: job.absolute_url || BOARD_JOB_URL(config.slug, job.id),
      partial_data: {
        title: job.title,
        location,
        greenhouse_job_id: String(job.id),
      },
    }
  })
}

export async function fetchGreenhouseJobDetails(
  slug: string,
  jobId: string
): Promise<GreenhouseJobDetail> {
  const response = await fetch(DETAIL_API(slug, jobId), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Greenhouse detail API error ${response.status} for job ${jobId}`)
  }

  return response.json()
}

export function normalizeGreenhouseJob(
  detail: GreenhouseJobDetail,
  companyName: string,
  filterCountry?: string
): NormalizedJob {
  const locationLabel = pickKenyaLocationLabel(detail, filterCountry)
  const { city, county } = parseCityCounty(locationLabel)
  const html = decodeHtmlEntities(detail.content || '')
  const employmentRaw = metadataValue(detail, 'Employment Type')
  const dept = detail.departments?.map(d => d.name).filter(Boolean).join(', ') || ''

  return {
    title: detail.title,
    company: companyName,
    description: html,
    responsibilities: '',
    required_qualifications: '',
    employment_type: normalizeEmploymentType(employmentRaw),
    job_location_type: /remote/i.test(locationLabel) ? 'REMOTE' : 'ON_SITE',
    job_location_country: 'Kenya',
    job_location_county: county,
    job_location_city: city,
    location: locationLabel.includes('Kenya') ? locationLabel : [locationLabel, 'Kenya'].filter(Boolean).join(', '),
    apply_link: detail.absolute_url || '',
    application_url: detail.absolute_url || '',
    valid_through: null,
    salary_min: null,
    salary_max: null,
    salary_currency: 'KES',
    salary_period: 'MONTH',
    salary_visibility: 'Hide',
    experience_level: 'Mid',
    minimum_experience: null,
    industry: null,
    status: 'active',
    posted_by: 'admin',
    tags: dept,
  }
}

export function extractGreenhouseJobId(
  jobUrl: string,
  partialData?: Record<string, unknown> | null
): string | null {
  if (partialData?.greenhouse_job_id) {
    return String(partialData.greenhouse_job_id)
  }
  const fromPath = jobUrl.match(/\/jobs\/(\d+)/i)
  if (fromPath) return fromPath[1]
  const fromQuery = jobUrl.match(/[?&]gh_jid=(\d+)/i)
  if (fromQuery) return fromQuery[1]
  return null
}

export function extractGreenhouseSlug(jobUrl: string, fallbackSlug?: string): string | null {
  const boards = jobUrl.match(/boards\.greenhouse\.io\/([^/?#]+)/i)
  if (boards) return boards[1]
  const jobApp = jobUrl.match(/job-boards\.greenhouse\.io\/([^/?#]+)/i)
  if (jobApp) return jobApp[1]
  return fallbackSlug ?? null
}

export { generateContentHash, decodeHtmlEntities }
