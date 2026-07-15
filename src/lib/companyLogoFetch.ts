/**
 * Server-side company logo fetcher.
 *
 * Tries multiple sources in priority order, verifies the image is real
 * (checks content-type + minimum byte size), and returns the working URL.
 *
 * THIS FILE must only be imported from server-side code (API routes, cron).
 * It uses Node.js fetch which is not available in edge runtime.
 */

import { extractDomain, getKnownBrandTwitterHandle, lookupBrand } from './companyLogo';

const UA = 'Mozilla/5.0 (compatible; careersasa-bot/1.0; +https://careersasa.co.ke)';

// Minimum byte size to consider an image "real" (rules out generic 726B gstatic fallbacks)
const MIN_IMAGE_BYTES = 1500;

interface FetchLogoResult {
  url: string;
  source: string;
}

/** Check that a URL returns a real image (not a generic placeholder). */
async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.startsWith('image/') && !ct.includes('svg')) return false;
    const cl = parseInt(res.headers.get('content-length') || '0', 10);
    // Content-Length not always present; if missing, try a small GET
    if (cl > 0) return cl >= MIN_IMAGE_BYTES;
    // Fallback: read first bytes to check size
    const getRes = await fetch(url, {
      headers: { 'User-Agent': UA, Range: `bytes=0-${MIN_IMAGE_BYTES - 1}` },
      signal: AbortSignal.timeout(8000),
    });
    const buf = await getRes.arrayBuffer();
    return buf.byteLength >= MIN_IMAGE_BYTES;
  } catch {
    return false;
  }
}

/** Try the gstatic faviconV2 service for a domain. Returns URL if real image found. */
async function trygstatic(domain: string): Promise<string | null> {
  const url = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${encodeURIComponent(domain)}&size=128`;
  if (await verifyImageUrl(url)) return url;
  return null;
}

/** Try Clearbit logo API (free, no key). Works from Vercel production IPs. */
async function tryClearbit(domain: string): Promise<string | null> {
  const url = `https://logo.clearbit.com/${domain}?size=128`;
  if (await verifyImageUrl(url)) return url;
  return null;
}

/** Try fetching well-known logo asset paths directly from the company website. */
async function tryDirectAssets(domain: string): Promise<string | null> {
  const paths = [
    '/apple-touch-icon.png',
    '/apple-touch-icon-precomposed.png',
    '/android-chrome-192x192.png',
    '/favicon-196x196.png',
    '/favicon-192x192.png',
    '/favicon-128x128.png',
    '/logo.png',
    '/logo.svg',
  ];
  for (const p of paths) {
    const url = `https://${domain}${p}`;
    if (await verifyImageUrl(url)) return url;
  }
  return null;
}

/** Scrape the company homepage for icon/OG image link tags. */
async function scrapeWebsiteForLogo(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Collect candidate URLs from <link> and <meta og:image>
    const candidates: string[] = [];

    // apple-touch-icon (highest quality)
    for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/gi)) {
      candidates.push(m[1]);
    }
    // Large favicons
    for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+(?:sizes=["']([0-9]+x[0-9]+)["'][^>]*)?href=["']([^"']+)["']/gi)) {
      const size = m[1] ? parseInt(m[1]) : 0;
      if (size >= 96 || !m[1]) candidates.push(m[2]);
    }
    // og:image
    for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) {
      candidates.push(m[1]);
    }
    // twitter:image (often same as og:image but sometimes higher quality)
    for (const m of html.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi)) {
      candidates.push(m[1]);
    }

    for (const candidate of candidates) {
      const absolute = candidate.startsWith('http')
        ? candidate
        : candidate.startsWith('//')
        ? `https:${candidate}`
        : `https://${domain}${candidate.startsWith('/') ? '' : '/'}${candidate}`;

      // Skip very large images (they're page banners, not logos)
      if (await verifyImageUrl(absolute)) {
        return absolute;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Try Twitter profile picture via unavatar.io. */
async function tryTwitterAvatar(handle: string): Promise<string | null> {
  const url = `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;
  if (await verifyImageUrl(url)) return url;
  return null;
}

/**
 * Fetch the best available logo URL for a company.
 * Tries sources in priority order; returns the first verified result.
 *
 * @param domain  - company's primary domain (e.g. "equitybank.co.ke")
 * @param companyName - used to look up known brand Twitter handle
 */
export async function fetchCompanyLogoUrl(
  domain: string | null | undefined,
  companyName?: string | null
): Promise<FetchLogoResult | null> {
  const effectiveDomain = domain || (companyName ? lookupBrand(companyName)?.domain : null);

  if (effectiveDomain) {
    // 1. Clearbit (best quality, free, works from Vercel)
    const clearbit = await tryClearbit(effectiveDomain);
    if (clearbit) return { url: clearbit, source: 'clearbit' };

    // 2. Direct asset paths on the company website
    const direct = await tryDirectAssets(effectiveDomain);
    if (direct) return { url: direct, source: 'direct-asset' };

    // 3. gstatic favicon (filtered to real images ≥ 1.5KB)
    const gstatic = await trygstatic(effectiveDomain);
    if (gstatic) return { url: gstatic, source: 'gstatic' };

    // 4. Scrape company website HTML
    const scraped = await scrapeWebsiteForLogo(effectiveDomain);
    if (scraped) return { url: scraped, source: 'scraped' };
  }

  // 5. Twitter profile picture (only for known brands with verified handles)
  const twitterHandle = companyName ? getKnownBrandTwitterHandle(companyName) : null;
  if (twitterHandle) {
    const twitter = await tryTwitterAvatar(twitterHandle);
    if (twitter) return { url: twitter, source: 'twitter' };
  }

  return null;
}
