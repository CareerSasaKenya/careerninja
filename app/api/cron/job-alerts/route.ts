import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendJobAlertDigest } from '@/lib/email';

/**
 * GET /api/cron/job-alerts
 * Processes saved searches with email_alerts_enabled, finds matching jobs,
 * and sends digest emails to users.
 *
 * Designed to be called daily by Vercel Cron or external scheduler.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all saved searches with email alerts enabled
    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select(`
        id,
        user_id,
        search_query,
        search_location,
        search_filters,
        alert_frequency
      `)
      .eq('email_alerts_enabled', true);

    if (searchError) {
      console.error('[Cron:JobAlerts] Error fetching searches:', searchError);
      return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    if (!searches || searches.length === 0) {
      return NextResponse.json({ success: true, message: 'No active email alerts', processed: 0 });
    }

    // Get all active jobs posted in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company_id, job_location_city, employment_type, status')
      .eq('status', 'active')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(200);

    if (jobsError) {
      console.error('[Cron:JobAlerts] Error fetching jobs:', jobsError);
      return NextResponse.json({ error: jobsError.message }, { status: 500 });
    }

    // Get user emails for all users with active searches
    const userIds = [...new Set(searches.map(s => s.user_id))];

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, job_alert_emails')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, p])
    );

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    // Process each user's searches
    const userSearches = new Map<string, typeof searches>();
    for (const search of searches) {
      if (!userSearches.has(search.user_id)) {
        userSearches.set(search.user_id, []);
      }
      userSearches.get(search.user_id)!.push(search);
    }

    for (const [userId, userSearchList] of userSearches) {
      const profile = profileMap.get(userId);
      if (!profile || !profile.email) {
        skipped++;
        continue;
      }

      // Check if user opted into job alert emails
      if (profile.job_alert_emails === false) {
        skipped++;
        continue;
      }

      // Match jobs against all user searches
      const matchedJobs: Array<{ id: string; title: string; company: string; location: string; type: string }> = [];

      for (const search of userSearchList) {
        const query = (search.search_query || '').toLowerCase();
        const location = (search.search_location || '').toLowerCase();

        for (const job of (recentJobs || [])) {
          // Simple text matching
          const titleMatch = !query || job.title.toLowerCase().includes(query);
          const locationMatch = !location || (job.job_location_city || '').toLowerCase().includes(location);

          if (titleMatch && locationMatch) {
            // Avoid duplicates
            if (!matchedJobs.find(m => m.id === job.id)) {
              matchedJobs.push({
                id: job.id,
                title: job.title,
                company: '', // Could join companies table but keeping it simple
                location: job.job_location_city || 'Kenya',
                type: job.employment_type || 'Full-time',
              });
            }
          }
        }
      }

      if (matchedJobs.length === 0) {
        skipped++;
        continue;
      }

      // Send digest email
      try {
        const result = await sendJobAlertDigest(
          profile.email,
          profile.full_name || 'there',
          matchedJobs.slice(0, 10), // Limit to 10 jobs per email
          userId
        );

        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`[Cron:JobAlerts] Failed to send to ${profile.email}:`, err);
        failed++;
      }

      // Rate limit: small delay between sends
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      processed: userSearches.size,
      sent,
      skipped,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cron:JobAlerts] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
