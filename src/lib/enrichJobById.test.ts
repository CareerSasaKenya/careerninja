import assert from 'node:assert/strict'
import { buildInputFromJobRow, jobNeedsEnrichment } from './enrichJobById'

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

assert.equal(
  jobNeedsEnrichment({
    id: 'job-3',
    title: 'Analyst',
    company: 'KCB',
    hiring_organization_name: 'KCB',
    description: '<p>Role overview</p>',
    responsibilities: '<ul><li>Analyse credit</li></ul>',
    required_qualifications: '<ul><li>Finance degree</li></ul>',
    additional_info: '<p><strong>How to Apply:</strong> Use the apply button.</p>',
    industry: 'Banking, Insurance & Financial Services',
    job_function: 'Accounting, Auditing & Finance',
    location: 'Nairobi',
    employment_type: 'FULL_TIME',
    job_location_type: 'ON_SITE',
  }),
  true,
  'complete jobs still need enrichment when career tips are missing'
)

assert.equal(
  jobNeedsEnrichment({
    id: 'job-4',
    title: 'Analyst',
    company: 'KCB',
    hiring_organization_name: 'KCB',
    description: '<p>Role overview</p>',
    responsibilities: '<ul><li>Analyse credit</li></ul>',
    required_qualifications: '<ul><li>Finance degree</li></ul>',
    additional_info: `<p><strong>How to Apply:</strong> Use the apply button.</p>
<h3>What Credit Files Must Prove Before The Committee</h3>
<p>Intro</p>
<p><strong>1. Spread the facility:</strong> Show the model.</p>
<p><strong>2. Sector notes:</strong> Know SME risk.</p>
<p><strong>3. Security pack:</strong> List collateral.</p>
<p><strong>4. First 90 days:</strong> Name the reviews.</p>`,
    industry: 'Banking, Insurance & Financial Services',
    job_function: 'Accounting, Auditing & Finance',
    location: 'Nairobi',
    employment_type: 'FULL_TIME',
    job_location_type: 'ON_SITE',
  }),
  false
)

console.log('enrichJobById.test.ts: ok')
