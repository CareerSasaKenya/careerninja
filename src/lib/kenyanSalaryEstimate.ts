/**
 * Kenyan job-market salary estimates for local roles when source pay is missing.
 *
 * Ranges are intentionally narrow (~1.35–1.5×) so listings show a realistic
 * band instead of "Negotiable" or an overly wide min–max span.
 */

export type KenyanExperienceLevel =
  | 'Internship'
  | 'Entry'
  | 'Mid'
  | 'Senior'
  | 'Managerial'
  | string
  | null
  | undefined

export interface KenyanSalaryEstimateInput {
  title?: string | null
  experienceLevel?: KenyanExperienceLevel
  /** ISO-ish country name/code from job_location_country */
  locationCountry?: string | null
  /** When true, estimate even if country is missing (scrapers default to Kenya). */
  assumeKenyaWhenMissing?: boolean
}

export interface KenyanSalaryEstimate {
  salary_min: number
  salary_max: number
  salary_currency: 'KES'
  salary_period: 'MONTH'
  median: number
  category: string
  is_estimated: true
}

/** Mid-level monthly median (KES) per role family. */
const CATEGORY_MID_MEDIANS: Array<{
  id: string
  keywords: string[]
  median: number
}> = [
  {
    id: 'software_engineer',
    keywords: [
      'software engineer',
      'software developer',
      'full stack',
      'fullstack',
      'backend developer',
      'frontend developer',
      'front-end',
      'back-end',
      'mobile developer',
      'android developer',
      'ios developer',
      'react native',
      'devops',
      'site reliability',
      'sre',
      'platform engineer',
    ],
    median: 180000,
  },
  {
    id: 'data',
    keywords: [
      'data scientist',
      'data engineer',
      'machine learning',
      'ml engineer',
      'ai engineer',
      'data analyst',
      'business intelligence',
      'bi analyst',
    ],
    median: 150000,
  },
  {
    id: 'product',
    keywords: ['product manager', 'product owner', 'product lead'],
    median: 220000,
  },
  {
    id: 'design',
    keywords: [
      'ui/ux',
      'ux designer',
      'ui designer',
      'product designer',
      'graphic designer',
      'visual designer',
    ],
    median: 110000,
  },
  {
    id: 'cybersecurity',
    keywords: [
      'cybersecurity',
      'security analyst',
      'information security',
      'infosec',
      'penetration',
    ],
    median: 180000,
  },
  {
    id: 'qa',
    keywords: ['qa engineer', 'quality assurance', 'test engineer', 'sdet'],
    median: 120000,
  },
  {
    id: 'it_support',
    keywords: [
      'it support',
      'technical support',
      'help desk',
      'helpdesk',
      'system administrator',
      'sysadmin',
      'network engineer',
      'it officer',
    ],
    median: 85000,
  },
  {
    id: 'finance',
    keywords: [
      'accountant',
      'financial analyst',
      'finance manager',
      'finance officer',
      'auditor',
      'credit analyst',
      'treasury',
      'bookkeeper',
      'accounts payable',
      'accounts receivable',
    ],
    median: 120000,
  },
  {
    id: 'banking',
    keywords: [
      'relationship manager',
      'bank teller',
      'credit officer',
      'loan officer',
      'branch manager',
    ],
    median: 130000,
  },
  {
    id: 'hr',
    keywords: [
      'hr officer',
      'human resource',
      'hr manager',
      'talent acquisition',
      'recruiter',
      'people operations',
      'people ops',
    ],
    median: 100000,
  },
  {
    id: 'marketing',
    keywords: [
      'marketing manager',
      'digital marketing',
      'content writer',
      'content creator',
      'social media',
      'brand manager',
      'communications officer',
      'communications manager',
      'seo ',
      'growth marketer',
      'copywriter',
    ],
    median: 110000,
  },
  {
    id: 'sales',
    keywords: [
      'sales representative',
      'sales executive',
      'sales manager',
      'business development',
      'account manager',
      'account executive',
      'commercial officer',
    ],
    median: 100000,
  },
  {
    id: 'operations',
    keywords: [
      'operations manager',
      'operations officer',
      'project manager',
      'program manager',
      'supply chain',
      'logistics',
      'procurement',
      'warehouse',
    ],
    median: 160000,
  },
  {
    id: 'admin',
    keywords: [
      'administrative assistant',
      'office administrator',
      'office assistant',
      'receptionist',
      'executive assistant',
      'personal assistant',
      'clerk',
    ],
    median: 65000,
  },
  {
    id: 'customer_service',
    keywords: [
      'customer service',
      'customer success',
      'call centre',
      'call center',
      'contact centre',
      'contact center',
      'client support',
    ],
    median: 55000,
  },
  {
    id: 'engineering',
    keywords: [
      'civil engineer',
      'electrical engineer',
      'mechanical engineer',
      'structural engineer',
      'quantity surveyor',
      'architect',
    ],
    median: 140000,
  },
  {
    id: 'healthcare',
    keywords: [
      'nurse',
      'clinical officer',
      'doctor',
      'medical officer',
      'pharmacist',
      'lab technologist',
      'laboratory',
      'clinician',
    ],
    median: 90000,
  },
  {
    id: 'education',
    keywords: [
      'teacher',
      'lecturer',
      'tutor',
      'trainer',
      'instructor',
      'academic',
    ],
    median: 75000,
  },
  {
    id: 'legal',
    keywords: [
      'legal officer',
      'advocate',
      'lawyer',
      'attorney',
      'compliance officer',
      'company secretary',
      'paralegal',
    ],
    median: 140000,
  },
  {
    id: 'hospitality',
    keywords: [
      'chef',
      'waiter',
      'waitress',
      'hotel',
      'hospitality',
      'barista',
      'housekeeping',
    ],
    median: 45000,
  },
  {
    id: 'agriculture',
    keywords: ['agronomist', 'agricultural', 'farm manager', 'veterinary'],
    median: 80000,
  },
  {
    id: 'driver',
    keywords: ['driver', 'chauffeur', 'rider', 'courier'],
    median: 40000,
  },
]

