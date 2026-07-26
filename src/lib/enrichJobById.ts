/**
 * Universal job enrichment — works for ANY CareerSasa job, regardless of intake
 * (scraper, manual post, parse-job form, template, n8n, etc.).
 *
 * Prefers scraped raw_data when available (richer ATS HTML); otherwise builds
 * the AI parse input from the job row's description / responsibilities /
 * required_qualifications text.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { mapEducationLevel } from './jobMetadataExtraction'
import { limitTags } from './jobParseNormalization'
import {
  parseScrapedJobContent,
  type ScrapedJobInput,
} from './scraperJobParsing'
import { buildReenrichInput } from './reenrichScrapedJobs'
import { sanitizeAdditionalInfoApplyCopy } from './applyInstructionsCopy'

export interface EnrichJobOptions {
  /** Overwrite existing section/taxonomy fields (default true for admin force enrich) */
  force?: boolean
  /** Only fill empty taxonomy when force is false */
  fillGapsOnly?: boolean
  apply?: boolean
}

export interface EnrichJobResult {
  job_id: string
  title: string
  status: 'updated' | 'skipped' | 'failed' | 'dry_run'
  detail?: string
  summary?: string
  used_raw_data?: boolean
  ai_keys_configured?: boolean
}

type JobRow = {
  id: string
  title: string | null
  company: string | null
  hiring_organization_name: string | null
  description: string | null
  responsibilities: string | null
  required_qualifications: string | null
  additional_info: string | null
  industry: string | null
  job_function: string | null
  location: string | null
  employment_type: string | null
  job_location_type: string | null
  apply_email?: string | null
  apply_link?: string | null
  application_url?: string | null
}

function hasAiKeys(): boolean {
  return [
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_API_KEY_2,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].some(v => typeof v === 'string' && v.trim().length > 0)
}

