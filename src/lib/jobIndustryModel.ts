/**
 * Industry → professional model image mapping for job share cards / OG images.
 * Images live in public/assets/job-thumbnails/ and are fetched at runtime
 * (not imported into the Edge OG bundle) to stay under Vercel's ~500KB limit.
 */

import { OG_FETCH_TIMEOUT_MS, fetchWithTimeout } from '@/lib/ogFetch';

export type JobIndustryModelCategory =
  | 'healthcare'
  | 'technology'
  | 'education'
  | 'finance'
  | 'hospitality'
  | 'agriculture'
  | 'construction'
  | 'retail'
  | 'government'
  | 'creative'
  | 'professional';

/** Filename under /assets/job-thumbnails/ for each category */
export const INDUSTRY_MODEL_FILENAMES: Record<JobIndustryModelCategory, string> = {
  healthcare: 'healthcare-professional.jpg',
  technology: 'technology-professional.jpg',
  education: 'education-professional.jpg',
  finance: 'finance-professional.jpg',
  hospitality: 'hospitality-professional.jpg',
  agriculture: 'agriculture-professional.jpg',
  construction: 'construction-professional.jpg',
  retail: 'retail-professional.jpg',
  government: 'government-professional.jpg',
  creative: 'creative-professional.jpg',
  professional: 'professional-default.jpg',
};

/**
 * Pick a model category from job title + company (and optional function/industry text).
 * All mapped images feature Black/African professionals.
 */
export function getModelForJob(jobTitle: string, company: string): JobIndustryModelCategory {
  const combined = `${jobTitle} ${company}`.toLowerCase();

  // NGO/Non-profit sector - common in Kenya (check first to avoid conflicts)
  if (
    combined.includes('ngo') ||
    combined.includes('non profit') ||
    combined.includes('charity') ||
    combined.includes('foundation') ||
    combined.includes('humanitarian') ||
    combined.includes('community') ||
    combined.includes('development') ||
    combined.includes('advocacy') ||
    combined.includes('social work')
  ) {
    return 'professional';
  }

  // Government/Public Service
  if (
    combined.includes('government') ||
    combined.includes('county') ||
    combined.includes('public') ||
    combined.includes('civil service') ||
    combined.includes('ministry') ||
    combined.includes('military') ||
    combined.includes('police') ||
    combined.includes('firefighter') ||
    combined.includes('officer') ||
    combined.includes('administration') ||
    combined.includes('parliament') ||
    combined.includes('judiciary') ||
    combined.includes('senate') ||
    combined.includes('assembly')
  ) {
    return 'government';
  }

  // Education
  if (
    combined.includes('teacher') ||
    combined.includes('educator') ||
    combined.includes('school') ||
    combined.includes('professor') ||
    combined.includes('academic') ||
    combined.includes('lecturer') ||
    combined.includes('tutor') ||
    combined.includes('trainer') ||
    combined.includes('instruction') ||
    combined.includes('research') ||
    combined.includes('university') ||
    combined.includes('college') ||
    combined.includes('kindergarten') ||
    combined.includes('tuition')
  ) {
    return 'education';
  }

  // Healthcare
  if (
    combined.includes('doctor') ||
    combined.includes('nurse') ||
    combined.includes('medical') ||
    combined.includes('health') ||
    combined.includes('clinical') ||
    combined.includes('physician') ||
    combined.includes('surgeon') ||
    combined.includes('pharmacist') ||
    combined.includes('therapy') ||
    combined.includes('hospital') ||
    combined.includes('clinic') ||
    combined.includes('dentist') ||
    combined.includes('veterinary') ||
    combined.includes('optometrist')
  ) {
    return 'healthcare';
  }

  // Technology
  if (
    combined.includes('developer') ||
    combined.includes('engineer') ||
    combined.includes('software') ||
    combined.includes('tech') ||
    combined.includes('programmer') ||
    combined.includes('it ') ||
    combined.includes('data') ||
    combined.includes('analyst') ||
    combined.includes('cyber') ||
    combined.includes('web') ||
    combined.includes('frontend') ||
    combined.includes('backend') ||
    combined.includes('fullstack') ||
    combined.includes('devops') ||
    combined.includes('cloud') ||
    combined.includes('ai') ||
    combined.includes('machine learning') ||
    combined.includes('blockchain') ||
    combined.includes('network') ||
    combined.includes('database') ||
    combined.includes('systems')
  ) {
    return 'technology';
  }

  // Finance
  if (
    (combined.includes('finance') ||
      combined.includes('accountant') ||
      combined.includes('bank') ||
      combined.includes('auditor') ||
      combined.includes('investment') ||
      combined.includes('financial') ||
      combined.includes('insurance') ||
      combined.includes('tax') ||
      combined.includes('wealth') ||
      combined.includes('credit') ||
      combined.includes('loan') ||
      combined.includes('broker') ||
      combined.includes('trading') ||
      combined.includes('stock')) &&
    !combined.includes('data analyst')
  ) {
    return 'finance';
  }

  // Hospitality
  if (
    (combined.includes('hotel') ||
      combined.includes('restaurant') ||
      combined.includes('chef') ||
      combined.includes('hospitality') ||
      combined.includes('tourism') ||
      combined.includes('catering') ||
      combined.includes('waiter') ||
      combined.includes('bartender') ||
      combined.includes('cook') ||
      combined.includes('barista') ||
      combined.includes('lodging') ||
      combined.includes('travel') ||
      combined.includes('resort') ||
      combined.includes('cafe')) &&
    !combined.includes('tour guide') &&
    !combined.includes('kenya wildlife service')
  ) {
    return 'hospitality';
  }

  // Agriculture
  if (
    (combined.includes('farm') ||
      combined.includes('agriculture') ||
      combined.includes('crop') ||
      combined.includes('livestock') ||
      combined.includes('agri') ||
      combined.includes('farming') ||
      combined.includes('ranch') ||
      combined.includes('agronomist') ||
      combined.includes('horticulture') ||
      combined.includes('fisheries') ||
      combined.includes('forestry') ||
      combined.includes('dairy') ||
      combined.includes('tea') ||
      combined.includes('coffee') ||
      combined.includes('maize') ||
      combined.includes('wheat') ||
      combined.includes('sugarcane')) &&
    !combined.includes('ministry of agriculture') &&
    !combined.includes('fisheries officer')
  ) {
    return 'agriculture';
  }

  // Construction
  if (
    (combined.includes('construction') ||
      combined.includes('architect') ||
      combined.includes('civil') ||
      combined.includes('builder') ||
      combined.includes('contractor') ||
      combined.includes('surveyor') ||
      combined.includes('foreman') ||
      combined.includes('welding') ||
      combined.includes('mechanical') ||
      combined.includes('electrician') ||
      combined.includes('plumber') ||
      combined.includes('carpenter') ||
      combined.includes('mason') ||
      combined.includes('painter') ||
      combined.includes('roofer') ||
      combined.includes('tiler')) &&
    !combined.includes('civil engineer') &&
    !combined.includes('data')
  ) {
    return 'construction';
  }

  // Retail
  if (
    combined.includes('sales') ||
    combined.includes('retail') ||
    combined.includes('shop') ||
    combined.includes('store') ||
    combined.includes('customer service') ||
    combined.includes('cashier') ||
    combined.includes('merchandiser') ||
    combined.includes('clerk') ||
    combined.includes('associate') ||
    combined.includes('market') ||
    combined.includes('mall') ||
    combined.includes('boutique')
  ) {
    return 'retail';
  }

  // Creative/Design
  if (
    combined.includes('designer') ||
    combined.includes('creative') ||
    combined.includes('artist') ||
    combined.includes('graphic') ||
    combined.includes('marketing') ||
    combined.includes('brand') ||
    combined.includes('ui') ||
    combined.includes('ux') ||
    combined.includes('media') ||
    combined.includes('content') ||
    combined.includes('writer') ||
    combined.includes('photographer') ||
    combined.includes('music') ||
    combined.includes('film') ||
    combined.includes('video') ||
    combined.includes('advertising') ||
    combined.includes('pr ') ||
    combined.includes('public relations')
  ) {
    return 'creative';
  }

  return 'professional';
}

