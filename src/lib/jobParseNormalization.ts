/** Shared helpers for normalizing AI-parsed job fields against allowed dropdown values. */

export const FALLBACK_INDUSTRIES = [
  'Accounting, Auditing & Finance',
  'Advertising, Media & Communications',
  'Agriculture, Fishing & Forestry',
  'Automotive & Aviation',
  'Banking, Insurance & Financial Services',
  'Building, Construction & Real Estate',
  'Charity, NGO & Non-Profit',
  'Community & Social Services',
  'Consulting & Professional Services',
  'Creative Arts, Entertainment & Design',
  'Education & Training',
  'Energy, Utilities & Waste Management',
  'Engineering & Technical Services',
  'Environment & Natural Resources',
  'Fashion & Beauty',
  'Food Services, Hospitality & Catering',
  'Government & Public Administration',
  'Healthcare, Medical & Pharmaceutical',
  'Human Resources & Recruitment',
  'ICT & Telecommunications',
  'Import & Export',
  'Legal Services',
  'Logistics & Transportation',
  'Manufacturing & Warehousing',
  'Marketing & Public Relations',
  'Mining, Oil & Gas',
  'NGO, NPO & Charity',
  'Printing, Publishing & Packaging',
  'Real Estate & Property Management',
  'Research, Science & Technology',
  'Retail, Wholesale, E-commerce & FMCG',
  'Security & Defence',
  'Sports, Fitness & Recreation',
  'Tourism, Travel & Leisure',
  'Agriculture & Agribusiness',
  'Financial Technology (FinTech)',
  'Media, Film & Broadcasting',
  'Maritime & Shipping',
  'Education Technology (EdTech)',
  'Arts, Culture & Heritage',
  'Renewable Energy & Climate',
  'Chemical & Process Industry',
  'Transport & Infrastructure',
  'Business Process Outsourcing (BPO)',
  'Health Tech & Biotechnology',
  'Non-classified / Miscellaneous',
] as const;

export const FALLBACK_JOB_FUNCTIONS = [
  'Accounting, Auditing & Finance',
  'Admin & Office',
  'Agriculture, Food & Natural Resources',
  'Building & Architecture',
  'Community & Social Services',
  'Consulting & Strategy',
  'Creative & Design',
  'Customer Service & Support',
  'Driver & Transport Services',
  'Education & Training',
  'Engineering & Technology',
  'Environment, Energy & Natural Resources',
  'Estate Agents & Property Management',
  'Farming & Veterinary',
  'Food Services & Catering',
  'Health & Safety',
  'Healthcare & Medical',
  'Hospitality & Leisure',
  'Human Resources & Recruitment',
  'IT & Software',
  'Legal Services',
  'Management & Business Development',
  'Manufacturing & Warehousing',
  'Marketing & Communications',
  'Product & Project Management',
  'Quality Control & Assurance',
  'Research, Teaching & Training',
  'Sales',
  'Security',
  'Supply Chain & Procurement',
  'Trades & Services',
  'Travel, Tourism & Leisure',
  'Volunteer & NGO Work',
  'Government & Public Service',
  'Banking, Insurance & Financial Services',
  'Media, Advertising & PR',
  'Science & Laboratory',
  'Telecommunications',
  'Sports, Fitness & Recreation',
  'NGO, NPO & Charity',
  'Beauty, Wellness & Fitness',
  'Real Estate & Construction',
  'Logistics & Transportation',
  'Retail, Fashion & FMCG',
  'Maintenance, Repair & Installation',
  'Data, Analytics & AI',
  'Other / Miscellaneous',
] as const;

export const MAX_JOB_TAGS = 5;

export function getDefaultValidThrough(fromDate = new Date()): string {
  const expiry = new Date(fromDate);
  expiry.setDate(expiry.getDate() + 30);
  return expiry.toISOString().split("T")[0];
}

