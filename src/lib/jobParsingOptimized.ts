import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Create a Supabase client for server-side operations
// Check if required environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the Supabase client if we have the required variables
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

export interface ParsedJobData {
  title: string;
  company: string;
  description: string;
  responsibilities: string;
  required_qualifications: string;
  software_skills?: string;
  employment_type: string;
  employment_types?: string[];
  job_location_type: string;
  job_location_types?: string[];
  job_location_country: string;
  job_location_county?: string;
  job_location_city?: string;
  additional_locations?: Array<{ county: string; city: string }>;
  industry: string;
  industries?: string[];
  education_level_name?: string;
  area_of_study?: string;
  field_of_study?: string;
  education_requirements?: string;
  experience_level: string;
  language_requirements?: string;
  salary_min?: string;
  salary_max?: string;
  salary_period?: string;
  salary_currency?: string;
  minimum_experience?: string;
  apply_email?: string;
  apply_link?: string;
  application_url?: string;
  additional_info?: string;
  tags?: string;
  job_function?: string;
  job_functions?: string[];
  valid_through?: string;
}

export interface JobParsingResult {
  success: boolean;
  data?: ParsedJobData;
  error?: string;
  cached?: boolean;
  processingTime?: number;
}

// Generate hash for caching using Web Crypto API (Edge runtime compatible)
async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check cache first
export async function getCachedResponse(jobText: string): Promise<ParsedJobData | null> {
  // If Supabase isn't configured, return null
  if (!supabase) {
    console.warn("Supabase not configured - skipping cache lookup");
    return null;
  }
  
  try {
    const hash = await generateHash(jobText);
    
    const { data, error } = await (supabase as any)
      .from('ai_response_cache')
      .select('response_data')
      .eq('input_hash', hash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Update hit count
    await (supabase as any)
      .from('ai_response_cache')
      .update({ hit_count: (supabase as any).sql`hit_count + 1` })
      .eq('input_hash', hash);

    return sanitizeParsedJobData(data.response_data as ParsedJobData & { status?: string; job_status?: string });
  } catch (error) {
    console.error('Cache lookup error:', error);
    return null;
  }
}

// Save response to cache
export async function saveToCache(
  jobText: string, 
  response: ParsedJobData, 
  modelUsed: string = 'unknown'
): Promise<void> {
  // If Supabase isn't configured, skip cache save
  if (!supabase) {
    console.warn("Supabase not configured - skipping cache save");
    return;
  }
  
  try {
    const hash = await generateHash(jobText);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days cache

    await (supabase as any)
      .from('ai_response_cache')
      .upsert({
        input_hash: hash,
        input_text: jobText,
        response_data: response,
        model_used: modelUsed,
        expires_at: expiresAt.toISOString(),
        hit_count: 1
      }, {
        onConflict: 'input_hash'
      });
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

// Optimized AI API call with timeout and retry
// Priority chain: Gemini → Groq → OpenRouter
export async function callAIWithRetry(
  jobText: string,
  systemPrompt: string,
  maxRetries: number = 2
): Promise<{ response: ParsedJobData; modelUsed: string }> {
  const geminiApiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);
  
  const groqApiKey = process.env.GROQ_API_KEY;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  
  let lastError: any = null;
  
  // 1. Try Gemini keys first
  for (const apiKey of geminiApiKeys) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await callGeminiAPI(apiKey!, jobText, systemPrompt);
        return { response, modelUsed: 'gemini-2.5-flash' };
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  // 2. Fallback to Groq
  if (groqApiKey) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await callGroqAPI(groqApiKey, jobText, systemPrompt);
        return { response, modelUsed: 'llama-3.3-70b-versatile' };
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  // 3. Fallback to OpenRouter
  if (openRouterApiKey) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await callOpenRouterAPI(openRouterApiKey, jobText, systemPrompt);
        return { response, modelUsed: 'gemini-2.5-flash (openrouter)' };
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
  
  throw lastError || new Error('All AI services failed');
}

// Optimized Gemini API call
async function callGeminiAPI(apiKey: string, jobText: string, systemPrompt: string): Promise<ParsedJobData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}

Parse this job posting:

${jobText}` }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 6000, // Reduced from 8000
          }
        }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in Gemini response');
    }
    
    return parseAIResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Optimized Groq API call (Llama 3.3 70B)
async function callGroqAPI(apiKey: string, jobText: string, systemPrompt: string): Promise<ParsedJobData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this job posting:\n\n${jobText}` },
        ],
        temperature: 0.1,
        max_tokens: 6000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq response');
    }

    return parseAIResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Optimized OpenRouter API call
