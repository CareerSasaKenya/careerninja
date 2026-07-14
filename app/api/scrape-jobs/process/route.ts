import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobDetails, normalizeJob, generateContentHash, ScraperSelectors } from '@/lib/scraper'
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
import type { WorkableJobDetail } from '@/lib/workable-adapter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scraper-secret')
  if (secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pick the oldest pending job
  const { data: queueItem, error: pickError } = await supabase
    .from('scrape_queue')
    .select('*, scraper_sources(*)')
    .eq('status', 'pending')
    .order('queued_at', { ascending: true })
    .limit(1)
    .single()

  if (pickError || !queueItem) {
    return NextResponse.json({ message: 'No pending jobs in queue', processed: 0 })
  }

  // Mark as processing immediately
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

      return NextResponse.json({
        success: true,
        source: source.source_id,
        job_url: queueItem.job_url,
        pdf_document: true,
        published: pdfResult.published,
        duplicates: pdfResult.duplicates,
        errors: pdfResult.errors,
        jobs: pdfResult.jobs,
      })
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
        descriptionSection: [sections?.companyDescription?.text, sections?.jobDescription?.text].filter(Boolean).join('\n'),
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
      if (!raw.location && queueItem.partial_data?.location) raw.location = queueItem.partial_data.location
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
      return NextResponse.json({ message: 'Duplicate job skipped', job_url: queueItem.job_url })
    }

    // ── Intelligent field parsing ────────────────────────────────────────────
    const parsed = await parseScrapedJobContent(parseInput)

    const { data: educationLevels } = await supabase
      .from('education_levels')
      .select('id, name')
    const educationLevelId = mapEducationLevel(parsed.education_level, educationLevels || [])

    // ── Look up or create company ────────────────────────────────────────────
    const scraperUserId = await getScraperUserId()
    let companyId: string | null = null

    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', dedupCompany)
      .maybeSingle()

    if (existingCompany) {
      companyId = existingCompany.id
    } else {
      const { data: newCompany } = await supabase
        .from('companies')
        .insert({ name: dedupCompany, user_id: scraperUserId })
        .select('id')
        .single()
      companyId = newCompany?.id ?? null
    }

    // ── Insert job ───────────────────────────────────────────────────────────
    const jobPayload = {
      ...normalized,
      description: parsed.description || normalized.description,
      responsibilities: parsed.responsibilities || null,
      required_qualifications: parsed.required_qualifications || normalized.required_qualifications || null,
      additional_info: parsed.additional_info || null,
      company_id: companyId,
      user_id: scraperUserId,
      hiring_organization_name: dedupCompany,
      source: 'Scraper',
      direct_apply: false,
      application_url: normalized.application_url || queueItem.job_url,
      valid_through: resolveValidThrough(parsed.deadline || normalized.valid_through || undefined),
      education_level_id: educationLevelId,
      minimum_experience: parsed.minimum_experience ?? normalized.minimum_experience,
      experience_level: parsed.experience_level || normalized.experience_level,
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

    // ── Log to scraped_job_sources ───────────────────────────────────────────
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

    return NextResponse.json({
      success: true,
      job_id: insertedJob.id,
      title: normalized.title,
      source: source.source_id,
      job_url: queueItem.job_url,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err))
    console.error('[process] Error:', queueItem.job_url, message)

    const attempts = (queueItem.attempts || 0) + 1
    const newStatus = attempts >= 3 ? 'failed' : 'pending'

    await supabase
      .from('scrape_queue')
      .update({ status: newStatus, error_message: message, attempts })
      .eq('id', queueItem.id)

    return NextResponse.json({ error: message, job_url: queueItem.job_url }, { status: 500 })
  }
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
