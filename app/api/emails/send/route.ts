import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCampaignEmail } from '@/lib/email';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/emails/send
 * Admin-triggered campaign send. Requires admin auth.
 * Body: { campaign_id }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    // Create a client with the user's session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          ...(cookie ? { cookie } : {}),
          ...(authHeader ? { authorization: authHeader } : {}),
        },
      },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { campaign_id } = body;

    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    // Fetch the campaign
    const { data: campaign, error: campaignError } = await adminClient
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json({ error: `Campaign cannot be sent (status: ${campaign.status})` }, { status: 400 });
    }

    // Mark campaign as sending
    await adminClient
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Get confirmed subscribers
    const { data: subscribers } = await adminClient
      .from('email_subscribers')
      .select('id, email, unsubscribe_token')
      .eq('status', 'confirmed');

    if (!subscribers || subscribers.length === 0) {
      await adminClient
        .from('email_campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString(), sent_count: 0 })
        .eq('id', campaign_id);

      return NextResponse.json({ message: 'No subscribers to send to', sent: 0 });
    }

    // Send emails (batch to respect rate limits)
    let sentCount = 0;
    let failedCount = 0;
    const batchSize = 5; // Resend free tier: be conservative

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (sub) => {
          const result = await sendCampaignEmail(
            sub.email,
            campaign.subject,
            campaign.html_body,
            campaign_id,
            sub.unsubscribe_token
          );

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await adminClient
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', campaign_id);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Campaign send error:', msg);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
