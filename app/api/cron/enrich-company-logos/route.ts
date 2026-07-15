import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractDomain, resolveCompanyWebsite, lookupBrand } from '@/lib/companyLogo';
import { fetchCompanyLogoUrl } from '@/lib/companyLogoFetch';

/**
 * Backfill companies.logo / companies.website for rows missing them.
 * Uses verified server-side fetching (Clearbit → direct assets → HTML scrape → Twitter).
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 * Optional query params:
 *   ?limit=50       (max companies to process per run, default 50)
 *   ?only_missing   (default true — only process rows where logo IS NULL)
 *   ?company_id=... (process a single company for testing)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const singleId = searchParams.get('company_id');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let companies: Array<{ id: string; name: string; logo: string | null; website: string | null }> = [];

    if (singleId) {
      const { data } = await supabase
        .from('companies')
        .select('id, name, logo, website')
        .eq('id', singleId)
        .limit(1);
      companies = data || [];
    } else {
      const { data } = await supabase
        .from('companies')
        .select('id, name, logo, website')
        .is('logo', null)
        .limit(limit);
      companies = data || [];
    }

    const results: Array<{ name: string; action: string; source?: string; url?: string }> = [];

    for (const company of companies) {
      const patch: { logo?: string; website?: string } = {};

      // Resolve / confirm website first
      const existingDomain = extractDomain(company.website);
      const brandDomain = lookupBrand(company.name)?.domain ?? null;
      const websiteToUse = existingDomain
        ? company.website
        : brandDomain
        ? `https://${brandDomain}`
        : resolveCompanyWebsite(company.name, null);

      if (!company.website && websiteToUse) {
        patch.website = websiteToUse;
      }

      const effectiveDomain = extractDomain(websiteToUse || null);

      // Skip if no domain to work with AND no known brand name
      if (!effectiveDomain && !lookupBrand(company.name)) {
        results.push({ name: company.name, action: 'skipped-no-domain' });
        continue;
      }

      if (!company.logo) {
        const result = await fetchCompanyLogoUrl(effectiveDomain, company.name);
        if (result) {
          patch.logo = result.url;
          results.push({ name: company.name, action: 'updated', source: result.source, url: result.url });
        } else {
          results.push({ name: company.name, action: 'no-logo-found' });
        }
      } else {
        results.push({ name: company.name, action: 'already-has-logo' });
      }

      if (Object.keys(patch).length > 0) {
        await supabase.from('companies').update(patch).eq('id', company.id);
      }
    }

    const updated = results.filter(r => r.action === 'updated').length;
    const noLogo = results.filter(r => r.action === 'no-logo-found').length;
    const skipped = results.filter(r => r.action.startsWith('skipped')).length;
    const alreadyHas = results.filter(r => r.action === 'already-has-logo').length;

    return NextResponse.json({
      success: true,
      scanned: companies.length,
      updated,
      no_logo_found: noLogo,
      skipped,
      already_has_logo: alreadyHas,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