/**
 * Resolve a posting deadline for manual/AI parse flows.
 * Empty → 30 days from postingDate. Non-empty values are kept as-is
 * (callers that need expiry gating should use resolveScrapedDeadline).
 */
export function resolveValidThrough(
  validThrough: string | null | undefined,
  postingDate = new Date()
): string {
  const trimmed = validThrough?.trim();
  if (!trimmed) return getDefaultValidThrough(postingDate);

  // Prefer YYYY-MM-DD; if a past date is supplied by a form/parser, keep it
  // so the UI can show the chosen value (scrapers use resolveScrapedDeadline).
  const isoDay = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDay) return isoDay[1];

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return getDefaultValidThrough(postingDate);
}

export function fuzzyMatchOption(
  parsedValue: string | undefined,
  allowedNames: string[] | undefined
): string | null {
  if (!parsedValue || !allowedNames || allowedNames.length === 0) return null;
  const normalized = parsedValue.toLowerCase().trim();
  const exact = allowedNames.find((n) => n.toLowerCase().trim() === normalized);
  if (exact) return exact;
  const sub = allowedNames.find((n) => {
    const dbNorm = n.toLowerCase().trim();
    return dbNorm.includes(normalized) || normalized.includes(dbNorm);
  });
  if (sub) return sub;
  const parsedWords = normalized.split(/\s+/).filter((w) => w.length > 2);
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const dbName of allowedNames) {
    const dbWords = dbName.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 2);
    const overlap = parsedWords.filter((pw) => dbWords.includes(pw)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      bestMatch = dbName;
    }
  }
  return bestScore > 0 ? bestMatch : null;
}

export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function matchToAllowedOptions(parsedValues: string[], allowedNames: string[]): string[] {
  const matched: string[] = [];
  const seen = new Set<string>();

  for (const parsed of parsedValues) {
    const option = fuzzyMatchOption(parsed, allowedNames);
    if (!option) continue;
    const key = option.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    matched.push(option);
  }

  return matched;
}

export function parseTagsInput(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return dedupeStrings(tags.map((tag) => String(tag)));
  }
  return dedupeStrings(
    tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  );
}

export function limitTags(tags: string | string[] | null | undefined, max = MAX_JOB_TAGS): string {
  return parseTagsInput(tags).slice(0, max).join(', ');
}

