/**
 * Scholarship aggregator + flagship-programme adapter.
 *
 * Discover from RSS/Atom, WordPress REST, HTML listings, or a single
 * canonical programme URL. Process parses the detail page (og:title,
 * article/entry-content) and prefers the official apply link over the
 * aggregator permalink.
 *
 * Source config in scraper_sources.selectors:
 * {
 *   "type": "scholarship_feed",
 *   "sourceKind": "scholarship",
 *   "company": "Opportunity Desk",
 *   "feedUrls": ["https://opportunitydesk.org/feed/"],
 *   "listingUrls": ["https://opportunitydesk.org/category/scholarships/"],
 *   "wpRestUrls": ["https://www.scholars4dev.com/wp-json/wp/v2/posts?search=kenya"],
 *   "programmeUrls": ["https://www.chevening.org/scholarships/"],
 *   "linkInclude": "opportunitydesk\\.org/\\d{4}/\\d{2}/",
 *   "kenyaOrAfricaOnly": true,
 *   "scholarshipOnly": true,
 *   "maxItems": 40
 * }
 */

import * as cheerio from 'cheerio'
import { coerceDatePosted, generateContentHash, NormalizedJob } from './scraper'
import { extractApplicationDeadline } from './scraperDeadline'
import { DISCOVER_FETCH_TIMEOUT_MS, DETAIL_FETCH_TIMEOUT_MS, abortAfter } from './scraperHttp'

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const AWARD_RE =
  /\b(scholarships?|bursar(?:y|ies)|fellowships?|fully funded|scholarship programme|scholars?\s+program)\b/i
const KENYA_AFRICA_RE =
  /\b(kenya(n)?|africa(n)?|east africa|sub-?saharan|developing countr(?:y|ies)|developing world|commonwealth|global south)\b/i
const DROP_RE =
  /\b(internship|internships|hot jobs|contest|conference|call for papers|job opening|vacancies)\b/i

export interface ScholarshipFeedConfig {
  type: 'scholarship_feed'
  category?: string
  sourceKind?: string
  company: string
  location?: string
  feedUrls?: string[]
  listingUrls?: string[]
  wpRestUrls?: string[]
  programmeUrls?: string[]
  /** RegExp source tested against absolute detail URLs. */
  linkInclude?: string
  kenyaOrAfricaOnly?: boolean
  scholarshipOnly?: boolean
  maxItems?: number
  applyUrl?: string
  fallbackTitle?: string
  fallbackHtml?: string
}

export interface ScholarshipFeedItem {
  url: string
  title: string
  html: string
  datePosted: string | null
  categories: string
}

export interface ScholarshipFeedDetail {
  jobUrl: string
  title: string
  company: string
  location: string
  descriptionHtml: string
  datePosted: string | null
  validThrough: string | null
  applyLink: string | null
  applicationUrl: string | null
  occupationalCategory: string
}

export function isAwardListing(title: string, categories = '', html = ''): boolean {
  const blob = `${title} ${categories}`
  if (DROP_RE.test(blob) && !AWARD_RE.test(blob)) return false
  if (AWARD_RE.test(blob)) return true
  // Listing scrapes sometimes have empty anchor text — then peek at HTML.
  if (!title.trim() && !categories.trim()) {
    return AWARD_RE.test(html.slice(0, 2000))
  }
  return false
}

export function isKenyaOrAfricaListing(title: string, categories = '', html = ''): boolean {
  const blob = `${title} ${categories} ${html.slice(0, 4000)}`
  return KENYA_AFRICA_RE.test(blob)
}

export function itemPassesFilters(
  item: Pick<ScholarshipFeedItem, 'title' | 'categories' | 'html'>,
  config: Pick<ScholarshipFeedConfig, 'kenyaOrAfricaOnly' | 'scholarshipOnly'>
): boolean {
  if (config.scholarshipOnly && !isAwardListing(item.title, item.categories, item.html)) {
    return false
  }
  if (config.kenyaOrAfricaOnly && !isKenyaOrAfricaListing(item.title, item.categories, item.html)) {
    return false
  }
  return true
}

