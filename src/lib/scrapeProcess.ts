/**
 * Shared scrape-queue processing (discover → queue → process → publish).
 * Called in-process by admin/cron/API routes — avoids HTTP self-fetch that
 * can return HTML (DOCTYPE) instead of JSON when hitting the public site URL.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobDetails, normalizeJob, ScraperSelectors } from '@/lib/scraper'
import {
  fetchWorkableJobDetails,
  normalizeWorkableJob,
  extractWorkableShortcode,
  extractWorkableSlug,
  generateContentHash as workableHash,
} from '@/lib/workable-adapter'
import {
  fetchSmartRecruitersJobDetails,
  normalizeSmartRecruitersJob,
  extractSmartRecruitersPostingId,
  extractSmartRecruitersSlug,
} from '@/lib/smartrecruiters-adapter'
import {
  fetchPscJobRow,
  normalizePscJob,
  extractPscAdvertNumber,
} from '@/lib/psc-adapter'
import { processPscPdfQueueItem } from '@/lib/psc-pdf-adapter'
import { mapEducationLevel } from '@/lib/jobMetadataExtraction'
import { resolveValidThrough } from '@/lib/jobParseNormalization'
import { parseScrapedJobContent, ScrapedJobInput } from '@/lib/scraperJobParsing'
import { ensureCompanyForJob } from '@/lib/ensureCompanyForJob'
import type { WorkableJobDetail } from '@/lib/workable-adapter'

export type ScrapeProcessResult = Record<string, unknown>

export async function runScrapeProcessOne(
  supabase: SupabaseClient
): Promise<ScrapeProcessResult> {
  const { data: queueItem, error: pickError } = await supabase
    .from('scrape_queue')
    .select('*, scraper_sources(*)')
    .eq('status', 'pending')
    .order('queued_at', { ascending: true })
    .limit(1)
    .single()

  if (pickError || !queueItem) {
    return { message: 'No pending jobs in queue', processed: 0 }
  }

  await supabase
    .from('scrape_queue')
    .update({ status: 'processing', attempts: (queueItem.attempts || 0) + 1 })
    .eq('id', queueItem.id)

  const source = queueItem.scraper_sources
  const adapterType = (source.selectors as { type?: string }).type || 'html'
  const hiringCompany = resolveHiringCompany(source.name, adapterType, queueItem.partial_data)

  try {
    if (adapterType === 'psc_pdf') {
      const scraperUserId = await getScraperUserId()
      const pdfResult = await processPscPdfQueueItem(queueItem, source, supabase, scraperUserId)

      await supabase
        .from('scrape_queue')
        .update({ status: 'done', processed_at: new Date().toISOString() })
        .eq('id', queueItem.id)

      return {
        success: true,
        processed: 1,
        source: source.source_id,
        job_url: queueItem.job_url,
        pdf_document: true,
        published: pdfResult.published,
        duplicates: pdfResult.duplicates,
        errors: pdfResult.errors,
        jobs: pdfResult.jobs,
      }
    }

    let normalized: ReturnType<typeof normalizeJob>
    let rawData: unknown
    let parseInput: ScrapedJobInput

    if (adapterType === 'workable') {
      const slug = extractWorkableSlug(queueItem.job_url)
      const shortcode = extractWorkableShortcode(queueItem.job_url)

      if (!slug || !shortcode) {
        throw new Error(`Cannot parse Workable slug/shortcode from URL: ${queueItem.job_url}`)
      }

      const detail: WorkableJobDetail = await fetchWorkableJobDetails(slug, shortcode)
      const filterCountry = (source.selectors as { filterCountry?: string }).filterCountry

      normalized = normalizeWorkableJob(detail, hiringCompany, filterCountry)
      normalized.application_url = queueItem.job_url
      rawData = detail

      parseInput = {
        title: normalized.title,
        company: hiringCompany,
        location: normalized.location,
        employmentType: normalized.employment_type,
        workplace: normalized.job_location_type,
        descriptionSection: detail.description,
        requirementsSection: detail.requirements,
        benefitsSection: detail.benefits,
      }
    } else if (adapterType === 'smartrecruiters') {
      const config = source.selectors as { slug?: string }
      const postingId = extractSmartRecruitersPostingId(queueItem.job_url)
      const slug = extractSmartRecruitersSlug(queueItem.job_url, config.slug)

      if (!slug || !postingId) {
        throw new Error(`Cannot parse SmartRecruiters slug/posting ID from URL: ${queueItem.job_url}`)
      }

      const detail = await fetchSmartRecruitersJobDetails(slug, postingId)
      normalized = normalizeSmartRecruitersJob(detail, hiringCompany)
      normalized.application_url = detail.applyUrl || detail.postingUrl || queueItem.job_url
      rawData = detail

      const sections = detail.jobAd?.sections
      parseInput = {
        title: normalized.title,
        company: hiringCompany,
        location: normalized.location,
        employmentType: normalized.employment_type,
        workplace: normalized.job_location_type,
        descriptionSection: [sections?.companyDescription?.text, sections?.jobDescription?.text]
          .filter(Boolean)
          .join('\n'),
        requirementsSection: sections?.qualifications?.text,
        benefitsSection: sections?.additionalInformation?.text,
      }
    } else if (adapterType === 'psc') {
      const advertNumber =
        extractPscAdvertNumber(queueItem.job_url) ||
        (queueItem.partial_data?.advertNumber as string | undefined)

      if (!advertNumber) {
        throw new Error(`Cannot parse PSC advert number from URL: ${queueItem.job_url}`)
      }

      const row = await fetchPscJobRow(source.base_url, advertNumber)
      if (!row) {
        throw new Error(`PSC advert ${advertNumber} not found on listing page`)
      }

      const applyUrl = 'https://www.psckjobs.go.ke/loginPage.aspx'
      normalized = normalizePscJob(row, applyUrl)
      rawData = row

      parseInput = {
        title: normalized.title,
        company: normalized.company,
        location: normalized.location,
        employmentType: normalized.employment_type,
        descriptionSection: normalized.description,
        requirementsSection: normalized.required_qualifications,
        rawContent: [
          normalized.description,
          normalized.required_qualifications,
          `Apply via PSC portal: ${applyUrl}`,
        ].join('\n\n'),
      }
    } else {
      const html = await fetchHtml(queueItem.job_url)
      const raw = extractJobDetails(html, queueItem.job_url, source.selectors as ScraperSelectors)

      if (!raw.title && queueItem.partial_data?.title) raw.title = queueItem.partial_data.title
      if (!raw.location && queueItem.partial_data?.location) {
        raw.location = queueItem.partial_data.location
      }
      if (!raw.title) throw new Error('Could not extract job title from detail page')

      normalized = normalizeJob(raw, hiringCompany)
      rawData = raw

      parseInput = {
        title: normalized.title,
        company: hiringCompany,
        location: normalized.location,
        employmentType: normalized.employment_type,
        descriptionSection: raw.description,
        requirementsSection: raw.requirements,
        rawContent: [raw.description, raw.requirements].filter(Boolean).join('\n\n'),
      }
    }

    if (!normalized.title) throw new Error('Job title is empty after normalization')

    const dedupCompany = adapterType === 'psc' ? normalized.company : hiringCompany
    const contentHash = workableHash(
      normalized.title,
      dedupCompany,
      normalized.job_location_city || normalized.job_location_county || ''
    )

    const { data: existing } = await supabase
      .from('scraped_job_sources')
      .select('id')
      .eq('content_hash', contentHash)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('scrape_queue')
        .update({ status: 'done', processed_at: new Date().toISOString() })
        .eq('id', queueItem.id)
      return {
        message: 'Duplicate job skipped',
        processed: 1,
        job_url: queueItem.job_url,
      }
    }

    const parsed = await parseScrapedJobContent(parseInput)

    const { data: educationLevels } = await supabase.from('education_levels').select('id, name')
    const educationLevelId = mapEducationLevel(parsed.education_level, educationLevels || [])

    const scraperUserId = await getScraperUserId()
    const ensured = await ensureCompanyForJob(supabase, {
      name: dedupCompany,
      userId: scraperUserId,
    })
    const companyId = ensured.companyId

    const jobPayload = {
      ...normalized,
      description: parsed.description || normalized.description,
      responsibilities: parsed.responsibilities || null,
      required_qualifications:
        parsed.required_qualifications || normalized.required_qualifications || null,
      additional_info: parsed.additional_info || null,
      company_id: companyId,
      user_id: scraperUserId,
      hiring_organization_name: dedupCompany,
      hiring_organization_logo: ensured.logo,
      hiring_organization_url: ensured.website,
      source: 'Scraper',
      direct_apply: false,
      application_url: normalized.application_url || queueItem.job_url,
      valid_through: resolveValidThrough(parsed.deadline || normalized.valid_through || undefined),
      education_level_id: educationLevelId,
      minimum_experience: parsed.minimum_experience ?? normalized.minimum_experience,
      experience_level: sanitizeExperienceLevel(
        parsed.experience_level || normalized.experience_level
      ),
      job_location_type: sanitizeJobLocationType(normalized.job_location_type),
      industry: parsed.industry || normalized.industry || null,
      salary_min: normalized.salary_min ?? parsed.salary_min ?? null,
      salary_max: normalized.salary_max ?? parsed.salary_max ?? null,
      salary_currency: normalized.salary_currency || parsed.salary_currency || 'KES',
      salary_period: normalized.salary_period || parsed.salary_period || 'MONTH',
    }

    const { data: insertedJob, error: jobError } = await supabase
      .from('jobs')
      .insert(jobPayload)
      .select('id')
      .single()

    if (jobError) throw jobError

    await supabase.from('scraped_job_sources').insert({
      source_id: source.source_id,
      job_url: queueItem.job_url,
      content_hash: contentHash,
      job_id: insertedJob.id,
      status: 'published',
      raw_data: rawData,
    })

    await supabase
      .from('scrape_queue')
      .update({ status: 'done', processed_at: new Date().toISOString() })
      .eq('id', queueItem.id)

    return {
      success: true,
      processed: 1,
      job_id: insertedJob.id,
      title: normalized.title,
      source: source.source_id,
      job_url: queueItem.job_url,
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object'
          ? JSON.stringify(err)
          : String(err)
    console.error('[process] Error:', queueItem.job_url, message)

    const attempts = (queueItem.attempts || 0) + 1
    // Permanent failures (gone postings, unparseable URLs) — don't retry.
    const permanent =
      /\b404\b/i.test(message) ||
      /not found/i.test(message) ||
      /Cannot parse/i.test(message) ||
      /Invalid PDF structure/i.test(message)
    const newStatus = permanent || attempts >= 3 ? 'failed' : 'pending'

    await supabase
      .from('scrape_queue')
      .update({ status: newStatus, error_message: message, attempts })
      .eq('id', queueItem.id)

    return {
      error: message,
      processed: 1,
      failed_permanent: permanent || attempts >= 3,
      job_url: queueItem.job_url,
    }
  }
}

export interface ScrapeProcessBatchOptions {
  maxJobs?: number
  /**
   * Soft time budget in ms. Stop before starting another item once exceeded.
   * Avoids hard Vercel timeouts that return HTML error pages instead of JSON.
   * Default: 270s (safe under Pro's 300s maxDuration).
   */
  budgetMs?: number
}

