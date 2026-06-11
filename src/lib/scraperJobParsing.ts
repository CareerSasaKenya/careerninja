/**
 * Intelligent parsing of scraped job content into CareerSasa job fields.
 *
 * Uses a hybrid approach:
 * 1. Rule-based section splitting (Workable API fields + HTML heading detection)
 * 2. AI enhancement via Gemini when API keys are configured
 */

import * as cheerio from 'cheerio'
import { callAIWithRetry } from './jobParsingOptimized'
import { ExtractedJobMetadata, extractJobMetadata } from './jobMetadataExtraction'

export interface ScrapedJobInput {
  title: string
  company: string
  location?: string
  employmentType?: string
  workplace?: string
  /** HTML from the main description section (Workable description or scraped page) */
  descriptionSection?: string
  /** HTML from requirements / qualifications section */
  requirementsSection?: string
  /** HTML from benefits / perks section */
  benefitsSection?: string
  /** Unstructured fallback for HTML scrapers */
  rawContent?: string
}

export interface ParsedScrapedJobContent {
  description: string
  responsibilities: string
  required_qualifications: string
  additional_info: string
  deadline: string | null
  education_level: string | null
  minimum_experience: number | null
  experience_level: string | null
  industry: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_period: string | null
}

const EMPTY_METADATA: Omit<
  ParsedScrapedJobContent,
  'description' | 'responsibilities' | 'required_qualifications' | 'additional_info'
> = {
  deadline: null,
  education_level: null,
  minimum_experience: null,
  experience_level: null,
  industry: null,
  salary_min: null,
  salary_max: null,
  salary_currency: null,
  salary_period: null,
}

const SECTION_PATTERNS = {
  responsibilities: /responsibilit|duties|what you.{0,12}do|key tasks|your role|role overview/i,
  qualifications: /qualification|requirement|skills|experience required|who you are|what we.?re looking|must have/i,
  benefits: /benefits|what we offer|perks|why join|compensation package|what.?s in it/i,
  additional: /how to apply|application process|equal opportunity|about us|about the company/i,
}

function wrapSection(heading: string, html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ''
  return `<h3>${heading}</h3>${trimmed}`
}

type ContentBucket = 'description' | 'responsibilities' | 'required_qualifications' | 'additional_info'

function bucketForHeading(headingText: string): ContentBucket {
  if (SECTION_PATTERNS.responsibilities.test(headingText)) return 'responsibilities'
  if (SECTION_PATTERNS.qualifications.test(headingText)) return 'required_qualifications'
  if (SECTION_PATTERNS.benefits.test(headingText) || SECTION_PATTERNS.additional.test(headingText)) return 'additional_info'
  return 'description'
}

/**
 * Split an HTML blob into sections based on h1-h4 headings.
 */
export function splitHtmlByHeadings(html: string): {
  description: string
  responsibilities: string
  required_qualifications: string
  additional_info: string
} {
  if (!html?.trim()) {
    return { description: '', responsibilities: '', required_qualifications: '', additional_info: '' }
  }

  const $ = cheerio.load(`<div id="scraper-root">${html}</div>`, null, false)
  const root = $('#scraper-root')
  const children = root.children().toArray()

  if (children.length === 0) {
    return { description: html, responsibilities: '', required_qualifications: '', additional_info: '' }
  }

  const sections: Record<ContentBucket, string[]> = {
    description: [],
    responsibilities: [],
    required_qualifications: [],
    additional_info: [],
  }

  let currentBucket: ContentBucket = 'description'

  for (const el of children) {
    const tag = el.tagName?.toLowerCase()
    if (tag && /^h[1-4]$/.test(tag)) {
      currentBucket = bucketForHeading($(el).text().trim())
    }
    sections[currentBucket].push($.html(el))
  }

  return {
    description: sections.description.join('') || html,
    responsibilities: sections.responsibilities.join(''),
    required_qualifications: sections.required_qualifications.join(''),
    additional_info: sections.additional_info.join(''),
  }
}

function buildAdditionalInfo(benefitsHtml?: string, extraHtml?: string): string {
  const parts: string[] = []
  if (benefitsHtml?.trim()) parts.push(wrapSection('Benefits', benefitsHtml))
  if (extraHtml?.trim()) parts.push(extraHtml)
  return parts.join('\n')
}

/**
 * Rule-based parsing — fast fallback that respects Workable's native field split.
 */
export function parseScrapedJobFallback(input: ScrapedJobInput): ParsedScrapedJobContent {
  const sourceHtml = input.descriptionSection || input.rawContent || ''
  const split = splitHtmlByHeadings(sourceHtml)

  const description =
    split.description ||
    input.descriptionSection ||
    input.rawContent ||
    ''

  const responsibilities = split.responsibilities
  const required_qualifications =
    input.requirementsSection?.trim() ||
    split.required_qualifications ||
    ''

  const additional_info = buildAdditionalInfo(input.benefitsSection, split.additional_info)

  return {
    description,
    responsibilities,
    required_qualifications,
    additional_info,
    ...EMPTY_METADATA,
  }
}

