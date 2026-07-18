/**
 * Intelligent parsing of scraped job content into CareerSasa job fields.
 *
 * Uses a hybrid approach:
 * 1. Rule-based section splitting (ATS fields + HTML heading / <strong> detection)
 * 2. AI enhancement via Gemini when API keys are configured
 * 3. Lightweight regex metadata when AI is unavailable
 */

import * as cheerio from 'cheerio'
import type { AnyNode, Element as DomElement } from 'domhandler'
import { callAI } from './aiProviders'
import { ExtractedJobMetadata, extractJobMetadata } from './jobMetadataExtraction'
import { fuzzyMatchOption, limitTags } from './jobParseNormalization'
import { inferCompanyIndustry } from './companyIndustryInference'

export interface ScrapedJobInput {
  title: string
  company: string
  location?: string
  employmentType?: string
  workplace?: string
  /** HTML from the main description section (company overview / role summary) */
  descriptionSection?: string
  /** HTML that is primarily duties (e.g. SmartRecruiters jobDescription) */
  responsibilitiesSection?: string
  /** HTML from requirements / qualifications section */
  requirementsSection?: string
  /** HTML from benefits / perks section */
  benefitsSection?: string
  /** Unstructured fallback for HTML scrapers */
  rawContent?: string
  /** ATS industry label hint */
  industryHint?: string | null
  /** ATS job-function label hint */
  jobFunctionHint?: string | null
  /** Seed tags (department, etc.) */
  tagsHint?: string | null
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
  job_function: string | null
  tags: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_period: string | null
}

const EMPTY_METADATA: Omit<
  ParsedScrapedJobContent,
  'description' | 'responsibilities' | 'required_qualifications' | 'additional_info' | 'tags' | 'job_function'
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
  responsibilities:
    /responsibilit|accountabilit|duties|what you.{0,20}do|key tasks|your role|role overview|activities|kpis?|competenc|deliverables|make an impact|how you will|you will:/i,
  qualifications:
    /qualification|requirement|skills|experience required|who you are|what we.?re looking|must have|preferred|you bring|ideal candidate|an ideal/i,
  benefits: /benefits|what we offer|perks|why join|compensation package|what.?s in it|how you can grow|grow with us/i,
  additional:
    /how to apply|application process|equal opportunity|about us|about the company|work environment/i,
  overview: /purpose|overview|about the role|the role|summary|introduction|the opportunity/i,
}

function wrapSection(heading: string, html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ''
  return `<h3>${heading}</h3>${trimmed}`
}

type ContentBucket = 'description' | 'responsibilities' | 'required_qualifications' | 'additional_info'

function bucketForHeading(headingText: string, current: ContentBucket = 'description'): ContentBucket {
  if (SECTION_PATTERNS.overview.test(headingText)) return 'description'
  if (SECTION_PATTERNS.responsibilities.test(headingText)) return 'responsibilities'
  if (SECTION_PATTERNS.qualifications.test(headingText)) return 'required_qualifications'
  if (SECTION_PATTERNS.benefits.test(headingText) || SECTION_PATTERNS.additional.test(headingText)) {
    return 'additional_info'
  }
  // Numbered topic sub-headings (e.g. "1. Physical Security…") stay in the
  // current section instead of falling back to description.
  if (
    current === 'responsibilities' ||
    current === 'required_qualifications' ||
    current === 'additional_info'
  ) {
    return current
  }
  return 'description'
}

