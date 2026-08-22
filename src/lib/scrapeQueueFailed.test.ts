import assert from 'node:assert/strict'
import {
  failedJobDisplayTitle,
  failedJobLocation,
  isUuid,
  mapFailedQueueRow,
  parseFailedQueueAction,
  parseFailedQueueListOptions,
  parseFailedQueueScope,
} from './scrapeQueueFailed'

assert.equal(isUuid('3b0d261c-86a2-4383-89f0-9162c1c10662'), true)
assert.equal(isUuid('not-a-uuid'), false)

{
  const parsed = parseFailedQueueScope({
    ids: ['3b0d261c-86a2-4383-89f0-9162c1c10662', '3b0d261c-86a2-4383-89f0-9162c1c10662'],
  })
  assert.deepEqual(parsed, {
    kind: 'ids',
    ids: ['3b0d261c-86a2-4383-89f0-9162c1c10662'],
  })
}

assert.deepEqual(parseFailedQueueScope({ source_id: 'myjobmag-kenya' }), {
  kind: 'source',
  source_id: 'myjobmag-kenya',
})
assert.deepEqual(parseFailedQueueScope({ all: true }), { kind: 'all' })
assert.equal('error' in parseFailedQueueScope({ ids: [] }), true)
assert.equal('error' in parseFailedQueueScope({ ids: ['bad'] }), true)
assert.equal('error' in parseFailedQueueScope({ source_id: 'no spaces allowed' }), true)
assert.equal('error' in parseFailedQueueScope({}), true)

assert.equal(parseFailedQueueAction('retry'), 'retry')
assert.equal(parseFailedQueueAction('delete'), 'delete')
assert.equal('error' in parseFailedQueueAction('archive'), true)

{
  const parsed = parseFailedQueueListOptions(
    new URLSearchParams('source_id=fuzu-kenya&limit=200&offset=10')
  )
  assert.deepEqual(parsed, { sourceId: 'fuzu-kenya', limit: 100, offset: 10 })
}
assert.equal('error' in parseFailedQueueListOptions(new URLSearchParams('limit=-1')), true)
assert.equal('error' in parseFailedQueueListOptions(new URLSearchParams('source_id=bad id')), true)

assert.equal(
  failedJobDisplayTitle({ title: '  Finance Officer  ' }, 'https://example.com/jobs/ignored'),
  'Finance Officer'
)
assert.equal(
  failedJobDisplayTitle({}, 'https://www.myjobmag.co.ke/job/senior-accountant-nairobi'),
  'senior accountant nairobi'
)
assert.equal(failedJobDisplayTitle(null, 'not-a-url'), 'not-a-url')
assert.equal(failedJobLocation({ location: ' Nairobi ' }), 'Nairobi')
assert.equal(failedJobLocation({ title: 'Only title' }), null)

assert.deepEqual(
  mapFailedQueueRow({
    id: '3b0d261c-86a2-4383-89f0-9162c1c10662',
    source_id: 'fuzu-kenya',
    job_url: 'https://www.fuzu.com/kenya/job/ops-lead',
    error_message: 'HTTP 404',
    attempts: 3,
    queued_at: '2026-08-01T00:00:00.000Z',
    processed_at: '2026-08-02T00:00:00.000Z',
    partial_data: { title: 'Ops Lead', location: 'Kisumu' },
    scraper_sources: { name: 'Fuzu Kenya' },
  }),
  {
    id: '3b0d261c-86a2-4383-89f0-9162c1c10662',
    source_id: 'fuzu-kenya',
    source_name: 'Fuzu Kenya',
    job_url: 'https://www.fuzu.com/kenya/job/ops-lead',
    title: 'Ops Lead',
    location: 'Kisumu',
    error_message: 'HTTP 404',
    attempts: 3,
    queued_at: '2026-08-01T00:00:00.000Z',
    processed_at: '2026-08-02T00:00:00.000Z',
  }
)

console.log('scrapeQueueFailed.test.ts: all assertions passed')
