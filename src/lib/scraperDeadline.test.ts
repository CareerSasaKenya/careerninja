import assert from 'node:assert/strict'
import {
  isDeadlineExpired,
  normalizeJobUrl,
  parseDeadlineDate,
  resolveScrapedDeadline,
  expiresAtFromValidThrough,
} from './scraperDeadline'

assert.equal(parseDeadlineDate('2026-08-01'), '2026-08-01')
assert.equal(parseDeadlineDate('2026-08-01T12:00:00Z'), '2026-08-01')
assert.equal(parseDeadlineDate(null), null)
assert.equal(parseDeadlineDate('not-a-date'), null)

const now = new Date('2026-07-18T12:00:00Z')
assert.equal(isDeadlineExpired('2026-07-17', now), true)
assert.equal(isDeadlineExpired('2026-07-18', now), false)
assert.equal(isDeadlineExpired('2026-07-19', now), false)
assert.equal(isDeadlineExpired(null, now), false)

const missing = resolveScrapedDeadline(null, now)
assert.equal(missing.action, 'use')
if (missing.action === 'use') {
  assert.equal(missing.source, 'default')
  assert.equal(missing.validThrough, '2026-08-17')
}

const future = resolveScrapedDeadline('2026-09-01', now)
assert.equal(future.action, 'use')
if (future.action === 'use') {
  assert.equal(future.source, 'explicit')
  assert.equal(future.validThrough, '2026-09-01')
}

const expired = resolveScrapedDeadline('2025-03-25', now)
assert.equal(expired.action, 'skip_expired')
if (expired.action === 'skip_expired') {
  assert.equal(expired.validThrough, '2025-03-25')
}

// Workable "published" timestamps must not be treated as deadlines when nullish path used
const fromPublishedBug = resolveScrapedDeadline('2025-05-08T10:00:00.000Z', now)
assert.equal(fromPublishedBug.action, 'skip_expired')

assert.equal(expiresAtFromValidThrough('2026-08-17'), '2026-08-17T23:59:59.999Z')

assert.equal(
  normalizeJobUrl('https://Apply.Workable.com/tatucity/j/ABC123/?utm_source=x'),
  'https://apply.workable.com/tatucity/j/ABC123'
)
assert.equal(
  normalizeJobUrl('https://apply.workable.com/tatucity/j/ABC123/'),
  'https://apply.workable.com/tatucity/j/ABC123'
)

console.log('scraperDeadline.test.ts: all assertions passed')
