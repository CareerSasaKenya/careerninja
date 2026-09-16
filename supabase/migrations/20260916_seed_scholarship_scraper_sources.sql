-- ============================================================
-- Seed scholarship aggregator + flagship-programme scraper sources
-- ============================================================
-- Discover uses type=scholarship_feed (RSS / WP REST / HTML / one
-- canonical programme URL) or BrighterMonday with scholarshipOnly.
-- Process classifies listing_kind=scholarship and labelled Facts.
-- Safe to re-run (ON CONFLICT).
-- ============================================================

BEGIN;

INSERT INTO public.scraper_sources (source_id, name, base_url, is_active, selectors)
VALUES
(
  'opportunitydesk-scholarships',
  'Opportunity Desk Scholarships',
  'https://opportunitydesk.org/feed/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "ngo",
    "sourceKind": "scholarship",
    "company": "Opportunity Desk",
    "location": "Kenya",
    "feedUrls": [
      "https://opportunitydesk.org/feed/",
      "https://opportunitydesk.org/category/scholarships/feed/"
    ],
    "listingUrls": [
      "https://opportunitydesk.org/category/scholarships/"
    ],
    "linkInclude": "opportunitydesk\\.org/\\d{4}/\\d{2}/",
    "kenyaOrAfricaOnly": true,
    "scholarshipOnly": true,
    "maxItems": 40
  }'::jsonb
),
(
  'afterschoolafrica-kenya',
  'After School Africa Kenya',
  'https://www.afterschoolafrica.com/tag/kenya/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "ngo",
    "sourceKind": "scholarship",
    "company": "After School Africa",
    "location": "Kenya",
    "feedUrls": [
      "https://www.afterschoolafrica.com/feed/"
    ],
    "listingUrls": [
      "https://www.afterschoolafrica.com/tag/kenya/",
      "https://www.afterschoolafrica.com/country/kenya/"
    ],
    "wpRestUrls": [
      "https://www.afterschoolafrica.com/wp-json/wp/v2/posts?search=kenya&per_page=20"
    ],
    "programmeUrls": [
      "https://www.afterschoolafrica.com/tag/kenya/"
    ],
    "applyUrl": "https://www.afterschoolafrica.com/tag/kenya/",
    "fallbackTitle": "After School Africa scholarships for Kenyans",
    "fallbackHtml": "<p>After School Africa lists scholarships and fellowships open to Kenyan and African students. When the listing feed is reachable, individual awards are imported automatically. Otherwise use this Kenya tag as the starting point and follow each post’s official apply link.</p>",
    "linkInclude": "afterschoolafrica\\.com/(?!tag/|category/|country/|feed)[a-z0-9-]+",
    "kenyaOrAfricaOnly": true,
    "scholarshipOnly": true,
    "maxItems": 30
  }'::jsonb
),
(
  'scholars4dev-kenya',
  'Scholars4Dev Kenya / Africa',
  'https://www.scholars4dev.com/category/country/africa-scholarships/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "ngo",
    "sourceKind": "scholarship",
    "company": "Scholars4Dev",
    "location": "Kenya",
    "listingUrls": [
      "https://www.scholars4dev.com/category/country/africa-scholarships/",
      "https://www.scholars4dev.com/?s=kenya"
    ],
    "wpRestUrls": [
      "https://www.scholars4dev.com/wp-json/wp/v2/posts?search=kenya&per_page=20",
      "https://www.scholars4dev.com/wp-json/wp/v2/posts?categories=43&per_page=20"
    ],
    "linkInclude": "scholars4dev\\.com/\\d+/",
    "kenyaOrAfricaOnly": true,
    "scholarshipOnly": true,
    "maxItems": 40
  }'::jsonb
),
(
  'opportunitiesforafricans-scholarships',
  'Opportunities For Africans Scholarships',
  'https://www.opportunitiesforafricans.com/category/scholarships/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "ngo",
    "sourceKind": "scholarship",
    "company": "Opportunities For Africans",
    "location": "Kenya",
    "feedUrls": [
      "https://www.opportunitiesforafricans.com/category/scholarships/feed/"
    ],
    "listingUrls": [
      "https://www.opportunitiesforafricans.com/category/scholarships/"
    ],
    "linkInclude": "opportunitiesforafricans\\.com/(?!category/|tag/|author/|page/|wp-|feed)[a-z0-9-]{10,}",
    "kenyaOrAfricaOnly": false,
    "scholarshipOnly": true,
    "maxItems": 40
  }'::jsonb
),
(
  'chevening-scholarships',
  'Chevening Scholarships',
  'https://www.chevening.org/scholarships/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "government",
    "sourceKind": "scholarship",
    "company": "Chevening",
    "location": "Kenya",
    "programmeUrls": [
      "https://www.chevening.org/scholarships/"
    ],
    "applyUrl": "https://www.chevening.org/apply/",
    "fallbackTitle": "Chevening Scholarships (Kenya)",
    "fallbackHtml": "<p>Chevening Scholarships are the UK government global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations. They are awarded to outstanding professionals with leadership potential, including Kenyan citizens, to pursue a one-year master’s degree in the UK.</p><p>Apply on the official Chevening website. Check the current application cycle, eligible courses, and Kenya-specific guidance before you submit.</p>",
    "maxItems": 1
  }'::jsonb
),
(
  'commonwealth-masters',
  'Commonwealth Master’s Scholarships',
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "government",
    "sourceKind": "scholarship",
    "company": "Commonwealth Scholarship Commission",
    "location": "Kenya",
    "programmeUrls": [
      "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/"
    ],
    "applyUrl": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    "fallbackTitle": "Commonwealth Master’s Scholarships",
    "fallbackHtml": "<p>Commonwealth Master’s Scholarships support candidates from eligible low and middle income Commonwealth countries, including Kenya, to undertake full-time taught master’s study at a UK university.</p><p>The programme is funded by the UK Foreign, Commonwealth &amp; Development Office and administered by the Commonwealth Scholarship Commission. Review current eligibility, nominating agencies, and deadlines on the CSC site before applying.</p>",
    "maxItems": 1
  }'::jsonb
),
(
  'fulbright-kenya',
  'Fulbright Kenya Exchange Programs',
  'https://ke.usembassy.gov/u-s-kenya-exchange-programs/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "government",
    "sourceKind": "scholarship",
    "company": "Fulbright Kenya",
    "location": "Kenya",
    "programmeUrls": [
      "https://ke.usembassy.gov/u-s-kenya-exchange-programs/"
    ],
    "applyUrl": "https://ke.usembassy.gov/u-s-kenya-exchange-programs/",
    "fallbackTitle": "U.S. – Kenya Exchange Programs (Fulbright)",
    "fallbackHtml": "<p>The Fulbright Program and related U.S. government academic exchanges for Kenyans are administered through the U.S. Embassy in Nairobi. Awards typically include the Fulbright Foreign Student Program, Fulbright Scholar Program, and other study/research exchanges.</p><p>Use the Embassy’s U.S.–Kenya exchange programmes page for current eligibility, deadlines, and application instructions.</p>",
    "maxItems": 1
  }'::jsonb
),
(
  'daad-scholarships',
  'DAAD Scholarships Kenya',
  'https://www.daad.de/en/studying-in-germany/scholarships/',
  true,
  '{
    "type": "scholarship_feed",
    "category": "government",
    "sourceKind": "scholarship",
    "company": "DAAD",
    "location": "Kenya",
    "programmeUrls": [
      "https://www.daad.de/en/studying-in-germany/scholarships/"
    ],
    "applyUrl": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
    "fallbackTitle": "DAAD Scholarships for Kenyan Students",
    "fallbackHtml": "<p>DAAD (German Academic Exchange Service) funds scholarships and research grants for Kenyan students, graduates, and academics to study or research in Germany. Awards range from master’s and PhD scholarships to short research stays.</p><p>Search currently open programmes in the DAAD scholarship database and apply on the official DAAD portal. Kenya-specific calls are published when the Nairobi office opens a new cycle.</p>",
    "maxItems": 1
  }'::jsonb
),
(
  'brightermonday-scholarships',
  'BrighterMonday Scholarships',
  'https://www.brightermonday.co.ke/jobs',
  true,
  '{
    "type": "brightermonday",
    "category": "other",
    "sourceKind": "job_board",
    "scholarshipOnly": true,
    "maxPages": 8
  }'::jsonb
)
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  is_active = EXCLUDED.is_active,
  selectors = EXCLUDED.selectors;

COMMIT;
