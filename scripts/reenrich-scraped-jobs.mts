/**
 * Re-parse already-published scraped jobs so description / responsibilities /
 * qualifications / tags / industry / education populate like normal posts.
 *
 * Uses scraped_job_sources.raw_data (no live ATS refetch).
 *
 *   npx tsx scripts/reenrich-scraped-jobs.mts           # dry-run
 *   npx tsx scripts/reenrich-scraped-jobs.mts --apply   # write updates
 *   npx tsx scripts/reenrich-scraped-jobs.mts --apply --limit=20
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  parseScrapedJobContent,
  type ScrapedJobInput,
} from '../src/lib/scraperJobParsing'
import { mapEducationLevel } from '../src/lib/jobMetadataExtraction'
import { limitTags } from '../src/lib/jobParseNormalization'

config({ path: '.env' })
config({ path: '.env.local', override: true })

const apply = process.argv.includes('--apply')
const missingOnly = process.argv.includes('--missing-only')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500
const sourceArg = process.argv.find(a => a.startsWith('--source='))
const sourceFilter = sourceArg ? sourceArg.split('=').slice(1).join('=') : null

type RawWorkable = {
  description?: string
  requirements?: string
  benefits?: string
  department?: string[]
  title?: string
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

function buildInput(
  sourceId: string,
  title: string,
  company: string,
  raw: Record<string, unknown>
): ScrapedJobInput | null {
  const isSR =
    sourceId.includes('amref') ||
    sourceId.includes('salix') ||
    sourceId.includes('digital-divide') ||
    sourceId.includes('powergen') ||
    sourceId.includes('ihub') ||
    !!(raw as RawSmartRecruiters).jobAd

  if (isSR || (raw as RawSmartRecruiters).jobAd) {
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

  const w = raw as RawWorkable
  if (w.description || w.requirements) {
    const deptHint = Array.isArray(w.department)
      ? w.department.filter(Boolean).join(', ')
      : null
    return {
      title,
      company,
      descriptionSection: w.description || '',
      requirementsSection: w.requirements || '',
      benefitsSection: w.benefits || '',
      jobFunctionHint: Array.isArray(w.department) ? w.department[0] || null : null,
      tagsHint: deptHint,
    }
  }

  return null
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env')

  const supabase = createClient(url, key)

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
    .limit(limit)

  if (sourceFilter) {
    query = query.eq('source_id', sourceFilter)
  }

  const { data: rows, error } = await query

  if (error) throw error
  if (!rows?.length) {
    console.log('No published scraped jobs found')
    return
  }

  console.log(
    `${apply ? 'APPLY' : 'DRY-RUN'}: re-enrich ${rows.length} scraped jobs` +
      `${sourceFilter ? ` (source=${sourceFilter})` : ''}` +
      `${missingOnly ? ' (missing industry/function only)' : ''}`
  )

  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const { data: job } = await supabase
      .from('jobs')
      .select(
        'id, title, hiring_organization_name, company, description, responsibilities, tags, industry, job_function'
      )
      .eq('id', row.job_id)
      .maybeSingle()

    if (!job) {
      skipped++
      continue
    }

    if (missingOnly && job.industry && job.job_function) {
      skipped++
      continue
    }

    const raw = (row.raw_data || {}) as Record<string, unknown>
    const input = buildInput(
      row.source_id,
      job.title,
      job.hiring_organization_name || job.company || 'Company',
      raw
    )

    if (!input) {
      console.log('skip (no parsable raw):', job.title)
      skipped++
      continue
    }

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

    console.log(
      `${apply ? 'update' : 'would update'}: ${job.title}` +
        ` | desc ${String(job.description || '').length}→${String(patch.description || '').length}` +
        ` resp ${String(job.responsibilities || '').length}→${String(patch.responsibilities || '').length}` +
        ` tags="${patch.tags}" industry=${patch.industry} fn=${patch.job_function}` +
        ` edu=${parsed.education_level} study=${parsed.field_of_study}` +
        ` email=${parsed.apply_email || '-'} minExp=${parsed.minimum_experience}`
    )

    if (apply) {
      const { error: upErr } = await supabase.from('jobs').update(patch).eq('id', job.id)
      if (upErr) {
        console.error('  FAILED', upErr.message)
      } else {
        updated++
      }
    } else {
      updated++
    }
  }

  console.log(`Done. ${apply ? 'Updated' : 'Would update'}: ${updated}, skipped: ${skipped}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