export function urlMatchesInclude(url: string, linkInclude?: string): boolean {
  if (!linkInclude) return true
  try {
    return new RegExp(linkInclude, 'i').test(url)
  } catch {
    return true
  }
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/gi, ' ')
    .trim()
}

export function parseRssItems(xml: string): ScholarshipFeedItem[] {
  const $ = cheerio.load(xml, { xml: true })
  const items: ScholarshipFeedItem[] = []
  $('item, entry').each((_, el) => {
    const node = $(el)
    const title = decodeXml(node.find('title').first().text() || '')
    const link =
      node.find('link').first().attr('href') ||
      decodeXml(node.find('link').first().text() || node.find('guid').first().text() || '')
    if (!title || !link || !/^https?:\/\//i.test(link)) return
    const html = decodeXml(
      node.find('content\\:encoded, encoded, content, description, summary').first().html() ||
        node.find('content\\:encoded, encoded, content, description, summary').first().text() ||
        ''
    )
    const cats = node
      .find('category')
      .map((__, cat) => decodeXml($(cat).text()))
      .get()
      .filter(Boolean)
      .join(', ')
    const dateRaw =
      node.find('pubDate, published, updated, dc\\:date').first().text() || null
    items.push({
      url: link.trim(),
      title,
      html,
      datePosted: coerceDatePosted(dateRaw),
      categories: cats,
    })
  })
  return items
}

export function parseWpRestPosts(jsonText: string): ScholarshipFeedItem[] {
  let data: unknown
  try {
    data = JSON.parse(jsonText)
  } catch {
    return []
  }
  const posts = Array.isArray(data) ? data : []
  const items: ScholarshipFeedItem[] = []
  for (const post of posts) {
    if (!post || typeof post !== 'object') continue
    const row = post as {
      link?: string
      date?: string
      title?: { rendered?: string } | string
      content?: { rendered?: string }
      excerpt?: { rendered?: string }
    }
    const url = typeof row.link === 'string' ? row.link : ''
    const titleRaw =
      typeof row.title === 'string' ? row.title : row.title?.rendered || ''
    const title = decodeXml(titleRaw.replace(/<[^>]+>/g, ' '))
    if (!url || !title) continue
    const html = row.content?.rendered || row.excerpt?.rendered || ''
    items.push({
      url,
      title: title.replace(/\s+/g, ' ').trim(),
      html,
      datePosted: coerceDatePosted(row.date || null),
      categories: '',
    })
  }
  return items
}

export function extractListingLinks(
  html: string,
  pageUrl: string,
  linkInclude?: string
): ScholarshipFeedItem[] {
  const $ = cheerio.load(html)
  const origin = new URL(pageUrl).origin
  const seen = new Set<string>()
  const items: ScholarshipFeedItem[] = []
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim()
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return
    let absolute: string
    try {
      absolute = new URL(href, origin).toString()
    } catch {
      return
    }
    absolute = absolute.split('#')[0]
    if (!urlMatchesInclude(absolute, linkInclude)) return
    if (seen.has(absolute)) return
    seen.add(absolute)
    const title = $(el).text().replace(/\s+/g, ' ').trim()
    if (title.length < 8) return
    items.push({
      url: absolute,
      title,
      html: '',
      datePosted: null,
      categories: '',
    })
  })
  return items
}

function stripScripts(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
}

