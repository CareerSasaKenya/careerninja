import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminServiceClient } from '@/lib/adminAuth';
import { enqueueJobForSocialShare } from '@/lib/socialShareQueue';

export const runtime = 'nodejs';

/**
 * POST /api/social-share/enqueue
 *
 * Enqueue an active job for automatic social sharing.
 * Auth: Bearer access token. Caller must be admin OR the job owner.
 * Body: { job_id: string }
 */
export async function POST(request: NextRequest) {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const jobId =
      typeof body.job_id === 'string' && body.job_id.trim() ? body.job_id.trim() : null;
    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const adminClient = getAdminServiceClient();
    const { data: job, error: jobError } = await adminClient
      .from('jobs')
      .select('id, user_id, status')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';
    const isOwner = job.user_id === user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, enqueued: 0, reason: 'job_not_active' },
        { status: 200 }
      );
    }

    const result = await enqueueJobForSocialShare(adminClient, jobId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Enqueue failed';
    console.error('[social-share enqueue]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
