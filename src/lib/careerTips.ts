/**
 * Career tips that belong in jobs.additional_info (under Additional Information).
 *
 * The main parse prompt already asks for 8 job-specific tips, but models often
 * omit them: they are generated (not extracted), they sit last in the JSON, and
 * RULE "omit missing fields" conflicts with ALWAYS GENERATE. Detect that gap
 * and fill it with a dedicated tips call so scrape / parse / enrich stay aligned.
 */

import { callAI, hasAIConfigured } from './aiProviders'
import { sanitizeStockTipsCopy } from './sanitizeStockTipsCopy'

const HOW_TO_APPLY_BLOCK_RE =
  /<p>\s*<strong>\s*How to Apply:\s*<\/strong>\s*([\s\S]*?)<\/p>/i

const STOCK_SECTION_H3_RE =
  /^(how to apply|benefits|about us|about the company|equal opportunity|work environment)$/i

const NUMBERED_TIP_RE = /<strong>\s*\d+\s*[.)]/gi

export interface CareerTipsJobContext {
  title?: string | null
  company?: string | null
  description?: string | null
  responsibilities?: string | null
  qualifications?: string | null
}

function plainSnippet(html: string | null | undefined, max = 1400): string {
  const plain = (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return ''
  return plain.length > max ? `${plain.slice(0, max)}…` : plain
}

export function stripHowToApplyBlock(html: string): string {
  return html.replace(HOW_TO_APPLY_BLOCK_RE, '').replace(/\n{3,}/g, '\n\n').trim()
}

function countNumberedTips(html: string): number {
  NUMBERED_TIP_RE.lastIndex = 0
  return (html.match(NUMBERED_TIP_RE) || []).length
}

function hasCustomTipsHeading(html: string): boolean {
  const headings = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)]
  return headings.some((match) => {
    const text = (match[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return Boolean(text) && !STOCK_SECTION_H3_RE.test(text)
  })
}

/** True when additional_info already contains generated career tips (not just How to Apply). */
export function hasGeneratedCareerTips(html: string | null | undefined): boolean {
  if (!html?.trim()) return false
  const numbered = countNumberedTips(html)
  if (numbered >= 4) return true
  return hasCustomTipsHeading(html) && numbered >= 2
}

export function appendCareerTips(
  existing: string | null | undefined,
  tipsHtml: string | null | undefined
): string {
  const base = (existing || '').trim()
  if (hasGeneratedCareerTips(base)) return base
  const tipsOnly = stripHowToApplyBlock((tipsHtml || '').trim())
  if (!tipsOnly) return base
  return base ? `${base}\n${tipsOnly}` : tipsOnly
}

function extractTipsHtml(parsed: unknown): string | null {
  if (typeof parsed === 'string' && parsed.trim()) return parsed.trim()
  if (!parsed || typeof parsed !== 'object') return null
  const record = parsed as Record<string, unknown>
  const fromTips = record.career_tips
  if (typeof fromTips === 'string' && fromTips.trim()) return fromTips.trim()
  const fromInfo = record.additional_info
  if (typeof fromInfo === 'string' && fromInfo.trim()) return fromInfo.trim()
  return null
}

const TIPS_SYSTEM_PROMPT = `You write job-specific career advice for Kenyan job seekers on CareerSasa.
Return ONLY valid JSON: {"career_tips":"<h3>...</h3><p>intro</p><p><strong>1. ...</strong>...</p>"}.
Do not include a How to Apply block — that already exists. Produce only the tips HTML.`

function buildTipsUserPrompt(job: CareerTipsJobContext): string {
  const title = job.title?.trim() || 'This role'
  const company = job.company?.trim() || 'the hiring company'
  return `Write career tips for this CareerSasa job posting.

Title: ${title}
Company: ${company}

Role overview:
${plainSnippet(job.description) || '(not provided)'}

Responsibilities:
${plainSnippet(job.responsibilities) || '(not provided)'}

Requirements:
${plainSnippet(job.qualifications) || '(not provided)'}

RULES:
- After How to Apply (already written), add an enticing <h3> subtopic customized to THIS posting's duties, tools, industry, and seniority.
- Do NOT use bland headings: "Tips", "Application Tips", "Interview Tips", "Career Tips".
- Never use a fill-in-the-blank heading that only swaps the job title into a fixed interview-win template. Ground the title in a concrete duty, tool, stakeholder, or screen from THIS posting.
- Vary angle by role: CV proof for this craft, first 90 days, what hiring managers probe, portfolio/demo prep, field realities, stakeholder communication, etc.
- Immediately under the <h3>, write one short intro <p> with a hook (2–3 sentences). Speak like a sharp Kenyan career coach: warm, direct, specific. No fluff.
- Do not end the intro with a generic teaser about standing out from the crowd or beating the competition.
- Then exactly 8 numbered tips, customized to this role's duties, tools, seniority, and hiring context. Do not reuse generic advice that could fit any job.
- Each tip format:
  <p><strong>N. Short tip title:</strong> Then 3 to 5 full explanation sentences. Make them practical and concrete (what to put on the CV, what to prepare, what managers for this role usually probe). Optional one brief concrete example in the same paragraph — do not invent employer policies or benefits.</p>
- Tip titles stay short. Vary tip openings. Sound naturally human — no "leverage", "utilize", "delve into", "in today's competitive landscape".
- Allowed tags: <p>, <ul>, <li>, <strong>, <em>, <h3>, <a>, <br>.
- Return JSON only.`
}

/** Dedicated tips generation. Returns HTML fragment (h3 + intro + 8 tips) or null. */
export async function generateCareerTipsHtml(
  job: CareerTipsJobContext
): Promise<string | null> {
  if (!hasAIConfigured()) return null
  try {
    const result = await callAI(buildTipsUserPrompt(job), {
      systemPrompt: TIPS_SYSTEM_PROMPT,
      json: true,
      temperature: 0.35,
      maxTokens: 4096,
    })
    const raw = extractTipsHtml(result.parsed)
    if (!raw) return null
    const cleaned = sanitizeStockTipsCopy(stripHowToApplyBlock(raw), job.title || null)
    if (!cleaned || !hasGeneratedCareerTips(cleaned)) return null
    return cleaned
  } catch (err) {
    console.warn(
      '[careerTips] generation failed:',
      err instanceof Error ? err.message : err
    )
    return null
  }
}

/** Append generated tips when additional_info is only How to Apply / benefits. */
export async function ensureCareerTipsHtml(
  existing: string | null | undefined,
  job: CareerTipsJobContext
): Promise<string> {
  const current = (existing || '').trim()
  if (hasGeneratedCareerTips(current)) return current
  const generated = await generateCareerTipsHtml(job)
  return appendCareerTips(current, generated)
}