export function extractOfficialApplyUrl(
  html: string,
  pageUrl: string,
  configuredApply?: string
): string | null {
  if (configuredApply) return configuredApply
  const $ = cheerio.load(html)
  const originHost = (() => {
    try {
      return new URL(pageUrl).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  })()
  const candidates: { href: string; score: number }[] = []
  $('a[href]').each((_, el) => {
    const hrefRaw = ($(el).attr('href') || '').trim()
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (!hrefRaw || hrefRaw.startsWith('#') || hrefRaw.startsWith('mailto:')) return
    let href: string
    try {
      href = new URL(hrefRaw, pageUrl).toString()
    } catch {
      return
    }
    let host = ''
    let path = ''
    try {
      const parsed = new URL(href)
      host = parsed.hostname.replace(/^www\./, '')
      path = parsed.pathname
    } catch {
      return
    }
    if (/wa\.me|whatsapp|facebook\.com|twitter\.com|x\.com|linkedin\.com|t\.me/i.test(host)) {
      return
    }
    if (/\/(category|tag|author|wp-content)\//i.test(path)) return

    const applyPath = /\/(apply|application)(\/|$)/i.test(path)
    let score = 1
    if (host === originHost) {
      if (!applyPath && !/apply (here|now)|application form/i.test(text)) return
      score += 2
    }
    if (/visit the official|official webpage/i.test(text)) score += 8
    if (/apply (here|now)|application form/i.test(text)) score += 5
    if (applyPath) score += 3
    candidates.push({ href, score })
  })
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0]?.href || null
}

export function parseScholarshipDetailHtml(
  html: string,
  pageUrl: string,
  config: ScholarshipFeedConfig,
  fallback?: Partial<ScholarshipFeedItem>
): ScholarshipFeedDetail {
  const $ = cheerio.load(stripScripts(html))
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const h1 = $('h1').first().text()
  const title =
    (ogTitle || h1 || fallback?.title || config.fallbackTitle || '')
      .replace(/\s+/g, ' ')
      .replace(
        /\s+[|-]\s+(Opportunity Desk|Opportunities For Africans|Scholars4Dev|After School Africa|Commonwealth Scholarship Commission(?: in the UK)?).*$/i,
        ''
      )
      .trim()

  const article =
    $('article .entry-content, .entry-content, .singlepost, .post .maincontent, article, main').first()
  let descriptionHtml = (article.html() || '').trim()
  if (descriptionHtml.length < 80) {
    descriptionHtml = fallback?.html || config.fallbackHtml || `<p>${title}</p>`
  }

  const apply =
    extractOfficialApplyUrl(html, pageUrl, config.applyUrl) ||
    extractOfficialApplyUrl(descriptionHtml, pageUrl, config.applyUrl) ||
    pageUrl

  return {
    jobUrl: pageUrl,
    title: title || config.fallbackTitle || 'Scholarship',
    company: config.company,
    location: config.location || 'Kenya',
    descriptionHtml,
    datePosted: fallback?.datePosted || coerceDatePosted($('meta[property="article:published_time"]').attr('content') || null),
    validThrough: extractApplicationDeadline(descriptionHtml),
    applyLink: apply,
    applicationUrl: apply,
    occupationalCategory: 'Bursary and Scholarships',
  }
}

async function fetchText(url: string, timeout = DISCOVER_FETCH_TIMEOUT_MS): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml,application/json;q=0.9,*/*;q=0.8',
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'en-KE,en;q=0.9',
    },
    signal: abortAfter(timeout),
  })
  if (!response.ok) {
    throw new Error(`Scholarship feed HTTP ${response.status} fetching ${url}`)
  }
  return response.text()
}

function mergeItems(into: Map<string, ScholarshipFeedItem>, items: ScholarshipFeedItem[]) {
  for (const item of items) {
    const url = item.url.split('#')[0].replace(/\/+$/, '')
    const current = into.get(url)
    if (!current) {
      into.set(url, { ...item, url })
      continue
    }
    if (item.html.length > current.html.length) current.html = item.html
    if (item.title.length > current.title.length) current.title = item.title
    if (!current.datePosted && item.datePosted) current.datePosted = item.datePosted
    if (item.categories && !current.categories.includes(item.categories)) {
      current.categories = [current.categories, item.categories].filter(Boolean).join(', ')
    }
  }
}

export async function discoverScholarshipFeed(
  config: ScholarshipFeedConfig
): Promise<Array<{ job_url: string; partial_data: Record<string, unknown> }>> {
  const collected = new Map<string, ScholarshipFeedItem>()
  const errors: string[] = []

  for (const url of config.programmeUrls || []) {
    collected.set(url.replace(/\/+$/, ''), {
      url,
      title: config.fallbackTitle || config.company,
      html: config.fallbackHtml || '',
      datePosted: null,
      categories: 'Bursary and Scholarships',
    })
  }

  for (const url of config.feedUrls || []) {
    try {
      mergeItems(collected, parseRssItems(await fetchText(url)))
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  for (const url of config.wpRestUrls || []) {
    try {
      mergeItems(collected, parseWpRestPosts(await fetchText(url)))
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  for (const url of config.listingUrls || []) {
    try {
      mergeItems(collected, extractListingLinks(await fetchText(url), url, config.linkInclude))
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const filtered = [...collected.values()].filter(item => {
    if (!urlMatchesInclude(item.url, config.linkInclude)) return false
    if (config.programmeUrls?.some(u => item.url.replace(/\/+$/, '') === u.replace(/\/+$/, ''))) {
      return true
    }
    return itemPassesFilters(item, config)
  })

  const maxItems = Math.max(1, Math.min(config.maxItems ?? 40, 80))
  const sliced = filtered.slice(0, maxItems)

  if (sliced.length === 0 && errors.length > 0 && (config.programmeUrls || []).length === 0) {
    throw new Error(errors.slice(0, 3).join('; '))
  }

  return sliced.map(item => ({
    job_url: item.url,
    partial_data: {
      title: item.title,
      location: config.location || 'Kenya',
      descriptionHtml: item.html,
      datePosted: item.datePosted,
      categories: item.categories,
      company: config.company,
    },
  }))
}

export async function fetchScholarshipFeedDetails(
  jobUrl: string,
  config: ScholarshipFeedConfig,
  partial?: Record<string, unknown> | null
): Promise<ScholarshipFeedDetail> {
  const fallback: Partial<ScholarshipFeedItem> = {
    title: typeof partial?.title === 'string' ? partial.title : '',
    html: typeof partial?.descriptionHtml === 'string' ? partial.descriptionHtml : '',
    datePosted: typeof partial?.datePosted === 'string' ? partial.datePosted : null,
    categories: typeof partial?.categories === 'string' ? partial.categories : '',
    url: jobUrl,
  }

  try {
    const html = await fetchText(jobUrl, DETAIL_FETCH_TIMEOUT_MS)
    return parseScholarshipDetailHtml(html, jobUrl, config, fallback)
  } catch (error) {
    if (fallback.title || fallback.html || config.fallbackHtml) {
      return parseScholarshipDetailHtml(
        fallback.html || config.fallbackHtml || `<p>${fallback.title || config.company}</p>`,
        jobUrl,
        config,
        fallback
      )
    }
    throw error
  }
}

export function normalizeScholarshipFeedJob(detail: ScholarshipFeedDetail): NormalizedJob {
  return {
    title: detail.title,
    company: detail.company,
    description: detail.descriptionHtml || `<p>${detail.title}</p>`,
    responsibilities: '',
    required_qualifications: '',
    employment_type: 'FULL_TIME',
    job_location_type: 'ON_SITE',
    job_location_country: 'Kenya',
    job_location_county: '',
    job_location_city: '',
    location: detail.location || 'Kenya',
    apply_link: detail.applyLink || '',
    application_url: detail.applicationUrl || detail.applyLink || '',
    valid_through: detail.validThrough,
    date_posted: coerceDatePosted(detail.datePosted),
    salary_min: null,
    salary_max: null,
    salary_currency: 'KES',
    salary_period: 'YEAR',
    salary_visibility: 'Hide',
    experience_level: 'Entry',
    minimum_experience: null,
    industry: 'Education & Training',
    status: 'active',
    posted_by: 'admin',
    tags: [detail.occupationalCategory, 'Scholarship', detail.company].filter(Boolean).join(','),
  }
}

export function scholarshipFeedContentHash(detail: ScholarshipFeedDetail): string {
  return generateContentHash(detail.title, detail.company, detail.location)
}