async function callOpenRouterAPI(apiKey: string, jobText: string, systemPrompt: string): Promise<ParsedJobData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careersasa.co.ke",
        "X-Title": "CareerSasa Job Parser",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this job posting:\n\n${jobText}` },
        ],
        temperature: 0.1,
        max_tokens: 6000, // Reduced from 8000
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenRouter response');
    }
    
    return parseAIResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Parse AI response with better error handling
function sanitizeParsedJobData(data: ParsedJobData & { status?: string; job_status?: string; direct_apply?: boolean }): ParsedJobData {
  const { status: _status, job_status: _jobStatus, direct_apply: _directApply, ...clean } = data;
  return clean as ParsedJobData;
}

function parseAIResponse(content: string): ParsedJobData {
  let cleanedContent = content.trim();
  
  // Remove markdown code blocks
  if (cleanedContent.startsWith("``json")) {
    cleanedContent = cleanedContent.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.replace(/^```\n/, "").replace(/\n```$/, "");
  }
  
  try {
    return sanitizeParsedJobData(JSON.parse(cleanedContent));
  } catch (error) {
    // Try to extract JSON from the response
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return sanitizeParsedJobData(JSON.parse(jsonMatch[0]));
      } catch (e) {
        throw new Error(`Failed to parse AI response: ${error}`);
      }
    }
    throw new Error(`Invalid JSON in AI response: ${error}`);
  }
}

// Queue job for async processing
export async function queueJobForParsing(jobText: string): Promise<string> {
  // If Supabase isn't configured, throw an error
  if (!supabase) {
    throw new Error("Supabase not configured - cannot queue job");
  }
  
  const hash = await generateHash(jobText);
  
  const { data, error } = await (supabase as any)
    .from('job_parsing_queue')
    .insert({
      job_text: jobText,
      job_text_hash: hash,
      status: 'pending'
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to queue job: ${error.message}`);
  }
  
  return data.id;
}

// Get job parsing status
export async function getJobParsingStatus(jobId: string): Promise<{
  status: string;
  result?: ParsedJobData;
  error?: string;
  progress?: number;
}> {
  // If Supabase isn't configured, throw an error
  if (!supabase) {
    throw new Error("Supabase not configured - cannot get job status");
  }
  
  const { data, error } = await (supabase as any)
    .from('job_parsing_queue')
    .select('status, result, error_message')
    .eq('id', jobId)
    .single();
  
  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }
  
  return {
    status: data.status,
    result: data.result as ParsedJobData | undefined,
    error: data.error_message || undefined,
    progress: data.status === 'completed' ? 100 : data.status === 'processing' ? 50 : 0
  };
}

// Process queued jobs (for background processing)
export async function processQueuedJobs(batchSize: number = 5): Promise<void> {
  // If Supabase isn't configured, skip processing
  if (!supabase) {
    console.warn("Supabase not configured - skipping job processing");
    return;
  }
  
  const { data: jobs, error } = await (supabase as any)
    .from('job_parsing_queue')
    .select('id, job_text')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);
  
  if (error || !jobs?.length) {
    return;
  }
  
  // Process jobs in parallel (but limited batch size)
  await Promise.allSettled(
    jobs.map((job: any) => processQueuedJob(job.id, job.job_text))
  );
}

