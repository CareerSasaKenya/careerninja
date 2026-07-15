import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildCompanyLogoEnrichment } from '@/lib/companyLogo';

/**
 * Backfill companies.logo / companies.website for rows missing them,
 * using website domains and the known Kenyan brand map.
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, logo, website')
      .or('logo.is.null,website.is.null')
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let updated = 0;
    let skipped = 0;

    for (const company of companies || []) {
      const enrichment = buildCompanyLogoEnrichment({
        name: company.name,
        logo: company.logo,
        website: company.website,
      });

      if (Object.keys(enrichment).length === 0) {
        skipped += 1;
        continue;
      }

      const { error: updateError } = await supabase
        .from('companies')
        .update(enrichment)
        .eq('id', company.id);

      if (!updateError) updated += 1;
      else skipped += 1;
    }

    return NextResponse.json({
      success: true,
      scanned: companies?.length ?? 0,
      updated,
      skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
