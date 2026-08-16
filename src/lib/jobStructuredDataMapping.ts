/**
 * JobPosting JSON-LD value mappers.
 *
 * Google's JobPosting parser is strict about a few fields:
 *  - jobLocationType only accepts "TELECOMMUTE" (100% remote only)
 *  - experienceRequirements prefers OccupationalExperienceRequirements.monthsOfExperience
 *  - educationRequirements prefers EducationalOccupationalCredential.credentialCategory
 *  - addressCountry should be an ISO 3166-1 alpha-2 code
 *
 * These helpers FAIL SAFE: when the underlying data is missing, uncertain, or
 * would produce an invalid/estimated value, they return undefined so the
 * property is omitted from the markup instead of being fabricated.
 */

import type { Database } from '@/integrations/supabase/types'

export type JobForSchema = Database['public']['Tables']['jobs']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row'] | null
  salary_is_estimated?: boolean | null
}

const ISO_COUNTRY: Record<string, string> = {
  kenya: 'KE',
  'united states': 'US',
  usa: 'US',
  america: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  england: 'GB',
  'great britain': 'GB',
  'united arab emirates': 'AE',
  uae: 'AE',
  'south africa': 'ZA',
  tanzania: 'TZ',
  uganda: 'UG',
  rwanda: 'RW',
  burundi: 'BI',
  nigeria: 'NG',
  ghana: 'GH',
  ethiopia: 'ET',
  'south sudan': 'SS',
  sudan: 'SD',
  somalia: 'SO',
  'democratic republic of congo': 'CD',
  congo: 'CD',
  egypt: 'EG',
  india: 'IN',
  china: 'CN',
  germany: 'DE',
  france: 'FR',
  canada: 'CA',
  australia: 'AU',
  ireland: 'IE',
  netherlands: 'NL',
  sweden: 'SE',
  switzerland: 'CH',
  qatar: 'QA',
  'saudi arabia': 'SA',
  oman: 'OM',
  bahrain: 'BH',
  kuwait: 'KW',
  botswana: 'BW',
  zambia: 'ZM',
  zimbabwe: 'ZW',
  malawi: 'MW',
  mozambique: 'MZ',
  mauritius: 'MU',
  madagascar: 'MG',
}

/** Normalize a country value to an ISO 3166-1 alpha-2 code. */
export function isoCountryCode(value?: string | null): string | undefined {
  if (!value) return undefined
  const key = value.trim().toLowerCase()
  if (ISO_COUNTRY[key]) return ISO_COUNTRY[key]
  if (/^[a-z]{2}$/i.test(key)) return value.trim().toUpperCase()
  return undefined
}

const REMOTE_LOCATION_TOKENS =
  /\b(remote|virtual|work from home|work-from-home|wfh|online|anywhere|nationwide|hybrid)\b/i

const STREET_HINTS =
  /\b(road|rd|street|st\.|avenue|ave\.|lane|drive|dr\.|close|place|way|boulevard|blvd|highway|hwy|building|tower|plaza|house|office|floor|block|plot|suite|wing|park|centre|center|mall|junction|estate|off|along|behind|near|opposite|junction)\b/i

function splitLocationParts(location: string): string[] {
  return location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function isCountryToken(value: string): boolean {
  const key = value.trim().toLowerCase().replace(/\.$/, '')
  return ISO_COUNTRY[key] !== undefined
}

function looksLikeStreet(value: string): boolean {
  return /\d/.test(value) || STREET_HINTS.test(value)
}

function isRemoteLocation(value: string): boolean {
  return REMOTE_LOCATION_TOKENS.test(value)
}

/**
 * Build the jobLocation object as Place → PostalAddress, per Google's rule that
 * jobLocation.address must exist.
 * - addressCountry is always an ISO code (defaults to KE for this Kenyan site).
 * - streetAddress only when the location text actually looks like a street.
 * - locality/region only when we have a real city/county (never "Kenya" everywhere).
 * - 100% remote roles have no physical office → returns undefined so jobLocation
 *   is omitted entirely; Google allows this when applicantLocationRequirements is set.
 */
export function resolveJobAddress(
  job: JobForSchema
): {
  '@type': 'Place'
  address: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    addressCountry: string
  }
} | undefined {
  const rawLocation = (job.location || '').trim()
  const country = isoCountryCode(job.job_location_country) || 'KE'

  // 100% remote roles: no physical office. jobLocation is omitted and the role is
  // represented by jobLocationType: TELECOMMUTE + applicantLocationRequirements,
  // which avoids any contradictory jobLocation/remote data.
  if (job.job_location_type === 'REMOTE') {
    return undefined
  }

  // Location text alone says "remote" (e.g. "Remote, Kenya") but the DB type is
  // not REMOTE: keep a country-level address so the posting still has a location
  // signal, without inventing a city.
  if (rawLocation && isRemoteLocation(rawLocation)) {
    return {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: country },
    }
  }

  const parts = splitLocationParts(rawLocation).filter((p) => !isRemoteLocation(p))
  const nonCountryParts = parts.filter((p) => !isCountryToken(p))

  const city = job.job_location_city?.trim() || undefined
  const county = job.job_location_county?.trim() || undefined

  // Last non-country, non-street token is usually the city ("Nairobi, Kenya" → Nairobi).
  const derivedCity =
    nonCountryParts.filter((p) => !looksLikeStreet(p))[
      nonCountryParts.filter((p) => !looksLikeStreet(p)).length - 1
    ] || undefined

  const streetAddress = looksLikeStreet(rawLocation) ? rawLocation : undefined

  const address: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    addressCountry: string
  } = { '@type': 'PostalAddress', addressCountry: country }

  if (streetAddress) address.streetAddress = streetAddress
  if (city || derivedCity) address.addressLocality = city || derivedCity
  if (county) address.addressRegion = county

  return { '@type': 'Place', address }
}

