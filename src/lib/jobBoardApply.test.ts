import assert from 'node:assert/strict'
import {
  extractJobBoardApplyUrls,
  extractJobBoardEmails,
  isJobBoardSource,
  resolveJobBoardApplication,
} from './jobBoardApply'

const descWithEmail = `
<p><b>How to Apply</b> Please submit your resume to info@divinecravingske.com
with the subject line "Application: Pastry Chef".</p>
`

const descWithCareer = `
<ul><li>Support the offshore team.</li></ul>
<div>👉 Apply now: https://strategicbureaux.com/career</div>
`

const descWithBoth = `
<p>Email hr@intexafrica.com or apply at https://intexafrica.com/careers/apply</p>
`

assert.deepEqual(extractJobBoardEmails(descWithEmail), ['info@divinecravingske.com'])
assert.equal(extractJobBoardEmails('anonymous@anonymous.com').length, 0)
assert.equal(
  extractJobBoardEmails('jobs@brightermonday.co.ke', ['brightermonday.co.ke']).length,
  0
)

assert.ok(
  extractJobBoardApplyUrls(descWithCareer).some(u => u.includes('strategicbureaux.com/career'))
)
assert.equal(
  extractJobBoardApplyUrls(
    '<a href="https://www.brightermonday.co.ke/listings/x">Apply</a>',
    ['brightermonday.co.ke']
  ).length,
  0
)

const emailOnly = resolveJobBoardApplication({
  boardJobUrl: 'https://www.brightermonday.co.ke/listings/pastry-chef-7j8x8x',
  descriptionHtml: descWithEmail,
  boardHosts: ['brightermonday.co.ke'],
})
assert.equal(emailOnly.apply_email, 'info@divinecravingske.com')
assert.equal(emailOnly.application_url, null)
assert.equal(emailOnly.apply_link, null)
assert.equal(emailOnly.used_board_fallback, false)

const career = resolveJobBoardApplication({
  boardJobUrl: 'https://www.brightermonday.co.ke/listings/x',
  descriptionHtml: descWithCareer,
  boardHosts: ['brightermonday.co.ke'],
})
assert.ok(career.application_url?.includes('strategicbureaux.com'))
assert.equal(career.apply_link, career.application_url)
assert.equal(career.used_board_fallback, false)

const both = resolveJobBoardApplication({
  boardJobUrl: 'https://www.brightermonday.co.ke/listings/x',
  descriptionHtml: descWithBoth,
  boardHosts: ['brightermonday.co.ke'],
})
assert.ok(both.application_url?.includes('intexafrica.com'))
assert.equal(both.apply_email, 'hr@intexafrica.com')

const linkout = resolveJobBoardApplication({
  boardJobUrl: 'https://www.brightermonday.co.ke/listings/x',
  descriptionHtml: '<p>No links here</p>',
  linkoutUrl: 'https://careers.example.com/jobs/123',
  boardHosts: ['brightermonday.co.ke'],
})
assert.equal(linkout.application_url, 'https://careers.example.com/jobs/123')

const fallback = resolveJobBoardApplication({
  boardJobUrl: 'https://www.brightermonday.co.ke/listings/x',
  descriptionHtml: '<p>Join our team.</p>',
  boardHosts: ['brightermonday.co.ke'],
})
assert.equal(fallback.application_url, 'https://www.brightermonday.co.ke/listings/x')
assert.equal(fallback.apply_link, null)
assert.equal(fallback.used_board_fallback, true)

assert.equal(isJobBoardSource({ type: 'brightermonday' }), true)
assert.equal(isJobBoardSource({ type: 'myjobmag' }), true)
assert.equal(isJobBoardSource({ type: 'fuzu' }), true)
assert.equal(isJobBoardSource({ type: 'workable', sourceKind: 'job_board' }), true)
assert.equal(isJobBoardSource({ type: 'workable' }), false)

console.log('jobBoardApply.test.ts: ok')
