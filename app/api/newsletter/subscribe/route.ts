import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionConfirmation } from '@/lib/email';
import crypto from 'crypto';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Check if subscriber already exists
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, status')
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'confirmed') {
        return NextResponse.json({ message: 'You are already subscribed!', already_subscribed: true });
      }
      if (existing.status === 'unsubscribed') {
        // Re-subscribe: generate new confirmation token
        const confirmToken = crypto.randomBytes(32).toString('hex');
        await supabase
          .from('email_subscribers')
          .update({
            status: 'pending' as string,
            confirmation_token: confirmToken,
            unsubscribed_at: null,
            name: name || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        await sendSubscriptionConfirmation(email, confirmToken, name);
        return NextResponse.json({ message: 'Confirmation email sent! Please check your inbox.' });
      }
      // Already pending
      return NextResponse.json({ message: 'A confirmation email has already been sent. Please check your inbox.' });
    }

    // Create new subscriber
    const confirmToken = crypto.randomBytes(32).toString('hex');

    const { error: insertError } = await supabase.from('email_subscribers').insert({
      email: email.toLowerCase(),
      name: name || null,
      status: 'pending',
      confirmation_token: confirmToken,
      source: 'website',
    });

    if (insertError) {
      console.error('[Newsletter] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    // Send confirmation email
    await sendSubscriptionConfirmation(email, confirmToken, name);

    return NextResponse.json({ message: 'Confirmation email sent! Please check your inbox.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Newsletter] Subscribe error:', msg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
