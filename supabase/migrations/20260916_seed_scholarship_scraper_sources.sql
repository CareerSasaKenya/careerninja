-- ============================================================
-- Seed scholarship aggregator + flagship-programme scraper sources
-- ============================================================
-- Discover uses type=scholarship_feed (RSS / WP REST / HTML / one
-- canonical programme URL) or BrighterMonday with scholarshipOnly.
-- Process classifies listing_kind=scholarship and labelled Facts.
-- Safe to re-run (ON CONFLICT).
--
-- Built with jsonb_build_object / jsonb_build_array so the Supabase
-- SQL editor does not treat JSON arrays as SQL.
-- Query strings are concatenated with chr(63) to avoid bind placeholders.
-- ============================================================

BEGIN;

INSERT INTO public.scraper_sources (source_id, name, base_url, is_active, selectors)
VALUES
(
  'opportunitydesk-scholarships',
  'Opportunity Desk Scholarships',
  'https://opportunitydesk.org/feed/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'ngo',
    'sourceKind', 'scholarship',
    'company', 'Opportunity Desk',
    'location', 'Kenya',
    'feedUrls', jsonb_build_array(
      'https://opportunitydesk.org/feed/',
      'https://opportunitydesk.org/category/scholarships/feed/'
    ),
    'listingUrls', jsonb_build_array(
      'https://opportunitydesk.org/category/scholarships/'
    ),
    'linkInclude', 'opportunitydesk\.org/\d{4}/\d{2}/',
    'kenyaOrAfricaOnly', true,
    'scholarshipOnly', true,
    'maxItems', 40
  )
),
(
  'afterschoolafrica-kenya',
  'After School Africa Kenya',
  'https://www.afterschoolafrica.com/tag/kenya/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'ngo',
    'sourceKind', 'scholarship',
    'company', 'After School Africa',
    'location', 'Kenya',
    'feedUrls', jsonb_build_array(
      'https://www.afterschoolafrica.com/feed/'
    ),
    'listingUrls', jsonb_build_array(
      'https://www.afterschoolafrica.com/tag/kenya/',
      'https://www.afterschoolafrica.com/country/kenya/'
    ),
    'wpRestUrls', jsonb_build_array(
      'https://www.afterschoolafrica.com/wp-json/wp/v2/posts'
        || chr(63) || 'search=kenya&per_page=20'
    ),
    'programmeUrls', jsonb_build_array(
      'https://www.afterschoolafrica.com/tag/kenya/'
    ),
    'applyUrl', 'https://www.afterschoolafrica.com/tag/kenya/',
    'fallbackTitle', 'After School Africa scholarships for Kenyans',
    'fallbackHtml', $asa$<p>After School Africa lists scholarships and fellowships open to Kenyan and African students. When the listing feed is reachable, individual awards are imported automatically. Otherwise use this Kenya tag as the starting point and follow each post official apply link.</p>$asa$,
    'linkInclude', 'afterschoolafrica\.com/',
    'kenyaOrAfricaOnly', true,
    'scholarshipOnly', true,
    'maxItems', 30
  )
),
(
  'scholars4dev-kenya',
  'Scholars4Dev Kenya / Africa',
  'https://www.scholars4dev.com/category/country/africa-scholarships/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'ngo',
    'sourceKind', 'scholarship',
    'company', 'Scholars4Dev',
    'location', 'Kenya',
    'listingUrls', jsonb_build_array(
      'https://www.scholars4dev.com/category/country/africa-scholarships/',
      'https://www.scholars4dev.com/' || chr(63) || 's=kenya'
    ),
    'wpRestUrls', jsonb_build_array(
      'https://www.scholars4dev.com/wp-json/wp/v2/posts'
        || chr(63) || 'search=kenya&per_page=20',
      'https://www.scholars4dev.com/wp-json/wp/v2/posts'
        || chr(63) || 'categories=43&per_page=20'
    ),
    'linkInclude', 'scholars4dev\.com/\d+/',
    'kenyaOrAfricaOnly', true,
    'scholarshipOnly', true,
    'maxItems', 40
  )
),
(
  'opportunitiesforafricans-scholarships',
  'Opportunities For Africans Scholarships',
  'https://www.opportunitiesforafricans.com/category/scholarships/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'ngo',
    'sourceKind', 'scholarship',
    'company', 'Opportunities For Africans',
    'location', 'Kenya',
    'feedUrls', jsonb_build_array(
      'https://www.opportunitiesforafricans.com/category/scholarships/feed/'
    ),
    'listingUrls', jsonb_build_array(
      'https://www.opportunitiesforafricans.com/category/scholarships/'
    ),
    'linkInclude', 'opportunitiesforafricans\.com/',
    'kenyaOrAfricaOnly', false,
    'scholarshipOnly', true,
    'maxItems', 40
  )
),
(
  'chevening-scholarships',
  'Chevening Scholarships',
  'https://www.chevening.org/scholarships/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'government',
    'sourceKind', 'scholarship',
    'company', 'Chevening',
    'location', 'Kenya',
    'programmeUrls', jsonb_build_array(
      'https://www.chevening.org/scholarships/'
    ),
    'applyUrl', 'https://www.chevening.org/apply/',
    'fallbackTitle', 'Chevening Scholarships (Kenya)',
    'fallbackHtml', $chevening$<p>Chevening Scholarships are the UK government global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations. They are awarded to outstanding professionals with leadership potential, including Kenyan citizens, to pursue a one-year masters degree in the UK.</p><p>Apply on the official Chevening website. Check the current application cycle, eligible courses, and Kenya-specific guidance before you submit.</p>$chevening$,
    'maxItems', 1
  )
),
(
  'commonwealth-masters',
  'Commonwealth Masters Scholarships',
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'government',
    'sourceKind', 'scholarship',
    'company', 'Commonwealth Scholarship Commission',
    'location', 'Kenya',
    'programmeUrls', jsonb_build_array(
      'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/'
    ),
    'applyUrl', 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
    'fallbackTitle', 'Commonwealth Masters Scholarships',
    'fallbackHtml', $csc$<p>Commonwealth Masters Scholarships support candidates from eligible low and middle income Commonwealth countries, including Kenya, to undertake full-time taught masters study at a UK university.</p><p>The programme is funded by the UK Foreign, Commonwealth and Development Office and administered by the Commonwealth Scholarship Commission. Review current eligibility, nominating agencies, and deadlines on the CSC site before applying.</p>$csc$,
    'maxItems', 1
  )
),
(
  'fulbright-kenya',
  'Fulbright Kenya Exchange Programs',
  'https://ke.usembassy.gov/u-s-kenya-exchange-programs/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'government',
    'sourceKind', 'scholarship',
    'company', 'Fulbright Kenya',
    'location', 'Kenya',
    'programmeUrls', jsonb_build_array(
      'https://ke.usembassy.gov/u-s-kenya-exchange-programs/'
    ),
    'applyUrl', 'https://ke.usembassy.gov/u-s-kenya-exchange-programs/',
    'fallbackTitle', 'U.S. - Kenya Exchange Programs (Fulbright)',
    'fallbackHtml', $fulbright$<p>The Fulbright Program and related U.S. government academic exchanges for Kenyans are administered through the U.S. Embassy in Nairobi. Awards typically include the Fulbright Foreign Student Program, Fulbright Scholar Program, and other study/research exchanges.</p><p>Use the Embassy U.S.-Kenya exchange programmes page for current eligibility, deadlines, and application instructions.</p>$fulbright$,
    'maxItems', 1
  )
),
(
  'daad-scholarships',
  'DAAD Scholarships Kenya',
  'https://www.daad.de/en/studying-in-germany/scholarships/',
  true,
  jsonb_build_object(
    'type', 'scholarship_feed',
    'category', 'government',
    'sourceKind', 'scholarship',
    'company', 'DAAD',
    'location', 'Kenya',
    'programmeUrls', jsonb_build_array(
      'https://www.daad.de/en/studying-in-germany/scholarships/'
    ),
    'applyUrl', 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/',
    'fallbackTitle', 'DAAD Scholarships for Kenyan Students',
    'fallbackHtml', $daad$<p>DAAD (German Academic Exchange Service) funds scholarships and research grants for Kenyan students, graduates, and academics to study or research in Germany. Awards range from masters and PhD scholarships to short research stays.</p><p>Search currently open programmes in the DAAD scholarship database and apply on the official DAAD portal. Kenya-specific calls are published when the Nairobi office opens a new cycle.</p>$daad$,
    'maxItems', 1
  )
),
(
  'brightermonday-scholarships',
  'BrighterMonday Scholarships',
  'https://www.brightermonday.co.ke/jobs',
  true,
  jsonb_build_object(
    'type', 'brightermonday',
    'category', 'other',
    'sourceKind', 'job_board',
    'scholarshipOnly', true,
    'maxPages', 8
  )
)
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  is_active = EXCLUDED.is_active,
  selectors = EXCLUDED.selectors;

COMMIT;
