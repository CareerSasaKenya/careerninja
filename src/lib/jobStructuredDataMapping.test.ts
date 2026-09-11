/**
 * Run: npx tsx src/lib/jobStructuredDataMapping.test.ts
 */
import assert from 'node:assert/strict'
import {
  resolveDatePosted,
  type JobForSchema,
} from './jobStructuredDataMapping'

function job(partial: Partial<JobForSchema>): JobForSchema {
  return partial as JobForSchema
}

assert.equal(
  resolveDatePosted(job({ date_posted: '2026-09-01T08:00:00.000Z' })),
  '2026-09-01T08:00:00.000Z',
  'uses date_posted when present'
)

assert.equal(
  resolveDatePosted(
    job({
      date_posted: '2026-08-20T00:00:00.000Z',
      created_at: '2026-09-09T12:00:00.000Z',
    })
  ),
  '2026-08-20T00:00:00.000Z',
  'date_posted wins over created_at'
)

assert.equal(
  resolveDatePosted(
    job({
      date_posted: null,
      created_at: '2026-09-09T12:00:00.000Z',
    })
  ),
  '2026-09-09T12:00:00.000Z',
  'created_at fills in when date_posted is missing (GSC datePosted)'
)

assert.equal(
  resolveDatePosted(
    job({
      date_posted: null,
      created_at: '',
      posted_date: '2026-09-07',
    })
  ),
  new Date('2026-09-07').toISOString(),
  'posted_date is the last-resort fallback'
)

assert.equal(
  resolveDatePosted(
    job({
      date_posted: 'not-a-date',
      created_at: '2026-09-09T12:00:00.000Z',
    })
  ),
  '2026-09-09T12:00:00.000Z',
  'invalid date_posted still falls back to created_at'
)

assert.equal(
  resolveDatePosted(job({ date_posted: 'not-a-date', created_at: 'also-bad' })),
  undefined,
  'invalid dates are omitted rather than emitted'
)

console.log('jobStructuredDataMapping.test.ts: all assertions passed')
