import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchHtml, extractJobDetails, normalizeJob, generateContentHash, ScraperSelectors } from '@/lib/scraper'
import {
  fetchWorkableJobDetails,
  normalizeWorkableJob,
  extractWorkableShortcode,
  extractWorkableSlug,
  generateContentHash as workableHash,
} from '@/lib/workable-adapter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scraper-secret')
  if (secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pick the oldest pending job
  const { data: queueItem, error: pickError } = await supabase
    .from('scrape_queue')
    .select('*, scraper_sources(*)')
    .eq('status', 'pending')
    .order('queued_at', { ascending: true })
    .limit(1)
    .single()

  if (pickError || !queueItem) {
    return NextResponse.json({ message: 'No pending jobs in queue', processed: 0 })
  }

  // Mark as processing immediately
  await supabase
    .from('scrape_queue')
    .update({ status: 'processing', attempts: (queueItem.attempts || 0) + 1 })
    .eq('id', queueItem.id)

  const source = queueItem.scraper_sources
  const isWorkable = (source.selectors as { type?: string }).type === 'workable'

  try {
    let normalized: ReturnType<typeof normalizeJob>
    let rawData: unknown

    if (isWorkable) {
      // ── Workable: fetch via API ──────────────────────────────────────────────
      const slug = extractWorkableSlug(queueItem.job_url)
      const shortcode = extractWorkableShortcode(queueItem.job_url)

      if (!slug || !shortcode) {
        throw new Error(`Cannot parse Workable slug/shortcode from URL: ${queueItem.job_url}`)
      }

      const detail = await fetchWorkableJobDetails(slug, shortcode)
      const filterCountry = (source.selectors as { filterCountry?: string }).filterCountry

      normalized = normalizeWorkableJob(detail, source.name, filterCountry)

      // Fix the application_url placeholder
      normalized.application_url = queueItem.job_url

      rawData = detail

    } else {
      // ── HTML scraper ─────────────────────────────────────────────────────────
      const html = await fetchHtml(queueItem.job_url)
      const raw = extractJobDetails(html, queueItem.job_url, source.selectors as ScraperSelectors)

      if (!raw.title && queueItem.partial_data?.title) raw.title = queueItem.partial_data.title
      if (!raw.location && queueItem.partial_data?.location) raw.location = queueItem.partial_data.location
      if (!raw.title) throw new Error('Could not extract job title from detail page')

      normalized = normalizeJob(raw, source.name)
      rawData = raw
    }

    if (!normalized.title) throw new Error('Job title is empty after normalization')

    // ── Dedup check ──────────────────────────────────────────────────────────
    const contentHash = workableHash(normalized.title, source.name, normalized.job_location_city || normalized.job_location_county || '')

    const { data: existing } = await supabase
      .from('scraped_job_sources')
      .select('id')
      .eq('content_hash', contentHash)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('scrape_queue')
        .update({ status: 'done', processed_at: new Date().toISOString() })
        .eq('id', queueItem.id)
      return NextResponse.json({ message: 'Duplicate job skipped', job_url: queueItem.job_url })
    }

    // ── Look up or create company ────────────────────────────────────────────
    const scraperUserId = await getScraperUserId()
    let companyId: string | null = null

    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', source.name)
      .maybeSingle()

    if (existingCompany) {
      companyId = existingCompany.id
    } else {
      const { data: newCompany } = await supabase
        .from('companies')
        .insert({ name: source.name, user_id: scraperUserId })
        .select('id')
        .single()
      companyId = newCompany?.id ?? null
    }

    // ── Insert job ───────────────────────────────────────────────────────────
    const jobPayload = {
      ...normalized,
      company_id: companyId,
      user_id: scraperUserId,
      hiring_organization_name: source.name,
    }

    const { data: insertedJob, error: jobError } = await supabase
      .from('jobs')
      .insert(jobPayload)
      .select('id')
      .single()

    if (jobError) throw jobError

    // ── Log to scraped_job_sources ───────────────────────────────────────────
    await supabase.from('scraped_job_sources').insert({
      source_id: source.source_id,
      job_url: queueItem.job_url,
      content_hash: contentHash,
      job_id: insertedJob.id,
      status: 'published',
      raw_data: rawData,
    })

    await supabase
      .from('scrape_queue')
      .update({ status: 'done', processed_at: new Date().toISOString() })
      .eq('id', queueItem.id)

    return NextResponse.json({
      success: true,
      job_id: insertedJob.id,
      title: normalized.title,
      source: source.source_id,
      job_url: queueItem.job_url,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[process] Error:', queueItem.job_url, message)

    const attempts = (queueItem.attempts || 0) + 1
    const newStatus = attempts >= 3 ? 'failed' : 'pending'

    await supabase
      .from('scrape_queue')
      .update({ status: newStatus, error_message: message, attempts })
      .eq('id', queueItem.id)

    return NextResponse.json({ error: message, job_url: queueItem.job_url }, { status: 500 })
  }
}

let _scraperUserId: string | null = null

async function getScraperUserId(): Promise<string> {
  if (_scraperUserId) return _scraperUserId
  if (process.env.SCRAPER_USER_ID) {
    _scraperUserId = process.env.SCRAPER_USER_ID
    return _scraperUserId
  }
  throw new Error('SCRAPER_USER_ID not set in environment variables.')
}
