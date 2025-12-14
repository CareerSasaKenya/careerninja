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
3. employment_type: FULL_TIME, PART_TIME, CONTRACTOR, INTERN, TEMPORARY, VOLUNTEER
4. job_location_type: ON_SITE, REMOTE, HYBRID
5. experience_level: Entry, Mid, Senior, Managerial, Internship
6. salary_period: HOUR, DAY, WEEK, MONTH, YEAR
7. salary_currency: KES, USD
8. Extract salary as numbers only
9. If not found, omit field

CRITICAL FIELDS:
- education_level_name: "Bachelor's Degree", "Diploma", "Certificate", etc.
- job_location_country: "Kenya" (default)
- job_location_county: Extract county (Nairobi, Mombasa, etc.)
- job_location_city: Extract city/town

ADDITIONAL_INFO: Include application instructions and 4 brief tips for this role type.

Return JSON structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "description": "<p>Job description</p>",
  "responsibilities": "<ul><li>Task 1</li></ul>",
  "required_qualifications": "<ul><li>Qual 1</li></ul>",
  "employment_type": "FULL_TIME",
  "job_location_type": "ON_SITE",
  "job_location_country": "Kenya",
  "job_location_county": "Nairobi",
  "job_location_city": "Nairobi",
  "industry": "Technology",
  "education_level_name": "Bachelor's Degree",
  "experience_level": "Mid",
  "additional_info": "<p><strong>How to Apply:</strong> Instructions here</p><h3>Tips:</h3><p>1. Tip one...</p>"
}`;


