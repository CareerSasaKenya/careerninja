import assert from 'node:assert/strict'
import { resolveDomainLocally } from './companyDomainLookup'

const amref = resolveDomainLocally('Amref Health Africa')
assert.equal(amref.domain, 'amref.org')
assert.equal(amref.source, 'known_brand')

const powergen = resolveDomainLocally('PowerGen Renewable Energy')
assert.equal(powergen.domain, 'powergen-renewable.com')

const ihub = resolveDomainLocally('iHub Nairobi')
assert.equal(ihub.domain, 'ihub.co.ke')

const ddd = resolveDomainLocally('Digital Divide Data')
assert.equal(ddd.domain, 'digitaldividedata.com')

const fromHint = resolveDomainLocally('Some Unknown Co', 'https://www.example.co.ke/careers')
assert.equal(fromHint.domain, 'example.co.ke')
assert.equal(fromHint.source, 'heuristic')

const unknown = resolveDomainLocally('Completely Made Up Org XYZ 123')
assert.equal(unknown.domain, null)
assert.equal(unknown.source, 'none')

console.log('companyDomainLookup.test.ts: all assertions passed')
