/**
 * Assertions for Buffer createPost variable building.
 * Run: npx tsx src/lib/social/bufferCreatePostInput.test.ts
 */

import {
  BufferApiError,
  buildCreatePostVariables,
  extractFirstUrl,
} from './bufferAdapter'

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

// --- LinkedIn now: caption + empty assets, no Facebook metadata ---
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
  assert(input.metadata === undefined, 'linkedin has no facebook metadata')
  assert(input.dueAt === undefined, 'no dueAt on now')
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

// --- Facebook with image: no linkAttachment (mutually exclusive with assets) ---
{
  const input = buildCreatePostVariables({
    channelId: 'ch_fb',
    text: 'Photo post https://www.careersasa.co.ke/jobs/nurse',
    mode: 'now',
    service: 'Facebook',
    mediaUrl: 'https://www.careersasa.co.ke/api/og/job/nurse?template=job',
  })
  const assets = input.assets as { image: { url: string } }[]
  assert(assets.length === 1, 'one image asset')
  assert(
    assets[0].image.url === 'https://www.careersasa.co.ke/api/og/job/nurse?template=job',
    'image url'
  )
  const meta = input.metadata as { facebook: { type: string; linkAttachment?: unknown } }
  assert(meta.facebook.type === 'post', 'still a facebook post')
  assert(meta.facebook.linkAttachment === undefined, 'no linkAttachment when assets present')
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

console.log('bufferCreatePostInput.test.ts: all assertions passed')
