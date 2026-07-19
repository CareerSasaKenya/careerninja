import assert from 'node:assert/strict'
import { buildReenrichInput } from './reenrichScrapedJobs'

const gh = buildReenrichInput(
  'instiglio',
  'Senior Manager',
  'Instiglio',
  {
    title: 'Senior Manager',
    content: '&lt;p&gt;About the role&lt;/p&gt;&lt;p&gt;&lt;strong&gt;Responsibilities&lt;/strong&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Lead teams&lt;/li&gt;&lt;/ul&gt;',
    departments: [{ name: 'Delivery' }],
  }
)
assert.ok(gh)
assert.ok(gh!.descriptionSection.includes('<p>About the role</p>'))
assert.equal(gh!.jobFunctionHint, 'Delivery')

const psc = buildReenrichInput('psc-pdf-adverts', 'Cook III', 'PSC', {
  extracted: {
    title: 'Cook III',
    ministry: 'Ministry of Health',
    description: 'Cook meals',
    responsibilities: 'Prepare food',
    required_qualifications: 'KCSE',
  },
})
assert.ok(psc)
assert.equal(psc!.company, 'Ministry of Health')
assert.ok(psc!.requirementsSection?.includes('KCSE'))

const workable = buildReenrichInput('laterite', 'Analyst', 'Laterite', {
  description: '<p>Role</p>',
  requirements: '<p>Degree</p>',
  department: ['Research'],
})
assert.ok(workable)
assert.equal(workable!.jobFunctionHint, 'Research')

console.log('reenrichScrapedJobs.test.ts: all assertions passed')