export function getIndustryModelPublicPath(category: JobIndustryModelCategory): string {
  return `/assets/job-thumbnails/${INDUSTRY_MODEL_FILENAMES[category]}`;
}

export function getIndustryModelAbsoluteUrl(
  category: JobIndustryModelCategory,
  origin: string,
): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${getIndustryModelPublicPath(category)}`;
}

/** Edge-safe ArrayBuffer → base64 for data URLs */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, OG_FETCH_TIMEOUT_MS.asset);
    if (!res.ok) {
      console.warn(`Industry model image fetch failed (${res.status}): ${url}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.warn(`Industry model URL was not an image: ${url} (${contentType})`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength) return null;
    return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
  } catch (error) {
    console.warn('Industry model image fetch error:', error);
    return null;
  }
}

/**
 * Fetch one industry thumbnail and return a data URL for @vercel/og.
 * Tries `origin` first (preview/local), then `fallbackOrigin` (production).
 * Returns null on any failure so callers can omit the image (fail soft).
 */
export async function loadIndustryModelDataUrl(
  category: JobIndustryModelCategory,
  origin: string,
  fallbackOrigin = 'https://www.careersasa.co.ke',
): Promise<string | null> {
  const primary = getIndustryModelAbsoluteUrl(category, origin);
  const dataUrl = await fetchImageAsDataUrl(primary);
  if (dataUrl) return dataUrl;

  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedFallback = fallbackOrigin.replace(/\/$/, '');
  if (normalizedOrigin !== normalizedFallback) {
    return fetchImageAsDataUrl(getIndustryModelAbsoluteUrl(category, fallbackOrigin));
  }
  return null;
}