function asHtmlSection(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/** Build AI parse input from the live jobs row (any intake path). */
export function buildInputFromJobRow(job: JobRow): ScrapedJobInput | null {
  const description = asHtmlSection(job.description)
  const responsibilities = asHtmlSection(job.responsibilities)
  const requirements = asHtmlSection(job.required_qualifications)
  const additional = asHtmlSection(job.additional_info)
  const corpus = [description, responsibilities, requirements, additional]
    .join('\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (corpus.length < 40) return null

  const company =
    job.hiring_organization_name?.trim() || job.company?.trim() || 'Company'

  return {
    title: job.title?.trim() || 'Untitled',
    company,
    location: job.location || undefined,
    employmentType: job.employment_type || undefined,
    workplace: job.job_location_type || undefined,
    descriptionSection: description,
    responsibilitiesSection: responsibilities,
    requirementsSection: requirements,
    benefitsSection: additional,
    rawContent: [description, responsibilities, requirements, additional]
      .filter(Boolean)
      .join('\n\n'),
    industryHint: job.industry,
    jobFunctionHint: job.job_function,
  }
}

function jobNeedsEnrichment(job: JobRow): boolean {
  const hasIndustry = Boolean(job.industry?.trim())
  const hasFunction = Boolean(job.job_function?.trim())
  const hasResp = Boolean(asHtmlSection(job.responsibilities).trim())
  const hasQuals = Boolean(asHtmlSection(job.required_qualifications).trim())
  // Sparse posts (common for n8n / thin ATS / incomplete forms)
  return !hasIndustry || !hasFunction || !hasResp || !hasQuals
}

/**
 * Normalize + AI-enrich one job by id.
 * Works whether or not it came from the scraper.
 */
export async function enrichJobById(
  supabase: SupabaseClient,
  jobId: string,
  options: EnrichJobOptions = {}
): Promise<EnrichJobResult> {
  const { force = true, fillGapsOnly = false, apply = true } = options
  const aiConfigured = hasAiKeys()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(
      'id, title, company, hiring_organization_name, description, responsibilities, required_qualifications, additional_info, industry, job_function, location, employment_type, job_location_type, apply_email, apply_link, application_url'
    )
    .eq('id', jobId)
    .maybeSingle()

  if (jobError) {
    return {
      job_id: jobId,
      title: jobId,
      status: 'failed',
      detail: jobError.message,
      ai_keys_configured: aiConfigured,
    }
  }
  if (!job) {
    return {
      job_id: jobId,
      title: jobId,
      status: 'failed',
      detail: 'Job not found',
      ai_keys_configured: aiConfigured,
    }
  }

  const row = job as JobRow
  if (fillGapsOnly && !force && !jobNeedsEnrichment(row)) {
    return {
      job_id: row.id,
      title: row.title || 'Untitled',
      status: 'skipped',
      detail: 'already complete',
      ai_keys_configured: aiConfigured,
    }
  }

  // Prefer richer ATS raw_data when this job was scraped
  let usedRawData = false
  let input: ScrapedJobInput | null = null
  const { data: scraped } = await supabase
    .from('scraped_job_sources')
    .select('source_id, raw_data')
    .eq('job_id', jobId)
    .eq('status', 'published')
    .order('scraped_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (scraped?.raw_data && typeof scraped.raw_data === 'object') {
    input = buildReenrichInput(
      scraped.source_id,
      row.title || 'Untitled',
      row.hiring_organization_name || row.company || 'Company',
      scraped.raw_data as Record<string, unknown>
    )
    if (input) usedRawData = true
  }

  if (!input) {
    input = buildInputFromJobRow(row)
  }

  if (!input) {
    return {
      job_id: row.id,
      title: row.title || 'Untitled',
      status: 'skipped',
      detail: 'insufficient content to enrich',
      ai_keys_configured: aiConfigured,
    }
  }

  try {
    const [{ data: educationLevels }, { data: industries }, { data: jobFunctions }] =
      await Promise.all([
        supabase.from('education_levels').select('id, name'),
        supabase.from('industries').select('id, name'),
        supabase.from('job_functions').select('id, name'),
      ])

    const industryNames = (industries || []).map(i => i.name)
    const jobFunctionNames = (jobFunctions || []).map(j => j.name)

    const parsed = await parseScrapedJobContent(input, {
      industryNames,
      jobFunctionNames,
    })

    const educationLevelId = mapEducationLevel(
      parsed.education_level,
      educationLevels || []
    )
    const industryNamesResolved =
      (parsed.industries?.length ? parsed.industries : null) ||
      (parsed.industry ? [parsed.industry] : null)
    const jobFunctionNamesResolved =
      (parsed.job_functions?.length ? parsed.job_functions : null) ||
      (parsed.job_function ? [parsed.job_function] : null)
    const industryName = industryNamesResolved?.[0] || null
    const jobFunctionName = jobFunctionNamesResolved?.[0] || null
    const industryRows = (industries || []).filter(i =>
      industryNamesResolved?.includes(i.name)
    )
    const jobFunctionRows = (jobFunctions || []).filter(j =>
      jobFunctionNamesResolved?.includes(j.name)
    )

    const allowedExp = new Set(['Entry', 'Mid', 'Senior', 'Managerial', 'Internship'])
    const experienceLevel =
      parsed.experience_level && allowedExp.has(parsed.experience_level)
        ? parsed.experience_level
        : null

    const patch: Record<string, unknown> = {}

    const setIf = (key: string, value: unknown, existing?: unknown) => {
      if (value == null || value === '') return
      if (fillGapsOnly && !force && existing != null && String(existing).trim()) return
      patch[key] = value
    }

    setIf('description', parsed.description || row.description, fillGapsOnly ? row.description : null)
    setIf(
      'responsibilities',
      parsed.responsibilities || null,
      fillGapsOnly ? row.responsibilities : null
    )
    setIf(
      'required_qualifications',
      parsed.required_qualifications || null,
      fillGapsOnly ? row.required_qualifications : null
    )
    setIf(
      'additional_info',
      sanitizeAdditionalInfoApplyCopy(
        parsed.additional_info || null,
        {
          apply_email: parsed.apply_email || row.apply_email || null,
          apply_link: parsed.apply_link || row.apply_link || null,
          application_url: row.application_url || null,
        },
        row.title || null
      )
    )
    setIf('education_level_id', educationLevelId)
    setIf('area_of_study', parsed.area_of_study || null)
    setIf('field_of_study', parsed.field_of_study || null)
    setIf('language_requirements', parsed.language_requirements || null)
    if (parsed.additional_locations?.length) {
      patch.additional_locations = parsed.additional_locations
    }
    setIf('minimum_experience', parsed.minimum_experience)
    setIf('experience_level', experienceLevel)
    setIf('industry', industryName, fillGapsOnly ? row.industry : null)
    if (industryNamesResolved) patch.industries = industryNamesResolved
    if (industryRows[0]) {
      patch.industry_id = industryRows[0].id
      patch.industry_ids = industryRows.map(r => r.id)
    }
    setIf('job_function', jobFunctionName, fillGapsOnly ? row.job_function : null)
    if (jobFunctionNamesResolved) patch.job_functions = jobFunctionNamesResolved
    if (jobFunctionRows[0]) {
      patch.job_function_id = jobFunctionRows[0].id
      patch.job_function_ids = jobFunctionRows.map(r => r.id)
    }
    if (parsed.tags) patch.tags = limitTags(parsed.tags, 5)

    // Never null out apply paths (DB check constraint)
    if (parsed.apply_email) patch.apply_email = parsed.apply_email
    if (parsed.apply_link) patch.apply_link = parsed.apply_link
    if (parsed.employment_types?.length) {
      patch.employment_types = parsed.employment_types
      patch.employment_type = parsed.employment_types[0]
    }
    if (parsed.job_location_types?.length) {
      patch.job_location_types = parsed.job_location_types
      patch.job_location_type = parsed.job_location_types[0]
    }
    if (parsed.job_location_country) {
      patch.job_location_country = parsed.job_location_country
    }
    if (parsed.job_location_county) {
      patch.job_location_county = parsed.job_location_county
    }
    if (parsed.job_location_city) {
      patch.job_location_city = parsed.job_location_city
    }

    if (Object.keys(patch).length === 0) {
      return {
        job_id: row.id,
        title: row.title || 'Untitled',
        status: 'skipped',
        detail: 'nothing to update',
        used_raw_data: usedRawData,
        ai_keys_configured: aiConfigured,
      }
    }

    const summary =
      `${row.title} | desc→${String(patch.description ?? row.description ?? '').length}` +
      ` resp→${String(patch.responsibilities ?? '').length}` +
      ` industry=${patch.industry ?? row.industry}` +
      ` fn=${patch.job_function ?? row.job_function}` +
      ` edu=${parsed.education_level}` +
      ` raw=${usedRawData}` +
      ` ai=${aiConfigured}`

    if (!apply) {
      return {
        job_id: row.id,
        title: row.title || 'Untitled',
        status: 'dry_run',
        summary,
        used_raw_data: usedRawData,
        ai_keys_configured: aiConfigured,
      }
    }

    const { error: upErr } = await supabase.from('jobs').update(patch).eq('id', row.id)
    if (upErr) {
      return {
        job_id: row.id,
        title: row.title || 'Untitled',
        status: 'failed',
        detail: upErr.message,
        used_raw_data: usedRawData,
        ai_keys_configured: aiConfigured,
      }
    }

    return {
      job_id: row.id,
      title: row.title || 'Untitled',
      status: 'updated',
      summary,
      used_raw_data: usedRawData,
      ai_keys_configured: aiConfigured,
    }
  } catch (err) {
    return {
      job_id: row.id,
      title: row.title || 'Untitled',
      status: 'failed',
      detail: err instanceof Error ? err.message : String(err),
      used_raw_data: usedRawData,
      ai_keys_configured: aiConfigured,
    }
  }
}

/**
 * Batch-enrich active jobs that look sparse (any intake path).
 */
export async function enrichJobsNeedingEnrichment(
  supabase: SupabaseClient,
  options: { limit?: number; apply?: boolean } = {}
): Promise<{ examined: number; results: EnrichJobResult[] }> {
  const limit = Math.min(Math.max(1, options.limit ?? 10), 25)
  const apply = options.apply !== false

  const { data: rows, error } = await supabase
    .from('jobs')
    .select(
      'id, title, industry, job_function, responsibilities, required_qualifications, description'
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit * 3)

  if (error) throw error

  const candidates = (rows || [])
    .filter(j =>
      jobNeedsEnrichment({
        id: j.id,
        title: j.title,
        company: null,
        hiring_organization_name: null,
        description: j.description,
        responsibilities: j.responsibilities,
        required_qualifications: j.required_qualifications,
        additional_info: null,
        industry: j.industry,
        job_function: j.job_function,
        location: null,
        employment_type: null,
        job_location_type: null,
      })
    )
    .slice(0, limit)

  const results: EnrichJobResult[] = []
  for (const row of candidates) {
    results.push(
      await enrichJobById(supabase, row.id, {
        force: true,
        fillGapsOnly: false,
        apply,
      })
    )
  }

  return { examined: candidates.length, results }
}
