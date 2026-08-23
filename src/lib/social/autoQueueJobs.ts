/**
 * Auto-queue job posts to Buffer: 3 per channel per Nairobi day.
 *
 * LinkedIn ← featured / professional
 * Facebook ← high-volume / entry
 * Instagram ← visual / youth
 *
 * A job is never generated for a second platform. Buffer Free's 10-slot
 * queue is also respected. Failures stay on social_posts and never touch
 * job publishing.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  createPost,
  getBufferStatus,
  publishToBuffer,
} from './socialPostService'
import { generatePostCopy, jobOgImageUrl, type JobForCopy } from './socialPostCopy'
import {
  BUFFER_FREE_QUEUE_CAP,
  SOCIAL_CANDIDATE_LOOKBACK_DAYS,
  SOCIAL_DAILY_CAP_PER_CHANNEL,
  countsTowardToday,
  nairobiDayBounds,
  selectJobsForQueue,
  slotsFromCounts,
  type RoutableJob,
} from './routeJobToPlatform'
import type { BufferChannel, SocialPlatform } from './types'

const PLATFORMS: SocialPlatform[] = ['linkedin', 'facebook', 'instagram']
const ACTIVE_STATUSES = ['draft', 'ready', 'scheduled', 'publishing', 'published'] as const

const JOB_SELECT = [
  'id',
  'title',
  'company',
  'hiring_organization_name',
  'location',
  'job_location_city',
  'job_location_county',
  'location_town',
  'job_function',
  'job_functions',
  'industry',
  'experience_level',
  'employment_type',
  'is_featured',
  'is_promoted',
  'date_posted',
  'created_at',
  'job_slug',
  'slug',
  'description',
  'responsibilities',
  'qualifications',
  'required_qualifications',
  'education_requirements',
  'salary',
  'salary_min',
  'salary_max',
  'salary_currency',
  'salary_period',
  'salary_is_estimated',
  'salary_visibility',
  'application_deadline',
].join(', ')

export interface AutoQueueOutcome {
  ok: boolean
  dry_run: boolean
  skipped?: string
  daily_cap: number
  queue_cap: number
  remaining: Record<SocialPlatform, number>
  queued: Record<SocialPlatform, { job_id: string; post_id: string; title: string }[]>
  failed: { job_id: string; platform: SocialPlatform; error: string }[]
  selected: Record<SocialPlatform, { id: string; title: string }[]>
}

function emptyQueued(): AutoQueueOutcome['queued'] {
  return { linkedin: [], facebook: [], instagram: [] }
}

function matchChannel(channels: BufferChannel[], platform: SocialPlatform): BufferChannel | null {
  const hit = channels.find((c) => (c.service ?? '').toLowerCase().includes(platform))
  return hit ?? null
}

function lookbackIso(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

async function loadUsedJobIds(adminClient: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await adminClient
    .from('social_posts')
    .select('job_id')
    .not('job_id', 'is', null)
    .in('status', [...ACTIVE_STATUSES])
  if (error) {
    console.error('[autoQueueJobs] used-job query failed:', error.message)
    throw new Error('Failed to load existing social posts')
  }
  const ids = new Set<string>()
  for (const row of data ?? []) {
    if (row.job_id) ids.add(row.job_id as string)
  }
  return ids
}

async function loadChannelCounts(
  adminClient: SupabaseClient,
  now = new Date()
): Promise<Record<SocialPlatform, { todayCount: number; scheduledCount: number }>> {
  const bounds = nairobiDayBounds(now)
  const since = new Date(bounds.start.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await adminClient
    .from('social_posts')
    .select('platform, status, created_at, scheduled_at, published_at')
    .in('platform', PLATFORMS)
    .in('status', ['scheduled', 'publishing', 'published'])
    .gte('created_at', since)
  if (error) {
    console.error('[autoQueueJobs] count query failed:', error.message)
    throw new Error('Failed to load social post counts')
  }

  const counts: Record<SocialPlatform, { todayCount: number; scheduledCount: number }> = {
    linkedin: { todayCount: 0, scheduledCount: 0 },
    facebook: { todayCount: 0, scheduledCount: 0 },
    instagram: { todayCount: 0, scheduledCount: 0 },
  }

  // Scheduled occupancy is "how many are waiting", not only those created today.
  const { data: waiting, error: waitingError } = await adminClient
    .from('social_posts')
    .select('platform')
    .in('platform', PLATFORMS)
    .eq('status', 'scheduled')
  if (waitingError) {
    console.error('[autoQueueJobs] scheduled count query failed:', waitingError.message)
    throw new Error('Failed to load Buffer queue occupancy')
  }
  for (const row of waiting ?? []) {
    const platform = row.platform as SocialPlatform
    if (counts[platform]) counts[platform].scheduledCount += 1
  }

  for (const row of data ?? []) {
    const platform = row.platform as SocialPlatform
    if (!counts[platform]) continue
    if (countsTowardToday(row, bounds)) counts[platform].todayCount += 1
  }
  return counts
}

async function loadCandidateJobs(
  adminClient: SupabaseClient,
  lookbackDays: number
): Promise<(RoutableJob & JobForCopy)[]> {
  const cutoff = lookbackIso(lookbackDays)
  const { data, error } = await adminClient
    .from('jobs')
    .select(JOB_SELECT)
    .eq('status', 'active')
    .or(`date_posted.gte.${cutoff},created_at.gte.${cutoff}`)
    .order('is_featured', { ascending: false, nullsFirst: false })
    .order('date_posted', { ascending: false, nullsFirst: false })
    .limit(300)
  if (error) {
    console.error('[autoQueueJobs] candidate query failed:', error.message)
    throw new Error('Failed to load jobs for social auto-queue')
  }
  return (data ?? []) as unknown as (RoutableJob & JobForCopy)[]
}

export interface AutoQueueOptions {
  dryRun?: boolean
  dailyCap?: number
  lookbackDays?: number
  userId?: string | null
  now?: Date
}

export async function autoQueueDailyPosts(
  adminClient: SupabaseClient,
  options: AutoQueueOptions = {}
): Promise<AutoQueueOutcome> {
  const dryRun = options.dryRun === true
  const dailyCap = options.dailyCap ?? SOCIAL_DAILY_CAP_PER_CHANNEL
  const lookbackDays = options.lookbackDays ?? SOCIAL_CANDIDATE_LOOKBACK_DAYS
  const userId = options.userId ?? process.env.SCRAPER_USER_ID ?? null
  const now = options.now ?? new Date()

  const status = await getBufferStatus(adminClient)
  if (!status.connected) {
    return {
      ok: true,
      dry_run: dryRun,
      skipped: 'Buffer is not connected. Connect it in Social Publishing → Buffer Settings.',
      daily_cap: dailyCap,
      queue_cap: BUFFER_FREE_QUEUE_CAP,
      remaining: { linkedin: 0, facebook: 0, instagram: 0 },
      queued: emptyQueued(),
      failed: [],
      selected: { linkedin: [], facebook: [], instagram: [] },
    }
  }

  const channels = status.channels ?? []
  const channelByPlatform: Partial<Record<SocialPlatform, BufferChannel>> = {}
  for (const platform of PLATFORMS) {
    const channel = matchChannel(channels, platform)
    if (channel) channelByPlatform[platform] = channel
  }

  const [usedJobIds, counts, jobs] = await Promise.all([
    loadUsedJobIds(adminClient),
    loadChannelCounts(adminClient, now),
    loadCandidateJobs(adminClient, lookbackDays),
  ])

  const remaining = slotsFromCounts(counts, dailyCap)
  for (const platform of PLATFORMS) {
    if (!channelByPlatform[platform]) remaining[platform] = 0
  }

  const selected = selectJobsForQueue(jobs, usedJobIds, remaining)
  const selectedSummary: AutoQueueOutcome['selected'] = {
    linkedin: selected.linkedin.map((j) => ({ id: j.id, title: j.title })),
    facebook: selected.facebook.map((j) => ({ id: j.id, title: j.title })),
    instagram: selected.instagram.map((j) => ({ id: j.id, title: j.title })),
  }

  if (dryRun) {
    return {
      ok: true,
      dry_run: true,
      daily_cap: dailyCap,
      queue_cap: BUFFER_FREE_QUEUE_CAP,
      remaining,
      queued: emptyQueued(),
      failed: [],
      selected: selectedSummary,
    }
  }

  const queued = emptyQueued()
  const failed: AutoQueueOutcome['failed'] = []

  for (const platform of PLATFORMS) {
    const channel = channelByPlatform[platform]
    if (!channel) continue
    for (const job of selected[platform]) {
      try {
        const copy = await generatePostCopy(job as JobForCopy, platform)
        const post = await createPost(adminClient, userId, {
          job_id: job.id,
          platform,
          post_text: copy.text,
          media_url: jobOgImageUrl(job as JobForCopy),
          status: 'ready',
        })
        const outcome = await publishToBuffer(adminClient, {
          postId: post.id,
          channelId: channel.id,
          mode: 'queue',
        })
        if (!outcome.ok || !outcome.post) {
          failed.push({
            job_id: job.id,
            platform,
            error: outcome.error ?? 'Buffer queue failed',
          })
          continue
        }
        queued[platform].push({
          job_id: job.id,
          post_id: outcome.post.id,
          title: job.title,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to auto-queue social post'
        console.error('[autoQueueJobs] job failed:', job.id, platform, message)
        failed.push({ job_id: job.id, platform, error: message })
      }
    }
  }

  return {
    ok: failed.length === 0,
    dry_run: false,
    daily_cap: dailyCap,
    queue_cap: BUFFER_FREE_QUEUE_CAP,
    remaining,
    queued,
    failed,
    selected: selectedSummary,
  }
}

/** Lightweight summary used by the worker / GitHub Actions logs. */
export function summarizeAutoQueue(result: AutoQueueOutcome): string {
  if (result.skipped) return `skipped: ${result.skipped}`
  const queued = PLATFORMS.map((p) => `${p}=${result.queued[p].length}`).join(' ')
  const selected = PLATFORMS.map((p) => `${p}=${result.selected[p].length}`).join(' ')
  const failed = result.failed.length
  return `queued[${queued}] selected[${selected}] failed=${failed} dry_run=${result.dry_run}`
}