const DEFAULT_CATEGORY = { id: 'general', median: 80000 }

/** Multipliers vs mid-level median. */
const LEVEL_MULTIPLIERS: Record<string, number> = {
  internship: 0.35,
  entry: 0.55,
  mid: 1.0,
  senior: 1.65,
  managerial: 2.0,
}

/** Half-width of the displayed band around the median (→ ~1.4× span). */
const BAND_LOW = 0.82
const BAND_HIGH = 1.18
/** Hard cap so ranges never look like "50k–300k". */
const MAX_RANGE_RATIO = 1.5

export function isKenyanLocalJob(
  locationCountry?: string | null,
  assumeKenyaWhenMissing = true
): boolean {
  const raw = String(locationCountry || '').trim().toLowerCase()
  if (!raw) return assumeKenyaWhenMissing
  if (raw === 'ke' || raw === 'ken' || raw.includes('kenya')) return true
  return false
}

export function normalizeExperienceLevelKey(
  experienceLevel?: KenyanExperienceLevel
): keyof typeof LEVEL_MULTIPLIERS {
  const raw = String(experienceLevel || '').trim().toLowerCase()
  if (!raw) return 'mid'
  if (raw.includes('intern')) return 'internship'
  if (raw.includes('entry') || raw.includes('junior') || raw.includes('graduate')) {
    return 'entry'
  }
  if (
    raw.includes('manager') ||
    raw.includes('director') ||
    raw.includes('executive') ||
    raw.includes('head of') ||
    raw === 'managerial'
  ) {
    return 'managerial'
  }
  if (
    raw.includes('senior') ||
    raw.includes('lead') ||
    raw.includes('principal') ||
    raw.includes('staff')
  ) {
    return 'senior'
  }
  return 'mid'
}

function matchCategory(title?: string | null): { id: string; median: number } {
  const t = String(title || '').toLowerCase()
  if (!t.trim()) return DEFAULT_CATEGORY

  for (const cat of CATEGORY_MID_MEDIANS) {
    if (cat.keywords.some((kw) => t.includes(kw))) {
      return { id: cat.id, median: cat.median }
    }
  }

  // Soft fallbacks for generic title words
  if (/\b(engineer|developer|programmer)\b/.test(t)) {
    return { id: 'software_engineer', median: 160000 }
  }
  if (/\b(manager|supervisor)\b/.test(t)) {
    return { id: 'operations', median: 140000 }
  }
  if (/\b(officer|coordinator|specialist|analyst)\b/.test(t)) {
    return { id: 'general', median: 90000 }
  }
  if (/\b(assistant|intern)\b/.test(t)) {
    return { id: 'admin', median: 50000 }
  }

  return DEFAULT_CATEGORY
}

