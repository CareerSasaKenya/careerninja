const SITE_URL = "https://www.careersasa.co.ke";

export type CmsPage = {
  slug: string;
  label: string;
  defaultUrl?: string;
  defaultCanonical?: string;
  hasSeo: boolean;
};

export type DefaultSection = {
  section_key: string;
  content_type: "text" | "html" | "json" | "number";
  content_value: string;
  metadata?: Record<string, string>;
};

/**
 * Pages the admin Content Editor (and SEO Manager) can manage.
 * Keep this in sync with public site chrome and jobs browse hubs.
 */
export const CMS_PAGES: CmsPage[] = [
  { slug: "navigation", label: "Navigation", hasSeo: false },
  {
    slug: "home",
    label: "Homepage",
    defaultUrl: "/",
    defaultCanonical: `${SITE_URL}/`,
    hasSeo: true,
  },
  {
    slug: "jobs",
    label: "All Jobs",
    defaultUrl: "/jobs",
    defaultCanonical: `${SITE_URL}/jobs`,
    hasSeo: true,
  },
  {
    slug: "jobs-industries",
    label: "Jobs by Industry",
    defaultUrl: "/jobs/industries",
    defaultCanonical: `${SITE_URL}/jobs/industries`,
    hasSeo: true,
  },
  {
    slug: "jobs-functions",
    label: "Jobs by Function",
    defaultUrl: "/jobs/functions",
    defaultCanonical: `${SITE_URL}/jobs/functions`,
    hasSeo: true,
  },
  {
    slug: "jobs-counties",
    label: "Jobs by County",
    defaultUrl: "/jobs/counties",
    defaultCanonical: `${SITE_URL}/jobs/counties`,
    hasSeo: true,
  },
  {
    slug: "services-cv",
    label: "CV Services",
    defaultUrl: "/services/cv",
    defaultCanonical: `${SITE_URL}/services/cv`,
    hasSeo: true,
  },
  {
    slug: "services-linkedin",
    label: "LinkedIn Services",
    defaultUrl: "/services/linkedin",
    defaultCanonical: `${SITE_URL}/services/linkedin`,
    hasSeo: true,
  },
  {
    slug: "services-cover-letter",
    label: "Cover Letter Services",
    defaultUrl: "/services/cover-letter",
    defaultCanonical: `${SITE_URL}/services/cover-letter`,
    hasSeo: true,
  },
  {
    slug: "about",
    label: "About Page",
    defaultUrl: "/about",
    defaultCanonical: `${SITE_URL}/about`,
    hasSeo: true,
  },
  {
    slug: "contact",
    label: "Contact Page",
    defaultUrl: "/contact",
    defaultCanonical: `${SITE_URL}/contact`,
    hasSeo: true,
  },
];

export const SEO_CMS_PAGES = CMS_PAGES.filter((page) => page.hasSeo);

/** Default copy for new / missing CMS keys so the editor stays aligned with the live site. */
export const DEFAULT_PAGE_CONTENT: Record<string, DefaultSection[]> = {
  navigation: [
    {
      section_key: "nav_browse_label",
      content_type: "text",
      content_value: "Browse Jobs",
      metadata: { location: "header", note: "Desktop and mobile nav trigger" },
    },
    {
      section_key: "nav_browse_all_jobs",
      content_type: "text",
      content_value: "All jobs",
      metadata: { href: "/jobs" },
    },
    {
      section_key: "nav_browse_all_jobs_description",
      content_type: "text",
      content_value: "Search and filter every live role",
    },
    {
      section_key: "nav_browse_by_industry",
      content_type: "text",
      content_value: "By industry",
      metadata: { href: "/jobs/industries" },
    },
    {
      section_key: "nav_browse_by_industry_description",
      content_type: "text",
      content_value: "See which sectors are hiring now",
    },
    {
      section_key: "nav_browse_by_function",
      content_type: "text",
      content_value: "By function",
      metadata: { href: "/jobs/functions" },
    },
    {
      section_key: "nav_browse_by_function_description",
      content_type: "text",
      content_value: "Browse jobs by what you do",
    },
    {
      section_key: "nav_browse_by_county",
      content_type: "text",
      content_value: "By county",
      metadata: { href: "/jobs/counties" },
    },
    {
      section_key: "nav_browse_by_county_description",
      content_type: "text",
      content_value: "Find roles across Kenya's 47 counties",
    },
  ],
  jobs: [
    {
      section_key: "hero_title",
      content_type: "text",
      content_value: "Find Your Next Job in Kenya",
    },
    {
      section_key: "hero_subtitle",
      content_type: "text",
      content_value:
        "Verified jobs from real employers, updated daily. Apply now. Early applicants get 4x more interview callbacks.",
    },
  ],
  "jobs-industries": [
    {
      section_key: "eyebrow",
      content_type: "text",
      content_value: "Browse jobs",
    },
    {
      section_key: "hero_title",
      content_type: "text",
      content_value: "Jobs by Industry",
    },
    {
      section_key: "hero_subtitle",
      content_type: "text",
      content_value:
        "Pick a sector to see live roles. Industry names are shown in full so you can compare hiring at a glance.",
    },
  ],
  "jobs-functions": [
    {
      section_key: "eyebrow",
      content_type: "text",
      content_value: "Browse jobs",
    },
    {
      section_key: "hero_title",
      content_type: "text",
      content_value: "Jobs by Function",
    },
    {
      section_key: "hero_subtitle",
      content_type: "text",
      content_value:
        "Every field we hire for — including those with no live roles right now. Search, sort, and click through to open jobs.",
    },
  ],
  "jobs-counties": [
    {
      section_key: "eyebrow",
      content_type: "text",
      content_value: "Browse jobs",
    },
    {
      section_key: "hero_title",
      content_type: "text",
      content_value: "Jobs by County",
    },
    {
      section_key: "hero_subtitle",
      content_type: "text",
      content_value:
        "The interactive map belongs here — tap a county or pick from the ranked list to see live jobs nearby.",
    },
  ],
};

export function getMissingDefaultSections(
  pageSlug: string,
  existingKeys: Iterable<string>
): DefaultSection[] {
  const defaults = DEFAULT_PAGE_CONTENT[pageSlug] ?? [];
  const existing = new Set(existingKeys);
  return defaults.filter((section) => !existing.has(section.section_key));
}
