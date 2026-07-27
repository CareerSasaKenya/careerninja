/**
 * Lightweight assertions for googleIndexing helpers.
 * Run: npx tsx src/lib/googleIndexing.test.ts
 */

import assert from 'node:assert/strict'
import {
  buildJobIndexingUrl,
  buildJobUrlPath,
  getIndexingSiteUrl,
  normalizePrivateKey,
  parseServiceAccountJson,
} from './googleIndexing'

function testUrlPath() {
  assert.equal(
    buildJobUrlPath({ id: 'abc', job_slug: 'software-engineer-nairobi' }),
    '/jobs/software-engineer-nairobi'
  )
  assert.equal(
    buildJobUrlPath({ id: 'abc', slug: 'fallback-slug' }),
    '/jobs/fallback-slug'
  )
  assert.equal(buildJobUrlPath({ id: 'abc-123' }), '/jobs/abc-123')
  console.log('✓ buildJobUrlPath')
}

function testSiteUrl() {
  const prevSite = process.env.SITE_URL
  const prevPublic = process.env.NEXT_PUBLIC_SITE_URL
  try {
    delete process.env.SITE_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
    assert.equal(getIndexingSiteUrl(), 'https://www.careersasa.co.ke')

    process.env.NEXT_PUBLIC_SITE_URL = 'https://careersasa.co.ke/'
    assert.equal(getIndexingSiteUrl(), 'https://careersasa.co.ke')

    process.env.SITE_URL = 'https://www.careersasa.co.ke/'
    assert.equal(getIndexingSiteUrl(), 'https://www.careersasa.co.ke')

    assert.equal(
      buildJobIndexingUrl({ id: 'x', job_slug: 'nurse-kisumu' }),
      'https://www.careersasa.co.ke/jobs/nurse-kisumu'
    )
  } finally {
    if (prevSite === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = prevSite
    if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = prevPublic
  }
  console.log('✓ getIndexingSiteUrl / buildJobIndexingUrl')
}

function testCredentialsParsing() {
  assert.equal(
    normalizePrivateKey('-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n'),
    '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----'
  )

  const parsed = parseServiceAccountJson(
    JSON.stringify({
      client_email: 'indexer@project.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\\nXYZ\\n-----END PRIVATE KEY-----\\n',
    })
  )
  assert.ok(parsed)
  assert.equal(parsed!.client_email, 'indexer@project.iam.gserviceaccount.com')
  assert.equal(
    parsed!.private_key,
    '-----BEGIN PRIVATE KEY-----\nXYZ\n-----END PRIVATE KEY-----'
  )
  assert.equal(parseServiceAccountJson('{bad'), null)
  assert.equal(parseServiceAccountJson('{"client_email":"a"}'), null)
  console.log('✓ credential parsing')
}

testUrlPath()
testSiteUrl()
testCredentialsParsing()
console.log('googleIndexing.test.ts: all assertions passed')
