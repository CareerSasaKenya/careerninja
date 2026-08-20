/**
 * Assertions for Buffer createPost variable building.
 * Run: npx tsx src/lib/social/bufferCreatePostInput.test.ts
 */

import {
  BufferApiError,
  buildCreatePostVariables,
  extractFirstUrl,
} from './bufferAdapter'
import { jobOgImageUrl, jobUrl } from './socialPostCopy'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function assertThrows(fn: () => unknown, match: string) {
  try {
    fn()
    throw new Error(`Expected to throw matching ${match}`)
  } catch (err: unknown) {
    if (err instanceof Error && err.message === `Expected to throw matching ${match}`) throw err
    const message = err instanceof Error ? err.message : String(err)
    assert(message.includes(match), `threw "${message}", expected to include "${match}"`)
    assert(err instanceof BufferApiError, 'expected BufferApiError')
  }
}

// --- extractFirstUrl ---
assert(extractFirstUrl('no link here') === null, 'no url → null')
assert(
  extractFirstUrl('Apply at https://www.careersasa.co.ke/jobs/nurse') ===
    'https://www.careersasa.co.ke/jobs/nurse',
  'extracts https url'
)
assert(
  extractFirstUrl('See http://example.com/a) next') === 'http://example.com/a',
  'strips trailing paren'
)

// --- empty / whitespace text ---
assertThrows(
  () =>
    buildCreatePostVariables({
      channelId: 'ch_1',
      text: '   ',
      mode: 'now',
    }),
  'Post text is required'
)

// --- LinkedIn now: caption + link card from the job URL (no image assets) ---
{
  const input = buildCreatePostVariables({
    channelId: 'ch_li',
    text: '  We are hiring: Nurse\nApply: https://www.careersasa.co.ke/jobs/nurse  ',
    mode: 'now',
    service: 'linkedin',
  })
  assert(input.text === 'We are hiring: Nurse\nApply: https://www.careersasa.co.ke/jobs/nurse', 'trims text')
  assert(input.channelId === 'ch_li', 'channelId')
  assert(input.mode === 'shareNow', 'shareNow')
  assert(input.schedulingType === 'automatic', 'automatic')
  assert(Array.isArray(input.assets) && (input.assets as unknown[]).length === 0, 'empty assets')
  assert(input.needsApproval === false, 'needsApproval false')
  const meta = input.metadata as { linkedin: { linkAttachment: { url: string } } }
  assert(
    meta.linkedin.linkAttachment.url === 'https://www.careersasa.co.ke/jobs/nurse',
    'linkedin linkAttachment from caption url'
  )
  assert(input.dueAt === undefined, 'no dueAt on now')
}

// --- LinkedIn with OG thumbnail: thumbnail on the link card, still no assets ---
{
  const og = 'https://www.careersasa.co.ke/api/og/job/nurse?template=5'
  const input = buildCreatePostVariables({
    channelId: 'ch_li',
    text: 'We are hiring: Nurse\nApply: https://www.careersasa.co.ke/jobs/nurse',
    mode: 'now',
    service: 'linkedin',
    mediaUrl: og,
    linkTitle: 'Nurse at Acme — Nairobi',
    linkDescription: 'Apply on CareerSasa',
  })
  assert(Array.isArray(input.assets) && (input.assets as unknown[]).length === 0, 'no image assets with link card')
  const meta = input.metadata as {
    linkedin: {
      linkAttachment: {
        url: string
        thumbnail?: { url: string }
        title?: string
        description?: string
      }
    }
  }
  assert(meta.linkedin.linkAttachment.url === 'https://www.careersasa.co.ke/jobs/nurse', 'link url')
  assert(meta.linkedin.linkAttachment.thumbnail?.url === og, 'og image as thumbnail')
  assert(meta.linkedin.linkAttachment.title === 'Nurse at Acme — Nairobi', 'link title')
  assert(meta.linkedin.linkAttachment.description === 'Apply on CareerSasa', 'link description')
}

