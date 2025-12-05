import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface ParsedJob {
  title: string;
  company: string;
  description: string;
  responsibilities: string;
  required_qualifications: string;
  software_skills?: string;
  employment_type: string;
  job_location_type: string;
  job_location_country: string;
  job_location_county?: string;
  job_location_city?: string;
  industry: string;
  education_level_id?: string;
  experience_level: string;
  language_requirements?: string;
  salary_min?: string;
  salary_max?: string;
  salary_period?: string;
  salary_currency?: string;
  minimum_experience?: string;
  apply_email?: string;
  apply_link?: string;
  additional_info?: string;
  tags?: string;
  job_function?: string;
  valid_through?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { jobText } = await request.json();

    if (!jobText || typeof jobText !== "string") {
      return NextResponse.json(
        { error: "Job text is required" },
        { status: 400 }
      );
    }

    // Try Gemini first (free tier), fallback to OpenRouter
    // Support multiple Gemini keys: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3
    const geminiApiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean); // Remove undefined/null values
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    console.log("API Keys available:", {
      geminiKeysCount: geminiApiKeys.length,
      hasOpenRouter: !!openRouterApiKey,
      geminiKeyPrefixes: geminiApiKeys.map(k => k!.substring(0, 10) + "...")
    });
    
    if (geminiApiKeys.length === 0 && !openRouterApiKey) {
      return NextResponse.json(
        { error: "No AI API key configured. Please add GEMINI_API_KEY (free) or OPENROUTER_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a job posting parser. Extract structured information from job postings and return ONLY valid JSON.

IMPORTANT RULES:
1. Return ONLY the JSON object, no markdown, no explanations
2. All text fields should be clean HTML (use <p>, <ul>, <li>, <strong>, <em> tags only)
3. For employment_type, use ONLY: FULL_TIME, PART_TIME, CONTRACTOR, INTERN, TEMPORARY, VOLUNTEER
4. For job_location_type, use ONLY: ON_SITE, REMOTE, HYBRID
5. For experience_level, use ONLY: Entry, Mid, Senior, Managerial, Internship
6. For salary_period, use ONLY: HOUR, DAY, WEEK, MONTH, YEAR
7. For salary_currency, use ONLY: KES, USD
8. Extract salary as numbers only (no currency symbols or commas)
9. Tags should be comma-separated keywords
10. If information is not found, omit the field or use empty string

CRITICAL FIELDS TO EXTRACT:

EDUCATION LEVEL (education_level_id):
- Look for phrases like: "Bachelor's degree", "Master's", "Diploma", "Certificate", "PhD", "Degree required", "University graduate"
- Map to ID: "1" = Certificate, "2" = Diploma, "3" = Bachelor's Degree, "4" = Master's Degree, "5" = PhD, "6" = High School
- If "degree" or "bachelor" mentioned → use "3"
- If "diploma" mentioned → use "2"
- If "certificate" mentioned → use "1"
- If "master" mentioned → use "4"
- If no education mentioned → omit field

LOCATION (CRITICAL):
- job_location_country: Always "Kenya" unless explicitly stated otherwise
- job_location_county: Extract county name (e.g., "Nairobi", "Mombasa", "Kisumu", "Nakuru")
- job_location_city: Extract city/town name (e.g., "Nairobi", "Westlands", "Mombasa", "Eldoret")
- Look for phrases: "Location:", "Based in", "Office in", "Work from"

APPLICATION INFORMATION (additional_info):
- Extract ALL application instructions as HTML
- Look for: "How to Apply", "Application Process", "To Apply", "Send CV to", "Apply via", "Application Deadline"
- Include: email addresses, application links, required documents, deadline dates
- Format as: "<p><strong>How to Apply:</strong></p><ul><li>Send CV to email@company.com</li><li>Deadline: Date</li></ul>"

Return JSON in this exact structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "description": "<p>Job description with HTML formatting</p>",
  "responsibilities": "<ul><li>Responsibility 1</li><li>Responsibility 2</li></ul>",
  "required_qualifications": "<ul><li>Qualification 1</li><li>Qualification 2</li></ul>",
  "software_skills": "Comma-separated skills",
  "employment_type": "FULL_TIME",
  "job_location_type": "ON_SITE",
  "job_location_country": "Kenya",
  "job_location_county": "Nairobi",
  "job_location_city": "Nairobi",
  "industry": "Technology",
  "education_level_id": "3",
  "experience_level": "Mid",
  "language_requirements": "English, Kiswahili",
  "salary_min": "50000",
  "salary_max": "80000",
  "salary_period": "MONTH",
  "salary_currency": "KES",
  "minimum_experience": "3",
  "apply_email": "careers@company.com",
  "apply_link": "https://company.com/careers",
  "additional_info": "<p><strong>How to Apply:</strong></p><ul><li>Send your CV and cover letter to careers@company.com</li><li>Application deadline: 2025-12-31</li></ul>",
  "tags": "engineering, remote, senior",
  "job_function": "Engineering",
  "valid_through": "2025-12-31"
}`;

    let response: Response | undefined;
    let content: string;
    let lastError: any = null;

    // Try Gemini keys in sequence
    if (geminiApiKeys.length > 0) {
      for (let i = 0; i < geminiApiKeys.length; i++) {
        const geminiApiKey = geminiApiKeys[i];
        console.log(`Trying Gemini API key ${i + 1}/${geminiApiKeys.length}...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        
        try {
          response = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nParse this job posting and return ONLY the JSON object:\n\n${jobText}`
                }]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 4000,
              }
            }),
          });

          if (response.ok) {
            console.log(`✓ Gemini API key ${i + 1} succeeded!`);
            break; // Success! Exit the loop
          } else {
            const errorData = await response.text();
            lastError = {
              status: response.status,
              statusText: response.statusText,
              data: errorData
            };
            console.error(`✗ Gemini API key ${i + 1} failed:`, lastError);
            
            // Continue to next key if available
            if (i < geminiApiKeys.length - 1) {
              console.log(`Trying next Gemini key...`);
              response = undefined;
              continue;
            }
          }
        } catch (geminiError: any) {
          console.error(`✗ Gemini API key ${i + 1} threw error:`, geminiError);
          lastError = geminiError;
          
          // Continue to next key if available
          if (i < geminiApiKeys.length - 1) {
            console.log(`Trying next Gemini key...`);
            response = undefined;
            continue;
          }
        }
      }
      
      // If all Gemini keys failed, try OpenRouter
      if (!response || !response.ok) {
        if (openRouterApiKey) {
          console.log(`All Gemini keys failed, trying OpenRouter fallback...`);
          response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openRouterApiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careerninja.co.ke",
              "X-Title": "CareerNinja Job Parser",
            },
            body: JSON.stringify({
              model: "anthropic/claude-3.5-sonnet",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Parse this job posting and return ONLY the JSON object:\n\n${jobText}` },
              ],
              temperature: 0.1,
              max_tokens: 4000,
            }),
          });
          } else {
            // No fallback available, return last Gemini error
            return NextResponse.json(
              { 
                error: `All ${geminiApiKeys.length} Gemini API key(s) failed and no OpenRouter fallback available`, 
                details: lastError,
                geminiStatus: lastError?.status 
              },
              { status: lastError?.status || 500 }
            );
          }
        }
      }
    } else {
      // Use OpenRouter if no Gemini key
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careerninja.co.ke",
          "X-Title": "CareerNinja Job Parser",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Parse this job posting and return ONLY the JSON object:\n\n${jobText}` },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      let errorMessage = "Failed to parse job text";
      if (response.status === 401) {
        if (geminiApiKey && openRouterApiKey) {
          errorMessage = "Both Gemini and OpenRouter failed. Gemini quota may be exceeded and OpenRouter has no credits. Please either: 1) Wait for Gemini quota reset (24hrs), 2) Add credits to OpenRouter at https://openrouter.ai/credits, or 3) Create a new Gemini API key.";
        } else {
          errorMessage = "Invalid API key or insufficient credits. Please check your API key configuration.";
        }
      } else if (response.status === 402) {
        errorMessage = "Payment Required: API quota exceeded. Please wait for quota reset or enable billing.";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorData, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle different response formats
    if (geminiApiKeys.length > 0 && data.candidates) {
      // Gemini response format
      content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      // OpenRouter response format
      content = data.choices?.[0]?.message?.content;
    }

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI", details: JSON.stringify(data) },
        { status: 500 }
      );
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse the JSON
    const parsedJob: ParsedJob = JSON.parse(cleanedContent);

    return NextResponse.json({ 
      success: true, 
      data: parsedJob 
    });

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
