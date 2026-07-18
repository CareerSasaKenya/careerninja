/**
 * Ensure a company row exists for a job post and has a logo when one can be found.
 *
 * Behavior:
 * 1. Reuse existing companies.logo if already stored (future posts of same company).
 * 2. Persist a manually/parsed logo URL when provided.
 * 3. Otherwise fetch a verified logo from website / known brand and store it
 *    so the next job for this company skips the fetch.
 *
 * Matching order:
 * 1. Explicit companyId
 * 2. Case-insensitive exact name
 * 3. Identity key (Equity Bank Group → Equity Bank)
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
import { resolveCompanyDomainSmart } from './companyDomainLookup';
import { normalizeCompanyIdentityKey } from './companyIdentity';
import { inferCompanyIndustry } from './companyIndustryInference';

export type EnsureCompanyForJobInput = {
  name: string;
  userId: string;
  companyId?: string | null;
  website?: string | null;
  /** Manual, parsed, or profile logo URL — stored after basic validation. */
  logo?: string | null;
  /**
   * Optional employer-profile industry only.
   * Do NOT pass the job posting's industry — agencies/gov advertise across sectors.
   */
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

async function findCompanyByExactName(
  supabase: SupabaseClient,
  name: string,
): Promise<CompanyRow | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Case-insensitive exact match (DB unique index is LOWER(name))
  const { data } = await supabase
    .from('companies')
    .select('id, name, logo, website')
    .ilike('name', trimmed)
    .limit(5);

  if (!data?.length) return null;

  const exact = data.find(
    (row) => row.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  return exact ?? data[0] ?? null;
}

/**
 * Match variant names ("Equity Bank Group" ↔ "Equity Bank") via identity key.
 * Uses a token ILIKE prefilter then exact identity-key compare in memory.
 */
async function findCompanyByIdentity(
  supabase: SupabaseClient,
  name: string,
): Promise<CompanyRow | null> {
  const key = normalizeCompanyIdentityKey(name);
  if (!key) return null;

  const token =
    key.split(/\s+/).find((part) => part.length >= 3) || key.split(/\s+/)[0];
  if (!token) return null;

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, logo, website')
    .ilike('name', `%${token}%`)
    .limit(100);

  if (error || !data?.length) return null;

  const matches = data.filter(
    (row) => normalizeCompanyIdentityKey(row.name) === key,
  );
  if (!matches.length) return null;

  // Prefer the row with a logo/website already filled
  matches.sort((a, b) => {
    const score = (c: CompanyRow) => (c.logo ? 2 : 0) + (c.website ? 1 : 0);
    return score(b) - score(a);
  });
  return matches[0] ?? null;
}

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

  const exact = await findCompanyByExactName(supabase, name);
  if (exact) return exact;

  return findCompanyByIdentity(supabase, name);
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
  // Prefer explicit profile industry, else infer from employer identity — never from the job role.
  const industry =
    input.industry?.trim() ||
    inferCompanyIndustry(name, website) ||
    null;

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      user_id: input.userId,
      website,
      logo,
      industry,
    })
    .select('id, name, logo, website')
    .single();

  if (!error && data) return data;

  // Race / unique constraint — re-read by exact name (case-insensitive) or identity
  const raced =
    (await findCompanyByExactName(supabase, name)) ||
    (await findCompanyByIdentity(supabase, name));
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
    let domain = extractDomain(patch.website || company.website || input.website || null);

    // If no domain yet, ask AI (Gemini waterfall) for the official site, then verify logo.
    if (!domain) {
      const smart = await resolveCompanyDomainSmart(company.name, {
        websiteHint: input.website,
        allowAI: true,
      });
      if (smart.domain) {
        domain = smart.domain;
        if (!company.website && !patch.website) {
          patch.website = `https://${smart.domain}`;
        }
      }
    }

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
