/**
 * MyJobMag Kenya job-board adapter
 *
 * No public API — discovers listing URLs from /jobs pages (href="/job/...")
 * and parses schema.org JobPosting JSON-LD on each /job/{slug} detail page.
 * MyJobMag embeds raw newlines inside JSON-LD description strings, so LD is
 * sanitized before parse; HTML (.job-details / .job-key-info) is the fallback.
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "myjobmag",
 *   "category": "other",
 *   "sourceKind": "job_board",
 *   "maxPages": 5
 * }
 */

import * as cheerio from 'cheerio'
import { generateContentHash, NormalizedJob } from './scraper'
import { resolveJobBoardApplication, stripBoardTrackingParams } from './jobBoardApply'
import { extractApplicationDeadline } from './scraperDeadline'

const DEFAULT_BASE = 'https://www.myjobmag.co.ke'
const LISTING_PATH = '/jobs'
const JOB_PATH_RE = /\/job\/[a-z0-9-]+/gi
const BOARD_HOSTS = ['myjobmag.co.ke']

export interface MyJobMagSourceConfig {
  type: 'myjobmag'
  category?: string
  maxPages?: number
  baseHost?: string
}

export interface MyJobMagJobDetail {
  jobUrl: string
  title: string
  company: string
  location: string
  descriptionHtml: string
  employmentType: string
  industry: string | null
  occupationalCategory: string | null
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
  jobLocationType: string | null
  applicationDeadline: string | null
  applyEmail: string | null
  applyLink: string | null
  applicationUrl: string | null
  companyLogo: string | null
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
    throw new Error(`MyJobMag HTTP ${response.status} fetching ${url}`)
  }

  return response.text()
}

/** MyJobMag pagination uses `/jobs/page/2`, `/jobs/page/3`, … */
function listingPageUrls(origin: string, listingPath: string, maxPages: number): string[] {
  const pages = Math.max(1, Math.min(maxPages, 10))
  const base = `${origin}${listingPath}`
  const urls: string[] = [base]
  for (let page = 2; page <= pages; page++) {
    urls.push(`${base}/page/${page}`)
  }
  return urls
}

function listingPathFromBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return LISTING_PATH
  try {
    const path = new URL(baseUrl).pathname.replace(/\/+$/, '') || LISTING_PATH
    // Seed base_url is /jobs; strip trailing /page/N if present
    const cleaned = path.replace(/\/page\/\d+$/i, '') || LISTING_PATH
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
  } catch {
    return LISTING_PATH
  }
}

function extractListingUrls(html: string, origin: string): string[] {
  const found = new Set<string>()
  JOB_PATH_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = JOB_PATH_RE.exec(html)) !== null) {
    // Skip non-job paths that share the /job prefix (e.g. /job-application/)
    if (/^\/job-/.test(match[0])) continue
    found.add(`${origin}${match[0]}`)
  }
  return [...found]
}

