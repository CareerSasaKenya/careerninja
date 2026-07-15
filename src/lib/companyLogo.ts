/**
 * Resolve hiring-company logos for job cards and details.
 *
 * Priority:
 * 1. Explicit stored logo URL (companies.logo / hiring_organization_logo)
 * 2. Domain derived from companies.website → gstatic faviconV2
 * 3. Well-known company → direct logo URL (Twitter via unavatar, then domain favicon)
 * 4. Logo.dev CDN (when NEXT_PUBLIC_LOGO_DEV_TOKEN is set)
 * 5. gstatic faviconV2 (no API key)
 *
 * Display components must still handle image load failures (→ initials).
 */

/**
 * Rich brand entry: domain for website resolution, optional Twitter handle
 * for high-quality logo via unavatar.io/twitter/{handle}.
 */
interface BrandEntry {
  domain: string;
  /** Twitter/X handle (without @). Gives 400×400 profile picture via unavatar. */
  twitter?: string;
}

/** Normalized company name → brand entry */
export const KNOWN_COMPANY_BRANDS: Record<string, BrandEntry> = {
  // ── Telecom / Tech ─────────────────────────────────────────────────
  safaricom: { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },
  "safaricom plc": { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },
  "safaricom limited": { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },
  airtel: { domain: "airtel.ke", twitter: "airtel_ke" },
  "airtel kenya": { domain: "airtel.ke", twitter: "airtel_ke" },
  "telkom kenya": { domain: "telkom.co.ke", twitter: "TelkomKenya" },
  andela: { domain: "andela.com", twitter: "Andela" },
  cellulant: { domain: "cellulant.com", twitter: "cellulant" },
  twiga: { domain: "twiga.com", twitter: "TwigaFoodsLtd" },
  "twiga foods": { domain: "twiga.com", twitter: "TwigaFoodsLtd" },
  branch: { domain: "branch.co", twitter: "BranchApp" },
  "branch international": { domain: "branch.co", twitter: "BranchApp" },
  tala: { domain: "tala.co", twitter: "Tala_app" },
  mpesa: { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },
  "m-pesa": { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },
  microsoft: { domain: "microsoft.com", twitter: "Microsoft" },
  "microsoft kenya": { domain: "microsoft.com", twitter: "Microsoft" },
  google: { domain: "google.com", twitter: "Google" },
  "google kenya": { domain: "google.com", twitter: "Google" },
  ibm: { domain: "ibm.com", twitter: "IBM" },
  oracle: { domain: "oracle.com", twitter: "Oracle" },
  sap: { domain: "sap.com", twitter: "SAP" },
  huawei: { domain: "huawei.com", twitter: "Huawei" },

  // ── Banking / Finance ───────────────────────────────────────────────
  "equity bank": { domain: "equitybank.co.ke", twitter: "EquityBank" },
  "equity bank kenya": { domain: "equitybank.co.ke", twitter: "EquityBank" },
  "equity group": { domain: "equitygroupholdings.com", twitter: "EquityBank" },
  "equity group holdings": { domain: "equitygroupholdings.com", twitter: "EquityBank" },
  kcb: { domain: "kcbbankgroup.com", twitter: "KCBGroup" },
  "kcb bank": { domain: "kcbbankgroup.com", twitter: "KCBGroup" },
  "kcb group": { domain: "kcbbankgroup.com", twitter: "KCBGroup" },
  "kenya commercial bank": { domain: "kcbbankgroup.com", twitter: "KCBGroup" },
  "co-operative bank": { domain: "co-opbank.co.ke", twitter: "CoopBankKenya" },
  "co-operative bank of kenya": { domain: "co-opbank.co.ke", twitter: "CoopBankKenya" },
  "coop bank": { domain: "co-opbank.co.ke", twitter: "CoopBankKenya" },
  "co-op bank": { domain: "co-opbank.co.ke", twitter: "CoopBankKenya" },
  ncba: { domain: "ncbagroup.com", twitter: "NCBABank" },
  "ncba bank": { domain: "ncbagroup.com", twitter: "NCBABank" },
  "ncba group": { domain: "ncbagroup.com", twitter: "NCBABank" },
  absa: { domain: "absa.africa", twitter: "AbsaKenya" },
  "absa bank": { domain: "absa.africa", twitter: "AbsaKenya" },
  "absa bank kenya": { domain: "absa.africa", twitter: "AbsaKenya" },
  "standard chartered": { domain: "standardchartered.co.ke", twitter: "StanChartKenya" },
  "standard chartered bank": { domain: "standardchartered.co.ke", twitter: "StanChartKenya" },
  "standard chartered kenya": { domain: "standardchartered.co.ke", twitter: "StanChartKenya" },
  "stanbic bank": { domain: "stanbicbank.co.ke", twitter: "StanbicBankKE" },
  "stanbic bank kenya": { domain: "stanbicbank.co.ke", twitter: "StanbicBankKE" },
  "i and m bank": { domain: "imbank.com", twitter: "IM_Bank" },
  "i&m bank": { domain: "imbank.com", twitter: "IM_Bank" },
  "diamond trust bank": { domain: "dtbafrica.com", twitter: "DTBKenya" },
  dtb: { domain: "dtbafrica.com", twitter: "DTBKenya" },
  "family bank": { domain: "familybank.co.ke", twitter: "FamilyBankLtd" },
  kwft: { domain: "kwftbank.com" },
  "kenya women microfinance bank": { domain: "kwftbank.com" },
  britam: { domain: "britam.com", twitter: "britam_insure" },
  "britam holdings": { domain: "britam.com", twitter: "britam_insure" },
  jubilee: { domain: "jubileeinsurance.com", twitter: "JubileeKenya" },
  "jubilee insurance": { domain: "jubileeinsurance.com", twitter: "JubileeKenya" },
  "jubilee health insurance": { domain: "jubileeinsurance.com", twitter: "JubileeKenya" },
  "cic insurance": { domain: "cic.co.ke", twitter: "CICGroupKenya" },
  "cic group": { domain: "cic.co.ke", twitter: "CICGroupKenya" },
  "old mutual": { domain: "oldmutual.co.ke", twitter: "OldMutualSA" },
  sanlam: { domain: "sanlam.com", twitter: "Sanlam" },
  "sanlam kenya": { domain: "sanlam.com", twitter: "Sanlam" },
  icea: { domain: "icealion.com", twitter: "IceaLion" },
  "icea lion": { domain: "icealion.com", twitter: "IceaLion" },
  "apa insurance": { domain: "apainsurance.org" },
  centum: { domain: "centum.co.ke", twitter: "centum_ke" },
  "centum investment": { domain: "centum.co.ke", twitter: "centum_ke" },
  "pesalink": { domain: "pesalink.co.ke" },
  "kenswitch": { domain: "kenswitch.co.ke" },
  "safaricom investment": { domain: "safaricom.co.ke", twitter: "SafaricomPLC" },

  // ── Public / Development ────────────────────────────────────────────
  "public service commission": { domain: "publicservice.go.ke" },
  "public service commission of kenya": { domain: "publicservice.go.ke" },
  psc: { domain: "publicservice.go.ke" },
  "government of kenya": { domain: "kenya.go.ke" },
  "central bank of kenya": { domain: "centralbank.go.ke" },
  cbk: { domain: "centralbank.go.ke" },
  "kenya revenue authority": { domain: "kra.go.ke" },
  kra: { domain: "kra.go.ke" },
  "kenya airways": { domain: "kenya-airways.com", twitter: "KenyaAirways" },
  kq: { domain: "kenya-airways.com", twitter: "KenyaAirways" },
  "kenya power": { domain: "kplc.co.ke", twitter: "KenyaPower_care" },
  kplc: { domain: "kplc.co.ke", twitter: "KenyaPower_care" },
  "kenya power and lighting": { domain: "kplc.co.ke", twitter: "KenyaPower_care" },
  "kenya ports authority": { domain: "kpa.co.ke", twitter: "KenyaPorts" },
  kpa: { domain: "kpa.co.ke" },
  "kenya airports authority": { domain: "kaa.go.ke" },
  "communication authority of kenya": { domain: "ca.go.ke" },
  "national hospital insurance fund": { domain: "nhif.or.ke" },
  nhif: { domain: "nhif.or.ke" },
  "national social security fund": { domain: "nssf.or.ke" },
  nssf: { domain: "nssf.or.ke" },
  "kenya national highways authority": { domain: "kenha.go.ke" },
  "ketraco": { domain: "ketraco.co.ke" },
  undp: { domain: "undp.org", twitter: "UNDP" },
  unicef: { domain: "unicef.org", twitter: "UNICEF" },
  unhcr: { domain: "unhcr.org", twitter: "Refugees" },
  "world bank": { domain: "worldbank.org", twitter: "WorldBank" },
  "world bank group": { domain: "worldbank.org", twitter: "WorldBank" },
  "african development bank": { domain: "afdb.org", twitter: "AfDB_Group" },
  afdb: { domain: "afdb.org", twitter: "AfDB_Group" },
  usaid: { domain: "usaid.gov", twitter: "USAID" },
  giz: { domain: "giz.de", twitter: "giz_gmbh" },
  "giz kenya": { domain: "giz.de", twitter: "giz_gmbh" },
  "british council": { domain: "britishcouncil.org", twitter: "BritishCouncil" },
  "amnesty international": { domain: "amnesty.org", twitter: "amnesty" },
  "red cross": { domain: "redcross.or.ke" },
  "kenya red cross": { domain: "redcross.or.ke", twitter: "kenyaredcross" },
  "kenya red cross society": { domain: "redcross.or.ke", twitter: "kenyaredcross" },
  "save the children": { domain: "savethechildren.org", twitter: "SavetheChildren" },
  "world food programme": { domain: "wfp.org", twitter: "WFP" },
  wfp: { domain: "wfp.org", twitter: "WFP" },
  "plan international": { domain: "plan-international.org", twitter: "PlanIntl" },
  "world vision": { domain: "worldvision.org", twitter: "worldvisionUSA" },
  "doctors without borders": { domain: "msf.org", twitter: "MSF_USA" },
  msf: { domain: "msf.org", twitter: "MSF_USA" },
  "care kenya": { domain: "care.org", twitter: "CARE" },
  "mercy corps": { domain: "mercycorps.org", twitter: "Mercy_Corps" },
  "path": { domain: "path.org", twitter: "PATH_tweets" },
  "population services international": { domain: "psi.org", twitter: "PSInews" },
  psi: { domain: "psi.org" },

  // ── Agriculture / Manufacturing ─────────────────────────────────────
  "bidco africa": { domain: "bidcoafrica.com", twitter: "Bidco_Africa" },
  bidco: { domain: "bidcoafrica.com", twitter: "Bidco_Africa" },
  "unga group": { domain: "unga.com" },
  "brookside dairy": { domain: "brookside.co.ke" },
  brookside: { domain: "brookside.co.ke" },
  "finlays kenya": { domain: "finlays.net", twitter: "JamesFinlay" },
  "british american tobacco": { domain: "bat.com", twitter: "BATplc" },
  bat: { domain: "bat.com", twitter: "BATplc" },
  "east african breweries": { domain: "eabl.com", twitter: "EABLplc" },
  eabl: { domain: "eabl.com", twitter: "EABLplc" },
  "kenya breweries": { domain: "eabl.com", twitter: "EABLplc" },
  "bamburi cement": { domain: "bamburicement.com", twitter: "BamburiCement" },
  "east african portland cement": { domain: "eapccl.com" },
  "arm cement": { domain: "armcement.com" },
  "kenya orchards": { domain: "kenyaorchards.com" },

  // ── Retail / Consumer ───────────────────────────────────────────────
  "carrefour kenya": { domain: "carrefour.ke", twitter: "CarrefourKenya" },
  carrefour: { domain: "carrefour.ke", twitter: "CarrefourKenya" },
  "naivas supermarket": { domain: "naivas.co.ke", twitter: "NaivasSupermark" },
  naivas: { domain: "naivas.co.ke", twitter: "NaivasSupermark" },
  quickmart: { domain: "quickmart.co.ke", twitter: "QuickmartSM" },
  "java house": { domain: "javahouse.africa", twitter: "JavaHouseAfrica" },
  "chicken inn": { domain: "chickeninn.co.ke" },
  "kfc kenya": { domain: "kfckenya.co.ke" },
  kfc: { domain: "kfc.com", twitter: "kfc" },
  "mr price": { domain: "mrpricekenya.co.ke" },
  woolworths: { domain: "woolworths.co.za", twitter: "woolworths_sa" },

  // ── Media ───────────────────────────────────────────────────────────
  "nation media": { domain: "nation.africa", twitter: "nationafrica" },
  "nation media group": { domain: "nation.africa", twitter: "nationafrica" },
  nmg: { domain: "nation.africa", twitter: "nationafrica" },
  "standard media": { domain: "standardmedia.co.ke", twitter: "StandardMediaGrp" },
  "standard group": { domain: "standardmedia.co.ke", twitter: "StandardMediaGrp" },
  "royal media": { domain: "royalmedia.co.ke", twitter: "royalmediakenya" },
  "royal media services": { domain: "royalmedia.co.ke", twitter: "royalmediakenya" },
  "radio africa": { domain: "radioafrica.co.ke" },

  // ── Agriculture Tech / NGOs ─────────────────────────────────────────
  inkomoko: { domain: "inkomoko.com", twitter: "Inkomoko" },
  "give directly": { domain: "givedirectly.org", twitter: "GiveDirectly" },
  givedirectly: { domain: "givedirectly.org", twitter: "GiveDirectly" },
  "one acre fund": { domain: "oneacrefund.org", twitter: "OneAcreFund" },
  "living goods": { domain: "livinggoods.org", twitter: "LivingGoods_" },
  "kenya commercial agriculture": { domain: "kenyacommercialagri.or.ke" },
  "apollo agriculture": { domain: "apolloagriculture.com", twitter: "ApolloAgricultu" },
  // ── Hospitality / Tourism ───────────────────────────────────────────
  "sarova hotels": { domain: "sarovahotels.com", twitter: "SarovaHotels" },
  "serena hotels": { domain: "serenahotels.com", twitter: "SerenaHotels" },
  "kenya tourism board": { domain: "magicalkenya.com", twitter: "VisitKenyaNow" },
  "leopard beach resort": { domain: "leopardbeachresort.com" },
  "heritage hotels": { domain: "heritage-eastafrica.com" },

  // ── Health / Pharma ─────────────────────────────────────────────────
  "aga khan hospital": { domain: "agakhanhospitals.org", twitter: "AKU_News" },
  "aga khan health services": { domain: "agakhanhospitals.org", twitter: "AKU_News" },
  "nairobi hospital": { domain: "nairobihospital.org", twitter: "NrbHospital" },
  "kenyatta national hospital": { domain: "knh.or.ke" },
  knh: { domain: "knh.or.ke" },
  "mater hospital": { domain: "materhospital.org" },
  "gertrude's children hospital": { domain: "gerties.org" },
  "astrazeneca": { domain: "astrazeneca.com", twitter: "AstraZeneca" },
  "roche": { domain: "roche.com", twitter: "Roche" },
  "glaxosmithkline": { domain: "gsk.com", twitter: "GSK" },
  gsk: { domain: "gsk.com", twitter: "GSK" },
  "johnson and johnson": { domain: "jnj.com", twitter: "JNJNews" },

  // ── Energy ──────────────────────────────────────────────────────────
  "kengen": { domain: "kengen.co.ke", twitter: "KenGen_Kenya" },
  "kenya electricity generating company": { domain: "kengen.co.ke", twitter: "KenGen_Kenya" },
  "kerio valley development authority": { domain: "kvda.go.ke" },
  "petroleum institute of east africa": { domain: "piea.or.ke" },

  // ── Logistics / Transport ───────────────────────────────────────────
  dhl: { domain: "dhl.com", twitter: "DHLglobal" },
  "dhl express": { domain: "dhl.com", twitter: "DHLglobal" },
  "kenya post": { domain: "posta.co.ke" },
  "posta kenya": { domain: "posta.co.ke" },
  "wells fargo kenya": { domain: "wellsfargoke.com" },
  "siginon freight": { domain: "siginon.com" },
  "bollore logistics": { domain: "bollore-logistics.com" },
};

