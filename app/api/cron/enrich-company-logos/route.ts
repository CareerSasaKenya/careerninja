import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractDomain, isUsableLogoUrl } from '@/lib/companyLogo';
import { fetchCompanyLogoUrl } from '@/lib/companyLogoFetch';
import { resolveCompanyDomainSmart } from '@/lib/companyDomainLookup';

/**
 * Backfill companies.logo / companies.website for rows missing them.
 *
 * Flow:
 * 1. Known-brand / existing website domain
 * 2. AI domain suggestion (Gemini → Groq → OpenRouter) when missing
 * 3. Verified logo fetch (site scrape → assets → Clearbit → favicons)
 * 4. Sync logo onto related jobs.hiring_organization_logo
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 * Optional query params:
 *   ?limit=50       (max companies to process per run, default 50)
 *   ?company_id=... (process a single company for testing)
 *   ?allow_ai=0     (disable AI domain lookup)
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
    const allowAI = searchParams.get('allow_ai') !== '0';

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

    const results: Array<{
      name: string
      action: string
      source?: string
      url?: string
      domain?: string | null
      domain_source?: string
    }> = [];

    for (const company of companies) {
      const patch: { logo?: string; website?: string } = {};

      const domainLookup = await resolveCompanyDomainSmart(company.name, {
        websiteHint: company.website,
        allowAI,
      });

      if (domainLookup.domain && !company.website) {
        patch.website = `https://${domainLookup.domain}`;
      }

      const effectiveDomain =
        extractDomain(patch.website || company.website || null) || domainLookup.domain;

      if (!effectiveDomain) {
        results.push({
          name: company.name,
          action: 'skipped-no-domain',
          domain_source: domainLookup.source,
        });
        // Still persist website if AI somehow returned only website path — already handled
        if (Object.keys(patch).length > 0) {
          await supabase.from('companies').update(patch).eq('id', company.id);
        }
        continue;
      }

      if (!isUsableLogoUrl(company.logo)) {
        const result = await fetchCompanyLogoUrl(effectiveDomain, company.name);
        if (result) {
          patch.logo = result.url;
          results.push({
            name: company.name,
            action: 'updated',
            source: result.source,
            url: result.url,
            domain: effectiveDomain,
            domain_source: domainLookup.source,
          });
        } else {
          results.push({
            name: company.name,
            action: 'no-logo-found',
            domain: effectiveDomain,
            domain_source: domainLookup.source,
          });
        }
      } else {
        results.push({
          name: company.name,
          action: 'already-has-logo',
          domain: effectiveDomain,
          domain_source: domainLookup.source,
        });
      }

      if (Object.keys(patch).length > 0) {
        await supabase.from('companies').update(patch).eq('id', company.id);

        // Keep job cards in sync when we just found a logo
        if (patch.logo) {
          await supabase
            .from('jobs')
            .update({
              hiring_organization_logo: patch.logo,
              ...(patch.website ? { hiring_organization_url: patch.website } : {}),
            })
            .eq('company_id', company.id)
            .or('hiring_organization_logo.is.null,hiring_organization_logo.eq.');
        }
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