export async function discoverMyJobMagJobs(
  config: MyJobMagSourceConfig,
  baseUrl?: string
): Promise<Array<{ job_url: string; partial_data: { title?: string; location?: string } }>> {
  const origin = originFromBaseUrl(baseUrl, config.baseHost)
  const listingPath = listingPathFromBaseUrl(baseUrl)
  const maxPages = typeof config.maxPages === 'number' ? config.maxPages : 5
  const pageUrls = listingPageUrls(origin, listingPath, maxPages)
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

/**
 * MyJobMag puts unescaped newlines (and other controls) inside JSON string
 * values. Replace controls inside strings so JSON.parse can succeed.
 */
export function sanitizeJsonLdText(raw: string): string {
  let out = ''
  let inString = false
  let escaped = false
  for (const ch of raw) {
    if (inString) {
      if (escaped) {
        out += ch
        escaped = false
      } else if (ch === '\\') {
        out += ch
        escaped = true
      } else if (ch === '"') {
        out += ch
        inString = false
      } else if (ch === '\n' || ch === '\r' || ch === '\t' || ch.charCodeAt(0) < 32) {
        out += ' '
      } else {
        out += ch
      }
    } else {
      if (ch === '"') inString = true
      out += ch
    }
  }
  return out
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function cleanText(value: unknown): string | null {
  if (value == null) return null
  const text = decodeHtmlEntities(String(value))
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

function parseJobLocationType(employmentType: unknown, keyInfoType?: string | null): string | null {
  const hay = `${employmentType || ''} ${keyInfoType || ''}`.toUpperCase()
  if (/REMOTE|TELECOMMUTE|WORK\s*FROM\s*HOME/.test(hay)) return 'TELECOMMUTE'
  if (/HYBRID/.test(hay)) return 'HYBRID'
  if (/ONSITE|ON[_\s-]?SITE/.test(hay)) return 'ON_SITE'
  return null
}

function isoDateOnly(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
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
  return v === 'kenya' || v === 'ke' || v === 'country' || v === 'remote' || v === 'n/a'
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

export function resolveMyJobMagLocation(input: {
  locality?: string | null
  region?: string | null
  country?: string | null
  jobLocationType?: string | null
}): { display: string; city: string; county: string } {
  const preferred =
    (!isVagueLocationPart(input.locality) && input.locality?.trim()) ||
    (!isVagueLocationPart(input.region) && input.region?.trim()) ||
    null

  const county =
    matchCounty(input.locality) || matchCounty(input.region) || matchCounty(preferred)

  let city = ''
  if (preferred && !isVagueLocationPart(preferred)) {
    city = preferred.split(',')[0]?.trim() || preferred
  } else if (county) {
    city = county
  } else if (/remote|telecommute/i.test(String(input.jobLocationType || ''))) {
    city = 'Remote'
  }

  const parts = [city || null, county && county !== city ? county : null, 'Kenya'].filter(Boolean)
  const display = [...new Set(parts)].join(', ') || 'Kenya'

  return { display, city: city || '', county: county || '' }
}

function parseSalaryRange(text: string | null | undefined): {
  min: number | null
  max: number | null
  currency: string
  period: string
} {
  if (!text?.trim()) {
    return { min: null, max: null, currency: 'KES', period: 'MONTH' }
  }
  const currency = /USD|\$/i.test(text) ? 'USD' : 'KES'
  const period = /year|annual|annum/i.test(text)
    ? 'YEAR'
    : /week/i.test(text)
      ? 'WEEK'
      : /day|daily/i.test(text)
        ? 'DAY'
        : 'MONTH'
  const numbers = [...text.matchAll(/\d[\d,]*/g)].map(m => Number(m[0].replace(/,/g, '')))
  const valid = numbers.filter(n => Number.isFinite(n) && n > 0)
  if (valid.length === 0) return { min: null, max: null, currency, period }
  return {
    min: valid[0],
    max: valid[1] ?? valid[0],
    currency,
    period,
  }
}

function experienceYearsFromMonths(value: unknown): number | null {
  const months = toNumber(value)
  if (months == null) return null
  return Math.round(months / 12)
}

function parseExperienceYears(text: string | null | undefined): number | null {
  if (!text?.trim()) return null
  const range = text.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i)
  if (range) return Number(range[1])
  const single = text.match(/(\d+)\s*\+?\s*years?/i)
  if (single) return Number(single[1])
  return null
}

function extractKeyInfo($: cheerio.CheerioAPI): Record<string, string> {
  const out: Record<string, string> = {}
  $('.job-key-info li').each((_, el) => {
    const title = cleanText($(el).find('.jkey-title').first().text())
    const info = cleanText($(el).find('.jkey-info').first().text())
    if (title && info) out[title.toLowerCase()] = info
  })
  return out
}

function parseJobPostingLd(html: string): Record<string, unknown> | null {
  const blocks = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )
  for (const block of blocks) {
    try {
      const payload = JSON.parse(sanitizeJsonLdText(block[1])) as
        | Record<string, unknown>
        | Array<Record<string, unknown>>
      const candidates = Array.isArray(payload) ? payload : [payload]
      for (const node of candidates) {
        const type = node?.['@type']
        if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) {
          return node
        }
      }
    } catch {
      /* try next block */
    }
  }
  return null
}

function companyFromHtml($: cheerio.CheerioAPI): string | null {
  const jobsAt = cleanText($('a[href*="/jobs-at/"]').first().text())
  if (jobsAt) {
    return jobsAt.replace(/^view\s+jobs\s+at\s+/i, '').trim() || null
  }
  const h1 = cleanText($('h1').first().text())
  if (h1) {
    const at = h1.match(/\bat\s+(.+)$/i)
    if (at?.[1]) return at[1].trim()
  }
  return null
}

/**
 * MyJobMag keeps "Method of Application" outside JobPosting JSON-LD /
 * `.job-details`. That block holds the real employer CTA, usually as
 * `<a href="/apply-now/{id}">Employer on careers.example.com</a>`.
 */
export function extractMyJobMagMethodOfApplicationHtml(html: string): string {
  const $ = cheerio.load(html)
  const heading = $('#application-method').first()
  if (heading.length) {
    const container = heading.parent()
    const chunk = container.html() || ''
    if (/apply-now|to apply|method of application/i.test(chunk)) return chunk
  }

  // Fallback: any apply-now CTA on the page
  const applyNow = $('a[href*="/apply-now/"]').first()
  if (applyNow.length) {
    const parent = applyNow.parent()
    return parent.html() || $.html(applyNow) || ''
  }
  return ''
}

export function extractMyJobMagApplyNow(html: string): {
  path: string | null
  hostFromText: string | null
} {
  const $ = cheerio.load(html)
  const anchor =
    $('#application-method').parent().find('a[href*="/apply-now/"]').first().length
      ? $('#application-method').parent().find('a[href*="/apply-now/"]').first()
      : $('a[href*="/apply-now/"]').first()

  if (!anchor.length) return { path: null, hostFromText: null }

  const href = String(anchor.attr('href') || '').trim()
  const pathMatch = href.match(/^(\/apply-now\/\d+)/i)
  const path = pathMatch ? pathMatch[1] : null
  const label = cleanText(anchor.text()) || ''
  const onHost = label.match(/\bon\s+([a-z0-9.-]+\.[a-z0-9.-]+)/i)
  const hostFromText = onHost?.[1]?.toLowerCase().replace(/[),.;]+$/g, '') || null

  return { path, hostFromText }
}

