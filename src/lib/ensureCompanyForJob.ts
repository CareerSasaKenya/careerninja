/**
 * Ensure a company row exists for a job post and has a logo when one can be found.
 *
 * Behavior:
 * 1. Reuse existing companies.logo if already stored (future posts of same company).
 * 2. Persist a manually/parsed logo URL when provided.
 * 3. Otherwise fetch a verified logo from website / known brand and store it
 *    so the next job for this company skips the fetch.
 *
 * Server-only — imports companyLogoFetch.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildCompanyLogoEnrichment,
  extractDomain,
  isUsableLogoUrl,
  resolveCompanyWebsite,
} from './companyLogo';
import { fetchCompanyLogoUrl } from './companyLogoFetch';

export type EnsureCompanyForJobInput = {
  name: string;
  userId: string;
  companyId?: string | null;
  website?: string | null;
  /** Manual, parsed, or profile logo URL — stored after basic validation. */
  logo?: string | null;
  industry?: string | null;
};

export type EnsureCompanyForJobResult = {
  companyId: string | null;
  logo: string | null;
  website: string | null;
  reusedLogo: boolean;
  fetchedLogo: boolean;
};

type CompanyRow = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
};

async function findCompany(
  supabase: SupabaseClient,
  input: EnsureCompanyForJobInput,
): Promise<CompanyRow | null> {
  if (input.companyId) {
    const { data } = await supabase
      .from('companies')
      .select('id, name, logo, website')
      .eq('id', input.companyId)
      .maybeSingle();
    if (data) return data;
  }

  const name = input.name.trim();
  if (!name) return null;

  const { data } = await supabase
    .from('companies')
    .select('id, name, logo, website')
    .eq('name', name)
    .maybeSingle();
  return data;
}

async function createCompany(
  supabase: SupabaseClient,
  input: EnsureCompanyForJobInput,
): Promise<CompanyRow | null> {
  const name = input.name.trim();
  const enrichment = buildCompanyLogoEnrichment({
    name,
    website: input.website,
    logo: input.logo,
  });
  const website = input.website?.trim() || enrichment.website || null;
  const logo = isUsableLogoUrl(input.logo) ? input.logo!.trim() : null;

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      user_id: input.userId,
      website,
      logo,
      industry: input.industry ?? null,
    })
    .select('id, name, logo, website')
    .single();

  if (!error && data) return data;

  // Race / unique constraint — re-read by name
  const { data: raced } = await supabase
    .from('companies')
    .select('id, name, logo, website')
    .eq('name', name)
    .maybeSingle();
  return raced;
}

/**
 * Look up or create the company, then ensure logo/website are populated when possible.
 */
export async function ensureCompanyForJob(
  supabase: SupabaseClient,
  input: EnsureCompanyForJobInput,
): Promise<EnsureCompanyForJobResult> {
  const name = input.name?.trim();
  if (!name && !input.companyId) {
    return {
      companyId: null,
      logo: null,
      website: null,
      reusedLogo: false,
      fetchedLogo: false,
    };
  }

  let company = await findCompany(supabase, { ...input, name: name || '' });
  if (!company && name) {
    company = await createCompany(supabase, { ...input, name });
  }
  if (!company) {
    return {
      companyId: null,
      logo: null,
      website: null,
      reusedLogo: false,
      fetchedLogo: false,
    };
  }

  // ── Fast path: logo already on the company — reuse for this and future jobs ─
  if (isUsableLogoUrl(company.logo)) {
    if (!company.website) {
      const website = input.website?.trim() || resolveCompanyWebsite(company.name, null);
      if (website) {
        await supabase.from('companies').update({ website }).eq('id', company.id);
        company = { ...company, website };
      }
    }
    return {
      companyId: company.id,
      logo: company.logo,
      website: company.website,
      reusedLogo: true,
      fetchedLogo: false,
    };
  }

  const patch: { logo?: string; website?: string } = {};
  let fetchedLogo = false;

  if (!company.website) {
    const website =
      input.website?.trim() ||
      resolveCompanyWebsite(company.name, null) ||
      buildCompanyLogoEnrichment({ name: company.name }).website ||
      null;
    if (website) patch.website = website;
  }

  // Prefer explicit manual / parsed / profile logo
  if (isUsableLogoUrl(input.logo)) {
    patch.logo = input.logo!.trim();
  } else {
    const domain = extractDomain(patch.website || company.website || input.website || null);
    const result = await fetchCompanyLogoUrl(domain, company.name);
    if (result) {
      patch.logo = result.url;
      fetchedLogo = true;
      if (!company.website && !patch.website && domain) {
        patch.website = `https://${domain}`;
      }
    }
  }

  if (Object.keys(patch).length > 0) {
    await supabase.from('companies').update(patch).eq('id', company.id);
  }

  return {
    companyId: company.id,
    logo: patch.logo ?? company.logo,
    website: patch.website ?? company.website,
    reusedLogo: false,
    fetchedLogo,
  };
}