// --- Facebook: explicit post type + link card from the caption URL ---
{
  const caption = `🚀 We're hiring at Acme!\n\nNurse — Nairobi\n\nApply: https://www.careersasa.co.ke/jobs/nurse`
  const input = buildCreatePostVariables({
    channelId: 'ch_fb',
    text: caption,
    mode: 'queue',
    service: 'facebook',
  })
  assert(input.mode === 'addToQueue', 'addToQueue')
  assert(input.text === caption, 'keeps facebook caption')
  const meta = input.metadata as { facebook: { type: string; linkAttachment?: { url: string } } }
  assert(meta.facebook.type === 'post', 'facebook type is post')
  assert(
    meta.facebook.linkAttachment?.url === 'https://www.careersasa.co.ke/jobs/nurse',
    'facebook linkAttachment from caption url'
  )
}

// --- Facebook with OG image: thumbnail on the link card (not an image asset) ---
{
  const og = 'https://www.careersasa.co.ke/api/og/job/nurse?template=job'
  const input = buildCreatePostVariables({
    channelId: 'ch_fb',
    text: 'Photo post https://www.careersasa.co.ke/jobs/nurse',
    mode: 'now',
    service: 'Facebook',
    mediaUrl: og,
  })
  const assets = input.assets as { image: { url: string } }[]
  assert(assets.length === 0, 'no image assets when a caption URL is present')
  const meta = input.metadata as {
    facebook: { type: string; linkAttachment?: { url: string; thumbnail?: { url: string } } }
  }
  assert(meta.facebook.type === 'post', 'still a facebook post')
  assert(
    meta.facebook.linkAttachment?.url === 'https://www.careersasa.co.ke/jobs/nurse',
    'linkAttachment kept when thumbnail present'
  )
  assert(meta.facebook.linkAttachment?.thumbnail?.url === og, 'og image as thumbnail')
}

// --- Instagram: OG image is a photo asset (no link card) ---
{
  const og = 'https://www.careersasa.co.ke/api/og/job/nurse?template=5'
  const input = buildCreatePostVariables({
    channelId: 'ch_ig',
    text: 'Hiring Nurse\nApply: https://www.careersasa.co.ke/jobs/nurse',
    mode: 'now',
    service: 'instagram',
    mediaUrl: og,
  })
  const assets = input.assets as { image: { url: string } }[]
  assert(assets.length === 1, 'instagram uses image asset')
  assert(assets[0].image.url === og, 'instagram image url')
  assert(input.metadata === undefined, 'instagram has no link metadata')
}

// --- LinkedIn without a URL: OG image becomes a photo asset ---
{
  const og = 'https://www.careersasa.co.ke/api/og/job/nurse?template=5'
  const input = buildCreatePostVariables({
    channelId: 'ch_li',
    text: 'We are hiring: Nurse in Nairobi',
    mode: 'now',
    service: 'linkedin',
    mediaUrl: og,
  })
  const assets = input.assets as { image: { url: string } }[]
  assert(assets.length === 1, 'linkedin photo fallback')
  assert(assets[0].image.url === og, 'fallback image url')
  assert(input.metadata === undefined, 'no linkAttachment without a url')
}

// --- schedule requires dueAt ---
assertThrows(
  () =>
    buildCreatePostVariables({
      channelId: 'ch_1',
      text: 'Hello',
      mode: 'schedule',
    }),
  'scheduled time is required'
)

{
  const dueAt = '2026-08-20T10:00:00.000Z'
  const input = buildCreatePostVariables({
    channelId: 'ch_1',
    text: 'Hello',
    mode: 'schedule',
    dueAt,
  })
  assert(input.mode === 'customScheduled', 'customScheduled')
  assert(input.dueAt === dueAt, 'dueAt forwarded')
}

// --- job OG image URL matches the public share-card path ---
{
  const job = { id: 'uuid-1', job_slug: 'nurse-nairobi', slug: null }
  assert(
    jobUrl(job) === 'https://www.careersasa.co.ke/jobs/nurse-nairobi',
    'jobUrl uses slug'
  )
  const og = jobOgImageUrl(job)
  assert(og.startsWith('https://www.careersasa.co.ke/api/og/job/nurse-nairobi?template='), 'og path')
  assert(/\?template=[245]$/.test(og), 'accepted share template')
}

console.log('bufferCreatePostInput.test.ts: all assertions passed')
