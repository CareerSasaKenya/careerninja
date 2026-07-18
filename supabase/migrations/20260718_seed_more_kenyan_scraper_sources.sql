-- ============================================================
-- Additional Kenyan first-party scraper sources (2026-07-18)
-- ============================================================
-- Prefer employer/NGO ATS boards over competing aggregators
-- (BrighterMonday, MyJobMag, Fuzu, Indeed, etc.).
--
-- Verified Kenya openings at seed time:
--   Workable: Tatu City, Genesis Analytics, Laterite
--   Greenhouse: One Acre Fund, Instiglio, Acumen
-- ============================================================

BEGIN;

-- ── Workable employers with active Kenya roles ───────────────────────────────
INSERT INTO public.scraper_sources (source_id, name, base_url, is_active, selectors)
VALUES
  (
    'tatu-city',
    'Tatu City',
    'https://apply.workable.com/tatucity/',
    true,
    '{
      "type": "workable",
      "slug": "tatucity",
      "filterCountry": "Kenya",
      "category": "employer"
    }'::jsonb
  ),
  (
    'genesis-analytics',
    'Genesis Analytics',
    'https://apply.workable.com/genesis-analytics/',
    true,
    '{
      "type": "workable",
      "slug": "genesis-analytics",
      "filterCountry": "Kenya",
      "category": "employer"
    }'::jsonb
  ),
  (
    'laterite',
    'Laterite',
    'https://apply.workable.com/laterite/',
    true,
    '{
      "type": "workable",
      "slug": "laterite",
      "filterCountry": "Kenya",
      "category": "employer"
    }'::jsonb
  )
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  is_active = EXCLUDED.is_active,
  selectors = EXCLUDED.selectors;

-- Legacy live-DB id (if present): keep category, prefer canonical tatu-city as active
UPDATE public.scraper_sources
SET
  is_active = false,
  selectors = selectors || '{"category": "employer"}'::jsonb
WHERE source_id = 'tatucity-workable'
  AND EXISTS (
    SELECT 1 FROM public.scraper_sources WHERE source_id = 'tatu-city'
  );

-- ── Greenhouse NGOs / orgs with Kenya roles ──────────────────────────────────
INSERT INTO public.scraper_sources (source_id, name, base_url, is_active, selectors)
VALUES
  (
    'one-acre-fund',
    'One Acre Fund',
    'https://boards.greenhouse.io/oneacrefund',
    true,
    '{
      "type": "greenhouse",
      "slug": "oneacrefund",
      "filterCountry": "Kenya",
      "category": "ngo"
    }'::jsonb
  ),
  (
    'instiglio',
    'Instiglio',
    'https://boards.greenhouse.io/instiglio',
    true,
    '{
      "type": "greenhouse",
      "slug": "instiglio",
      "filterCountry": "Kenya",
      "category": "ngo"
    }'::jsonb
  ),
  (
    'acumen',
    'Acumen',
    'https://boards.greenhouse.io/acumen',
    true,
    '{
      "type": "greenhouse",
      "slug": "acumen",
      "filterCountry": "Kenya",
      "category": "ngo"
    }'::jsonb
  )
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  is_active = EXCLUDED.is_active,
  selectors = EXCLUDED.selectors;

COMMIT;

-- Summary
SELECT source_id, name, is_active, selectors->>'type' AS adapter, selectors->>'category' AS category
FROM public.scraper_sources
WHERE source_id IN (
  'tatu-city',
  'tatucity-workable',
  'genesis-analytics',
  'laterite',
  'one-acre-fund',
  'instiglio',
  'acumen'
)
ORDER BY is_active DESC, name;
