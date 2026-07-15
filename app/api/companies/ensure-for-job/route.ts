import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureCompanyForJob } from '@/lib/ensureCompanyForJob';

export const runtime = 'nodejs';

/**
 * POST /api/companies/ensure-for-job
 *
 * Called from JobPostingForm (manual / parsed / employer posts) so that:
 * - the company row is linked
 * - an existing companies.logo is reused immediately
 * - otherwise a logo is fetched once and stored for future jobs
 *
 * Auth: Bearer access token (admin or employer).
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const companyId = typeof body.companyId === 'string' && body.companyId ? body.companyId : null;
    const website = typeof body.website === 'string' && body.website ? body.website : null;
    const logo = typeof body.logo === 'string' && body.logo ? body.logo : null;
    const industry = typeof body.industry === 'string' && body.industry ? body.industry : null;

    if (!name && !companyId) {
      return NextResponse.json({ error: 'name or companyId required' }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result = await ensureCompanyForJob(admin, {
      name: name || 'Unknown',
      userId: user.id,
      companyId,
      website,
      logo,
      industry,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[ensure-for-job]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to ensure company logo' },
      { status: 500 },
    );
  }
}
