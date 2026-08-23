/**
 * Enqueue + process automatic social shares for active jobs.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { buildShareOgImagePath } from './ogTemplateCatalog';
import { generateSocialShareCaption } from './socialShareCaption';
import {
  getEatDayUtcBounds,
  isKenyanBusinessHours,
  remainingDailyJobSlots,
  SOCIAL_SHARE_MAX_JOBS_PER_DAY,
} from './socialShareBusinessHours';
import {
  getConfiguredPlatforms,
  postToPlatform,
  type SocialPlatform,
} from './socialSharePlatforms';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://www.careersasa.co.ke';

export type SocialShareQueueRow = {
  id: string;
  job_id: string;
  platform: SocialPlatform;
  status: string;
  caption: string | null;
  share_url: string | null;
  image_url: string | null;
  attempts: number;
  max_attempts: number;
};

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function buildJobShareUrl(job: {
  id: string;
  job_slug?: string | null;
  slug?: string | null;
}): string {
  const slug = (job.job_slug || job.slug || job.id).trim();
  return `${normalizeSiteUrl(SITE_URL)}/jobs/${encodeURIComponent(slug)}`;
}

export function buildJobImageUrl(job: {
  id: string;
  job_slug?: string | null;
  slug?: string | null;
  og_image_url?: string | null;
}): string {
  if (job.og_image_url && /^https?:\/\//i.test(job.og_image_url)) {
    return job.og_image_url;
  }
  const key = job.job_slug || job.slug || job.id;
  return `${normalizeSiteUrl(SITE_URL)}${buildShareOgImagePath(key)}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Enqueue share rows for an active job (deduped by unique job_id+platform). */