/** Process up to maxJobs pending queue items (one at a time). */
export async function runScrapeProcessBatch(
  supabase: SupabaseClient,
  maxJobsOrOptions: number | ScrapeProcessBatchOptions = 10
): Promise<{ processed: number; results: ScrapeProcessResult[]; stopped_early?: string }> {
  const options: ScrapeProcessBatchOptions =
    typeof maxJobsOrOptions === 'number' ? { maxJobs: maxJobsOrOptions } : maxJobsOrOptions

  const maxJobs = Math.min(Math.max(1, Math.floor(options.maxJobs ?? 10)), 20)
  const budgetMs = options.budgetMs ?? 270_000
  const startedAt = Date.now()

  const results: ScrapeProcessResult[] = []
  let processed = 0
  let stoppedEarly: string | undefined

  for (let i = 0; i < maxJobs; i++) {
    const elapsed = Date.now() - startedAt
    if (i > 0 && elapsed >= budgetMs) {
      stoppedEarly = `Stopped after ${processed} item(s) to stay within Vercel time limits (${Math.round(elapsed / 1000)}s elapsed)`
      break
    }

    const result = await runScrapeProcessOne(supabase)

    if (result.processed === 0 || result.message === 'No pending jobs in queue') {
      break
    }

    results.push(result)
    processed++

    // Continue through duplicates and per-item failures so cron can drain the
    // backlog (stale Workable 404s, etc.) without aborting the whole batch.
    if (result.message === 'Duplicate job skipped' || result.success || result.error) {
      continue
    }
  }

  return { processed, results, ...(stoppedEarly ? { stopped_early: stoppedEarly } : {}) }
}

