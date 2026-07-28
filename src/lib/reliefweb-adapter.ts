/**
 * ReliefWeb Kenya job-board adapter
 *
 * Discovers and fetches humanitarian / NGO jobs via the ReliefWeb API v2
 * (https://api.reliefweb.int/v2/jobs), filtered to Kenya.
 *
 * ReliefWeb is an aggregator — prefer the employer's apply email, career /
 * Google Form / ATS URL, or org homepage from how_to_apply (+ posting body).
 * Only fall back to the ReliefWeb job page when none of those exist.
 *
 * Requires a pre-approved API appname (since Nov 2025). Set RELIEFWEB_APPNAME
 * in the environment, or selectors.appname on the scraper source.
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "reliefweb",
 *   "category": "ngo",
 *   "sourceKind": "job_board",
 *   "country": "Kenya",
 *   "countryIso3": "ken",
 *   "maxPages": 5,
 *   "pageSize": 50
 * }
 */

import { generateContentHash, NormalizedJob } from './scraper'
import { resolveJobBoardApplication } from './jobBoardApply'
import {
  JobBoardCompanyProfile,
  sanitizeEmployerWebsite,
} from './jobBoardCompany'

const API_BASE = 'https://api.reliefweb.int/v2'
const DEFAULT_SITE = 'https://reliefweb.int'
const BOARD_HOSTS = ['reliefweb.int']
/** ReliefWeb country id for Kenya (advanced-search C147). */
const KENYA_COUNTRY_ID = 147
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

const JOB_FIELDS = [
  'id',
  'title',
  'url',
  'url_alias',
  'body',
  'body-html',
  'how_to_apply',
  'how_to_apply-html',
  'source',
  'country',
  'city',
  'date',
  'career_categories',
  'theme',
  'type',
  'experience',
  'status',
] as const

export interface ReliefWebSourceConfig {
  type: 'reliefweb'
  category?: string
  maxPages?: number
  pageSize?: number
  /** Override env RELIEFWEB_APPNAME */
  appname?: string
  /** Country name filter (default Kenya) */
  country?: string
  /** ISO3 filter, e.g. ken (preferred when set) */
  countryIso3?: string
  /** Numeric ReliefWeb country id (default 147 for Kenya) */
  countryId?: number
}

export interface ReliefWebJobDetail {
  jobUrl: string
  reliefWebId: string
  title: string
  company: string
  location: string
  descriptionHtml: string
  howToApplyHtml: string
  employmentType: string
  industry: string | null
  careerCategory: string | null
  datePosted: string | null
  applicationDeadline: string | null
  experienceLabel: string | null
  minimumExperienceYears: number | null
  experienceLevel: string
  addressLocality: string | null
  addressRegion: string | null
  addressCountry: string | null
  applyEmail: string | null
  applyLink: string | null
  applicationUrl: string | null
  usedBoardFallback: boolean
  companyHomepage: string | null
  companyShortname: string | null
  companySourceId: string | null
  status: string | null
}

interface ReliefWebApiFields {
  id?: number | string
  title?: string
  url?: string
  url_alias?: string
  body?: string
  'body-html'?: string
  how_to_apply?: string
  'how_to_apply-html'?: string
  source?: Array<{
    id?: number | string
    name?: string
    shortname?: string
    longname?: string
    homepage?: string | null
    type?: { name?: string } | Array<{ name?: string }>
  }>
  country?: Array<{
    id?: number
    name?: string
    shortname?: string
    iso3?: string
    primary?: boolean
  }>
  city?: Array<{ name?: string }>
  date?: {
    created?: string
    changed?: string
    closing?: string
  }
  career_categories?: Array<{ name?: string; id?: number }>
  theme?: Array<{ name?: string }>
  type?: Array<{ name?: string; id?: number }>
  experience?: Array<{ name?: string; id?: number }>
  status?: string
}

interface ReliefWebApiItem {
  id?: string | number
  fields?: ReliefWebApiFields
  href?: string
}

interface ReliefWebListResponse {
  count?: number
  totalCount?: number
  data?: ReliefWebApiItem[]
  error?: { message?: string }
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms)
}

