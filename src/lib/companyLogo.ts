/**
 * Resolve hiring-company logos for job cards and details.
 *
 * Priority:
 * 1. Explicit stored logo URL (companies.logo / hiring_organization_logo)
 * 2. Domain derived from companies.website
 * 3. Well-known company name → domain map (Kenyan employers)
 * 4. Optional Logo.dev CDN (when NEXT_PUBLIC_LOGO_DEV_TOKEN is set)
 * 5. Google favicon CDN (no API key)
 *
 * Display components must still handle image load failures (→ initials).
 */

/** Normalized company name → primary website domain */
export const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  // Telecom / tech
  safaricom: "safaricom.co.ke",
  "safaricom plc": "safaricom.co.ke",
  "safaricom limited": "safaricom.co.ke",
  airtel: "airtel.ke",
  "airtel kenya": "airtel.ke",
  "telkom kenya": "telkom.co.ke",
  andela: "andela.com",
  cellulant: "cellulant.com",
  twiga: "twiga.com",
  "twiga foods": "twiga.com",
  branch: "branch.co",
  "branch international": "branch.co",
  tala: "tala.co",
  mpesa: "safaricom.co.ke",
  "m-pesa": "safaricom.co.ke",

  // Banking / finance
  "equity bank": "equitygroupholdings.com",
  "equity bank kenya": "equitygroupholdings.com",
  "equity group": "equitygroupholdings.com",
  "equity group holdings": "equitygroupholdings.com",
  kcb: "kcbbankgroup.com",
  "kcb bank": "kcbbankgroup.com",
  "kcb group": "kcbbankgroup.com",
  "kenya commercial bank": "kcbbankgroup.com",
  "co-operative bank": "co-opbank.co.ke",
  "co-operative bank of kenya": "co-opbank.co.ke",
  "coop bank": "co-opbank.co.ke",
  "co-op bank": "co-opbank.co.ke",
  ncba: "ncbagroup.com",
  "ncba bank": "ncbagroup.com",
  "ncba group": "ncbagroup.com",
  absa: "absa.africa",
  "absa bank": "absa.africa",
  "absa bank kenya": "absa.africa",
  "standard chartered": "sc.com",
  "standard chartered bank": "sc.com",
  "standard chartered kenya": "sc.com",
  "stanbic bank": "stanbicbank.co.ke",
  "stanbic bank kenya": "stanbicbank.co.ke",
  "i&m bank": "imbank.com",
  "i and m bank": "imbank.com",
  "diamond trust bank": "dtbafrica.com",
  dtb: "dtbafrica.com",
  "family bank": "familybank.co.ke",
  "kenya women microfinance bank": "kwftbank.com",
  kwft: "kwftbank.com",
  britam: "britam.com",
  "britam holdings": "britam.com",
  jubilee: "jubileeinsurance.com",
  "jubilee insurance": "jubileeinsurance.com",
  "cic insurance": "cic.co.ke",
  "old mutual": "oldmutual.co.ke",
  sanlam: "sanlam.com",
  "sanlam kenya": "sanlam.com",
  icea: "icealion.com",
  "icea lion": "icealion.com",
  "apa insurance": "apainsurance.org",
  "centum investment": "centum.co.ke",
  centum: "centum.co.ke",

  // Public / development
  "public service commission": "publicservice.go.ke",
  "public service commission of kenya": "publicservice.go.ke",
  psc: "publicservice.go.ke",
  "county government": "kenya.go.ke",
  "government of kenya": "kenya.go.ke",
  "central bank of kenya": "centralbank.go.ke",
  cbk: "centralbank.go.ke",
  "kenya revenue authority": "kra.go.ke",
  kra: "kra.go.ke",
  "kenya airways": "kenya-airways.com",
  kq: "kenya-airways.com",
  "kenya power": "kplc.co.ke",
  kplc: "kplc.co.ke",
  "kenya ports authority": "kpa.co.ke",
  kpa: "kpa.co.ke",
  "kenya airports authority": "kaa.go.ke",
  "communication authority of kenya": "ca.go.ke",
  undp: "undp.org",
  unicef: "unicef.org",
  unhcr: "unhcr.org",
  "world bank": "worldbank.org",
  "world bank group": "worldbank.org",
  "african development bank": "afdb.org",
  afdb: "afdb.org",
  usaid: "usaid.gov",
  "giz kenya": "giz.de",
  giz: "giz.de",
  "british council": "britishcouncil.org",
  "amnesty international": "amnesty.org",
  "red cross": "redcross.or.ke",
  "kenya red cross": "redcross.or.ke",
  "kenya red cross society": "redcross.or.ke",

  // Media / retail / other well-known
  "nation media": "nation.africa",
  "nation media group": "nation.africa",
  "standard media": "standardmedia.co.ke",
  "standard group": "standardmedia.co.ke",
  "royal media": "royalmedia.co.ke",
  "royal media services": "royalmedia.co.ke",
  nakumatt: "nakumatt.net",
  "carrefour kenya": "carrefour.ke",
  carrefour: "carrefour.ke",
  "naivas supermarket": "naivas.co.ke",
  naivas: "naivas.co.ke",
  quickmart: "quickmart.co.ke",
  "java house": "javahouse.africa",
  "chicken inn": "chickeninn.co.ke",
  "bidco africa": "bidcoafrica.com",
  bidco: "bidcoafrica.com",
  bamboo: "bamboocapitalpartners.com",
  inkomoko: "inkomoko.com",
  "give directly": "givedirectly.org",
  givedirectly: "givedirectly.org",
  "one acre fund": "oneacrefund.org",
  "living goods": "livinggoods.org",
  "finlays kenya": "finlays.net",
  bat: "bat.com",
  "british american tobacco": "bat.com",
  "east african breweries": "eabl.com",
  eabl: "eabl.com",
  "kenya breweries": "eabl.com",
  "ung a limited": "unga.com",
  "brookside dairy": "brookside.co.ke",
  brookside: "brookside.co.ke",
};

