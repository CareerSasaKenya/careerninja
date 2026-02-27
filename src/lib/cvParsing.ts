// CV Parsing using Gemini API
// Extracts structured data from CV/Resume documents

interface ParsedCVData {
  basicInfo: {
    full_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
  };
  professional: {
    current_title?: string;
    years_experience?: number;
    expected_salary_min?: number;
    expected_salary_max?: number;
  };
  workExperience: Array<{
    company_name: string;
    job_title: string;
    employment_type?: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution_name: string;
    degree_type: string;
    field_of_study: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    grade?: string;
    description?: string;
  }>;
  skills: Array<{
    skill_name: string;
    skill_category?: string;
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
  }>;
}

const SYSTEM_PROMPT = `You are an expert CV/Resume parser. Extract structured information from the provided CV text.

IMPORTANT INSTRUCTIONS:
1. Extract ALL information accurately from the CV
2. For dates, use YYYY-MM-DD format (use YYYY-MM-01 if only month/year is given, YYYY-01-01 if only year)
3. For current positions/education, set is_current to true and end_date to null
4. Categorize skills as: technical, soft, language, or tool
5. Estimate proficiency levels based on context (years, descriptions)
6. Extract phone numbers, emails, LinkedIn, GitHub, portfolio URLs
7. Infer years of experience from work history if not explicitly stated
8. For employment_type, use: full_time, part_time, contract, freelance, or internship
9. Return ONLY valid JSON, no markdown formatting

Return a JSON object with this exact structure:
{
  "basicInfo": {
    "full_name": "string",
    "phone": "string",
    "location": "string (city, country)",
    "bio": "string (professional summary/objective)",
    "linkedin_url": "string",
    "portfolio_url": "string",
    "github_url": "string"
  },
  "professional": {
    "current_title": "string (most recent job title)",
    "years_experience": number,
    "expected_salary_min": number,
    "expected_salary_max": number
  },
  "workExperience": [
    {
      "company_name": "string",
      "job_title": "string",
      "employment_type": "full_time|part_time|contract|freelance|internship",
      "location": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null",
      "is_current": boolean,
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "institution_name": "string",
      "degree_type": "string (Bachelor's, Master's, PhD, Diploma, etc.)",
      "field_of_study": "string",
      "location": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null",
      "is_current": boolean,
      "grade": "string (GPA, First Class, etc.)",
      "description": "string"
    }
  ],
  "skills": [
    {
      "skill_name": "string",
      "skill_category": "technical|soft|language|tool",
      "proficiency_level": "beginner|intermediate|advanced|expert",
      "years_of_experience": number
    }
  ]
}`;

async function callGeminiAPI(apiKey: string, cvText: string): Promise<ParsedCVData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for CV parsing

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${SYSTEM_PROMPT}\n\nCV TEXT:\n${cvText}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
        signal: controller.signal,
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

    // Clean up markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleanedContent);
    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('CV parsing timed out. Please try again.');
    }
    throw error;
  }
}

export async function parseCVText(
  cvText: string,
  maxRetries: number = 2
): Promise<{ response: ParsedCVData; modelUsed: string }> {
  const geminiApiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  if (geminiApiKeys.length === 0) {
    throw new Error('No Gemini API key configured. Please add GEMINI_API_KEY to environment variables.');
  }

  let lastError: any = null;

  // Try each Gemini key
  for (const apiKey of geminiApiKeys) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await callGeminiAPI(apiKey!, cvText);
        return { response, modelUsed: 'gemini-2.0-flash-exp' };
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }

  throw lastError || new Error('CV parsing failed');
}

// Extract text from PDF using browser's built-in capabilities
export async function extractTextFromPDF(file: File): Promise<string> {
  // This is a placeholder - in production, you'd use a library like pdf.js
  // For now, we'll return a message to use the API route
  throw new Error('PDF text extraction should be done server-side');
}
