import assert from 'node:assert/strict'
import { aggregateQueueStats, emptyQueueStats, sumQueueStats } from './scrapeQueueStats'

const bySource = aggregateQueueStats([
  { source_id: 'a', status: 'pending' },
  { source_id: 'a', status: 'pending' },
  { source_id: 'a', status: 'done' },
  { source_id: 'b', status: 'failed' },
  { source_id: 'b', status: 'processing' },
  { source_id: 'c', status: 'unknown' },
])

assert.deepEqual(bySource.a, { pending: 2, processing: 0, done: 1, failed: 0 })
assert.deepEqual(bySource.b, { pending: 0, processing: 1, done: 0, failed: 1 })
assert.deepEqual(bySource.c, emptyQueueStats())

assert.deepEqual(sumQueueStats(bySource), {
  pending: 2,
  processing: 1,
  done: 1,
  failed: 1,
})

console.log('scrapeQueueStats.test.ts: all assertions passed')