/** Backward-compat alias: domain-only lookup */
export const KNOWN_COMPANY_DOMAINS: Record<string, string> = Object.fromEntries(
  Object.entries(KNOWN_COMPANY_BRANDS).map(([k, v]) => [k, v.domain])
);

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

/** Look up the brand entry for a company name. */
function lookupBrand(companyName: string): BrandEntry | null {
  const key = normalizeCompanyKey(companyName);
  if (!key) return null;
  if (KNOWN_COMPANY_BRANDS[key]) return KNOWN_COMPANY_BRANDS[key];

  // Prefer longest known key contained in the normalized name
  let best: { known: string; entry: BrandEntry } | null = null;
  for (const [known, entry] of Object.entries(KNOWN_COMPANY_BRANDS)) {
    if (known.length < 4) continue;
    if (key === known || key.includes(known)) {
      if (!best || known.length > best.known.length) {
        best = { known, entry };
      }
    }
  }
  return best?.entry ?? null;
}

export function resolveCompanyDomain(
  companyName?: string | null,
  website?: string | null
): string | null {
  const fromWebsite = extractDomain(website);
  if (fromWebsite) return fromWebsite;
  if (!companyName) return null;
  return lookupBrand(companyName)?.domain ?? null;
}

/**
 * Logo URL from Twitter profile picture (via unavatar.io, no API key required).
 * Returns a 400×400 image that unavatar proxies from the Twitter CDN.
 * Images are cached server-side by unavatar so most requests resolve quickly.
 */
