import assert from 'node:assert/strict'
import { buildInputFromJobRow } from './enrichJobById'

const input = buildInputFromJobRow({
  id: 'job-1',
  title: 'Credit Analyst',
  company: 'KCB Group',
  hiring_organization_name: 'KCB Group',
  description: '<p>About the credit risk role at the bank.</p>',
  responsibilities: '<ul><li>Assess credit applications</li></ul>',
  required_qualifications: '<ul><li>Bachelor’s degree in Finance</li></ul>',
  additional_info: null,
  industry: null,
  job_function: null,
  location: 'Nairobi, Kenya',
  employment_type: 'FULL_TIME',
  job_location_type: 'ON_SITE',
})

assert.ok(input)
assert.equal(input!.company, 'KCB Group')
assert.ok(input!.descriptionSection?.includes('credit risk'))
assert.ok(input!.requirementsSection?.includes('Finance'))

const tooThin = buildInputFromJobRow({
  id: 'job-2',
  title: 'X',
  company: 'Y',
  hiring_organization_name: null,
  description: '<p>Hi</p>',
  responsibilities: null,
  required_qualifications: null,
  additional_info: null,
  industry: null,
  job_function: null,
  location: null,
  employment_type: null,
  job_location_type: null,
})
assert.equal(tooThin, null)

console.log('enrichJobById.test.ts: ok')
