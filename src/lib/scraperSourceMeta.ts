export type ScraperAdapterType =
  | 'workable'
  | 'smartrecruiters'
  | 'greenhouse'
  | 'psc'
  | 'psc_pdf'
  | 'html'
  | 'unknown'

export type ScraperSourceCategory = 'government' | 'employer' | 'ngo' | 'other'

export function getAdapterType(selectors: unknown): ScraperAdapterType {
  const type = (selectors as { type?: string })?.type
  if (
    type === 'workable' ||
    type === 'smartrecruiters' ||
    type === 'greenhouse' ||
    type === 'psc' ||
    type === 'psc_pdf'
  ) {
    return type
  }
  if (type) return 'html'
  return 'unknown'
}

export function getSourceCategory(selectors: unknown): ScraperSourceCategory {
  const category = (selectors as { category?: string })?.category
  if (category === 'government' || category === 'employer' || category === 'ngo') return category
  return 'other'
}

export const ADAPTER_LABELS: Record<ScraperAdapterType, string> = {
  workable: 'Workable ATS',
  smartrecruiters: 'SmartRecruiters ATS',
  greenhouse: 'Greenhouse ATS',
  psc: 'PSC Portal (listing table)',
  psc_pdf: 'PSC PDF Adverts (full detail)',
  html: 'HTML / CSS',
  unknown: 'Unknown',
}

export const CATEGORY_LABELS: Record<ScraperSourceCategory, string> = {
  government: 'Government',
  employer: 'Employer',
  ngo: 'NGO',
  other: 'Other',
}
