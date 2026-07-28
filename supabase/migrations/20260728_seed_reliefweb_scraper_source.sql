-- ============================================================
-- Seed ReliefWeb Kenya as an in-app scraper source
-- ============================================================
-- ReliefWeb API v2 (https://api.reliefweb.int/v2/jobs), filtered to
-- Kenya (country.iso3=ken). Requires a pre-approved RELIEFWEB_APPNAME
-- env var (or selectors.appname). Apply method prefers employer email /
-- external URL / org homepage from how_to_apply; ReliefWeb job page is
-- last resort only. Safe to re-run (ON CONFLICT).
-- ============================================================

BEGIN;

INSERT INTO public.scraper_sources (source_id, name, base_url, is_active, selectors)
VALUES (
  'reliefweb-kenya',
  'ReliefWeb Kenya',
  'https://reliefweb.int/jobs?advanced-search=%28C147%29',
  true,
  '{
    "type": "reliefweb",
    "category": "ngo",
    "sourceKind": "job_board",
    "country": "Kenya",
    "countryIso3": "ken",
    "countryId": 147,
    "maxPages": 5,
    "pageSize": 50
  }'::jsonb
)
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  is_active = EXCLUDED.is_active,
  selectors = EXCLUDED.selectors;

COMMIT;
