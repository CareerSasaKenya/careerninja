/**
 * Shared logic to publish a scraped job into Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { NormalizedJob, generateContentHash } from './scraper'
import { mapEducationLevel } from './jobMetadataExtraction'
import {
  expiresAtFromValidThrough,
  normalizeJobUrl,
  resolveScrapedDeadline,
} from './scraperDeadline'
import { parseScrapedJobContent, ScrapedJobInput } from './scraperJobParsing'
import { ensureCompanyForJob } from './ensureCompanyForJob'

export interface PublishScrapedJobParams {
  supabase: SupabaseClient
  sourceId: string
  jobUrl: string
  normalized: NormalizedJob
  parseInput: ScrapedJobInput
  rawData: unknown
  scraperUserId: string
  dedupCompany: string
  skipAi?: boolean
}

export interface PublishScrapedJobResult {
  status: 'published' | 'duplicate' | 'expired' | 'error'
  job_id?: string
  title?: string
  error?: string
  valid_through?: string
}

export async function publishScrapedJob(
  params: PublishScrapedJobParams
): Promise<PublishScrapedJobResult> {
  const {
    supabase,
    sourceId,
    jobUrl,
    normalized,
    parseInput,
    rawData,
    scraperUserId,
    dedupCompany,
    skipAi = false,
  } = params

  const contentHash = generateContentHash(
    normalized.title,
    dedupCompany,
    normalized.job_location_city || normalized.job_location_county || ''
  )
  const canonicalUrl = normalizeJobUrl(jobUrl)
  const applicationUrl = normalizeJobUrl(normalized.application_url || jobUrl)

  const [{ data: existingByHash }, { data: existingByUrl }, { data: existingByAppUrl }] =
    await Promise.all([
      supabase.from('scraped_job_sources').select('id').eq('content_hash', contentHash).maybeSingle(),
      supabase.from('scraped_job_sources').select('id').eq('job_url', canonicalUrl).maybeSingle(),
      supabase
        .from('jobs')
        .select('id')
        .eq('source', 'Scraper')
        .eq('application_url', applicationUrl)
        .maybeSingle(),
    ])

  if (existingByHash || existingByUrl || existingByAppUrl) {
    return { status: 'duplicate', title: normalized.title }
  }

  try {
    const parsed = skipAi
      ? {
          description: normalized.description,
          responsibilities: normalized.responsibilities,
          required_qualifications: normalized.required_qualifications,
          additional_info: '',
          deadline: normalized.valid_through,
          education_level: null,
          minimum_experience: normalized.minimum_experience,
          experience_level: normalized.experience_level,
          industry: normalized.industry,
          job_function: null,
          tags: normalized.tags || '',
          salary_min: normalized.salary_min,
          salary_max: normalized.salary_max,
          salary_currency: normalized.salary_currency,
          salary_period: normalized.salary_period,
        }
      : await parseScrapedJobContent(parseInput)

    const deadline = resolveScrapedDeadline(
      parsed.deadline || normalized.valid_through || null
    )
    if (deadline.action === 'skip_expired') {
      await supabase.from('scraped_job_sources').upsert(
        {
          source_id: sourceId,
          job_url: canonicalUrl,
          content_hash: contentHash,
          job_id: null,
          status: 'skipped',
          raw_data: {
            ...(typeof rawData === 'object' && rawData ? (rawData as object) : {}),
            skip_reason: 'expired',
            expired_on: deadline.validThrough,
          },
        },
        { onConflict: 'job_url' }
      )
      return {
        status: 'expired',
        title: normalized.title,
        valid_through: deadline.validThrough,
      }
    }

    const { data: educationLevels } = await supabase
      .from('education_levels')
      .select('id, name')
    const educationLevelId = mapEducationLevel(parsed.education_level, educationLevels || [])

    // Reuse stored company logo, or fetch+persist once for this employer
    const ensured = await ensureCompanyForJob(supabase, {
      name: dedupCompany,
      userId: scraperUserId,
    })
    const companyId = ensured.companyId

    const jobPayload = {
      ...normalized,
      description: parsed.description || normalized.description,
      responsibilities: parsed.responsibilities || null,
      required_qualifications: parsed.required_qualifications || normalized.required_qualifications || null,
      additional_info: parsed.additional_info || null,
      company_id: companyId,
      user_id: scraperUserId,
      hiring_organization_name: dedupCompany,
      hiring_organization_logo: ensured.logo,
      hiring_organization_url: ensured.website,
      source: 'Scraper',
      direct_apply: false,
      application_url: applicationUrl,
      valid_through: deadline.validThrough,
      expires_at: expiresAtFromValidThrough(deadline.validThrough),
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

    await supabase.from('scraped_job_sources').insert({
      source_id: sourceId,
      job_url: canonicalUrl,
      content_hash: contentHash,
      job_id: insertedJob.id,
      status: 'published',
      raw_data: rawData,
    })

    return {
      status: 'published',
      job_id: insertedJob.id,
      title: normalized.title,
      valid_through: deadline.validThrough,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 'error', error: message, title: normalized.title }
  }
}
