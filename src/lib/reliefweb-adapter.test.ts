import assert from 'node:assert/strict'
import {
  canonicalizeReliefWebJobUrl,
  extractReliefWebJobId,
  normalizeReliefWebJob,
  parseReliefWebEmploymentType,
  parseReliefWebExperience,
  parseReliefWebJobFields,
  resolveReliefWebApplication,
  resolveReliefWebCompanyProfile,
  resolveReliefWebLocation,
} from './reliefweb-adapter'

assert.equal(
  extractReliefWebJobId('https://reliefweb.int/job/1899339/photography-intern'),
  '1899339'
)
assert.equal(extractReliefWebJobId('https://reliefweb.int/node/1899339'), '1899339')
assert.equal(extractReliefWebJobId('https://api.reliefweb.int/v2/jobs/1899339'), '1899339')
assert.equal(extractReliefWebJobId('1899339'), '1899339')
assert.equal(extractReliefWebJobId('https://example.com/nope'), null)

assert.equal(
  canonicalizeReliefWebJobUrl({
    url_alias: 'https://reliefweb.int/job/123/foo/',
    url: 'https://reliefweb.int/node/123',
    id: 123,
  }),
  'https://reliefweb.int/job/123/foo'
)

assert.deepEqual(
  resolveReliefWebLocation({ cities: ['Nairobi'], countries: ['Kenya'] }),
  { display: 'Nairobi, Kenya', city: 'Nairobi', county: 'Nairobi' }
)

assert.deepEqual(
  resolveReliefWebLocation({ cities: ['Eldoret'], countries: ['Kenya'] }),
  { display: 'Eldoret, Uasin Gishu, Kenya', city: 'Eldoret', county: 'Uasin Gishu' }
)

assert.equal(parseReliefWebEmploymentType([{ name: 'Internship' }]), 'INTERN')
assert.equal(parseReliefWebEmploymentType([{ name: 'Consultancy' }]), 'CONTRACTOR')
assert.equal(parseReliefWebEmploymentType([{ name: 'Job' }]), 'FULL_TIME')
assert.equal(parseReliefWebEmploymentType([{ name: 'Volunteer' }]), 'VOLUNTEER')

assert.deepEqual(parseReliefWebExperience('0-2 years'), {
  minimumExperienceYears: 0,
  experienceLevel: 'Entry',
})
assert.deepEqual(parseReliefWebExperience('5-9 years'), {
  minimumExperienceYears: 5,
  experienceLevel: 'Mid',
})
assert.deepEqual(parseReliefWebExperience('10+ years'), {
  minimumExperienceYears: 10,
  experienceLevel: 'Senior',
})

// Employer apply email beats ReliefWeb listing
const emailApply = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/1/x',
  howToApplyText: 'Send cover letter and resume to jobs@mercadoglobal.org',
  companyHomepage: 'http://www.mercadoglobal.org/',
})
assert.equal(emailApply.apply_email, 'jobs@mercadoglobal.org')
assert.equal(emailApply.application_url, null)
assert.equal(emailApply.apply_link, null)
assert.equal(emailApply.used_board_fallback, false)

// Google Form in how_to_apply beats board URL and weak homepage
const formApply = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/2/y',
  howToApplyHtml:
    '<p>Apply via <a href="https://docs.google.com/forms/d/e/ABC/viewform">this form</a>.</p>',
  companyHomepage: 'https://example-ngo.org/',
})
assert.ok(formApply.application_url?.includes('docs.google.com/forms'))
assert.equal(formApply.apply_link, formApply.application_url)
assert.equal(formApply.used_board_fallback, false)

// External career URL in how_to_apply
const careerApply = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/3/z',
  howToApplyHtml:
    '<p>Apply at <a href="https://careers.unhcr.org/job/123">UNHCR careers</a></p>',
})
assert.equal(careerApply.application_url, 'https://careers.unhcr.org/job/123')
assert.equal(careerApply.used_board_fallback, false)

// Org homepage used when how_to_apply has no method
const homepageFallback = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/4/a',
  howToApplyText: 'Please follow the instructions on the organization website.',
  companyHomepage: 'https://www.example-ngo.org/',
})
assert.equal(homepageFallback.application_url, 'https://www.example-ngo.org/')
assert.equal(homepageFallback.used_board_fallback, false)

// Board listing only when nothing else exists
const boardFallback = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/5/b',
  howToApplyText: 'See posting for details.',
  companyHomepage: null,
})
assert.equal(boardFallback.application_url, 'https://reliefweb.int/job/5/b')
assert.equal(boardFallback.apply_link, null)
assert.equal(boardFallback.used_board_fallback, true)

// ReliefWeb URLs in how_to_apply must not count as employer links
const reliefLinkIgnored = resolveReliefWebApplication({
  boardJobUrl: 'https://reliefweb.int/job/6/c',
  howToApplyHtml:
    '<p>View on <a href="https://reliefweb.int/job/6/c">ReliefWeb</a></p>',
  companyHomepage: null,
})
assert.equal(reliefLinkIgnored.used_board_fallback, true)

