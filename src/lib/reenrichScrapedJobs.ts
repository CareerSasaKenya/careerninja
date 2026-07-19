/**
 * Re-parse already-published scraped jobs from stored raw_data
 * using the same full parse path as manual / scrape publish.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { decodeGreenhouseHtml } from './greenhouse-adapter'
import { mapEducationLevel } from './jobMetadataExtraction'
import { limitTags } from './jobParseNormalization'
import {
  parseScrapedJobContent,
  type ScrapedJobInput,
} from './scraperJobParsing'

type RawWorkable = {
  description?: string
  requirements?: string
  benefits?: string
  department?: string[] | string
  title?: string
  workplace?: string
  location?: { city?: string; country?: string } | string
}

type RawSmartRecruiters = {
  name?: string
  department?: { label?: string }
  industry?: { label?: string }
  function?: { label?: string }
  jobAd?: {
    sections?: {
      companyDescription?: { text?: string }
      jobDescription?: { text?: string }
      qualifications?: { text?: string }
      additionalInformation?: { text?: string }
    }
  }
}

type RawGreenhouse = {
  title?: string
  content?: string
  departments?: Array<{ name?: string }>
  offices?: Array<{ name?: string; location?: { name?: string } }>
  location?: { name?: string }
}

type RawPscPdf = {
  extracted?: {
    title?: string
    description?: string
    responsibilities?: string
    required_qualifications?: string
    ministry?: string
    location?: string
    employment_type?: string
  }
  pdfExcerpt?: string
}

export function buildReenrichInput(
  sourceId: string,
  title: string,
  company: string,
  raw: Record<string, unknown>
): ScrapedJobInput | null {
  // SmartRecruiters
  if ((raw as RawSmartRecruiters).jobAd) {
    const sr = raw as RawSmartRecruiters
    const sections = sr.jobAd?.sections
    return {
      title: title || sr.name || 'Untitled',
      company,
      descriptionSection: sections?.companyDescription?.text || '',
      responsibilitiesSection: sections?.jobDescription?.text || '',
      requirementsSection: sections?.qualifications?.text || '',
      benefitsSection: sections?.additionalInformation?.text || '',
      industryHint: sr.industry?.label || sr.department?.label || null,
      jobFunctionHint: sr.function?.label || null,
      tagsHint: [sr.function?.label, sr.industry?.label, sr.department?.label]
        .filter(Boolean)
        .join(', '),
    }
  }

  // Greenhouse (content is often entity-encoded HTML)
  if (typeof (raw as RawGreenhouse).content === 'string' && (raw as RawGreenhouse).content) {
    const gh = raw as RawGreenhouse
    const html = decodeGreenhouseHtml(gh.content || '')
    const dept = gh.departments?.[0]?.name || null
    const location =
      gh.location?.name ||
      gh.offices?.[0]?.location?.name ||
      gh.offices?.[0]?.name ||
      undefined
    return {
      title: title || gh.title || 'Untitled',
      company,
      location,
      descriptionSection: html,
      requirementsSection: '',
      industryHint: dept,
      jobFunctionHint: dept,
      tagsHint: dept,
    }
  }

  // PSC PDF extracted payload
  if ((raw as RawPscPdf).extracted) {
    const extracted = (raw as RawPscPdf).extracted!
    const description = extracted.description || ''
    const responsibilities = extracted.responsibilities || ''
    const requirements = extracted.required_qualifications || ''
    if (!description && !responsibilities && !requirements) return null
    return {
      title: title || extracted.title || 'Untitled',
      company: extracted.ministry || company,
      location: extracted.location,
      employmentType: extracted.employment_type,
      descriptionSection: description,
      responsibilitiesSection: responsibilities,
      requirementsSection: requirements,
      rawContent: [description, responsibilities, requirements].filter(Boolean).join('\n\n'),
    }
  }

  // Workable / generic HTML adapters with description+requirements
  const w = raw as RawWorkable
  if (w.description || w.requirements) {
    const deptArr = Array.isArray(w.department)
      ? w.department.filter(Boolean)
      : typeof w.department === 'string'
        ? [w.department]
        : []
    const deptHint = deptArr.join(', ') || null
    const location =
      typeof w.location === 'string'
        ? w.location
        : w.location && typeof w.location === 'object'
          ? [w.location.city, w.location.country].filter(Boolean).join(', ')
          : undefined
    return {
      title,
      company,
      location,
      workplace: w.workplace,
      descriptionSection: w.description || '',
      requirementsSection: w.requirements || '',
      benefitsSection: w.benefits || '',
      jobFunctionHint: deptArr[0] || null,
      tagsHint: deptHint,
    }
  }

  // Last resort: PDF excerpt text
  if (typeof (raw as RawPscPdf).pdfExcerpt === 'string' && (raw as RawPscPdf).pdfExcerpt) {
    return {
      title,
      company,
      rawContent: String((raw as RawPscPdf).pdfExcerpt),
      descriptionSection: String((raw as RawPscPdf).pdfExcerpt),
    }
  }

  return null
}

export interface ReenrichOptions {
  limit?: number
  offset?: number
  sourceFilter?: string | null
  missingOnly?: boolean
  apply?: boolean
  onProgress?: (line: string) => void
}

export interface ReenrichResult {
  examined: number
  updated: number
  skipped: number
  failed: number
  details: Array<{ title: string; status: string; detail?: string }>
}

export async function runReenrichScrapedJobs(
  supabase: SupabaseClient,
  options: ReenrichOptions = {}
): Promise<ReenrichResult> {
  const {
    limit = 50,
    offset = 0,
    sourceFilter = null,
    missingOnly = false,
    apply = true,
    onProgress,
  } = options

  const log = (line: string) => {
    onProgress?.(line)
  }

  const [{ data: educationLevels }, { data: industries }, { data: jobFunctions }] =
    await Promise.all([
      supabase.from('education_levels').select('id, name'),
      supabase.from('industries').select('id, name'),
      supabase.from('job_functions').select('id, name'),
    ])

  const industryNames = (industries || []).map(i => i.name)
  const jobFunctionNames = (jobFunctions || []).map(j => j.name)

  let query = supabase
    .from('scraped_job_sources')
    .select('id, source_id, job_id, raw_data, job_url')
    .eq('status', 'published')
    .not('job_id', 'is', null)
    .order('scraped_at', { ascending: false })
    .range(offset, offset + Math.max(limit, 1) - 1)

  if (sourceFilter) {
    query = query.eq('source_id', sourceFilter)
  }

  const { data: rows, error } = await query
  if (error) throw error

  const result: ReenrichResult = {
    examined: rows?.length || 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  }

  if (!rows?.length) {
    log('No published scraped jobs found')
    return result
  }

  log(
    `${apply ? 'APPLY' : 'DRY-RUN'}: re-enrich ${rows.length} scraped jobs` +
      `${sourceFilter ? ` (source=${sourceFilter})` : ''}` +
      `${missingOnly ? ' (missing industry/function only)' : ''}` +
      ` offset=${offset}`
  )

  for (const row of rows) {
    const { data: job } = await supabase
      .from('jobs')
      .select(
        'id, title, hiring_organization_name, company, description, responsibilities, tags, industry, job_function'
      )
      .eq('id', row.job_id)
      .maybeSingle()

    if (!job) {
      result.skipped++
      result.details.push({ title: String(row.job_id), status: 'skipped', detail: 'job missing' })
      continue
    }

    if (missingOnly && job.industry && job.job_function) {
      result.skipped++
      result.details.push({ title: job.title, status: 'skipped', detail: 'already complete' })
      continue
    }

    const raw = (row.raw_data || {}) as Record<string, unknown>
    const input = buildReenrichInput(
      row.source_id,
      job.title,
      job.hiring_organization_name || job.company || 'Company',
      raw
    )

    if (!input) {
      log(`skip (no parsable raw): ${job.title}`)
      result.skipped++
      result.details.push({ title: job.title, status: 'skipped', detail: 'no parsable raw' })
      continue
    }

    try {
      const parsed = await parseScrapedJobContent(input, {
        industryNames,
        jobFunctionNames,
      })

      const educationLevelId = mapEducationLevel(parsed.education_level, educationLevels || [])
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

      const patch = {
        description: parsed.description || job.description,
        responsibilities: parsed.responsibilities || null,
        required_qualifications: parsed.required_qualifications || null,
        additional_info: parsed.additional_info || null,
        education_level_id: educationLevelId,
        area_of_study: parsed.area_of_study || null,
        field_of_study: parsed.field_of_study || null,
        language_requirements: parsed.language_requirements || null,
        apply_email: parsed.apply_email || null,
        apply_link: parsed.apply_link || null,
        employment_types: parsed.employment_types || null,
        employment_type: parsed.employment_types?.[0] || null,
        job_location_types: parsed.job_location_types || null,
        job_location_type: parsed.job_location_types?.[0] || null,
        job_location_country: parsed.job_location_country || null,
        job_location_county: parsed.job_location_county || null,
        job_location_city: parsed.job_location_city || null,
        additional_locations: parsed.additional_locations || [],
        minimum_experience: parsed.minimum_experience,
        experience_level: experienceLevel,
        industry: industryName,
        industries: industryNamesResolved,
        industry_id: industryRows[0]?.id ?? null,
        industry_ids: industryRows.map(r => r.id),
        job_function: jobFunctionName,
        job_functions: jobFunctionNamesResolved,
        job_function_id: jobFunctionRows[0]?.id ?? null,
        job_function_ids: jobFunctionRows.map(r => r.id),
        tags: limitTags(parsed.tags, 5),
      }

      const summary =
        `${job.title} | desc ${String(job.description || '').length}→${String(patch.description || '').length}` +
        ` resp ${String(job.responsibilities || '').length}→${String(patch.responsibilities || '').length}` +
        ` industry=${patch.industry} fn=${patch.job_function}` +
        ` edu=${parsed.education_level} study=${parsed.field_of_study}` +
        ` email=${parsed.apply_email || '-'}`

      if (apply) {
        const { error: upErr } = await supabase.from('jobs').update(patch).eq('id', job.id)
        if (upErr) {
          log(`FAILED ${job.title}: ${upErr.message}`)
          result.failed++
          result.details.push({ title: job.title, status: 'failed', detail: upErr.message })
        } else {
          log(`update: ${summary}`)
          result.updated++
          result.details.push({ title: job.title, status: 'updated' })
        }
      } else {
        log(`would update: ${summary}`)
        result.updated++
        result.details.push({ title: job.title, status: 'would_update' })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      log(`FAILED ${job.title}: ${message}`)
      result.failed++
      result.details.push({ title: job.title, status: 'failed', detail: message })
    }
  }

  log(
    `Done. ${apply ? 'Updated' : 'Would update'}: ${result.updated}, skipped: ${result.skipped}, failed: ${result.failed}`
  )
  return result
}