/** Follow MyJobMag `/apply-now/{id}` 302 to the employer application URL. */
export async function resolveMyJobMagApplyNowRedirect(
  applyNowPath: string,
  origin = DEFAULT_BASE
): Promise<string | null> {
  const path = applyNowPath.startsWith('/') ? applyNowPath : `/${applyNowPath}`
  if (!/^\/apply-now\/\d+/i.test(path)) return null

  const url = `${origin.replace(/\/$/, '')}${path}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
        'Accept-Language': 'en-KE,en;q=0.9',
      },
      signal: withTimeout(15000),
    })

    const location = response.headers.get('location')
    if (!location) return null
    const absolute = location.startsWith('http')
      ? location
      : new URL(location, origin).toString()
    const host = new URL(absolute).hostname.replace(/^www\./i, '').toLowerCase()
    if (BOARD_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) return null
    return stripBoardTrackingParams(absolute)
  } catch {
    return null
  }
}

export function parseMyJobMagJobHtml(
  html: string,
  jobUrl: string,
  options?: { linkoutUrl?: string | null }
): MyJobMagJobDetail {
  const $ = cheerio.load(html)
  const posting = parseJobPostingLd(html)
  const keyInfo = extractKeyInfo($)

  const org = (posting?.hiringOrganization as Record<string, unknown>) || {}
  const place = (posting?.jobLocation as Record<string, unknown>) || {}
  const address = (place.address as Record<string, unknown>) || {}
  const experience = (posting?.experienceRequirements as Record<string, unknown>) || {}

  const title =
    cleanText(posting?.title) ||
    cleanText($('.subjob-title').first().text()) ||
    cleanText($('h1').first().text()) ||
    'Untitled Position'

  const company =
    cleanText(org.name) || companyFromHtml($) || 'Company Name Not Available'

  let descriptionHtml =
    typeof posting?.description === 'string' ? decodeHtmlEntities(posting.description) : ''
  if (!descriptionHtml.trim()) {
    descriptionHtml = $('.job-details').first().html() || ''
  }

  const methodHtml = extractMyJobMagMethodOfApplicationHtml(html)
  if (methodHtml.trim()) {
    descriptionHtml = descriptionHtml
      ? `${descriptionHtml}\n${methodHtml}`
      : methodHtml
  }

  const locality = cleanText(address.addressLocality) || keyInfo.location || null
  const region = cleanText(address.addressRegion) || null
  const country = cleanText(address.addressCountry) || 'Kenya'
  const employmentRaw = posting?.employmentType || keyInfo['job type'] || null
  const jobLocationType = parseJobLocationType(employmentRaw, keyInfo['job type'])

  const location = resolveMyJobMagLocation({
    locality,
    region,
    country,
    jobLocationType,
  })

  const salary = parseSalaryRange(keyInfo['salary range'])
  const minimumExperienceYears =
    experienceYearsFromMonths(experience.monthsOfExperience) ||
    parseExperienceYears(keyInfo.experience)

  // Prefer employer deadline in the description; fall back to MyJobMag validThrough
  const fromDescription = extractApplicationDeadline(descriptionHtml)
  const fromValidThrough = isoDateOnly(posting?.validThrough)
  const deadlineLabel = keyInfo.deadline
  const fromKeyInfo =
    deadlineLabel && !/not\s*specified/i.test(deadlineLabel)
      ? extractApplicationDeadline(`Deadline: ${deadlineLabel}`)
      : null
  const applicationDeadline = fromDescription || fromKeyInfo || fromValidThrough

  // Prefer resolved /apply-now/ redirect; else host from CTA text ("on example.com")
  let linkoutUrl = options?.linkoutUrl || null
  if (!linkoutUrl) {
    const applyNow = extractMyJobMagApplyNow(html)
    if (applyNow.hostFromText) {
      linkoutUrl = `https://${applyNow.hostFromText}/`
    }
  }

  const apply = resolveJobBoardApplication({
    boardJobUrl: jobUrl,
    descriptionHtml,
    linkoutUrl,
    boardHosts: BOARD_HOSTS,
  })

  const logo =
    typeof org.logo === 'string' && org.logo.trim() && !/myjobmag\.co\.ke/i.test(org.logo)
      ? org.logo.trim()
      : typeof posting?.image === 'string' &&
          posting.image.trim() &&
          !/myjobmag\.co\.ke/i.test(posting.image)
        ? posting.image.trim()
        : null

  return {
    jobUrl,
    title,
    company,
    location: location.display,
    descriptionHtml,
    employmentType: parseEmploymentType(employmentRaw),
    industry: cleanText(posting?.industry) || keyInfo['job field'] || null,
    occupationalCategory: cleanText(posting?.occupationalCategory) || keyInfo['job field'] || null,
    datePosted: typeof posting?.datePosted === 'string' ? posting.datePosted : null,
    validThrough: applicationDeadline,
    salaryCurrency: salary.currency,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryPeriod: salary.period,
    minimumExperienceYears,
    addressLocality: location.city || locality,
    addressRegion: location.county || region,
    addressCountry: 'Kenya',
    jobLocationType,
    applicationDeadline,
    applyEmail: apply.apply_email,
    applyLink: apply.apply_link,
    applicationUrl: apply.application_url,
    companyLogo: logo,
  }
}