/** Approved ReliefWeb API appname — env first, then selectors.appname. */
export function resolveReliefWebAppname(config?: Pick<ReliefWebSourceConfig, 'appname'>): string {
  const fromEnv = process.env.RELIEFWEB_APPNAME?.trim()
  const fromConfig = config?.appname?.trim()
  const appname = fromEnv || fromConfig || ''
  if (!appname) {
    throw new Error(
      'ReliefWeb API requires a pre-approved appname. Set RELIEFWEB_APPNAME in the environment ' +
        'or selectors.appname on the scraper source. Request one at https://apidoc.reliefweb.int/parameters#appname'
    )
  }
  return appname
}

function apiJobsUrl(appname: string, jobId?: string): string {
  const base = jobId
    ? `${API_BASE}/jobs/${encodeURIComponent(jobId)}`
    : `${API_BASE}/jobs`
  return `${base}?appname=${encodeURIComponent(appname)}`
}

async function postReliefWebJson(
  url: string,
  body: Record<string, unknown>
): Promise<ReliefWebListResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0; +https://careersasa.co.ke)',
    },
    body: JSON.stringify(body),
    signal: withTimeout(25000),
  })

  let payload: ReliefWebListResponse = {}
  try {
    payload = (await response.json()) as ReliefWebListResponse
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const msg =
      payload?.error?.message ||
      `ReliefWeb API HTTP ${response.status} for ${url.split('?')[0]}`
    throw new Error(msg)
  }

  return payload
}

function cleanText(value: unknown): string | null {
  if (value == null) return null
  const text = String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text || null
}

