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

// Generic gstatic "unknown domain" placeholder is 726B / 16×16.
// Real logos can be ~900–1400B (e.g. INTERFELK 48×48 JPEG ≈ 1086B).
const MIN_IMAGE_BYTES = 850;
const GENERIC_PLACEHOLDER_BYTES = 726;

interface FetchLogoResult {
  url: string;
  source: string;
}

/**
 * WordPress and other CMS pages often emit HTML-encoded URL bits
 * (e.g. &#038; for &). Decode those before probing, or verify fails.
 */
export function sanitizeLogoCandidateUrl(raw: string, domain?: string): string | null {
  if (!raw?.trim()) return null;
  let value = raw.trim();

  // Decode common HTML entities (named + numeric)
  value = value
    .replace(/&amp;/gi, '&')
    .replace(/&#0*38;/g, '&')
    .replace(/&#x0*26;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  // Strip trailing junk left by broken entity decoding (e.g. "...svg&#")
  value = value.replace(/&#+$/g, '').replace(/&+$/g, '');

  if (value.startsWith('//')) value = `https:${value}`;
  if (!/^https?:\/\//i.test(value) && domain) {
    value = `https://${domain}${value.startsWith('/') ? '' : '/'}${value}`;
  }

  try {
    const parsed = new URL(value);
    if (!/^https?:$/i.test(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function pngDims(buf: ArrayBuffer): { w: number; h: number } | null {
  const u8 = new Uint8Array(buf);
  if (u8.length < 24) return null;
  if (u8[0] !== 0x89 || u8[1] !== 0x50 || u8[2] !== 0x4e || u8[3] !== 0x47) return null;
  const view = new DataView(buf);
  return { w: view.getUint32(16), h: view.getUint32(20) };
}

function jpegDims(buf: ArrayBuffer): { w: number; h: number } | null {
  const u8 = new Uint8Array(buf);
  if (u8.length < 4 || u8[0] !== 0xff || u8[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < u8.length) {
    if (u8[i] !== 0xff) { i++; continue; }
    const marker = u8[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: (u8[i + 5] << 8) | u8[i + 6], w: (u8[i + 7] << 8) | u8[i + 8] };
    }
    const len = (u8[i + 2] << 8) | u8[i + 3];
    i += 2 + len;
  }
  return null;
}

/** Check that a URL returns a real image (not a generic 16×16 placeholder). */
async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return false;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.startsWith('image/') && !ct.includes('svg') && !ct.includes('icon')) return false;
    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    if (size === GENERIC_PLACEHOLDER_BYTES || size < 500) return false;

    const dims = pngDims(buf) || jpegDims(buf);
    if (dims) {
      if (dims.w <= 16 || dims.h <= 16) return false;
      return dims.w >= 32 || dims.h >= 32;
    }
    if (ct.includes('svg')) return size >= 200;
    return size >= MIN_IMAGE_BYTES;
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

/**
 * icon.horse often returns a real brand icon, but also recycles placeholders.
 * We reject tiny / 16×16 images via verifyImageUrl; cron/script does hash dedupe.
 */
async function tryIconHorse(domain: string): Promise<string | null> {
  const url = `https://icon.horse/icon/${domain}`;
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
      const absolute = sanitizeLogoCandidateUrl(candidate, domain);
      if (!absolute) continue;

      // Skip obvious page banners / photos masquerading as logos
      if (/\.(jpe?g)(\?|$)/i.test(absolute) && /scaled|household|banner|hero|cover/i.test(absolute)) {
        continue;
      }

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
    // 1. Scrape company website HTML (most accurate when reachable)
    const scraped = await scrapeWebsiteForLogo(effectiveDomain);
    if (scraped) return { url: scraped, source: 'scraped' };

    // 2. Direct asset paths on the company website
    const direct = await tryDirectAssets(effectiveDomain);
    if (direct) return { url: direct, source: 'direct-asset' };

    // 3. Clearbit (best quality when reachable; often blocked from some IPs)
    const clearbit = await tryClearbit(effectiveDomain);
    if (clearbit) return { url: clearbit, source: 'clearbit' };

    // 4. gstatic favicon (filtered to real images, rejects 16×16 placeholders)
    const gstatic = await trygstatic(effectiveDomain);
    if (gstatic) return { url: gstatic, source: 'gstatic' };

    // 5. icon.horse (verifyImageUrl rejects tiny placeholders)
    const iconHorse = await tryIconHorse(effectiveDomain);
    if (iconHorse) return { url: iconHorse, source: 'iconhorse' };
  }

  // 5. Twitter profile picture (only for known brands with verified handles)
  const twitterHandle = companyName ? getKnownBrandTwitterHandle(companyName) : null;
  if (twitterHandle) {
    const twitter = await tryTwitterAvatar(twitterHandle);
    if (twitter) return { url: twitter, source: 'twitter' };
  }

  return null;
}