/** Map DB experience data to Google's expected structured form. */
export function resolveExperienceRequirements(job: JobForSchema) {
  const minYears = job.minimum_experience
  if (minYears != null && Number.isFinite(minYears) && minYears > 0) {
    const months = Math.round(Math.min(minYears, 50) * 12)
    return {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: months,
    }
  }
  // Fallback: experience_level labels map to a representative minimum.
  const LEVEL_MONTHS: Record<string, number> = {
    Mid: 24,
    Senior: 48,
    Managerial: 60,
  }
  if (job.experience_level) {
    const months = LEVEL_MONTHS[job.experience_level]
    if (months) {
      return {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: months,
      }
    }
  }
  return undefined
}

const CREDENTIAL_HINTS: Array<{ category: string; pattern: RegExp }> = [
  {
    category: 'postgraduate degree',
    pattern: /\b(masters?|postgraduate|mba|phd|doctorate)\b/i,
  },
  {
    category: 'bachelor degree',
    pattern:
      /\b(bachelor|degree|bsc|b\.?\s?sc|ba\b|b\.?\s?a\b|bcom|b\.?\s?com|llb|beng|b\.?\s?eng|hnd)\b/i,
  },
  { category: 'associate degree', pattern: /\bdiploma\b/i },
  {
    category: 'high school',
    pattern: /\b(kcse|high school|secondary|o.level|form four|school certificate)\b/i,
  },
  {
    category: 'professional certificate',
    pattern: /\b(certificate|certification|trade test|craft certificate)\b/i,
  },
]

const EDUCATION_ORDER = [
  'postgraduate degree',
  'bachelor degree',
  'associate degree',
  'professional certificate',
  'high school',
]

const ADDED_ADVANTAGE = /\b(added advantage|preferred|an advantage|preferable|desirable|plus)\b/i

/**
 * Map free-text education requirements to Google's credentialCategory enum.
 * Emits the MINIMUM level actually required (Google wants the floor, e.g.
 * "Degree or Diploma" → associate degree; "BSc ... MSc an added advantage" → bachelor).
 * Returns undefined when nothing recognizable is present (property omitted).
 */
export function resolveEducationRequirements(text?: string | null) {
  if (!text || !text.trim()) return undefined
  const t = text.trim()

  if (/\b(no education|no formal|no specific education)\b/i.test(t)) {
    return { '@type': 'EducationalOccupationalCredential', credentialCategory: 'no requirements' }
  }

  const matched = new Set<string>()
  for (const hint of CREDENTIAL_HINTS) {
    if (hint.pattern.test(t)) matched.add(hint.category)
  }
  if (matched.size === 0) return undefined

  let present = EDUCATION_ORDER.filter((c) => matched.has(c))

  // A Master's mentioned as an "added advantage" is not the minimum requirement.
  if (present.includes('postgraduate degree') && ADDED_ADVANTAGE.test(t)) {
    present = present.filter((c) => c !== 'postgraduate degree')
  }
  // "Certificate / certification / trade test" alongside a degree or diploma is
  // usually a technical add-on ("Certification in Fibre technology"), not the
  // education bar — drop it unless it's the only credential mentioned.
  if (
    present.includes('professional certificate') &&
    present.some((c) => c !== 'professional certificate')
  ) {
    present = present.filter((c) => c !== 'professional certificate')
  }
  if (present.length === 0) return undefined

  // Minimum required level = the lowest-ranked credential present.
  const credentialCategory = present[present.length - 1]
  return { '@type': 'EducationalOccupationalCredential', credentialCategory }
}

/** Only 100%-remote roles may be marked TELECOMMUTE. Never emit ON_SITE/HYBRID. */
export function resolveJobLocationType(job: JobForSchema): string | undefined {
  if (job.job_location_type === 'REMOTE') return 'TELECOMMUTE'
  return undefined
}

/** Remote roles need a country of eligibility. */
export function resolveApplicantLocationRequirements(job: JobForSchema) {
  if (job.job_location_type !== 'REMOTE') return undefined
  return {
    '@type': 'Country',
    name: job.job_location_country?.trim() || 'Kenya',
  }
}

/** A valid ISO date only when we actually know it — never fabricate. */
export function resolveDatePosted(job: JobForSchema): string | undefined {
  if (!job.date_posted) return undefined
  const d = new Date(job.date_posted)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

/** Emit validThrough only when the job has a real deadline. */
export function resolveValidThrough(job: JobForSchema): string | undefined {
  const source = job.valid_through || job.expires_at
  if (!source) return undefined
  const d = new Date(source)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

/**
 * A logo is only safe to emit when it's a curated/verified company logo.
 * Favicon-CDN placeholders (gstatic, logo.dev, clearbit) are not company logos
 * and fail Google's logo guidelines, so they're omitted from markup.
 */
export function isSchemaLogoPlaceholder(url?: string | null): boolean {
  if (!url) return true
  return /gstatic\.com\/faviconV2|img\.logo\.dev|logo\.clearbit\.com|unavatar\.io|website-thumbnail/i.test(
    url
  )
}