const EXPERIENCE_LEVELS = new Set(['Entry', 'Mid', 'Senior', 'Managerial', 'Internship'])
const LOCATION_TYPES = new Set(['ON_SITE', 'REMOTE', 'HYBRID'])

/** Coerce free-text / ATS labels onto the jobs.experience_level enum. */
function sanitizeExperienceLevel(value: unknown): 'Entry' | 'Mid' | 'Senior' | 'Managerial' | 'Internship' {
  if (typeof value === 'string' && EXPERIENCE_LEVELS.has(value)) {
    return value as 'Entry' | 'Mid' | 'Senior' | 'Managerial' | 'Internship'
  }
  const raw = String(value || '').trim().toLowerCase()
  if (!raw || raw.includes('not applicable') || raw === 'n/a' || raw === 'none') return 'Mid'
  if (raw.includes('intern')) return 'Internship'
  if (raw.includes('entry') || raw.includes('junior') || raw.includes('graduate')) return 'Entry'
  if (raw.includes('senior') || raw.includes('lead') || raw.includes('principal')) return 'Senior'
  if (
    raw.includes('manager') ||
    raw.includes('director') ||
    raw.includes('executive') ||
    raw.includes('head')
  ) {
    return 'Managerial'
  }
  if (raw.includes('associate') || raw.includes('mid') || raw.includes('intermediate')) return 'Mid'
  return 'Mid'
}

/** Schema.org TELECOMMUTE → DB REMOTE; keep ON_SITE / HYBRID. */
function sanitizeJobLocationType(value: unknown): 'ON_SITE' | 'REMOTE' | 'HYBRID' {
  const raw = String(value || '').trim().toUpperCase()
  if (raw === 'TELECOMMUTE' || raw === 'REMOTE') return 'REMOTE'
  if (raw === 'HYBRID') return 'HYBRID'
  if (LOCATION_TYPES.has(raw)) return raw as 'ON_SITE' | 'REMOTE' | 'HYBRID'
  return 'ON_SITE'
}

function resolveHiringCompany(
  sourceName: string,
  adapterType: string,
  partialData: Record<string, unknown> | null | undefined
): string {
  if (adapterType === 'psc' && partialData?.ministry) {
    return String(partialData.ministry)
  }
  return sourceName
}

let _scraperUserId: string | null = null

async function getScraperUserId(): Promise<string> {
  if (_scraperUserId) return _scraperUserId
  if (process.env.SCRAPER_USER_ID) {
    _scraperUserId = process.env.SCRAPER_USER_ID
    return _scraperUserId
  }
  throw new Error('SCRAPER_USER_ID not set in environment variables.')
}