function isoDateOnly(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

function plainToHtml(text: string | null | undefined): string {
  if (!text?.trim()) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .split(/\n{2,}/)
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('\n')
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
  'Kakamega',
  'Bungoma',
  'Meru',
  'Garissa',
  'Embu',
  'Kericho',
  'Bomet',
  'Narok',
  'Nyandarua',
  "Murang'a",
  'Kirinyaga',
  'Trans Nzoia',
  'Turkana',
  'Isiolo',
  'Laikipia',
  'Kitui',
  'Makueni',
  'Tharaka-Nithi',
  'Vihiga',
  'Siaya',
  'Homa Bay',
  'Migori',
  'Busia',
  'Nandi',
  'Elgeyo-Marakwet',
  'West Pokot',
  'Samburu',
  'Marsabit',
  'Mandera',
  'Wajir',
  'Tana River',
  'Lamu',
  'Taita-Taveta',
  'Nyamira',
]

function isVagueLocationPart(value: string | null | undefined): boolean {
  if (!value?.trim()) return true
  const v = value.trim().toLowerCase()
  return (
    v === 'kenya' ||
    v === 'ke' ||
    v === 'ken' ||
    v === 'country' ||
    v === 'remote' ||
    v === 'n/a' ||
    v === 'various' ||
    v === 'multiple locations'
  )
}

function matchCounty(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const haystack = value.toLowerCase()
  for (const county of KENYAN_COUNTIES) {
    if (haystack.includes(county.toLowerCase())) return county
  }
  if (/\bnbi\b/.test(haystack) || haystack.includes('nairobi county')) return 'Nairobi'
  if (haystack.includes('eldoret')) return 'Uasin Gishu'
  return ''
}

export function resolveReliefWebLocation(input: {
  cities?: string[] | null
  countries?: string[] | null
}): { display: string; city: string; county: string } {
  const cityNames = (input.cities || []).map(c => c.trim()).filter(Boolean)
  const preferred = cityNames.find(c => !isVagueLocationPart(c)) || cityNames[0] || null
  const county = matchCounty(preferred) || matchCounty(cityNames.join(', '))

  let city = ''
  if (preferred && !isVagueLocationPart(preferred)) {
    city = preferred.split(',')[0]?.trim() || preferred
  } else if (county) {
    city = county
  }

  const parts = [city || null, county && county !== city ? county : null, 'Kenya'].filter(Boolean)
  const display = [...new Set(parts)].join(', ') || 'Kenya'
  return { display, city: city || '', county: county || '' }
}

export function parseReliefWebEmploymentType(types: Array<{ name?: string }> | undefined): string {
  const raw = types?.map(t => t?.name).filter(Boolean).join(' ') || ''
  const t = raw.toUpperCase()
  if (t.includes('INTERN')) return 'INTERN'
  if (t.includes('VOLUNTEER')) return 'VOLUNTEER'
  if (t.includes('CONSULT')) return 'CONTRACTOR'
  if (t.includes('PART')) return 'PART_TIME'
  if (t.includes('TEMP')) return 'TEMPORARY'
  if (t.includes('CONTRACT')) return 'CONTRACTOR'
  return 'FULL_TIME'
}

export function parseReliefWebExperience(label: string | null | undefined): {
  minimumExperienceYears: number | null
  experienceLevel: string
} {
  const text = (label || '').toLowerCase()
  if (!text) return { minimumExperienceYears: null, experienceLevel: 'Mid' }

  const range = text.match(/(\d+)\s*[-–]\s*(\d+)/)
  if (range) {
    const min = Number(range[1])
    if (min <= 2) return { minimumExperienceYears: min, experienceLevel: 'Entry' }
    if (min <= 5) return { minimumExperienceYears: min, experienceLevel: 'Mid' }
    return { minimumExperienceYears: min, experienceLevel: 'Senior' }
  }

  const plus = text.match(/(\d+)\s*\+/)
  if (plus) {
    const min = Number(plus[1])
    return {
      minimumExperienceYears: min,
      experienceLevel: min >= 8 ? 'Senior' : 'Mid',
    }
  }

  if (/entry|junior|0\s*year/.test(text)) {
    return { minimumExperienceYears: 0, experienceLevel: 'Entry' }
  }
  if (/senior|director|lead/.test(text)) {
    return { minimumExperienceYears: 8, experienceLevel: 'Senior' }
  }
  return { minimumExperienceYears: null, experienceLevel: 'Mid' }
}

/** Extract numeric ReliefWeb job id from a job URL or API href. */
export function extractReliefWebJobId(jobUrl: string): string | null {
  if (!jobUrl?.trim()) return null
  const raw = jobUrl.trim()

  // Direct numeric id
  if (/^\d+$/.test(raw)) return raw

  try {
    const path = /^https?:\/\//i.test(raw) ? new URL(raw).pathname : raw
    const jobMatch = path.match(/\/(?:job|jobs|node)\/(\d+)\b/i)
    if (jobMatch) return jobMatch[1]
  } catch {
    /* fall through */
  }

  const loose = raw.match(/(?:job|jobs|node)\/(\d+)\b/i)
  return loose?.[1] || null
}

export function canonicalizeReliefWebJobUrl(
  fields: Pick<ReliefWebApiFields, 'url_alias' | 'url' | 'id'>,
  itemId?: string | number
): string {
  const alias = typeof fields.url_alias === 'string' ? fields.url_alias.trim() : ''
  if (alias) return alias.replace(/\/+$/, '')

  const url = typeof fields.url === 'string' ? fields.url.trim() : ''
  if (url && /reliefweb\.int\/job\//i.test(url)) return url.replace(/\/+$/, '')

  const id = String(fields.id ?? itemId ?? '').trim()
  if (id) return `${DEFAULT_SITE}/job/${id}`

  return url || `${DEFAULT_SITE}/jobs`
}

/**
 * Prefer employer apply email / external URL / org homepage over the
 * ReliefWeb listing page.
 */
export function resolveReliefWebApplication(input: {
  boardJobUrl: string
  howToApplyHtml?: string | null
  howToApplyText?: string | null
  bodyHtml?: string | null
  companyHomepage?: string | null
}): ReturnType<typeof resolveJobBoardApplication> {
  const howHtml =
    (input.howToApplyHtml && input.howToApplyHtml.trim()) ||
    plainToHtml(input.howToApplyText) ||
    ''
  const bodyHtml = input.bodyHtml?.trim() || ''
  // how_to_apply first — that is where ReliefWeb puts employer contact methods
  const descriptionHtml = [howHtml, bodyHtml].filter(Boolean).join('\n')

  const apply = resolveJobBoardApplication({
    boardJobUrl: input.boardJobUrl,
    descriptionHtml,
    boardHosts: BOARD_HOSTS,
  })

  if (!apply.used_board_fallback) return apply

  const homepage = sanitizeEmployerWebsite(input.companyHomepage || null)
  if (homepage) {
    return {
      application_url: homepage,
      apply_link: homepage,
      apply_email: null,
      used_board_fallback: false,
    }
  }

  return apply
}

function primarySource(fields: ReliefWebApiFields) {
  return fields.source?.[0] || null
}

function sourceTypeName(source: ReturnType<typeof primarySource>): string | null {
  if (!source?.type) return null
  if (Array.isArray(source.type)) return cleanText(source.type[0]?.name)
  return cleanText(source.type.name)
}

export function parseReliefWebJobFields(
  fields: ReliefWebApiFields,
  itemId?: string | number
): ReliefWebJobDetail {
  const id = String(fields.id ?? itemId ?? '').trim()
  if (!id) throw new Error('ReliefWeb job payload missing id')

  const jobUrl = canonicalizeReliefWebJobUrl(fields, id)
  const source = primarySource(fields)
  const company =
    cleanText(source?.name) ||
    cleanText(source?.longname) ||
    cleanText(source?.shortname) ||
    'Organization Name Not Available'

  const cities = (fields.city || []).map(c => c.name || '').filter(Boolean)
  const countries = (fields.country || []).map(c => c.name || c.shortname || '').filter(Boolean)
  const location = resolveReliefWebLocation({ cities, countries })

  const descriptionHtml =
    (typeof fields['body-html'] === 'string' && fields['body-html'].trim()) ||
    plainToHtml(fields.body) ||
    `<p>${cleanText(fields.title) || 'Untitled Position'}</p>`

  const howToApplyHtml =
    (typeof fields['how_to_apply-html'] === 'string' && fields['how_to_apply-html'].trim()) ||
    plainToHtml(fields.how_to_apply) ||
    ''

  const homepage = sanitizeEmployerWebsite(source?.homepage || null)
  const apply = resolveReliefWebApplication({
    boardJobUrl: jobUrl,
    howToApplyHtml,
    howToApplyText: fields.how_to_apply,
    bodyHtml: descriptionHtml,
    companyHomepage: homepage,
  })

  const experienceLabel = cleanText(fields.experience?.[0]?.name)
  const experience = parseReliefWebExperience(experienceLabel)
  const careerCategory = cleanText(fields.career_categories?.[0]?.name)
  const industry = sourceTypeName(source) || careerCategory || 'NGO / Humanitarian'

  return {
    jobUrl,
    reliefWebId: id,
    title: cleanText(fields.title) || 'Untitled Position',
    company,
    location: location.display,
    descriptionHtml,
    howToApplyHtml,
    employmentType: parseReliefWebEmploymentType(fields.type),
    industry,
    careerCategory,
    datePosted: typeof fields.date?.created === 'string' ? fields.date.created : null,
    applicationDeadline: isoDateOnly(fields.date?.closing),
    experienceLabel,
    minimumExperienceYears: experience.minimumExperienceYears,
    experienceLevel: experience.experienceLevel,
    addressLocality: location.city || cities[0] || null,
    addressRegion: location.county || null,
    addressCountry: 'Kenya',
    applyEmail: apply.apply_email,
    applyLink: apply.apply_link,
    applicationUrl: apply.application_url,
    usedBoardFallback: apply.used_board_fallback,
    companyHomepage: homepage,
    companyShortname: cleanText(source?.shortname),
    companySourceId: source?.id != null ? String(source.id) : null,
    status: cleanText(fields.status),
  }
}

function countryFilter(config: ReliefWebSourceConfig): Record<string, unknown> {
  const iso3 = (config.countryIso3 || 'ken').trim().toLowerCase()
  if (iso3) {
    return { field: 'country.iso3', value: iso3 }
  }
  const countryId = config.countryId ?? KENYA_COUNTRY_ID
  if (countryId) {
    return { field: 'country.id', value: countryId }
  }
  return { field: 'country', value: config.country || 'Kenya' }
}

function listQueryBody(config: ReliefWebSourceConfig, offset: number, limit: number) {
  return {
    filter: {
      operator: 'AND',
      conditions: [
        { field: 'status', value: 'published' },
        countryFilter(config),
      ],
    },
    fields: { include: [...JOB_FIELDS] },
    sort: ['date.created:desc'],
    limit,
    offset,
  }
}

export async function discoverReliefWebJobs(
  config: ReliefWebSourceConfig,
  _baseUrl?: string
): Promise<Array<{ job_url: string; partial_data: { title?: string; location?: string; company?: string } }>> {
  const appname = resolveReliefWebAppname(config)
  const maxPages = Math.max(1, Math.min(typeof config.maxPages === 'number' ? config.maxPages : 5, 20))
  const pageSize = Math.max(
    1,
    Math.min(
      typeof config.pageSize === 'number' ? config.pageSize : DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    )
  )

  const seen = new Map<string, { title?: string; location?: string; company?: string }>()
  const listUrl = apiJobsUrl(appname)

  for (let page = 0; page < maxPages; page++) {
    const offset = page * pageSize
    const payload = await postReliefWebJson(listUrl, listQueryBody(config, offset, pageSize))
    const items = Array.isArray(payload.data) ? payload.data : []
    if (items.length === 0) break

    for (const item of items) {
      const fields = item.fields || {}
      const id = fields.id ?? item.id
      if (id == null) continue
      try {
        const detail = parseReliefWebJobFields(fields, id)
        if (!seen.has(detail.jobUrl)) {
          seen.set(detail.jobUrl, {
            title: detail.title,
            location: detail.location,
            company: detail.company,
          })
        }
      } catch {
        const fallbackUrl = canonicalizeReliefWebJobUrl(fields, id)
        if (!seen.has(fallbackUrl)) {
          seen.set(fallbackUrl, {
            title: cleanText(fields.title) || undefined,
          })
        }
      }
    }

    const total = payload.totalCount ?? 0
    if (offset + items.length >= total || items.length < pageSize) break
  }

  return [...seen.entries()].map(([job_url, partial_data]) => ({
    job_url,
    partial_data,
  }))
}

export async function fetchReliefWebJobDetails(
  jobUrl: string,
  config?: Pick<ReliefWebSourceConfig, 'appname'>
): Promise<ReliefWebJobDetail> {
  const appname = resolveReliefWebAppname(config)
  const jobId = extractReliefWebJobId(jobUrl)
  if (!jobId) {
    throw new Error(`Cannot parse ReliefWeb job id from URL: ${jobUrl}`)
  }

  const payload = await postReliefWebJson(apiJobsUrl(appname, jobId), {
    fields: { include: [...JOB_FIELDS] },
  })

  const item = payload.data?.[0]
  if (!item?.fields) {
    throw new Error(`ReliefWeb job ${jobId} not found`)
  }

  return parseReliefWebJobFields(item.fields, item.id ?? jobId)
}

export function resolveReliefWebCompanyProfile(
  detail: ReliefWebJobDetail
): JobBoardCompanyProfile | null {
  if (!detail.company?.trim()) return null
  return {
    name: detail.company.trim(),
    logo: null,
    website: detail.companyHomepage,
    description: null,
    location: detail.location || null,
    size: null,
    industry: detail.industry,
    source: 'reliefweb',
    sourceUrl: detail.companySourceId
      ? `${DEFAULT_SITE}/organization/${detail.companySourceId}`
      : null,
    externalId: detail.companySourceId,
  }
}

export function normalizeReliefWebJob(detail: ReliefWebJobDetail): NormalizedJob {
  const resolved = resolveReliefWebLocation({
    cities: detail.addressLocality ? [detail.addressLocality] : [],
    countries: ['Kenya'],
  })
  const county = detail.addressRegion || resolved.county || matchCounty(detail.location)
  const city = detail.addressLocality || resolved.city || county

  const tags = [
    detail.careerCategory,
    detail.industry,
    detail.experienceLabel,
    'ReliefWeb',
    'NGO',
  ]
    .filter(Boolean)
    .join(',')

  return {
    title: detail.title,
    company: detail.company,
    description: detail.descriptionHtml || `<p>${detail.title}</p>`,
    responsibilities: '',
    required_qualifications: '',
    employment_type: detail.employmentType,
    job_location_type: 'ON_SITE',
    job_location_country: 'Kenya',
    job_location_county: county,
    job_location_city: city || '',
    location: detail.location || resolved.display,
    apply_link: detail.applyLink || '',
    application_url: detail.applicationUrl || '',
    apply_email: detail.applyEmail,
    valid_through: detail.applicationDeadline,
    salary_min: null,
    salary_max: null,
    salary_currency: 'KES',
    salary_period: 'MONTH',
    salary_visibility: 'Hide',
    experience_level: detail.experienceLevel || 'Mid',
    minimum_experience: detail.minimumExperienceYears,
    industry: detail.industry,
    status: 'active',
    posted_by: 'admin',
    tags,
  }
}

export function reliefWebContentHash(detail: ReliefWebJobDetail): string {
  return generateContentHash(detail.title, detail.company, detail.location)
}
