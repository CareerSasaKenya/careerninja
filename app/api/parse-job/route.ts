import { NextRequest, NextResponse } from "next/server";
import { 
  getCachedResponse, 
  callAIWithRetry, 
  saveToCache, 
  queueJobForParsing,
  ParsedJobData 
} from "@/lib/jobParsingOptimized";

export const runtime = "edge";

// Interface moved to shared library

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { jobText, async: useAsync = false } = await request.json();

    if (!jobText || typeof jobText !== "string") {
      return NextResponse.json(
        { error: "Job text is required" },
        { status: 400 }
      );
    }

    // Check if any API keys are configured
    const geminiApiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (geminiApiKeys.length === 0 && !openRouterApiKey) {
      return NextResponse.json(
        { error: "No AI API key configured. Please add GEMINI_API_KEY (free) or OPENROUTER_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    // For async processing, queue the job and return immediately
    if (useAsync) {
      try {
        const jobId = await queueJobForParsing(jobText);
        return NextResponse.json({
          success: true,
          jobId,
          message: "Job queued for processing. Use the job ID to check status."
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: `Failed to queue job: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Check cache first for immediate response
    const cachedResult = await getCachedResponse(jobText);
    if (cachedResult) {
      const processingTime = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
        processingTime
      });
    }

    // Use optimized AI parsing with caching
    try {
      const { response: parsedJob, modelUsed } = await callAIWithRetry(jobText, getOptimizedSystemPrompt());
      
      // Save to cache for future requests
      await saveToCache(jobText, parsedJob, modelUsed);
      
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        data: parsedJob,
        cached: false,
        processingTime,
        modelUsed
      });
    } catch (error: any) {
      console.error("AI parsing error:", error);
      return NextResponse.json(
        { 
          error: "Failed to parse job text with AI", 
          details: error.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Job parsing error:", error);
    return NextResponse.json(
      { 
        error: "Failed to parse job text", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Optimized system prompt (much shorter)
function getOptimizedSystemPrompt(): string {
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