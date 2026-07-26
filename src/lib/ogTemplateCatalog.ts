/**
 * Catalog of CareerSasa job OG / social card templates.
 * Kept templates: 2 (default), 4, 5.
 */

export type OgTemplateId = '2' | '4' | '5';

export type OgTemplateReviewStatus =
  | 'pending'
  | 'approved'
  | 'needs_changes'
  | 'rejected';

export type OgTemplateReview = {
  status: OgTemplateReviewStatus;
  notes: string;
  updatedAt: string | null;
};

export type OgTemplateReviewsMap = Partial<Record<OgTemplateId, OgTemplateReview>>;

/** app_settings key that stores JSON reviews for all OG templates */
export const OG_TEMPLATE_REVIEWS_SETTING_KEY = 'og_template_reviews';

export const OG_TEMPLATE_CATALOG: Array<{
  id: OgTemplateId;
  name: string;
  description: string;
  /** Query value for /api/og/job/{id}?template= — empty = default */
  queryValue: string | null;
  accent: string;
  isDefault?: boolean;
}> = [
  {
    id: '2',
    name: 'Light Split Panel',
    description:
      'Default. White left / blue diagonal right, MetaTiles, orange arc, “Don’t wait” text.',
    queryValue: null,
    accent: 'bg-sky-100 text-sky-800',
    isDefault: true,
  },
  {
    id: '4',
    name: 'Light Hex Frame',
    description: 'Light editorial card with CareerSasa blue hexagonal portrait frame.',
    queryValue: '4',
    accent: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: '5',
    name: 'LinkedIn Blue',
    description: 'Medium LinkedIn-blue gradient, circular portrait, white footer.',
    queryValue: '5',
    accent: 'bg-cyan-100 text-cyan-900',
  },
];

export function buildOgPreviewUrl(
  jobIdOrSlug: string,
  templateId: OgTemplateId,
  size: string = 'og',
  bustCache = true,
): string {
  const entry = OG_TEMPLATE_CATALOG.find((t) => t.id === templateId);
  const params = new URLSearchParams();
  if (entry?.queryValue) params.set('template', entry.queryValue);
  if (size && size !== 'og') params.set('size', size);
  if (bustCache) params.set('t', String(Date.now()));
  const qs = params.toString();
  return `/api/og/job/${encodeURIComponent(jobIdOrSlug)}${qs ? `?${qs}` : ''}`;
}

export function emptyReview(): OgTemplateReview {
  return { status: 'pending', notes: '', updatedAt: null };
}

export function parseOgTemplateReviews(raw: string | null | undefined): OgTemplateReviewsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as OgTemplateReviewsMap;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}