export async function enqueueJobForSocialShare(
  supabase: SupabaseClient,
  jobId: string,
  platforms?: SocialPlatform[]
): Promise<{ enqueued: number; platforms: SocialPlatform[] }> {
  const enabled = platforms?.length ? platforms : getConfiguredPlatforms();
  if (enabled.length === 0) {
    return { enqueued: 0, platforms: [] };
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select(
      'id, title, company, location, status, expires_at, job_slug, slug, og_image_url, employment_type, experience_level, description'
    )
    .eq('id', jobId)
    .maybeSingle();

  if (error || !job) {
    console.warn('[socialShare] enqueue skipped — job not found', jobId, error?.message);
    return { enqueued: 0, platforms: enabled };
  }

  if (job.status !== 'active') {
    return { enqueued: 0, platforms: enabled };
  }

  if (job.expires_at && new Date(job.expires_at).getTime() <= Date.now()) {
    return { enqueued: 0, platforms: enabled };
  }

  const shareUrl = buildJobShareUrl(job);
  const imageUrl = buildJobImageUrl(job);

  const rows = enabled.map((platform) => ({
    job_id: jobId,
    platform,
    status: 'pending' as const,
    share_url: shareUrl,
    image_url: imageUrl,
    scheduled_at: new Date().toISOString(),
  }));

  const { data, error: insertError } = await supabase
    .from('social_share_queue')
    .upsert(rows, {
      onConflict: 'job_id,platform',
      ignoreDuplicates: true,
    })
    .select('id');

  if (insertError) {
    // ignoreDuplicates upsert may still error on older PostgREST — fall back to insert-ignore loop
    let enqueued = 0;
    for (const row of rows) {
      const { error: oneErr } = await supabase.from('social_share_queue').insert(row);
      if (!oneErr) enqueued++;
      else if (oneErr.code !== '23505') {
        console.error('[socialShare] enqueue error', oneErr.message);
      }
    }
    return { enqueued, platforms: enabled };
  }

  return { enqueued: data?.length || 0, platforms: enabled };
}

export async function countDistinctJobsPostedTodayEat(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<number> {
  const { startUtc, endUtc } = getEatDayUtcBounds(now);
  const { data, error } = await supabase
    .from('social_share_queue')
    .select('job_id')
    .eq('status', 'posted')
    .gte('posted_at', startUtc.toISOString())
    .lt('posted_at', endUtc.toISOString());

  if (error) {
    console.error('[socialShare] count posted today failed', error.message);
    return SOCIAL_SHARE_MAX_JOBS_PER_DAY; // fail closed on the daily cap
  }

  return new Set((data || []).map((r) => r.job_id)).size;
}

async function markRow(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>
) {
  await supabase
    .from('social_share_queue')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export type ProcessSocialShareResult = {
  outsideBusinessHours: boolean;
  dailyCapReached: boolean;
  postedToday: number;
  remainingSlots: number;
  processed: number;
  posted: number;
  skipped: number;
  failed: number;
  details: Array<Record<string, unknown>>;
};

/**
 * Process pending social share queue items.
 * Gates: Kenyan business hours + max 10 distinct jobs/day (EAT).
 */
export async function processSocialShareQueue(
  supabase: SupabaseClient,
  options: { now?: Date; limit?: number } = {}
): Promise<ProcessSocialShareResult> {
  const now = options.now || new Date();
  const details: Array<Record<string, unknown>> = [];

  if (!isKenyanBusinessHours(now)) {
    return {
      outsideBusinessHours: true,
      dailyCapReached: false,
      postedToday: await countDistinctJobsPostedTodayEat(supabase, now),
      remainingSlots: 0,
      processed: 0,
      posted: 0,
      skipped: 0,
      failed: 0,
      details: [{ reason: 'outside_kenyan_business_hours' }],
    };
  }

  const postedToday = await countDistinctJobsPostedTodayEat(supabase, now);
  let remaining = remainingDailyJobSlots(postedToday);
  if (remaining <= 0) {
    return {
      outsideBusinessHours: false,
      dailyCapReached: true,
      postedToday,
      remainingSlots: 0,
      processed: 0,
      posted: 0,
      skipped: 0,
      failed: 0,
      details: [{ reason: 'daily_cap_reached', postedToday }],
    };
  }

  // Fetch more rows than remaining slots so we can skip expired / claim siblings.
  const fetchLimit = Math.min(options.limit || 40, remaining * 4 + 10);

  const { data: pending, error } = await supabase
    .from('social_share_queue')
    .select('id, job_id, platform, status, caption, share_url, image_url, attempts, max_attempts')
    .eq('status', 'pending')
    .lte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(fetchLimit);

  if (error) {
    throw new Error(`Failed to load social_share_queue: ${error.message}`);
  }

  const rows = (pending || []) as SocialShareQueueRow[];
  let processed = 0;
  let posted = 0;
  let skipped = 0;
  let failed = 0;
  let newlyPostedJobs = 0;

  // Group by job so FB+LinkedIn for one job count as one daily slot.
  const byJob = new Map<string, SocialShareQueueRow[]>();
  for (const row of rows) {
    const list = byJob.get(row.job_id) || [];
    list.push(row);
    byJob.set(row.job_id, list);
  }

  for (const [jobId, jobRows] of byJob) {
    if (remaining <= 0) break;

    const { data: job } = await supabase
      .from('jobs')
      .select(
        'id, title, company, location, status, expires_at, job_slug, slug, og_image_url, employment_type, experience_level, description'
      )
      .eq('id', jobId)
      .maybeSingle();

    const expired =
      !job ||
      job.status !== 'active' ||
      (job.expires_at && new Date(job.expires_at).getTime() <= now.getTime());

    if (expired) {
      for (const row of jobRows) {
        await markRow(supabase, row.id, {
          status: 'skipped',
          skip_reason: !job
            ? 'job_missing'
            : job.status !== 'active'
              ? 'job_not_active'
              : 'job_expired',
          processed_at: now.toISOString(),
        });
        skipped++;
        processed++;
        details.push({ id: row.id, job_id: jobId, status: 'skipped', reason: 'expired_or_inactive' });
      }
      continue;
    }

    const shareUrl = jobRows[0].share_url || buildJobShareUrl(job);
    const imageUrl = jobRows[0].image_url || buildJobImageUrl(job);

    // One AI caption per job, reused across platforms (with light truncation later if needed).
    let sharedCaption = jobRows.find((r) => r.caption)?.caption || null;
    if (!sharedCaption) {
      const generated = await generateSocialShareCaption({
        title: job.title,
        company: job.company,
        location: job.location,
        employmentType: job.employment_type,
        experienceLevel: job.experience_level,
        description: stripHtml(job.description),
        shareUrl,
        platform: jobRows[0].platform,
      });
      sharedCaption = generated.caption;
    }

    let jobPostedAny = false;

    for (const row of jobRows) {
      if (!getConfiguredPlatforms().includes(row.platform) && process.env.SOCIAL_SHARE_DRY_RUN !== 'true') {
        await markRow(supabase, row.id, {
          status: 'skipped',
          skip_reason: `${row.platform}_not_configured`,
          caption: sharedCaption,
          processed_at: now.toISOString(),
        });
        skipped++;
        processed++;
        details.push({ id: row.id, platform: row.platform, status: 'skipped', reason: 'not_configured' });
        continue;
      }

      await markRow(supabase, row.id, {
        status: 'processing',
        caption: sharedCaption,
        share_url: shareUrl,
        image_url: imageUrl,
        attempts: (row.attempts || 0) + 1,
      });

      const result = await postToPlatform({
        platform: row.platform,
        caption: sharedCaption!,
        shareUrl,
        imageUrl,
        title: `${job.title} at ${job.company}`,
      });

      processed++;

      if (result.skipped) {
        await markRow(supabase, row.id, {
          status: 'skipped',
          skip_reason: result.skipReason || 'skipped',
          caption: sharedCaption,
          processed_at: now.toISOString(),
        });
        skipped++;
        details.push({ id: row.id, platform: row.platform, status: 'skipped', reason: result.skipReason });
        continue;
      }

      if (!result.ok) {
        const attempts = (row.attempts || 0) + 1;
        const maxAttempts = row.max_attempts || 3;
        const terminal = attempts >= maxAttempts;
        await markRow(supabase, row.id, {
          status: terminal ? 'failed' : 'pending',
          error_message: result.error || 'post_failed',
          caption: sharedCaption,
          processed_at: terminal ? now.toISOString() : null,
        });
        if (terminal) failed++;
        details.push({
          id: row.id,
          platform: row.platform,
          status: terminal ? 'failed' : 'retry',
          error: result.error,
        });
        continue;
      }

      await markRow(supabase, row.id, {
        status: 'posted',
        caption: sharedCaption,
        share_url: shareUrl,
        image_url: imageUrl,
        platform_post_id: result.platformPostId || null,
        error_message: null,
        skip_reason: null,
        posted_at: now.toISOString(),
        processed_at: now.toISOString(),
      });
      posted++;
      jobPostedAny = true;
      details.push({
        id: row.id,
        platform: row.platform,
        status: 'posted',
        dryRun: Boolean(result.dryRun),
        platformPostId: result.platformPostId,
      });
    }

    if (jobPostedAny) {
      remaining -= 1;
      newlyPostedJobs += 1;
    }
  }

  const postedTodayAfter = postedToday + newlyPostedJobs;

  return {
    outsideBusinessHours: false,
    dailyCapReached: remaining <= 0,
    postedToday: postedTodayAfter,
    remainingSlots: remaining,
    processed,
    posted,
    skipped,
    failed,
    details,
  };
}
