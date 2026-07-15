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
assert(resolveCompanyDomain("Equity Bank Kenya") === "equitygroupholdings.com", "known equity");
assert(resolveCompanyDomain("KCB Bank") === "kcbbankgroup.com", "known kcb");
assert(resolveCompanyDomain("Public Service Commission of Kenya") === "publicservice.go.ke", "known psc");
assert(
  resolveCompanyLogoUrl({ companyName: "Safaricom" })?.includes("safaricom.co.ke"),
  "logo url for safaricom"
);
assert(
  resolveCompanyLogoUrl({ website: "https://inkomoko.com" })?.includes("inkomoko.com"),
  "logo url from website"
);
assert(companyInitials("Equity Bank") === "EB", "initials");

const enrichment = buildCompanyLogoEnrichment({ name: "Safaricom" });
assert(!!enrichment.logo && !!enrichment.website, "enrichment fills both fields");

console.log("companyLogo.test.ts: all assertions passed");