function twitterLogoUrl(handle: string): string {
  return `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;
}

/** Build a favicon CDN URL for a domain. */
export function buildLogoCdnUrl(domain: string, size = 128): string {
  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || process.env.LOGO_DEV_API_KEY
      : undefined;

  if (token) {
    return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(token)}&size=${size}&format=png`;
  }

  // gstatic faviconV2 returns full-color brand icons at up to 128px
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${encodeURIComponent(domain)}&size=${size}`;
}

export function isUsableLogoUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return /^https?:\/\//i.test(trimmed);
}

/**
 * Best logo URL for display, or null when we should show initials/fallback.
 * For known brands we prefer their Twitter profile picture (higher quality
 * than a 16px favicon) when available and no stored logo exists.
 */
export function resolveCompanyLogoUrl(input: CompanyLogoInput): string | null {
  if (isUsableLogoUrl(input.logo)) return input.logo!.trim();
  if (isUsableLogoUrl(input.hiringOrganizationLogo)) {
    return input.hiringOrganizationLogo!.trim();
  }

  // From the stored/provided website domain
  const fromWebsite = input.website ? extractDomain(input.website) : null;

  // Look up brand entry from company name or website
  const brand =
    input.companyName ? lookupBrand(input.companyName) : null;

  // Use brand domain or website-derived domain
  const domain = fromWebsite || brand?.domain || null;

  // Twitter avatar first (better quality), then domain favicon
  if (brand?.twitter) {
    return twitterLogoUrl(brand.twitter);
  }
  if (domain) {
    return buildLogoCdnUrl(domain);
  }

  // If we have a website but no brand match, still try favicon
  if (fromWebsite) {
    return buildLogoCdnUrl(fromWebsite);
  }

  return null;
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
 * Prefers Twitter-based logo URL for known brands (stored once, served from DB).
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
