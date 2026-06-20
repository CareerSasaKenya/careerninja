/**
 * Strips HTML tags from a string and normalizes whitespace
 * @param html - The HTML string to clean
 * @returns Clean plain text
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  // Remove HTML tags using regex
  let text = html.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Normalize whitespace (multiple spaces, tabs, newlines to single space)
  text = text.replace(/\s+/g, " ");
  
  // Trim leading/trailing whitespace
  return text.trim();
};

/**
 * Strips trailing country names (e.g. ", Kenya", "Kenya") from a location string
 * to prevent duplication when we append ", Kenya" ourselves.
 */
function stripCountrySuffix(loc: string | null | undefined): string {
  if (!loc) return '';
  return loc
    .replace(/,?\s*Kenya\s*$/i, '')
    .replace(/^Kenya$/i, '')
    .trim();
}

/**
 * Builds a clean, deduplicated location string in the format:
 * [City], [County], Kenya
 * Omits parts that are empty or duplicates.
 */
export function buildLocationString(
  city?: string | null,
  county?: string | null,
  rawLocation?: string | null,
): string {
  const cleanCity = stripCountrySuffix(city);
  const cleanCounty = stripCountrySuffix(county);

  // If we have explicit city/county, use them
  const parts: string[] = [];
  if (cleanCity) parts.push(cleanCity);
  if (cleanCounty && cleanCounty.toLowerCase() !== cleanCity.toLowerCase()) {
    parts.push(cleanCounty);
  }

  // Fallback: use raw location (stripped of "Kenya")
  if (parts.length === 0 && rawLocation) {
    const clean = stripCountrySuffix(rawLocation);
    if (clean) parts.push(clean);
  }

  return parts.length > 0 ? `${parts.join(', ')}, Kenya` : 'Kenya';
}

/**
 * Builds an SEO-friendly job title:
 * [Post] at [Company] in [City], [County], Kenya
 * For remote: [Post] at [Company] — Remote (Kenya)
 * Omits "at [Company]" if company is empty.
 */
export function formatJobSeoTitle(
  title: string,
  company?: string | null,
  opts?: {
    city?: string | null;
    county?: string | null;
    rawLocation?: string | null;
    isRemote?: boolean;
  },
): string {
  const parts: string[] = [title];

  // "at [Company]"
  if (company && company.trim()) {
    parts.push(`at ${company.trim()}`);
  }

  // Location
  if (opts?.isRemote) {
    parts.push('— Remote (Kenya)');
  } else {
    const loc = buildLocationString(opts?.city, opts?.county, opts?.rawLocation);
    parts.push(`in ${loc}`);
  }

  return parts.join(' ');
}