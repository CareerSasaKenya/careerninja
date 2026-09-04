/**
 * Run: npx tsx src/lib/careerTips.test.ts
 */
import assert from 'node:assert/strict'
import {
  appendCareerTips,
  hasGeneratedCareerTips,
  stripHowToApplyBlock,
} from './careerTips'

const applyOnly = `<p><strong>How to Apply:</strong> Visit the application link provided on this page.</p>`
assert.equal(hasGeneratedCareerTips(applyOnly), false)
assert.equal(hasGeneratedCareerTips(null), false)
assert.equal(hasGeneratedCareerTips(''), false)
assert.equal(hasGeneratedCareerTips('<h3>Benefits</h3><p>Medical cover</p>'), false)

const fullTips = `<p><strong>How to Apply:</strong> Send your CV to hr@acme.com.</p>
<h3>Show ISO Discipline On Paper Before You Walk Into QA</h3>
<p>Hiring teams for this post want proof you can catch defects.</p>
<p><strong>1. Name the standard:</strong> Put ISO 9001 on the CV with a batch you actually audited.</p>
<p><strong>2. Bring a finding:</strong> Prepare one non-conformance story with the corrective action.</p>
<p><strong>3. Tools on paper:</strong> List the QMS software you used, not "attention to detail".</p>
<p><strong>4. First 90 days:</strong> Map the first three inspections you would run on this line.</p>`
assert.equal(hasGeneratedCareerTips(fullTips), true)

const headingPlusTwo = `<h3>What Credit Analysts Get Probed On</h3>
<p><strong>1. Spreadsheet proof:</strong> Walk through a facility you modelled.</p>
<p><strong>2. Sector notes:</strong> Know this bank's SME book.</p>`
assert.equal(hasGeneratedCareerTips(headingPlusTwo), true)

assert.ok(stripHowToApplyBlock(fullTips).startsWith('<h3>'))
assert.ok(!/How to Apply/i.test(stripHowToApplyBlock(fullTips)))

const appended = appendCareerTips(applyOnly, headingPlusTwo)
assert.ok(appended.includes('How to Apply'))
assert.ok(appended.includes('What Credit Analysts Get Probed On'))
assert.equal(appendCareerTips(fullTips, headingPlusTwo), fullTips)
assert.equal(appendCareerTips('', ''), '')
assert.equal(appendCareerTips(null, headingPlusTwo), headingPlusTwo)

console.log('careerTips.test.ts: all assertions passed')