// Process individual queued job
async function processQueuedJob(jobId: string, jobText: string): Promise<void> {
  // If Supabase isn't configured, skip processing
  if (!supabase) {
    console.warn("Supabase not configured - skipping job processing");
    return;
  }
  
  try {
    // Mark as processing
    await (supabase as any)
      .from('job_parsing_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', jobId);
    
    // Check cache first
    let result = await getCachedResponse(jobText);
    let modelUsed = 'cache';
    
    if (!result) {
      // Parse with AI
      const aiResult = await callAIWithRetry(jobText, getSystemPrompt());
      result = aiResult.response;
      modelUsed = aiResult.modelUsed;
      
      // Save to cache
      await saveToCache(jobText, result, modelUsed);
    }
    
    // Mark as completed
    await (supabase as any)
      .from('job_parsing_queue')
      .update({ 
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
      
  } catch (error: any) {
    // Mark as failed
    await (supabase as any)
      .from('job_parsing_queue')
      .update({ 
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

// Get optimized system prompt (reduced size)
function getSystemPrompt(): string {
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
10. Extract ALL fields that are present in the text — be thorough

CRITICAL FIELDS TO EXTRACT:
- education_level_name: The highest education required, e.g., "Bachelor's Degree", "Diploma", "Certificate", "Master's Degree", "PhD", "KCSE"
- area_of_study: The general area/discipline if specified, e.g., "Science", "Commerce", "Arts", "Engineering", "Business"
- field_of_study: The specific course/major if mentioned, e.g., "Industrial Chemistry", "Computer Science", "Electrical Engineering", "Accounting"
- education_requirements: Full text of education requirements if complex (e.g., multiple accepted degrees)
- job_location_country: "Kenya" (default if not stated)
- job_location_county: Kenyan county name (Nairobi, Mombasa, Kiambu, Nakuru, Kisumu, etc.)
- job_location_city: City or town name
- additional_locations: Array of {county, city} objects for other locations the job is available in
- industries: Array of sectors/industries that apply (e.g., ["Technology", "Finance"]). Include ALL that apply.
- job_functions: Array of functional areas (e.g., ["Engineering", "Product Management"]). Include ALL that apply.
- valid_through: Application deadline in ISO date format YYYY-MM-DD (e.g., "2025-07-30"). Extract from "deadline", "closing date", "apply by", "valid until" etc.
- minimum_experience: Minimum years of experience as a number (e.g., "3" from "3+ years", "minimum 5 years")
- apply_email: Application email address extracted from "send to", "email", "apply to"
- apply_link: Application URL extracted from "apply at", "apply online", "visit", application link
- application_url: Company career page URL if different from apply_link
- tags: Comma-separated relevant keywords/skills for the role
- language_requirements: Language requirements if mentioned (e.g., "English", "Kiswahili")

ADDITIONAL_INFO: Include application instructions and 4 brief tips for this role type.

Return JSON structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "description": "<p>Job description</p>",
  "responsibilities": "<ul><li>Task 1</li></ul>",
  "required_qualifications": "<ul><li>Qual 1</li></ul>",
  "employment_types": ["FULL_TIME", "PART_TIME"],
  "job_location_types": ["ON_SITE", "REMOTE"],
  "job_location_country": "Kenya",
  "job_location_county": "Nairobi",
  "job_location_city": "Nairobi",
  "additional_locations": [{"county": "Mombasa", "city": "Mombasa"}],
  "industries": ["Technology", "Finance"],
  "job_functions": ["Engineering", "Product Management"],
  "education_level_name": "Bachelor's Degree",
  "area_of_study": "Science",
  "field_of_study": "Computer Science",
  "education_requirements": "Bachelor of Science in Computer Science, IT, or related field",
  "experience_level": "Mid",
  "minimum_experience": "3",
  "valid_through": "2025-07-30",
  "salary_min": 80000,
  "salary_max": 120000,
  "salary_period": "MONTH",
  "salary_currency": "KES",
  "apply_email": "careers@company.com",
  "apply_link": "https://company.com/apply",
  "application_url": "https://company.com/careers",
  "tags": "react, nodejs, web development",
  "language_requirements": "English",
  "additional_info": "<p><strong>How to Apply:</strong> Instructions here</p><h3>Tips:</h3><p>1. Tip one...</p>"
}`;
}