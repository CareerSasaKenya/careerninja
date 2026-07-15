/**
 * Lightweight assertions for company logo resolution.
 * Run: npx tsx src/lib/companyLogo.test.ts
 */

import {
  buildCompanyLogoEnrichment,
  companyInitials,
  extractDomain,
  normalizeCompanyKey,
  resolveCompanyDomain,
  resolveCompanyLogoUrl,
} from "./companyLogo";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(normalizeCompanyKey("Safaricom PLC") === "safaricom", "normalize safaricom");
assert(extractDomain("https://www.safaricom.co.ke/careers") === "safaricom.co.ke", "extract domain");
assert(extractDomain("apply.workable.com/inkomoko") === null, "skip ATS host");
assert(resolveCompanyDomain("Equity Bank Kenya") === "equitybank.co.ke", "known equity");
assert(resolveCompanyDomain("KCB Bank") === "kcbbankgroup.com", "known kcb");
assert(resolveCompanyDomain("Public Service Commission of Kenya") === "publicservice.go.ke", "known psc");

// Known brands with Twitter handle → unavatar URL
assert(
  resolveCompanyLogoUrl({ companyName: "Safaricom" })?.includes("unavatar.io/twitter/SafaricomPLC"),
  "logo url for safaricom uses twitter"
);
assert(
  resolveCompanyLogoUrl({ companyName: "KCB Bank" })?.includes("unavatar.io/twitter/KCBGroup"),
  "logo url for kcb uses twitter"
);
assert(
  resolveCompanyLogoUrl({ companyName: "Equity Bank" })?.includes("unavatar.io/twitter/EquityBank"),
  "logo url for equity uses twitter"
);

// Website-derived logo
assert(
  resolveCompanyLogoUrl({ website: "https://inkomoko.com" })?.includes("inkomoko.com"),
  "logo url from website"
);
// Stored URL takes top priority
assert(
  resolveCompanyLogoUrl({ logo: "https://example.com/logo.png", companyName: "Safaricom" }) === "https://example.com/logo.png",
  "stored logo wins"
);

assert(companyInitials("Equity Bank") === "EB", "initials");

const enrichment = buildCompanyLogoEnrichment({ name: "Safaricom" });
assert(!!enrichment.logo && !!enrichment.website, "enrichment fills both fields");
assert(enrichment.logo?.includes("unavatar.io"), "enrichment uses twitter logo");

console.log("companyLogo.test.ts: all assertions passed");
