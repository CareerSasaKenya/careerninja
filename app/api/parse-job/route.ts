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

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
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
  "experience_level": "Mid",
  "language_requirements": "English, Kiswahili",
  "salary_min": "50000",
  "salary_max": "80000",
  "salary_period": "MONTH",
  "salary_currency": "KES",
  "minimum_experience": "3",
  "apply_email": "careers@company.com",
  "apply_link": "https://company.com/careers",
  "tags": "engineering, remote, senior",
  "job_function": "Engineering",
  "valid_through": "2025-12-31"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Parse this job posting and return ONLY the JSON object:\n\n${jobText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to parse job text", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
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
