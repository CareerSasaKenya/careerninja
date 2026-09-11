/**
 * Run: npx tsx src/components/JobStructuredData.test.ts
 *
 * Recreates the Search Console "Missing field datePosted" case:
 * Regenerative Market Garden Lead had null jobs.date_posted, so JSON-LD
 * omitted the required property. created_at must fill it in.
 */
import assert from 'node:assert/strict'
import { buildJobPostingJsonLd } from './JobStructuredData'
import type { Database } from '@/integrations/supabase/types'

type JobRow = Database['public']['Tables']['jobs']['Row']

function job(partial: Partial<JobRow> & { companies?: null }): JobRow & {
  companies?: null
} {
  return {
    title: 'Regenerative Market Garden Lead',
    company: 'Black House Syntropics',
    description: '<p>Farm manager role.</p>',
    date_posted: null,
    created_at: '2026-09-09T08:00:00.000Z',
    valid_through: '2026-10-04T00:00:00.000Z',
    employment_type: 'FULL_TIME',
    job_location_type: 'ON_SITE',
    job_location_city: 'Kajiado',
    job_location_county: 'Kajiado',
    job_location_country: 'Kenya',
    location: 'Kajiado, Kenya',
    salary_min: 16000,
    salary_max: 30000,
    salary_currency: 'KES',
    salary_period: 'MONTH',
    salary_is_estimated: false,
    salary_visibility: 'Show',
    minimum_experience: 1,
    industry: 'Agriculture & Agribusiness',
    direct_apply: false,
    companies: null,
    ...partial,
  } as JobRow & { companies?: null }
}

const liveGscCase = buildJobPostingJsonLd(job({}))
assert.ok(liveGscCase, 'emits JobPosting when date_posted is null')
assert.equal(liveGscCase['@type'], 'JobPosting')
assert.equal(
  liveGscCase.datePosted,
  '2026-09-09T08:00:00.000Z',
  'datePosted falls back to created_at for the GSC-invalid listing'
)
assert.equal(liveGscCase.title, 'Regenerative Market Garden Lead')

const withBoardDate = buildJobPostingJsonLd(
  job({ date_posted: '2026-08-20T10:45:32.000Z' })
)
assert.equal(
  withBoardDate?.datePosted,
  '2026-08-20T10:45:32.000Z',
  'board date_posted is preferred when present'
)

const noDates = buildJobPostingJsonLd(
  job({ date_posted: null, created_at: '', posted_date: null })
)
assert.equal(
  noDates,
  null,
  'does not emit JobPosting when no valid datePosted can be resolved'
)

console.log('JobStructuredData.test.ts: all assertions passed')
