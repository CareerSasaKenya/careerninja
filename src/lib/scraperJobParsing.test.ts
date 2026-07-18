import assert from 'node:assert/strict'
import {
  splitHtmlByHeadings,
  parseScrapedJobFallback,
  matchIndustryName,
  matchJobFunctionName,
  inferJobFunctionFromTitle,
  parseScrapedJobContent,
} from './scraperJobParsing'
import { inferCompanyIndustry } from './companyIndustryInference'

const workable = `
<p>About the role intro.</p>
<p><strong>Key Responsibilities </strong></p>
<ul><li>Do A</li><li>Do B</li></ul>
<p><strong>Requirements</strong></p>
<ul><li>Degree</li></ul>
`
const split = splitHtmlByHeadings(workable)
assert.ok(split.description.includes('About the role'))
assert.ok(split.responsibilities.includes('Do A'))
assert.ok(split.required_qualifications.includes('Degree'))

const nested = `
<p>Overview paragraph.</p>
<p><strong>Responsibilities:</strong></p>
<p><strong>1. Physical Security &amp; Access Control</strong></p>
<ul><li>Enforce policy</li></ul>
<p><strong>2. Vendor Management</strong></p>
<ul><li>Manage vendors</li></ul>
`
const nestedSplit = splitHtmlByHeadings(nested)
assert.ok(nestedSplit.description.includes('Overview'))
assert.ok(nestedSplit.responsibilities.includes('Enforce policy'))
assert.ok(nestedSplit.responsibilities.includes('Manage vendors'))
assert.equal(nestedSplit.responsibilities.includes('Overview'), false)

const sr = parseScrapedJobFallback({
  title: 'Learning Science Manager',
  company: 'iHub',
  descriptionSection: '<p>Company blurb.</p>',
  responsibilitiesSection: '<p>In this role you coach startups.</p>',
  requirementsSection: '<ul><li>Master’s degree</li><li>5 years of experience in edtech</li></ul>',
  industryHint: 'Information Technology And Services',
  jobFunctionHint: 'Education',
})
assert.ok(sr.description.includes('Company blurb'))
assert.ok(sr.responsibilities.includes('coach startups'))
assert.equal(sr.education_level, "Master's")
assert.equal(sr.minimum_experience, 5)

const industries = [
  'ICT & Telecommunications',
  'Energy, Utilities & Waste Management',
  'Banking, Insurance & Financial Services',
]
assert.equal(
  matchIndustryName('Information Technology And Services', industries),
  'ICT & Telecommunications'
)
assert.notEqual(
  matchIndustryName('Information Technology And Services', industries),
  'Banking, Insurance & Financial Services'
)

const functions = [
  'Engineering & Technology',
  'Sales',
  'Legal Services',
  'Building & Architecture',
  'Real Estate & Construction',
  'Health & Safety',
  'Accounting, Auditing & Finance',
  'IT & Software',
  'Human Resources & Recruitment',
  'Community & Social Services',
  'Admin & Office',
]
assert.equal(inferJobFunctionFromTitle('Material Engineer', functions), 'Engineering & Technology')
assert.equal(inferJobFunctionFromTitle('Sales Representative - Fahari Link', functions), 'Sales')
assert.equal(inferJobFunctionFromTitle('Project Architect, Kiswishi City', functions), 'Building & Architecture')
assert.equal(inferJobFunctionFromTitle('Senior HSE Officer', functions), 'Health & Safety')
assert.equal(inferJobFunctionFromTitle('Legal Assistant', functions, 'Legal Department'), 'Legal Services')
assert.equal(inferJobFunctionFromTitle('Executive Assistant', functions), 'Admin & Office')
assert.equal(
  matchJobFunctionName('Legal Department', functions),
  'Legal Services'
)

const industryList = [
  'Building, Construction & Real Estate',
  'Real Estate & Property Management',
  'Charity, NGO & Non-Profit',
  'ICT & Telecommunications',
]
assert.equal(
  inferCompanyIndustry('Tatu City', 'https://tatucity.com', industryList),
  'Building, Construction & Real Estate'
)
assert.equal(
  inferCompanyIndustry('Inkomoko', 'https://inkomoko.com', industryList),
  'Charity, NGO & Non-Profit'
)

const tatuParsed = await parseScrapedJobContent(
  {
    title: 'Community Relations Manager',
    company: 'Tatu City',
    descriptionSection: '<p>About Tatu City.</p>',
    requirementsSection: '<ul><li>Bachelor’s degree</li><li>10 years experience</li></ul>',
    tagsHint: 'City Management Department',
    jobFunctionHint: 'City Management Department',
  },
  { industryNames: industryList, jobFunctionNames: functions }
)
assert.equal(tatuParsed.industry, 'Building, Construction & Real Estate')
assert.equal(tatuParsed.job_function, 'Community & Social Services')

console.log('scraperJobParsing.test.ts: all assertions passed')