/** True when a block is effectively a section title (h1-h4 or bold-only short line). */
function extractPseudoHeading($: cheerio.CheerioAPI, el: DomElement): string | null {
  const tag = el.tagName?.toLowerCase()
  if (tag && /^h[1-6]$/.test(tag)) {
    const text = $(el).text().replace(/[:：]\s*$/, '').trim()
    return text || null
  }

  if (tag !== 'p' && tag !== 'div' && tag !== 'li') return null

  const $el = $(el as AnyNode)
  const text = $el.text().replace(/\s+/g, ' ').replace(/[:：]\s*$/, '').trim()
  if (!text || text.length > 80) return null

  const html = ($el.html() || '').trim()
  // <p><strong>Key Responsibilities</strong></p> or <p><strong>Purpose</strong><br>…
  const boldOnly = /^<(strong|b)[^>]*>[\s\S]+?<\/\1>(?:<br\s*\/?>)?$/i.test(html)
  const startsWithBoldTitle =
    /^<(strong|b)[^>]*>([^<]{3,80})<\/\1>(?:<br\s*\/?>|\s*)$/i.test(html)

  if (boldOnly || startsWithBoldTitle) return text

  // All visible text is inside bold/strong (possibly via nested <span>s) — treat as heading.
  // Catches <p><strong><span ...>Title</span></strong></p> (e.g. Instiglio / Word-pasted HTML).
  const boldText = $el.find('strong, b').text().replace(/\s+/g, ' ').replace(/[:：]\s*$/, '').trim()
  if (boldText && boldText === text) return text

  // Plain <p> with no inline markup that looks exactly like a section heading
  // (short, no trailing sentence-ending punctuation, matches a section keyword).
  // Handles ATS boards that use bare <p> for section labels.
  const isPlainText = !/<[a-z]/i.test(html)
  const noTrailingPeriod = !/[.!?]$/.test(text)
  const isSectionKeyword = Object.values(SECTION_PATTERNS).some(re => re.test(text))
  if (isPlainText && noTrailingPeriod && isSectionKeyword && text.length >= 4) return text

  return null
}