/** Round to nearest 5,000 KES for readable bands. */
export function roundKes(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.max(5000, Math.round(amount / 5000) * 5000)
}

/**
 * Tighten an arbitrary min/max (e.g. from salary_data aggregates) around a median.
 * Keeps the band narrow while staying inside the original span when possible.
 */
export function narrowSalaryRange(
  min: number,
  max: number,
  median?: number | null
): { min: number; max: number; median: number } {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const mid =
    median != null && Number.isFinite(median) && median > 0
      ? median
      : (lo + hi) / 2

  let nextMin = mid * BAND_LOW
  let nextMax = mid * BAND_HIGH

  // Prefer staying inside the known market span when it is already narrow-ish
  if (hi / Math.max(lo, 1) <= MAX_RANGE_RATIO * 1.15) {
    nextMin = Math.max(lo, nextMin)
    nextMax = Math.min(hi, nextMax)
  }

  if (nextMax / Math.max(nextMin, 1) > MAX_RANGE_RATIO) {
    nextMax = nextMin * MAX_RANGE_RATIO
  }
  if (nextMin >= nextMax) {
    nextMin = mid * BAND_LOW
    nextMax = mid * BAND_HIGH
  }

  return {
    min: roundKes(nextMin),
    max: roundKes(nextMax),
    median: roundKes(mid),
  }
}

/**
 * Synchronous Kenyan market estimate from title + experience level.
 * Safe for client and server; no network required.
 */
export function estimateKenyanSalary(
  input: KenyanSalaryEstimateInput
): KenyanSalaryEstimate | null {
  if (!isKenyanLocalJob(input.locationCountry, input.assumeKenyaWhenMissing !== false)) {
    return null
  }

  const category = matchCategory(input.title)
  const levelKey = normalizeExperienceLevelKey(input.experienceLevel)
  const multiplier = LEVEL_MULTIPLIERS[levelKey] ?? 1

  // Title-implied seniority can bump a Mid default (e.g. "Senior Accountant")
  let effectiveMultiplier = multiplier
  const titleLower = String(input.title || '').toLowerCase()
  if (levelKey === 'mid') {
    if (/\b(intern|internship|graduate trainee|attachment)\b/.test(titleLower)) {
      effectiveMultiplier = LEVEL_MULTIPLIERS.internship
    } else if (/\b(junior|entry[- ]level|graduate)\b/.test(titleLower)) {
      effectiveMultiplier = LEVEL_MULTIPLIERS.entry
    } else if (/\b(senior|lead|principal|head)\b/.test(titleLower)) {
      effectiveMultiplier = LEVEL_MULTIPLIERS.senior
    } else if (/\b(director|manager|vp|chief)\b/.test(titleLower)) {
      effectiveMultiplier = LEVEL_MULTIPLIERS.managerial
    }
  }

  const median = category.median * effectiveMultiplier
  const narrowed = narrowSalaryRange(median * BAND_LOW, median * BAND_HIGH, median)

  return {
    salary_min: narrowed.min,
    salary_max: narrowed.max,
    salary_currency: 'KES',
    salary_period: 'MONTH',
    median: narrowed.median,
    category: category.id,
    is_estimated: true,
  }
}

export function formatKenyanSalaryRange(
  estimate: Pick<KenyanSalaryEstimate, 'salary_min' | 'salary_max' | 'salary_currency' | 'salary_period'>,
  options?: { estimated?: boolean }
): string {
  const period = estimate.salary_period
    ? ` / ${estimate.salary_period.toLowerCase()}`
    : ''
  const range = `${estimate.salary_currency} ${estimate.salary_min.toLocaleString()} – ${estimate.salary_max.toLocaleString()}${period}`
  return options?.estimated ? `Est. ${range}` : range
}

/**
 * Resolve display salary: prefer stated numbers, else Kenyan market estimate
 * for local jobs, else null (caller may fall back to Negotiable for non-local).
 */
