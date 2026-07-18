import assert from 'node:assert/strict'
import {
  decodeHtmlEntities,
  extractGreenhouseJobId,
  extractGreenhouseSlug,
  normalizeGreenhouseJob,
  type GreenhouseJobDetail,
} from './greenhouse-adapter'

assert.equal(
  extractGreenhouseJobId('https://boards.greenhouse.io/oneacrefund/jobs/8066822'),
  '8066822'
)
assert.equal(
  extractGreenhouseJobId('https://oneacrefund.org/vacancies/?gh_jid=8066822'),
  '8066822'
)
assert.equal(
  extractGreenhouseJobId('https://oneacrefund.org/vacancies/', {
    greenhouse_job_id: '999',
  }),
  '999'
)
assert.equal(extractGreenhouseJobId('https://example.com/jobs'), null)

assert.equal(
  extractGreenhouseSlug('https://boards.greenhouse.io/oneacrefund/jobs/1'),
  'oneacrefund'
)
assert.equal(
  extractGreenhouseSlug('https://oneacrefund.org/vacancies/?gh_jid=1', 'oneacrefund'),
  'oneacrefund'
)

assert.equal(
  decodeHtmlEntities('&lt;p&gt;Hello &amp; welcome&lt;/p&gt;'),
  '<p>Hello & welcome</p>'
)

const detail: GreenhouseJobDetail = {
  id: 1,
  title: 'Fertilizer Procurement Associate',
  absolute_url: 'https://oneacrefund.org/vacancies/?gh_jid=1',
  location: { name: 'Nairobi, Kenya' },
  offices: [{ name: 'Kenya', location: 'Kenya' }],
  departments: [{ name: 'Operations' }],
  metadata: [{ name: 'Employment Type', value: 'Fixed-term' }],
  content: '&lt;p&gt;About the role&lt;/p&gt;&lt;p&gt;Requirements listed here&lt;/p&gt;',
}

const normalized = normalizeGreenhouseJob(detail, 'One Acre Fund', 'Kenya')
assert.equal(normalized.title, 'Fertilizer Procurement Associate')
assert.equal(normalized.company, 'One Acre Fund')
assert.equal(normalized.job_location_country, 'Kenya')
assert.equal(normalized.job_location_city, 'Nairobi')
assert.equal(normalized.employment_type, 'CONTRACTOR')
assert.equal(normalized.tags, 'Operations')
assert.ok(normalized.description.includes('<p>About the role</p>'))
assert.equal(normalized.application_url, 'https://oneacrefund.org/vacancies/?gh_jid=1')

const multiCountry: GreenhouseJobDetail = {
  id: 2,
  title: 'Director (Anglophone Africa)',
  absolute_url: 'https://boards.greenhouse.io/instiglio/jobs/2',
  location: { name: 'Kenya' },
  offices: [{ name: 'Kenya' }],
  content: '',
}
const multi = normalizeGreenhouseJob(multiCountry, 'Instiglio', 'Kenya')
assert.equal(multi.job_location_city, '')
assert.match(multi.location, /Kenya/i)

console.log('greenhouse-adapter.test.ts: all assertions passed')