export type CompanyLogoInput = {
  logo?: string | null;
  website?: string | null;
  companyName?: string | null;
  hiringOrganizationLogo?: string | null;
};

export function normalizeCompanyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    // Strip legal suffixes only (avoid bare "co" — breaks "co operative bank")
    .replace(/\b(ltd|limited|plc|inc|corp|corporation|company)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDomain(websiteOrDomain: string | null | undefined): string | null {
  if (!websiteOrDomain) return null;
  let value = websiteOrDomain.trim();
  if (!value) return null;

  try {
    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (!host || !host.includes(".")) return null;
    // Skip ATS / job-board hosts — they are not the employer brand
    if (
      /(workable\.com|smartrecruiters\.com|lever\.co|greenhouse\.io|bamboohr\.com|myworkdayjobs\.com|jobs\.|careersasa)/i.test(
        host
      )
    ) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

export function resolveCompanyDomain(
  companyName?: string | null,
  website?: string | null
): string | null {
  const fromWebsite = extractDomain(website);
  if (fromWebsite) return fromWebsite;

  if (!companyName) return null;
  const key = normalizeCompanyKey(companyName);
  if (!key) return null;

  if (KNOWN_COMPANY_DOMAINS[key]) return KNOWN_COMPANY_DOMAINS[key];

  // Prefer longest known key contained in the company name (avoids short-token false positives)
  let best: { known: string; domain: string } | null = null;
  for (const [known, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (known.length < 4) continue;
    if (key === known || key.includes(known)) {
      if (!best || known.length > best.known.length) {
        best = { known, domain };
      }
    }
  }

  return best?.domain ?? null;
}

/** Build a CDN logo URL for a domain. Prefers Logo.dev when token is configured. */
export function buildLogoCdnUrl(domain: string, size = 128): string {
  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || process.env.LOGO_DEV_API_KEY
      : undefined;

  if (token) {
    return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(token)}&size=${size}&format=png`;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function isUsableLogoUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return /^https?:\/\//i.test(trimmed);
}

/**
 * Best logo URL for display, or null when we should show initials/fallback.
 */
export function resolveCompanyLogoUrl(input: CompanyLogoInput): string | null {
  if (isUsableLogoUrl(input.logo)) return input.logo!.trim();
  if (isUsableLogoUrl(input.hiringOrganizationLogo)) {
    return input.hiringOrganizationLogo!.trim();
  }

  const domain = resolveCompanyDomain(input.companyName, input.website);
  if (!domain) return null;

  return buildLogoCdnUrl(domain);
}

/** Website URL to persist when enriching a company from a known name. */
export function resolveCompanyWebsite(
  companyName?: string | null,
  website?: string | null
): string | null {
  if (website && extractDomain(website)) {
    const domain = extractDomain(website)!;
    return website.startsWith("http") ? website : `https://${domain}`;
  }
  const domain = resolveCompanyDomain(companyName, null);
  return domain ? `https://${domain}` : null;
}

export function companyInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Fields to write when creating/updating a company that is missing logo/website.
 */
export function buildCompanyLogoEnrichment(input: {
  name: string;
  logo?: string | null;
  website?: string | null;
}): { logo?: string; website?: string } {
  const website = input.website || resolveCompanyWebsite(input.name, null);
  const logo =
    input.logo ||
    resolveCompanyLogoUrl({
      logo: input.logo,
      website,
      companyName: input.name,
    });

  const patch: { logo?: string; website?: string } = {};
  if (!input.website && website) patch.website = website;
  if (!input.logo && logo) patch.logo = logo;
  return patch;
}