export function buildJobParseSystemPrompt(
  industryNames: string[],
  jobFunctionNames: string[]
): string {
  return `You are a job posting parser. Extract structured information and return ONLY valid JSON.

RULES:
1. Return ONLY JSON, no markdown or explanations
2. Use clean HTML for text fields (<p>, <ul>, <li>, <strong> only)
3. employment_types: Array of FULL_TIME, PART_TIME, CONTRACTOR, INTERN, TEMPORARY, VOLUNTEER (include ALL that apply)
4. job_location_types: Array of ON_SITE, REMOTE, HYBRID (include ALL that apply)
5. experience_level: Entry, Mid, Senior, Managerial, Internship
6. salary_period: HOUR, DAY, WEEK, MONTH, YEAR
7. salary_currency: KES, USD
8. Extract salary as numbers only (e.g., 80000 not "80,000")
9. If a field is not found in the text, OMIT it from the JSON entirely
10. Put all education/degree requirements inside required_qualifications only — do NOT output education_requirements
11. industries: ONLY exact names from ALLOWED_INDUSTRIES (max 3, no duplicates). NEVER invent values.
12. job_functions: ONLY exact names from ALLOWED_JOB_FUNCTIONS (max 3, no duplicates). NEVER invent values.
13. tags: Comma-separated string with at most 5 of the most relevant skills/keywords
14. If no allowed industry or job function clearly matches, OMIT that field entirely
15. description: Write a clear role overview in <p> tags (2–4 sentences). Use facts from the posting only — do not invent duties, benefits, or requirements.
16. required_qualifications: When REQUIREMENTS are already bullet points, keep every fact and number verbatim — do not paraphrase, drop Need Type codes, or merge rows. NEVER put experience-level labels alone here (e.g. "Mid level", "Senior", "Unspecified") — those belong ONLY in experience_level. Extract the full education, skills, and experience requirements from the posting.

ALLOWED_INDUSTRIES: ${JSON.stringify(industryNames)}
ALLOWED_JOB_FUNCTIONS: ${JSON.stringify(jobFunctionNames)}

CRITICAL FIELDS TO EXTRACT:
- education_level_name: The highest education required, e.g., "Bachelor's Degree", "Diploma", "Certificate", "Master's Degree", "PhD", "KCSE"
- area_of_study: The general area/discipline if specified, e.g., "Science", "Commerce", "Arts", "Engineering", "Business"
- field_of_study: The specific course/major if mentioned, e.g., "Industrial Chemistry", "Computer Science", "Electrical Engineering", "Accounting"
- job_location_country: "Kenya" (default if not stated)
- job_location_county: Kenyan county name (Nairobi, Mombasa, Kiambu, Nakuru, Kisumu, etc.)
- job_location_city: City or town name
- additional_locations: Array of {county, city} objects for other locations the job is available in
- valid_through: Application deadline in ISO date format YYYY-MM-DD (e.g., "2025-07-30"). Extract from deadline/closing date text when stated. ALWAYS include this field — if no deadline is mentioned, use a date 30 days from today.
- minimum_experience: Minimum years of experience as a number (e.g., "3" from "3+ years", "minimum 5 years")
- apply_email: Application email address extracted from "send to", "email", "apply to"
- apply_link: Application URL extracted from "apply at", "apply online", "visit", application link
- application_url: Company career page URL if different from apply_link
- language_requirements: Language requirements if mentioned (e.g., "English", "Kiswahili")

ADDITIONAL_INFO (HTML only — How to Apply + tips):
1) HOW TO APPLY
- Keep a short "<p><strong>How to Apply:</strong> …</p>" block first.
- If the posting gives apply steps, keep those facts.
- If apply steps are missing BUT an email, apply link, career page URL, or original source URL is available: tell the candidate to send their application to that email and/or visit the application link. Example: "Send your application to hr@company.com." or "Visit the application link provided on this page to submit your application."
- NEVER write phrases like "Application instructions were not provided in the job posting" (or similar) when any apply email, website link, external link, or original source is available.

2) CAREER TIPS — ALWAYS GENERATE (meaty, job-specific, non-repetitive)
- After How to Apply, add an enticing <h3> subtopic customized to THIS posting's duties, tools, industry, and seniority.
- Do NOT use bland headings: "Tips", "Application Tips", "Interview Tips", "Career Tips".
- FORBIDDEN heading patterns (these are overused — never use them):
  - "How to Actually Win This [Job Title] Interview"
  - "How to Win This … Interview"
  - "How to Actually Land This …"
  - Any title that is only "How to … This [exact job title] Interview"
- Write a fresh heading every time. Vary angle by role: CV proof for this craft, first 90 days, what hiring managers probe, portfolio/demo prep, field realities, stakeholder communication, etc. Ground the title in something concrete from THIS posting (tools, sector, seniority, or core duty) — not a fill-in-the-blank job-title template.
- Immediately under the <h3>, write one short intro <p> with a hook (2–3 sentences). Speak like a sharp Kenyan career coach: warm, direct, specific. No fluff.
- FORBIDDEN intro closers / stock lines (never use):
  - "Here's how to stand out from the crowd."
  - "Here's how to stand out."
  - "Follow these tips to stand out."
  - "Use these tips to beat the competition."
  - Ending the intro with a generic "here's how…" teaser that could fit any job.
- End the intro with a line that is specific to this role's realities (e.g. what this employer will actually test or what weak applications usually miss for THIS function) — not a crowd/competition cliché.
- Then exactly 8 numbered tips, customized to this role’s duties, tools, seniority, and hiring context. Do not reuse generic advice that could fit any job.
- Each tip format:
  <p><strong>N. Short tip title:</strong> Then 3 to 5 full explanation sentences. Make them practical and concrete (what to put on the CV, what to prepare, what managers for this role usually probe). Optional one brief concrete example in the same paragraph — do not invent employer policies or benefits.</p>
- Tip titles stay short (a few words). The meat lives in the sentences beneath. Vary tip openings — do not start every tip with the same verb or phrase.
- Sound naturally human. Avoid robotic AI patterns: no "In today's competitive landscape", "leverage", "utilize", "delve into", "it's important to note", "furthermore/moreover" stacks, or identical sentence openings across tips.
- Do NOT invent salary figures, deadlines, company facts, or benefits not in the posting. Tips are advice, not fake employer claims.
- Allowed tags in additional_info: <p>, <ul>, <li>, <strong>, <em>, <h3>, <a>, <br>.

Return JSON structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "description": "<p>Job description</p>",
  "responsibilities": "<ul><li>Task 1</li></ul>",
  "required_qualifications": "<ul><li>Qual 1</li></ul>",
  "employment_types": ["FULL_TIME"],
  "job_location_types": ["ON_SITE"],
  "job_location_country": "Kenya",
  "job_location_county": "Nairobi",
  "job_location_city": "Nairobi",
  "industries": ["Manufacturing & Warehousing"],
  "job_functions": ["Quality Control & Assurance"],
  "education_level_name": "Bachelor's Degree",
  "area_of_study": "Science",
  "field_of_study": "Industrial Chemistry",
  "experience_level": "Mid",
  "minimum_experience": "3",
  "valid_through": "2025-07-30",
  "salary_min": 80000,
  "salary_max": 120000,
  "salary_period": "MONTH",
  "salary_currency": "KES",
  "apply_email": "careers@company.com",
  "apply_link": "https://company.com/apply",
  "tags": "quality assurance, ISO, manufacturing",
  "language_requirements": "English",
  "additional_info": "<p><strong>How to Apply:</strong> Send your CV to careers@company.com.</p><h3>Show ISO Discipline On Paper Before You Walk Into QA</h3><p>Quality roles get flooded with vague 'attention to detail' claims. Hiring teams for this kind of post want proof you can catch defects, document findings, and hold a line under production pressure.</p><p><strong>1. Short tip title:</strong> Three to five meaty sentences customized to this role…</p>"
}`;
}

