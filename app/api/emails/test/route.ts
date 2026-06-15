import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTestEmail } from '@/lib/email';

/**
 * POST /api/emails/test
 * Send a test email. Admin only.
 * Body: { to?: string } (defaults to admin email)
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    // Create a client with the user's access token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role using service role key
    const adminClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const to = body.to || user.email;

    if (!to) {
      return NextResponse.json({ error: 'No recipient email specified' }, { status: 400 });
    }

    const result = await sendTestEmail(to);

    return NextResponse.json({
      success: result.success,
      message: result.success ? `Test email sent to ${to}` : `Failed: ${result.error}`,
      provider_id: result.providerId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Test email error:', msg);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