export async function fetchMyJobMagJobDetails(jobUrl: string): Promise<MyJobMagJobDetail> {
  const html = await fetchPageHtml(jobUrl)
  const origin = originFromBaseUrl(jobUrl)
  const applyNow = extractMyJobMagApplyNow(html)

  let linkoutUrl: string | null = null
  if (applyNow.path) {
    linkoutUrl = await resolveMyJobMagApplyNowRedirect(applyNow.path, origin)
  }
  if (!linkoutUrl && applyNow.hostFromText) {
    linkoutUrl = `https://${applyNow.hostFromText}/`
  }

  return parseMyJobMagJobHtml(html, jobUrl, { linkoutUrl })
}

export function normalizeMyJobMagJob(detail: MyJobMagJobDetail): NormalizedJob {
  const hasSalary = detail.salaryMin != null || detail.salaryMax != null
  const resolved = resolveMyJobMagLocation({
    locality: detail.addressLocality,
    region: detail.addressRegion,
    country: detail.addressCountry,
    jobLocationType: detail.jobLocationType,
  })
  const county = resolved.county || matchCounty(detail.location)
  const city = resolved.city || county
  const remote =
    /remote/i.test(detail.location) ||
    /TELECOMMUTE|REMOTE/i.test(String(detail.jobLocationType || ''))

  return {
    title: detail.title,
    company: detail.company,
    description: detail.descriptionHtml || `<p>${detail.title}</p>`,
    responsibilities: '',
    required_qualifications: '',
    employment_type: detail.employmentType,
    job_location_type: remote ? 'REMOTE' : 'ON_SITE',
    job_location_country: 'Kenya',
    job_location_county: county,
    job_location_city: city || '',
    location: detail.location || resolved.display,
    apply_link: detail.applyLink || '',
    application_url: detail.applicationUrl || '',
    apply_email: detail.applyEmail,
    valid_through: detail.applicationDeadline,
    salary_min: detail.salaryMin,
    salary_max: detail.salaryMax,
    salary_currency: detail.salaryCurrency || 'KES',
    salary_period: detail.salaryPeriod || 'MONTH',
    salary_visibility: hasSalary ? 'Show' : 'Hide',
    experience_level: 'Mid',
    minimum_experience: detail.minimumExperienceYears,
    industry: detail.industry,
    status: 'active',
    posted_by: 'admin',
    tags: [detail.occupationalCategory, detail.industry, 'MyJobMag'].filter(Boolean).join(','),
  }
}

export function myjobmagContentHash(detail: MyJobMagJobDetail): string {
  return generateContentHash(detail.title, detail.company, detail.location)
}