export function resolveJobSalaryDisplay(params: {
  salaryMin?: number | null
  salaryMax?: number | null
  salary?: string | null
  salaryCurrency?: string | null
  salaryPeriod?: string | null
  salaryIsEstimated?: boolean | null
  salaryVisibility?: string | null
  title?: string | null
  experienceLevel?: string | null
  locationCountry?: string | null
}): { display: string; isEstimated: boolean } {
  // Employers can opt out of showing any salary figure (salary_visibility = 'Hide').
  // Respect it everywhere this resolver is used so the page never shows a salary
  // the employer chose to hide (and Google never sees page content that contradicts
  // the absence of baseSalary in the markup).
  if (params.salaryVisibility === 'Hide') {
    return { display: 'Negotiable', isEstimated: false }
  }

  const currency = params.salaryCurrency || 'KES'
  const period = params.salaryPeriod ? ` / ${params.salaryPeriod.toLowerCase()}` : ''

  const hasMin = params.salaryMin != null && Number.isFinite(params.salaryMin)
  const hasMax = params.salaryMax != null && Number.isFinite(params.salaryMax)

  if (hasMin && hasMax) {
    const range = `${currency} ${Number(params.salaryMin).toLocaleString()} – ${Number(params.salaryMax).toLocaleString()}${period}`
    return {
      display: params.salaryIsEstimated ? `Est. ${range}` : range,
      isEstimated: !!params.salaryIsEstimated,
    }
  }
  if (hasMin || hasMax) {
    const amount = hasMin ? params.salaryMin : params.salaryMax
    const range = `${currency} ${Number(amount).toLocaleString()}${period}`
    return {
      display: params.salaryIsEstimated ? `Est. ${range}` : range,
      isEstimated: !!params.salaryIsEstimated,
    }
  }

  if (params.salary && String(params.salary).trim()) {
    const text = String(params.salary).trim()
    if (!/^negotiable$/i.test(text)) {
      return { display: text, isEstimated: false }
    }
  }

  const estimate = estimateKenyanSalary({
    title: params.title,
    experienceLevel: params.experienceLevel,
    locationCountry: params.locationCountry,
  })

  if (estimate) {
    return {
      display: formatKenyanSalaryRange(estimate, { estimated: true }),
      isEstimated: true,
    }
  }

  return { display: 'Negotiable', isEstimated: false }
}

/**
 * Apply estimate onto a job payload when source salary is missing (scrape path).
 */
export function applyKenyanSalaryEstimateIfMissing<T extends Record<string, any>>(
  jobFields: T,
  opts?: { title?: string | null; experienceLevel?: string | null; locationCountry?: string | null }
): T & {
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_period: string
  salary_is_estimated: boolean
} {
  const hasMin = jobFields.salary_min != null && Number.isFinite(jobFields.salary_min)
  const hasMax = jobFields.salary_max != null && Number.isFinite(jobFields.salary_max)

  if (hasMin || hasMax) {
    return {
      ...jobFields,
      salary_min: jobFields.salary_min ?? null,
      salary_max: jobFields.salary_max ?? null,
      salary_currency: jobFields.salary_currency || 'KES',
      salary_period: jobFields.salary_period || 'MONTH',
      salary_is_estimated: false,
    }
  }

  const estimate = estimateKenyanSalary({
    title: opts?.title ?? jobFields.title,
    experienceLevel: opts?.experienceLevel ?? jobFields.experience_level,
    locationCountry:
      opts?.locationCountry ?? jobFields.job_location_country ?? 'Kenya',
  })

  if (!estimate) {
    return {
      ...jobFields,
      salary_min: null,
      salary_max: null,
      salary_currency: jobFields.salary_currency || 'KES',
      salary_period: jobFields.salary_period || 'MONTH',
      salary_is_estimated: false,
    }
  }

  return {
    ...jobFields,
    salary_min: estimate.salary_min,
    salary_max: estimate.salary_max,
    salary_currency: estimate.salary_currency,
    salary_period: estimate.salary_period,
    salary_is_estimated: true,
  }
}

/** True when PostgREST/Postgres rejects unknown salary_is_estimated column. */
export function isMissingSalaryEstimatedColumnError(error: unknown): boolean {
  const message = String(
    error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : error || ''
  ).toLowerCase()
  return (
    message.includes('salary_is_estimated') &&
    (message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find'))
  )
}

/**
 * Drop salary_is_estimated for environments where the migration is not applied yet.
 */
export function withoutSalaryEstimatedFlag<T extends Record<string, any>>(
  payload: T
): Omit<T, 'salary_is_estimated'> {
  const { salary_is_estimated: _ignored, ...rest } = payload
  return rest
}