export type NormalizableParsedJob = {
  industry?: string;
  industries?: string[];
  job_function?: string;
  job_functions?: string[];
  tags?: string;
  valid_through?: string;
  education_requirements?: string;
};

export function normalizeParsedJobFields<T extends NormalizableParsedJob>(
  data: T,
  industryNames: string[],
  jobFunctionNames: string[]
): T {
  const normalized = { ...data } as T & NormalizableParsedJob;

  delete normalized.education_requirements;

  const rawIndustries = dedupeStrings([
    ...(normalized.industries || []),
    ...(normalized.industry ? [normalized.industry] : []),
  ]);
  const matchedIndustries = matchToAllowedOptions(rawIndustries, industryNames);
  if (matchedIndustries.length > 0) {
    normalized.industries = matchedIndustries;
    normalized.industry = matchedIndustries[0];
  } else {
    delete normalized.industries;
    delete normalized.industry;
  }

  const rawFunctions = dedupeStrings([
    ...(normalized.job_functions || []),
    ...(normalized.job_function ? [normalized.job_function] : []),
  ]);
  const matchedFunctions = matchToAllowedOptions(rawFunctions, jobFunctionNames);
  if (matchedFunctions.length > 0) {
    normalized.job_functions = matchedFunctions;
    normalized.job_function = matchedFunctions[0];
  } else {
    delete normalized.job_functions;
    delete normalized.job_function;
  }

  if (normalized.tags) {
    normalized.tags = limitTags(normalized.tags);
  }

  normalized.valid_through = resolveValidThrough(normalized.valid_through);

  return normalized as T;
}
