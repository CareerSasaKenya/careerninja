import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * DELETE /api/admin/subscribers/[id]
 * Admin-only: permanently removes an email subscriber.
 * Uses service-role client to bypass RLS.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await adminClient
      .from('email_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[admin/subscribers] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin/subscribers] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
