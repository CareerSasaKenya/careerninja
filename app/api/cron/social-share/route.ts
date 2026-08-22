import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  enqueueJobForSocialShare,
  processSocialShareQueue,
} from '@/lib/socialShareQueue';
import { isKenyanBusinessHours } from '@/lib/socialShareBusinessHours';
import { getConfiguredPlatforms } from '@/lib/socialSharePlatforms';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * GET /api/cron/social-share
 *
 * Posts queued jobs to Facebook/LinkedIn during Kenyan business hours
 * with a max of 10 distinct jobs per EAT day. Highly AI-rewritten captions.
 *
 * Auth: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const platforms = getConfiguredPlatforms();

    // Backfill: enqueue recent active jobs that have no queue rows yet
    // (covers employer publishes that missed the enqueue hook).
    if (platforms.length > 0 && isKenyanBusinessHours(now)) {
      const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'active')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(30);

      for (const job of recentJobs || []) {
        const { count } = await supabase
          .from('social_share_queue')
          .select('id', { count: 'exact', head: true })
          .eq('job_id', job.id);
        if ((count || 0) === 0) {
          await enqueueJobForSocialShare(supabase, job.id, platforms);
        }
      }
    }

    const result = await processSocialShareQueue(supabase, { now });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      platforms,
      ...result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[social-share cron]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