/**
 * Split an HTML blob into sections based on h1-h4 and bold pseudo-headings.
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
  const children = root.contents().toArray().filter(node => {
    // Keep elements; drop bare whitespace text nodes
    if (node.type === 'text') return String((node as { data?: string }).data || '').trim().length > 0
    return node.type === 'tag'
  })

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
  let sawNamedSection = false

  for (const el of children) {
    if (el.type === 'text') {
      const text = String((el as { data?: string }).data || '').trim()
      if (text) sections[currentBucket].push(`<p>${text}</p>`)
      continue
    }

    const heading = extractPseudoHeading($, el as DomElement)
    if (heading) {
      currentBucket = bucketForHeading(heading, currentBucket)
      sawNamedSection = true
      // Keep overview headings in description; skip pure section labels for duties/quals
      if (currentBucket === 'description' && SECTION_PATTERNS.overview.test(heading)) {
        sections.description.push($.html(el))
      }
      continue
    }

    // Bold title + body in same paragraph: <p><strong>Purpose</strong><br> body…</p>
    const $el = $(el as AnyNode)
    const inner = ($el.html() || '').trim()
    const splitBold = inner.match(
      /^<(strong|b)[^>]*>([^<]{3,80})<\/\1>\s*(?:<br\s*\/?>)?\s*([\s\S]+)$/i
    )
    if (splitBold) {
      const headingText = splitBold[2].replace(/[:：]\s*$/, '').trim()
      const bodyHtml = splitBold[3].trim()
      currentBucket = bucketForHeading(headingText, currentBucket)
      sawNamedSection = true
      if (bodyHtml) {
        sections[currentBucket].push(`<p>${bodyHtml}</p>`)
      }
      continue
    }

    sections[currentBucket].push($.html(el))
  }

  const description = sections.description.join('')
  const responsibilities = sections.responsibilities.join('')
  const required_qualifications = sections.required_qualifications.join('')
  const additional_info = sections.additional_info.join('')

  // If no named sections were found, keep original HTML as description
  if (!sawNamedSection && !responsibilities && !required_qualifications) {
    return { description: html, responsibilities: '', required_qualifications: '', additional_info: '' }
  }

  return {
    description: description || (responsibilities || required_qualifications ? '' : html),
    responsibilities,
    required_qualifications,
    additional_info,
  }
}

function buildAdditionalInfo(benefitsHtml?: string, extraHtml?: string): string {
  const parts: string[] = []
  if (benefitsHtml?.trim()) parts.push(wrapSection('Benefits', benefitsHtml))
  if (extraHtml?.trim()) parts.push(extraHtml)
  return parts.join('\n')
}

function extractEducationLevel(text: string): string | null {
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/['’]/g, "'")
  if (/ph\.?d|doctorate/i.test(plain)) return "PhD"
  if (/master'?s|mba|msc|m\.a\./i.test(plain)) return "Master's"
  if (/bachelor'?s|bsc|b\.a\.|undergraduate degree/i.test(plain)) return "Bachelor's"
  if (/\bdiploma\b/i.test(plain)) return 'Diploma'
  if (/\bcertificate\b/i.test(plain)) return 'Certificate'
  if (/\bkcse\b/i.test(plain)) return 'KCSE'
  return null
}

function extractMinimumExperience(text: string): number | null {
  const plain = text.replace(/<[^>]+>/g, ' ')
  const match = plain.match(
    /(\d+)\s*(?:\+|plus)?\s*(?:[-–to]{1,3}\s*\d+\s*)?years?\s+(?:of\s+)?(?:relevant\s+)?experience/i
  ) || plain.match(/minimum\s+of\s+(\d+)\s+years?/i)
  if (!match) return null
  const n = parseInt(match[1], 10)
  return Number.isFinite(n) && n > 0 && n < 50 ? n : null
}

function extractExperienceLevelFromText(
  title: string,
  text: string,
  minYears: number | null
): string | null {
  const hay = `${title} ${text}`.toLowerCase()
  if (/\bintern(ship)?\b/.test(hay)) return 'Internship'
  if (/\b(director|head of|chief|vp|vice president|general manager)\b/.test(hay)) return 'Managerial'
  if (/\b(senior|lead|principal|manager)\b/.test(hay)) return 'Senior'
  if (/\b(junior|graduate|entry[- ]level|trainee)\b/.test(hay)) return 'Entry'
  if (minYears != null) {
    if (minYears >= 8) return 'Managerial'
    if (minYears >= 5) return 'Senior'
    if (minYears >= 2) return 'Mid'
    return 'Entry'
  }
  return null
}

function buildTags(input: {
  title: string
  tagsHint?: string | null
  industry?: string | null
  jobFunction?: string | null
  qualifications?: string
}): string {
  const tags: string[] = []
  if (input.jobFunction) tags.push(input.jobFunction)
  // Prefer short industry labels only (avoid stuffing long taxonomy strings into chips)
  if (input.industry && input.industry.length <= 32) tags.push(input.industry)

  if (input.tagsHint) {
    for (const t of input.tagsHint.split(/[,|;]/)) {
      const cleaned = t.trim()
      // Skip raw ATS industry dumps and duplicates of taxonomy labels
      if (!cleaned || cleaned.length > 32) continue
      if (/information technology and services/i.test(cleaned)) continue
      tags.push(cleaned)
    }
  }

  // Significant title tokens (skip fluff)
  const stop = new Set([
    'the', 'and', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'at', 'on', 'or',
    'senior', 'junior', 'lead', 'head', 'manager', 'officer', 'assistant',
  ])
  for (const part of input.title.split(/[\s/|,–—-]+/)) {
    const cleaned = part.replace(/[^a-zA-Z0-9+.#]/g, '').trim()
    if (cleaned.length >= 3 && !stop.has(cleaned.toLowerCase())) {
      tags.push(cleaned)
    }
  }

  return limitTags(tags, 5)
}

/**
 * Rule-based parsing — works without AI keys; respects ATS native field splits.
 */