const sampleFields = {
  id: 1899339,
  title: 'Photography Intern',
  url: 'https://reliefweb.int/node/1899339',
  url_alias: 'https://reliefweb.int/job/1899339/photography-intern',
  body: 'About Mercado Global.\n\nKey Responsibilities:\n- Support marketing',
  'body-html':
    '<p>About Mercado Global.</p><p>Key Responsibilities:</p><ul><li>Support marketing</li></ul>',
  how_to_apply: 'Send cover letter and resume to jobs@mercadoglobal.org',
  'how_to_apply-html':
    '<p>Send cover letter and resume to <a href="mailto:jobs@mercadoglobal.org">jobs@mercadoglobal.org</a></p>',
  source: [
    {
      id: 35611,
      name: 'Mercado Global',
      shortname: 'MG',
      homepage: 'http://www.mercadoglobal.org/',
      type: { name: 'Non-governmental Organization' },
    },
  ],
  country: [{ id: 147, name: 'Kenya', iso3: 'ken', primary: true }],
  city: [{ name: 'Nairobi' }],
  date: {
    created: '2026-07-01T10:00:00+00:00',
    closing: '2026-08-15T00:00:00+00:00',
  },
  career_categories: [{ name: 'Advocacy/Communications', id: 6865 }],
  type: [{ name: 'Internship', id: 265 }],
  experience: [{ name: '0-2 years', id: 258 }],
  status: 'published',
}

const detail = parseReliefWebJobFields(sampleFields)
assert.equal(detail.title, 'Photography Intern')
assert.equal(detail.company, 'Mercado Global')
assert.equal(detail.location, 'Nairobi, Kenya')
assert.equal(detail.employmentType, 'INTERN')
assert.equal(detail.applyEmail, 'jobs@mercadoglobal.org')
assert.equal(detail.applicationUrl, null)
assert.equal(detail.applyLink, null)
assert.equal(detail.usedBoardFallback, false)
assert.equal(detail.applicationDeadline, '2026-08-15')
assert.equal(detail.companyHomepage, 'http://www.mercadoglobal.org/')
assert.ok(detail.descriptionHtml.includes('Mercado Global'))

const normalized = normalizeReliefWebJob(detail)
assert.equal(normalized.job_location_country, 'Kenya')
assert.equal(normalized.job_location_city, 'Nairobi')
assert.equal(normalized.employment_type, 'INTERN')
assert.equal(normalized.apply_email, 'jobs@mercadoglobal.org')
assert.equal(normalized.application_url, '')
assert.ok(normalized.tags.includes('ReliefWeb'))
assert.equal(normalized.posted_by, 'admin')

const profile = resolveReliefWebCompanyProfile(detail)
assert.equal(profile?.name, 'Mercado Global')
assert.equal(profile?.website, 'http://www.mercadoglobal.org/')
assert.equal(profile?.source, 'reliefweb')

// Google Form sample payload
const formDetail = parseReliefWebJobFields({
  id: 99,
  title: 'Programme Officer',
  url_alias: 'https://reliefweb.int/job/99/programme-officer',
  'body-html': '<p>Deliver programmes in Kenya.</p>',
  'how_to_apply-html':
    '<p>Submit applications through <a href="https://forms.gle/abc123">this Google Form</a>.</p>',
  source: [{ name: 'Example NGO', homepage: 'https://example-ngo.org' }],
  country: [{ name: 'Kenya', iso3: 'ken' }],
  city: [{ name: 'Kisumu' }],
  date: { closing: '2026-09-01T00:00:00+00:00' },
  type: [{ name: 'Job' }],
  experience: [{ name: '3-4 years' }],
  status: 'published',
})
assert.ok(formDetail.applicationUrl?.includes('forms.gle'))
assert.equal(formDetail.applyEmail, null)
assert.equal(formDetail.usedBoardFallback, false)
assert.equal(formDetail.location, 'Kisumu, Kenya')

// No apply method + no homepage → board fallback
const fallbackDetail = parseReliefWebJobFields({
  id: 100,
  title: 'Field Coordinator',
  url_alias: 'https://reliefweb.int/job/100/field-coordinator',
  'body-html': '<p>Coordinate field activities.</p>',
  how_to_apply: 'Details available on request.',
  source: [{ name: 'Quiet Org' }],
  country: [{ name: 'Kenya' }],
  city: [{ name: 'Mombasa' }],
  type: [{ name: 'Job' }],
  status: 'published',
})
assert.equal(fallbackDetail.applicationUrl, 'https://reliefweb.int/job/100/field-coordinator')
assert.equal(fallbackDetail.applyLink, null)
assert.equal(fallbackDetail.usedBoardFallback, true)

console.log('reliefweb-adapter.test.ts: all assertions passed')
