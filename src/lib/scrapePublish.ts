/**
 * Shared logic to publish a scraped job into Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { NormalizedJob, generateContentHash } from './scraper'
import { mapEducationLevel } from './jobMetadataExtraction'
import { resolveValidThrough } from './jobParseNormalization'
import { parseScrapedJobContent, ScrapedJobInput } from './scraperJobParsing'
import { buildCompanyLogoEnrichment } from './companyLogo'

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
  status: 'published' | 'duplicate' | 'error'
  job_id?: string
  title?: string
  error?: string
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

  const { data: existing } = await supabase
    .from('scraped_job_sources')
    .select('id')
    .eq('content_hash', contentHash)
    .maybeSingle()

  if (existing) {
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
          salary_min: normalized.salary_min,
          salary_max: normalized.salary_max,
          salary_currency: normalized.salary_currency,
          salary_period: normalized.salary_period,
        }
      : await parseScrapedJobContent(parseInput)

    const { data: educationLevels } = await supabase
      .from('education_levels')
      .select('id, name')
    const educationLevelId = mapEducationLevel(parsed.education_level, educationLevels || [])

    let companyId: string | null = null
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, logo, website')
      .eq('name', dedupCompany)
      .maybeSingle()

    if (existingCompany) {
      companyId = existingCompany.id
      // Backfill logo/website for known or domain-resolvable employers
      const enrichment = buildCompanyLogoEnrichment({
        name: dedupCompany,
        logo: existingCompany.logo,
        website: existingCompany.website,
      })
      if (Object.keys(enrichment).length > 0) {
        await supabase.from('companies').update(enrichment).eq('id', existingCompany.id)
      }
    } else {
      const enrichment = buildCompanyLogoEnrichment({ name: dedupCompany })
      const { data: newCompany } = await supabase
        .from('companies')
        .insert({
          name: dedupCompany,
          user_id: scraperUserId,
          logo: enrichment.logo ?? null,
          website: enrichment.website ?? null,
        })
        .select('id')
        .single()
      companyId = newCompany?.id ?? null
    }

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
      application_url: normalized.application_url || jobUrl,
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

    await supabase.from('scraped_job_sources').insert({
      source_id: sourceId,
      job_url: jobUrl,
      content_hash: contentHash,
      job_id: insertedJob.id,
      status: 'published',
      raw_data: rawData,
    })

    return { status: 'published', job_id: insertedJob.id, title: normalized.title }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 'error', error: message, title: normalized.title }
  }
}
