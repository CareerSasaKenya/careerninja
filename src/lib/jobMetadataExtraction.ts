/**
 * AI-powered job metadata extraction using Gemini
 *
 * Sends the complete job text (description + requirements + benefits)
 * to Gemini and extracts structured fields that are not available
 * directly from the source API.
 */

export interface ExtractedJobMetadata {
  deadline: string | null           // YYYY-MM-DD format, e.g. "2026-06-16"
  education_level: string | null    // e.g. "Bachelor's", "Master's", "Diploma", "PhD"
  minimum_experience: number | null // integer years, e.g. 5
  experience_level: string | null   // "Entry", "Mid", "Senior", "Executive"
  industry: string | null           // e.g. "Financial Services", "Healthcare", "NGO"
  salary_min: number | null         // numeric, only if explicitly stated
  salary_max: number | null         // numeric, only if explicitly stated
  salary_currency: string | null    // e.g. "KES", "USD"
  salary_period: string | null      // "MONTH", "YEAR", "DAY"
}

const EXTRACTION_PROMPT = `You are a precise job posting data extractor. Read the job posting text carefully and extract the following fields.

CRITICAL RULES:
1. Only extract information that is EXPLICITLY stated in the text. Do NOT infer or guess.
2. For deadline/closing date: search the ENTIRE text for phrases like "DEADLINE:", "closing date", "apply by", "applications close", "last date". Extract the EXACT date mentioned.
3. For dates: return in YYYY-MM-DD format. If the year is not mentioned but context makes it clear (e.g. near future), infer from the posting context.
4. For education: return exactly one of: "Diploma", "Bachelor's", "Master's", "PhD", "Certificate", or null if not specified.
5. For experience years: return the MINIMUM years mentioned (e.g. "5-7 years" → 5).
6. For experience level: return one of: "Entry", "Mid", "Senior", "Executive", or null.
7. For salary: only return values if a specific number is stated. Do NOT guess.
8. Return ONLY valid JSON, no markdown, no explanation.

Return this exact JSON structure:
{
  "deadline": "YYYY-MM-DD or null",
  "education_level": "Diploma|Bachelor's|Master's|PhD|Certificate|null",
  "minimum_experience": number_or_null,
  "experience_level": "Entry|Mid|Senior|Executive|null",
  "industry": "string or null",
  "salary_min": number_or_null,
  "salary_max": number_or_null,
  "salary_currency": "KES|USD|EUR|GBP|null",
  "salary_period": "MONTH|YEAR|DAY|HOUR|null"
}`

async function callGemini(apiKey: string, jobText: string): Promise<ExtractedJobMetadata> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000) // 7s max — must finish within Vercel's 10s

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${EXTRACTION_PROMPT}\n\nJOB POSTING TEXT:\n${jobText}` }] }],
          generationConfig: {
            temperature: 0.0,  // zero temperature = most deterministic output
            maxOutputTokens: 512,
          },
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`)

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip markdown code fences if present
    const cleaned = content.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```\n?$/, '')

    return JSON.parse(cleaned) as ExtractedJobMetadata
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Extract job metadata from the full job text.
 * Falls back gracefully — if AI fails for any reason, returns all nulls
 * so the job still gets published without blocking.
 */
export async function extractJobMetadata(
  fullJobText: string
): Promise<ExtractedJobMetadata> {
  const fallback: ExtractedJobMetadata = {
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

  const apiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[]

  if (apiKeys.length === 0) return fallback

  // Strip HTML tags from the text before sending to Gemini — cleaner input = better output
  const plainText = fullJobText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    // Limit to 6000 chars — enough context, avoids hitting token limits
    .slice(0, 6000)

  for (const key of apiKeys) {
    try {
      const result = await callGemini(key, plainText)
      return result
    } catch (err) {
      console.warn('[jobMetadata] Gemini key failed, trying next:', err instanceof Error ? err.message : err)
    }
  }

  console.warn('[jobMetadata] All Gemini keys failed, using fallback nulls')
  return fallback
}

/**
 * Map education level string to careerninja's education_levels table ID.
 * Returns null if no match — job will be published without education filter.
 */
export function mapEducationLevel(
  level: string | null,
  educationLevels: Array<{ id: number; name: string }>
): number | null {
  if (!level) return null

  const normalized = level.toLowerCase()

  // Try exact match first
  const exact = educationLevels.find(e => e.name.toLowerCase() === normalized)
  if (exact) return exact.id

  // Try partial match
  const partial = educationLevels.find(e =>
    e.name.toLowerCase().includes(normalized) ||
    normalized.includes(e.name.toLowerCase())
  )
  return partial?.id ?? null
}