export function parseScrapedJobFallback(input: ScrapedJobInput): ParsedScrapedJobContent {
  const descSplit = splitHtmlByHeadings(input.descriptionSection || input.rawContent || '')
  const dutiesSplit = input.responsibilitiesSection
    ? splitHtmlByHeadings(input.responsibilitiesSection)
    : null

  let description = ''
  let responsibilities = ''

  if (input.responsibilitiesSection?.trim()) {
    // Dedicated ATS duties block (SmartRecruiters jobDescription)
    if (dutiesSplit?.responsibilities) {
      responsibilities = dutiesSplit.responsibilities
      description = [
        descSplit.description || input.descriptionSection || '',
        dutiesSplit.description || '',
      ]
        .filter(Boolean)
        .join('\n')
    } else {
      // No duty headings — entire jobDescription is Key Responsibilities
      responsibilities = input.responsibilitiesSection
      description = descSplit.description || input.descriptionSection || ''
    }
  } else {
    // Workable / HTML: split a single description blob
    description = descSplit.description || input.descriptionSection || input.rawContent || ''
    responsibilities = descSplit.responsibilities
  }

  const required_qualifications =
    input.requirementsSection?.trim() ||
    dutiesSplit?.required_qualifications ||
    descSplit.required_qualifications ||
    ''

  const additional_info = buildAdditionalInfo(
    input.benefitsSection,
    [dutiesSplit?.additional_info, descSplit.additional_info].filter(Boolean).join('\n')
  )

  const metaText = [description, responsibilities, required_qualifications, additional_info]
    .filter(Boolean)
    .join('\n')

  const education_level = extractEducationLevel(metaText)
  const minimum_experience = extractMinimumExperience(metaText)
  const experience_level = extractExperienceLevelFromText(
    input.title,
    metaText,
    minimum_experience
  )

  const industry = input.industryHint?.trim() || null
  const job_function = input.jobFunctionHint?.trim() || null
  const tags = buildTags({
    title: input.title,
    tagsHint: input.tagsHint,
    industry,
    jobFunction: job_function,
    qualifications: required_qualifications,
  })

  return {
    description,
    responsibilities,
    required_qualifications,
    additional_info,
    ...EMPTY_METADATA,
    education_level,
    minimum_experience,
    experience_level,
    industry,
    job_function,
    tags,
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
  if (input.industryHint) lines.push(`INDUSTRY HINT: ${input.industryHint}`)
  if (input.jobFunctionHint) lines.push(`JOB FUNCTION HINT: ${input.jobFunctionHint}`)

  if (input.descriptionSection) {
    lines.push('\n=== DESCRIPTION ===', stripToPlain(input.descriptionSection, 3000))
  }
  if (input.responsibilitiesSection) {
    lines.push('\n=== RESPONSIBILITIES / ROLE DETAILS ===', stripToPlain(input.responsibilitiesSection, 3000))
  }
  if (input.requirementsSection) {
    lines.push('\n=== REQUIREMENTS ===', stripToPlain(input.requirementsSection, 2000))
  }
  if (input.benefitsSection) {
    lines.push('\n=== BENEFITS ===', stripToPlain(input.benefitsSection, 1500))
  }
  if (input.rawContent && !input.descriptionSection && !input.responsibilitiesSection) {
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
3. description: Company overview + short role purpose — NOT a long list of duties
4. responsibilities: Key duties and tasks as <ul><li> items (from Responsibilities / Activities / KPIs)
5. required_qualifications: Education, experience, skills required as <ul><li> items
6. additional_info: Benefits, perks, how to apply, company culture — use <h3> subheadings
7. Do NOT duplicate the same content across fields
8. If a section is absent in the source, return empty string ""
9. experience_level: Entry, Mid, Senior, Managerial, Internship, or null
10. education_level: Diploma, Bachelor's, Master's, PhD, Certificate, KCSE, or null
11. salary: only if explicitly stated as numbers
12. deadline: YYYY-MM-DD if a closing date is mentioned, else null
13. tags: comma-separated string, at most 5 relevant skills/keywords
14. industry / job_function: short labels if clearly present

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
  "job_function": "string or null",
  "tags": "tag1, tag2, tag3",
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
    required_qualifications:
      String(ai.required_qualifications || '').trim() || fallback.required_qualifications,
    additional_info: String(ai.additional_info || '').trim() || fallback.additional_info,
    deadline: (ai.deadline as string | null) ?? (ai.valid_through as string | null) ?? fallback.deadline,
    education_level:
      (ai.education_level as string | null) ??
      (ai.education_level_name as string | null) ??
      fallback.education_level,
    minimum_experience: parseNumeric(ai.minimum_experience) ?? fallback.minimum_experience,
    experience_level: (ai.experience_level as string | null) ?? fallback.experience_level,
    industry: (ai.industry as string | null) ?? fallback.industry,
    job_function: (ai.job_function as string | null) ?? fallback.job_function,
    tags: limitTags(String(ai.tags || '').trim() || fallback.tags, 5),
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

/** Common ATS industry labels → CareerSasa industry names */
const INDUSTRY_ALIASES: Record<string, string> = {
  'information technology and services': 'ICT & Telecommunications',
  'information technology': 'ICT & Telecommunications',
  'it and services': 'ICT & Telecommunications',
  'computer software': 'ICT & Telecommunications',
  'internet': 'ICT & Telecommunications',
  'utilities': 'Energy, Utilities & Waste Management',
  'renewables & environment': 'Energy, Utilities & Waste Management',
  'oil & energy': 'Energy, Utilities & Waste Management',
  'hospital & health care': 'Healthcare, Medical & Pharmaceutical',
  'hospital and health care': 'Healthcare, Medical & Pharmaceutical',
  'health care': 'Healthcare, Medical & Pharmaceutical',
  'nonprofit organization management': 'Charity, NGO & Non-Profit',
  'non-profit organization management': 'Charity, NGO & Non-Profit',
  'civic & social organization': 'Charity, NGO & Non-Profit',
  'education management': 'Education & Training',
  'higher education': 'Education & Training',
  'financial services': 'Banking, Insurance & Financial Services',
  'banking': 'Banking, Insurance & Financial Services',
  'real estate': 'Building, Construction & Real Estate',
  'construction': 'Building, Construction & Real Estate',
  'staffing and recruiting': 'Human Resources & Recruitment',
  'human resources': 'Human Resources & Recruitment',
}

const FUNCTION_ALIASES: Record<string, string> = {
  education: 'Education & Training',
  engineering: 'Engineering & Technology',
  'business development': 'Management & Business Development',
  'project management': 'Product & Project Management',
  'product management': 'Product & Project Management',
  'customer service': 'Customer Service & Support',
  production: 'Manufacturing & Warehousing',
  research: 'Research, Teaching & Training',
  marketing: 'Marketing & Communications',
  sales: 'Sales',
  finance: 'Accounting, Auditing & Finance',
  accounting: 'Accounting, Auditing & Finance',
  'human resources': 'Human Resources & Recruitment',
  legal: 'Legal Services',
  'legal department': 'Legal Services',
  'information technology': 'IT & Software',
  'it and software': 'IT & Software',
  'it department': 'IT & Software',
  'city management department': 'Estate Agents & Property Management',
  'city management': 'Estate Agents & Property Management',
  'utilities department': 'Environment, Energy & Natural Resources',
  utilities: 'Environment, Energy & Natural Resources',
  construction: 'Real Estate & Construction',
  'construction department': 'Real Estate & Construction',
  'finance department': 'Accounting, Auditing & Finance',
  'hr department': 'Human Resources & Recruitment',
  'people department': 'Human Resources & Recruitment',
  'sales department': 'Sales',
  'marketing department': 'Marketing & Communications',
  other: '',
}

/**
 * Infer a CareerSasa job function from the job title (+ optional department hint).
 * Used when ATS provides no function taxonomy (common on Workable).
 */
export function inferJobFunctionFromTitle(
  title: string,
  allowed: string[],
  tagsHint?: string | null
): string | null {
  if (!title?.trim() || !allowed.length) return null
  const hay = `${title} ${tagsHint || ''}`.toLowerCase()

  const rules: Array<{ re: RegExp; fn: string }> = [
    { re: /\b(architect|architecture|urban design(er)?)\b/, fn: 'Building & Architecture' },
    { re: /\b(quantity surveyor|qs\b|contracts administrator|construction (manager|supervisor)|site manager|storekeeper|clerk of works|batch plant)\b/, fn: 'Real Estate & Construction' },
    { re: /\b(hse|ehs|health and safety|environmental health|safety officer)\b/, fn: 'Health & Safety' },
    { re: /\b(civil|structural|mep|material|electromechanical|electrical|mechanical)\b.*\b(engineer|engineering|supervisor)\b|\b(engineer|engineering|technologist)\b/, fn: 'Engineering & Technology' },
    { re: /\b(technician|electrician|plumber|welder|artisan|plant operator)\b/, fn: 'Trades & Services' },
    { re: /\b(sales|account executive|business development)\b/, fn: 'Sales' },
    { re: /\b(accountant|credit controller|financial analyst|finance|bookkeep|treasury|payroll)\b/, fn: 'Accounting, Auditing & Finance' },
    { re: /\b(legal|advocate|lawyer|counsel|compliance officer)\b/, fn: 'Legal Services' },
    { re: /\b(talent (acquisition|management)|recruiter|human resources?|\bhr\b|people partner|hr business partner|training and development|workforce management|people and culture|people & culture)\b/, fn: 'Human Resources & Recruitment' },
    { re: /\b(it support|software|developer|devops|sysadmin|system admin|network|cyber|helpdesk|help desk|privileged access|pam solution)\b/, fn: 'IT & Software' },
    { re: /\b(business (process )?analyst|data analyst|analytics|data scientist|machine learning|\bai\b)\b/, fn: 'Data, Analytics & AI' },
    { re: /\b(managing director|country director|chief |^director\b|project manager|programme manager|program manager|product manager|operations manager)\b/, fn: 'Management & Business Development' },
    { re: /\b(recovery officer|credit officer|loan officer|investment officer)\b/, fn: 'Accounting, Auditing & Finance' },
    { re: /\b(community relations|community liaison|social worker|stakeholder engagement)\b/, fn: 'Community & Social Services' },
    { re: /\b(marketing|communications|brand|pr\b|public relations)\b/, fn: 'Marketing & Communications' },
    { re: /\b(customer (care|service|success)|call centre|call center|reservations|service specialists?|retention agents?)\b/, fn: 'Customer Service & Support' },
    { re: /\b(real estate advisor|property advisor|estate agent)\b/, fn: 'Estate Agents & Property Management' },
    { re: /\b(procurement|supply chain|logistics|warehouse|inventory)\b/, fn: 'Supply Chain & Procurement' },
    { re: /\b(admin|office manager|executive assistant|receptionist|secretary|operations associate|operations officer|translator|interpreter)\b/, fn: 'Admin & Office' },
    { re: /\b(nurse|clinical|medical officer|pharmacist|doctor)\b/, fn: 'Healthcare & Medical' },
    { re: /\b(teacher|lecturer|trainer|instructor|curriculum)\b/, fn: 'Education & Training' },
    { re: /\b(security officer|security guard|loss prevention)\b/, fn: 'Security' },
  ]

  for (const rule of rules) {
    if (rule.re.test(hay)) {
      const matched = allowed.find(a => a.toLowerCase() === rule.fn.toLowerCase())
      if (matched) return matched
    }
  }

  // Department-only hint (e.g. "Legal Department") when title is generic
  if (tagsHint?.trim()) {
    return matchJobFunctionName(tagsHint.split(/[,|;]/)[0], allowed)
  }

  return null
}

function resolveAlias(hint: string, aliases: Record<string, string>, allowed: string[]): string | null {
  const key = hint.toLowerCase().trim()
  const aliased = aliases[key]
  if (aliased) {
    if (!aliased) return null
    return allowed.find(a => a.toLowerCase() === aliased.toLowerCase()) || fuzzyMatchOption(aliased, allowed)
  }
  // Require stronger fuzzy overlap than a single shared word like "Services"
  const normalized = key
  const parsedWords = normalized.split(/[^a-z0-9]+/).filter(w => w.length > 2)
  let bestMatch: string | null = null
  let bestScore = 0
  for (const dbName of allowed) {
    const dbWords = dbName.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2)
    const overlap = parsedWords.filter(pw => dbWords.includes(pw)).length
    if (overlap > bestScore) {
      bestScore = overlap
      bestMatch = dbName
    }
  }
  if (bestScore >= 2) return bestMatch
  return fuzzyMatchOption(hint, allowed)
}

export function matchIndustryName(
  hint: string | null | undefined,
  allowed: string[]
): string | null {
  if (!hint?.trim() || allowed.length === 0) return null
  return resolveAlias(hint, INDUSTRY_ALIASES, allowed)
}

export function matchJobFunctionName(
  hint: string | null | undefined,
  allowed: string[]
): string | null {
  if (!hint?.trim() || allowed.length === 0) return null
  return resolveAlias(hint, FUNCTION_ALIASES, allowed)
}

/**
 * Parse scraped job content into CareerSasa fields.
 * Tries AI first, falls back to rule-based splitting, then metadata-only AI.
 */
export async function parseScrapedJobContent(
  input: ScrapedJobInput,
  options?: { industryNames?: string[]; jobFunctionNames?: string[] }
): Promise<ParsedScrapedJobContent> {
  const fallback = parseScrapedJobFallback(input)
  const aiText = buildAIText(input)

  const hasAIKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.OPENROUTER_API_KEY,
  ].some(Boolean)

  let parsed = fallback

  if (hasAIKeys) {
    try {
      // Use callAI directly so the raw scraper JSON schema is preserved —
      // callAIWithRetry runs finalizeParsedJobData which remaps deadline →
      // valid_through and drops industry/job_function if they don't fuzzy-
      // match the employer-form taxonomy before mergeAIResult can read them.
      const result = await callAI(aiText, {
        systemPrompt: SCRAPER_PARSE_PROMPT,
        json: true,
        maxTokens: 4000,
        temperature: 0.1,
      })
      if (result.parsed && typeof result.parsed === 'object') {
        parsed = mergeAIResult(fallback, result.parsed as Record<string, unknown>)
      }
    } catch (err) {
      console.warn(
        '[scraperJobParsing] AI parse failed, using rule-based fallback:',
        err instanceof Error ? err.message : err
      )
    }
  } else {
    // Lightweight metadata extraction if Gemini keys exist for metadata-only path
    const plainText = [
      fallback.description,
      fallback.responsibilities,
      fallback.required_qualifications,
      fallback.additional_info,
    ]
      .filter(Boolean)
      .join('\n\n')

    const meta = await extractJobMetadata(plainText)
    parsed = {
      ...fallback,
      deadline: meta.deadline ?? fallback.deadline,
      education_level: meta.education_level ?? fallback.education_level,
      minimum_experience: meta.minimum_experience ?? fallback.minimum_experience,
      experience_level: meta.experience_level ?? fallback.experience_level,
      industry: meta.industry ?? fallback.industry,
      salary_min: meta.salary_min ?? fallback.salary_min,
      salary_max: meta.salary_max ?? fallback.salary_max,
      salary_currency: meta.salary_currency ?? fallback.salary_currency,
      salary_period: meta.salary_period ?? fallback.salary_period,
    }
  }

  // Only keep values that resolve to allowed CareerSasa taxonomy names
  const industryNames = options?.industryNames || []
  const jobFunctionNames = options?.jobFunctionNames || []

  const industry =
    matchIndustryName(parsed.industry, industryNames) ||
    matchIndustryName(input.industryHint, industryNames) ||
    // Workable rarely sends industry — fall back to known employer sector
    inferCompanyIndustry(input.company, null, industryNames) ||
    null

  // Prefer title keywords over ATS department labels (e.g. "City Management"
  // should not beat "Community Relations Manager" → Community & Social Services)
  const job_function =
    inferJobFunctionFromTitle(input.title, jobFunctionNames, null) ||
    matchJobFunctionName(parsed.job_function, jobFunctionNames) ||
    matchJobFunctionName(input.jobFunctionHint, jobFunctionNames) ||
    inferJobFunctionFromTitle(input.title, jobFunctionNames, input.tagsHint) ||
    null

  const tags = limitTags(
    buildTags({
      title: input.title,
      tagsHint: input.tagsHint,
      industry,
      jobFunction: job_function,
    }),
    5
  )

  return {
    ...parsed,
    industry,
    job_function,
    tags,
  }
}