function buildAIText(input: ScrapedJobInput): string {
  const lines = [
    `JOB TITLE: ${input.title}`,
    `COMPANY: ${input.company}`,
  ]
  if (input.location) lines.push(`LOCATION: ${input.location}`)
  if (input.employmentType) lines.push(`EMPLOYMENT TYPE: ${input.employmentType}`)
  if (input.workplace) lines.push(`WORKPLACE: ${input.workplace}`)

  if (input.descriptionSection) {
    lines.push('\n=== DESCRIPTION ===', stripToPlain(input.descriptionSection, 3000))
  }
  if (input.requirementsSection) {
    lines.push('\n=== REQUIREMENTS ===', stripToPlain(input.requirementsSection, 2000))
  }
  if (input.benefitsSection) {
    lines.push('\n=== BENEFITS ===', stripToPlain(input.benefitsSection, 1500))
  }
  if (input.rawContent && !input.descriptionSection) {
    lines.push('\n=== FULL JOB POSTING ===', stripToPlain(input.rawContent, 5000))
  }

  return lines.join('\n')
}

function stripToPlain(html: string, maxLen: number): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLen)
}

const SCRAPER_PARSE_PROMPT = `You are a job posting parser for CareerSasa, a Kenyan job portal.
Parse the labeled job sections into structured fields. Return ONLY valid JSON.

RULES:
1. Return ONLY JSON — no markdown fences or explanations
2. Use clean HTML for text fields (<p>, <ul>, <li>, <strong>, <h3> only)
3. description: Company overview, role summary, context — NOT a list of duties
4. responsibilities: Key duties and tasks as <ul><li> items
5. required_qualifications: Education, experience, skills required as <ul><li> items
6. additional_info: Benefits, perks, how to apply, company culture — use <h3> subheadings
7. Do NOT duplicate the same content across fields
8. If a section is absent in the source, return empty string ""
9. experience_level: Entry, Mid, Senior, Managerial, Internship, or null
10. education_level: Diploma, Bachelor's, Master's, PhD, Certificate, KCSE, or null
11. salary: only if explicitly stated as numbers
12. deadline: YYYY-MM-DD if a closing date is mentioned, else null

Return this JSON structure:
{
  "description": "<p>Role overview</p>",
  "responsibilities": "<ul><li>Duty 1</li></ul>",
  "required_qualifications": "<ul><li>Qualification 1</li></ul>",
  "additional_info": "<h3>Benefits</h3><ul><li>Benefit 1</li></ul>",
  "deadline": "YYYY-MM-DD or null",
  "education_level": "string or null",
  "minimum_experience": number_or_null,
  "experience_level": "Entry|Mid|Senior|Managerial|Internship|null",
  "industry": "string or null",
  "salary_min": number_or_null,
  "salary_max": number_or_null,
  "salary_currency": "KES|USD|null",
  "salary_period": "MONTH|YEAR|DAY|HOUR|null"
}`

function mergeAIResult(
  fallback: ParsedScrapedJobContent,
  ai: Record<string, unknown>
): ParsedScrapedJobContent {
  return {
    description: String(ai.description || '').trim() || fallback.description,
    responsibilities: String(ai.responsibilities || '').trim() || fallback.responsibilities,
    required_qualifications: String(ai.required_qualifications || '').trim() || fallback.required_qualifications,
    additional_info: String(ai.additional_info || '').trim() || fallback.additional_info,
    deadline: (ai.deadline as string | null) ?? (ai.valid_through as string | null) ?? fallback.deadline,
    education_level: (ai.education_level as string | null) ?? (ai.education_level_name as string | null) ?? fallback.education_level,
    minimum_experience: parseNumeric(ai.minimum_experience) ?? fallback.minimum_experience,
    experience_level: (ai.experience_level as string | null) ?? fallback.experience_level,
    industry: (ai.industry as string | null) ?? fallback.industry,
    salary_min: parseNumeric(ai.salary_min) ?? fallback.salary_min,
    salary_max: parseNumeric(ai.salary_max) ?? fallback.salary_max,
    salary_currency: (ai.salary_currency as string | null) ?? fallback.salary_currency,
    salary_period: (ai.salary_period as string | null) ?? fallback.salary_period,
  }
}

function parseNumeric(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = typeof val === 'number' ? val : parseInt(String(val), 10)
  return isNaN(n) ? null : n
}

/**
 * Parse scraped job content into CareerSasa fields.
 * Tries AI first, falls back to rule-based splitting, then metadata-only AI.
 */
export async function parseScrapedJobContent(
  input: ScrapedJobInput
): Promise<ParsedScrapedJobContent> {
  const fallback = parseScrapedJobFallback(input)
  const aiText = buildAIText(input)

  const hasAIKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.OPENROUTER_API_KEY,
  ].some(Boolean)

  if (hasAIKeys) {
    try {
      const { response } = await callAIWithRetry(aiText, SCRAPER_PARSE_PROMPT, 1)
      return mergeAIResult(fallback, response as unknown as Record<string, unknown>)
    } catch (err) {
      console.warn('[scraperJobParsing] AI parse failed, using rule-based fallback:', err instanceof Error ? err.message : err)
    }
  }

  // Lightweight metadata extraction if full parse unavailable
  const plainText = [
    fallback.description,
    fallback.responsibilities,
    fallback.required_qualifications,
    fallback.additional_info,
  ].filter(Boolean).join('\n\n')

  const meta = await extractJobMetadata(plainText)

  return {
    ...fallback,
    deadline: meta.deadline,
    education_level: meta.education_level,
    minimum_experience: meta.minimum_experience,
    experience_level: meta.experience_level,
    industry: meta.industry,
    salary_min: meta.salary_min,
    salary_max: meta.salary_max,
    salary_currency: meta.salary_currency,
    salary_period: meta.salary_period,
  }
}
