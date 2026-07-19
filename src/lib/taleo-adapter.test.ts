import assert from 'node:assert/strict'
import {
  extractTaleoContestNo,
  extractTaleoHost,
  extractTaleoLocation,
  extractTaleoPortal,
  extractTaleoSection,
  extractTaleoTitle,
  normalizeTaleoJob,
  parseLocationColumn,
  parseTaleoBoardUrl,
  parseTaleoInitialHistory,
} from './taleo-adapter'

assert.deepEqual(
  parseTaleoBoardUrl(
    'https://equitybank.taleo.net/careersection/ext_new/jobsearch.ftl'
  ),
  { host: 'equitybank.taleo.net', section: 'ext_new' }
)
assert.equal(
  extractTaleoContestNo(
    'https://britam.taleo.net/careersection/ke/jobdetail.ftl?lang=en&job=2600004N'
  ),
  '2600004N'
)
assert.equal(
  extractTaleoHost(
    'https://britam.taleo.net/careersection/ke/jobdetail.ftl?job=2600004N'
  ),
  'britam.taleo.net'
)
assert.equal(
  extractTaleoSection(
    'https://britam.taleo.net/careersection/ke/jobdetail.ftl?job=2600004N'
  ),
  'ke'
)
assert.equal(
  extractTaleoPortal(`var portalNo = '12300100254'; FacetedSearchSettings.portalNo = "12300100254";`),
  '12300100254'
)

assert.equal(parseLocationColumn('["Kenya"]'), 'Kenya')
assert.equal(parseLocationColumn('["Kenya-Nairobi"]'), 'Kenya, Nairobi')
assert.equal(
  extractTaleoLocation({
    column: ['Fraud Prevention Manager', '["Kenya"]', 'Jul 31, 2026'],
    locationsColumns: [1],
  }),
  'Kenya'
)
assert.equal(
  extractTaleoTitle({
    column: ['Banking Investigations Team Leader', '["Kenya"]', 'Jul 31, 2026'],
    linkedColumn: 0,
  }),
  'Banking Investigations Team Leader'
)

const history =
  'ftlx0!|!ftlUtil_resetPage!$!requisitionDescriptionInterface!|!descRequisition!|!rdPager!$!63153!|!true!|!63153!|!false!|!Submission for the position%5C: Banking Investigations Team Leader - (Job Number%5C: 2600009F)!|!false!|!63153!|!false!|!true!|!Banking Investigations Team Leader!|!' +
  '!*!<p>Equity Bank purpose statement.</p>' +
  '!*!<p>Equity Bank purpose statement.</p>' +
  '!*!<p>Qualifications go here.</p>' +
  '!*!<p>Qualifications go here.</p>'

const parsed = parseTaleoInitialHistory(history)
assert.equal(parsed.title, 'Banking Investigations Team Leader')
assert.equal(parsed.descriptionHtml, '<p>Equity Bank purpose statement.</p>')
assert.equal(parsed.qualificationsHtml, '<p>Qualifications go here.</p>')

const normalized = normalizeTaleoJob(
  {
    jobId: '63153',
    contestNo: '2600009F',
    title: 'Banking Investigations Team Leader',
    location: 'Kenya',
    detailUrl:
      'https://equitybank.taleo.net/careersection/ext_new/jobdetail.ftl?lang=en&job=2600009F',
    descriptionHtml: '<p>Lead investigations.</p>',
    qualificationsHtml: '<p>5+ years experience.</p>',
  },
  'Equity Bank'
)

assert.equal(normalized.title, 'Banking Investigations Team Leader')
assert.equal(normalized.company, 'Equity Bank')
assert.equal(normalized.job_location_country, 'Kenya')
assert.ok(normalized.application_url.includes('equitybank.taleo.net'))
assert.ok(normalized.description.includes('Lead investigations'))
assert.ok(normalized.required_qualifications.includes('5+ years'))

console.log('taleo-adapter.test.ts: ok')
