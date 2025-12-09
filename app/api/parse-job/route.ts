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
  education_level_name?: string;
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

    const systemPrompt = `You are a job posting parser and enrichment specialist. Extract structured information from job postings and return ONLY valid JSON.

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

EDUCATION LEVEL (education_level_name):
- Look for phrases like: "Bachelor's degree", "Master's", "Diploma", "Certificate", "PhD", "Degree required", "University graduate"
- Return the EXACT education level name (not ID):
  * "Bachelor's Degree" for bachelor's/degree mentions
  * "Diploma" for diploma mentions
  * "Craft Certificate (Certificate Level)" for certificate mentions
  * "Master's Degree" for master's mentions
  * "Doctorate (PhD)" for PhD/doctorate mentions
  * "KCSE / Senior Secondary Certificate" for high school/KCSE
  * "Artisan Certificate / Trade Test" for artisan/trade mentions
- If no education mentioned → omit field or use empty string

LOCATION (CRITICAL):
- job_location_country: Always "Kenya" unless explicitly stated otherwise
- job_location_county: Extract county name (e.g., "Nairobi", "Mombasa", "Kisumu", "Nakuru")
- job_location_city: Extract city/town name (e.g., "Nairobi", "Westlands", "Mombasa", "Eldoret")
- Look for phrases: "Location:", "Based in", "Office in", "Work from"

ENRICHMENT RULES (for description and responsibilities fields):
- If description is scanty (less than 100 words), enrich it with relevant context about the role WITHOUT inventing facts
- If responsibilities are scanty (less than 3 items), expand with typical responsibilities for this role
- DO NOT invent or change: salary, expiry date, location, company name, or any specific facts from the original text
- Only enrich with general industry-standard information that would apply to this type of role

ADDITIONAL_INFO FIELD (CRITICAL - COMPREHENSIVE CONTENT):
The additional_info field should ONLY contain the following sections in HTML format:

1. HOW TO APPLY (if present in original text):
   - Extract application instructions, email, link, deadline from the job posting
   - Format: "<p><strong>How to Apply:</strong></p><ul><li>Send your CV to email@company.com</li><li>Application deadline: Date</li></ul>"

2. APPLICATION & INTERVIEW TIPS (ALWAYS GENERATE - 8 TIPS):
   - Start with: "<h3>Application & Interview Tips for [Job Title]</h3>"
   - Brief enticing intro paragraph (2-3 sentences) about succeeding in this application
   - Then exactly 8 detailed tips, each with:
     * Tip number and heading in <strong>
     * 3-4 sentences explaining the tip in detail
     * A concrete, specific example in <em>
   - Format each tip as: "<p><strong>1. Research the Company Thoroughly:</strong> Before applying, spend time understanding the company's mission, values, and recent achievements. This knowledge will help you tailor your application and show genuine interest. Review their website, social media, and recent news articles. <em>Example: If applying to a fintech company, mention their recent mobile banking app launch and how your skills could contribute to similar innovations.</em></p>"

3. FREQUENTLY ASKED QUESTIONS (ALWAYS GENERATE - 4 FAQs):
   - Start with: "<h3>Frequently Asked Questions</h3>"
   - Generate 4 relevant FAQs about this specific job role, industry, or application process
   - Each FAQ should have a question and a detailed 2-3 sentence answer
   - Format: "<p><strong>Q: What qualifications are most important for this role?</strong><br>A: For this position, employers typically prioritize relevant work experience and technical skills over formal education. However, having a diploma or degree in the field demonstrates foundational knowledge and commitment to professional development.</p>"

4. SALARY & CAREER GROWTH PROJECTION (ALWAYS GENERATE):
   - Start with: "<h3>Salary & Career Growth Projection</h3>"
   - First paragraph: Discuss typical salary ranges for this role in Kenya (entry to senior level)
   - Second paragraph: Outline career progression path over 3-5 years
   - Third paragraph: Discuss growth opportunities in this industry/company type
   - Format: "<p>In Kenya, [Job Title] positions typically offer salaries ranging from KES X to KES Y per month, depending on experience level and company size. Entry-level professionals can expect KES X, while those with 3-5 years of experience often earn KES Y or more.</p><p>Career progression in this field typically follows a clear path: starting as [Entry Role], advancing to [Mid Role] within 2-3 years, and potentially reaching [Senior Role] within 5 years. Each step brings increased responsibilities and compensation.</p><p>The [Industry] sector in Kenya is experiencing steady growth, with increasing demand for skilled professionals. Companies are investing in employee development, offering training programs and opportunities for specialization in emerging areas.</p>"

Return JSON in this exact structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "description": "<p>Enriched job description with HTML formatting (if original was scanty)</p>",
  "responsibilities": "<ul><li>Responsibility 1</li><li>Responsibility 2</li><li>Additional responsibilities if original was scanty</li></ul>",
  "required_qualifications": "<ul><li>Qualification 1</li><li>Qualification 2</li></ul>",
  "software_skills": "Comma-separated skills",
  "employment_type": "FULL_TIME",
  "job_location_type": "ON_SITE",
  "job_location_country": "Kenya",
  "job_location_county": "Nairobi",
  "job_location_city": "Nairobi",
  "industry": "Technology",
  "education_level_name": "Bachelor's Degree",
  "experience_level": "Mid",
  "language_requirements": "English, Kiswahili",
  "salary_min": "50000",
  "salary_max": "80000",
  "salary_period": "MONTH",
  "salary_currency": "KES",
  "minimum_experience": "3",
  "apply_email": "careers@company.com",
  "apply_link": "https://company.com/careers",
  "additional_info": "<p><strong>How to Apply:</strong></p><ul><li>Send your CV and cover letter to careers@company.com</li><li>Application deadline: 2025-12-31</li></ul><h3>Application & Interview Tips for Software Engineer</h3><p>Landing a software engineering role requires more than technical skills. Here are proven strategies to stand out in your application and interview process.</p><p><strong>1. Tailor Your Resume to the Job Description:</strong> Carefully read the job requirements and highlight relevant experience that matches their needs. Use keywords from the posting and quantify your achievements with metrics. Customize your resume for each application rather than using a generic version. <em>Example: Instead of 'Developed web applications,' write 'Built 5 React-based web applications serving 10,000+ users, reducing load time by 40%.'</em></p><p><strong>2. Build a Strong Portfolio:</strong> Showcase your best projects on GitHub or a personal website. Include detailed README files explaining your problem-solving approach and technical decisions. Quality matters more than quantity—focus on 3-5 polished projects. <em>Example: Create a full-stack e-commerce app demonstrating your skills in React, Node.js, and database design, with live demo and clean documentation.</em></p><p><strong>3. Research the Company Thoroughly:</strong> Before applying, understand the company's products, culture, and recent achievements. This knowledge helps you tailor your application and demonstrate genuine interest. Follow their blog, social media, and news coverage. <em>Example: If applying to a fintech company, mention their recent mobile banking app launch and how your experience with payment APIs could contribute.</em></p><p><strong>4. Prepare for Technical Interviews:</strong> Practice coding problems on platforms like LeetCode or HackerRank. Focus on data structures, algorithms, and system design. Time yourself and practice explaining your thought process aloud. <em>Example: Spend 30 minutes daily solving medium-difficulty problems, then review optimal solutions and time complexity analysis.</em></p><p><strong>5. Demonstrate Soft Skills:</strong> Technical ability alone isn't enough—show you can communicate, collaborate, and solve problems creatively. Share examples of teamwork, mentoring, or handling challenging situations. Use the STAR method (Situation, Task, Action, Result). <em>Example: 'When our deployment failed before a major release, I coordinated with the team to identify the issue, implemented a fix within 2 hours, and established new testing protocols.'</em></p><p><strong>6. Ask Thoughtful Questions:</strong> Prepare intelligent questions about the role, team structure, technology stack, and growth opportunities. This shows engagement and helps you evaluate if the company is right for you. Avoid questions about salary or benefits in early interviews. <em>Example: 'What does success look like for this role in the first 6 months?' or 'How does the team approach code reviews and knowledge sharing?'</em></p><p><strong>7. Follow Up Professionally:</strong> Send a thank-you email within 24 hours of your interview. Reference specific discussion points and reiterate your interest. Keep it concise and professional. This simple step sets you apart from other candidates. <em>Example: 'Thank you for discussing the mobile app project. I'm excited about the opportunity to contribute my React Native experience to your team's goals.'</em></p><p><strong>8. Stay Updated on Industry Trends:</strong> Show you're passionate about technology by staying current with new frameworks, tools, and best practices. Mention relevant technologies or methodologies in your application. Continuous learning is highly valued in tech. <em>Example: 'I recently completed a course on microservices architecture and have been experimenting with Docker and Kubernetes in personal projects.'</em></p><h3>Frequently Asked Questions</h3><p><strong>Q: What qualifications are most important for this role?</strong><br>A: For software engineering positions, practical experience and demonstrable skills often outweigh formal education. However, a degree in Computer Science or related field provides strong fundamentals. Focus on building a portfolio of projects and contributing to open source to showcase your abilities.</p><p><strong>Q: How long does the hiring process typically take?</strong><br>A: The software engineering hiring process in Kenya usually takes 2-4 weeks from application to offer. This typically includes an initial screening call, technical assessment, one or two technical interviews, and a final interview with management. Some companies may have additional rounds or take longer.</p><p><strong>Q: What salary should I expect as a software engineer in Kenya?</strong><br>A: Entry-level software engineers in Kenya typically earn KES 50,000-80,000 per month, while mid-level engineers with 3-5 years experience can expect KES 100,000-200,000. Senior engineers and specialists often earn KES 250,000+ depending on the company and specialization.</p><p><strong>Q: Is remote work common for software engineering roles?</strong><br>A: Remote and hybrid work options have become increasingly common in Kenya's tech industry, especially post-pandemic. Many companies now offer flexible arrangements, though some prefer on-site presence for junior roles to facilitate mentorship and collaboration.</p><h3>Salary & Career Growth Projection</h3><p>In Kenya, Software Engineer positions typically offer salaries ranging from KES 50,000 to KES 300,000+ per month, depending on experience level, specialization, and company size. Entry-level developers can expect KES 50,000-80,000, mid-level engineers with 3-5 years experience earn KES 100,000-200,000, while senior engineers and technical leads often command KES 250,000 or more. International companies and fintech firms typically offer higher compensation packages.</p><p>Career progression in software engineering follows a well-defined path: starting as a Junior Developer, advancing to Software Engineer within 2-3 years, then to Senior Engineer or Team Lead within 5 years. From there, professionals can specialize as Solutions Architects, Engineering Managers, or Principal Engineers. Each advancement brings 30-50% salary increases and expanded responsibilities in system design, mentorship, and technical leadership.</p><p>Kenya's technology sector is experiencing rapid growth, with increasing investment in fintech, e-commerce, and digital services. Companies are actively seeking skilled developers and offering competitive benefits including training budgets, conference attendance, and opportunities to work with cutting-edge technologies. The demand for software engineers is expected to grow 25% annually over the next five years, creating excellent long-term career prospects.</p>",
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
                maxOutputTokens: 8000,
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
              max_tokens: 8000,
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
          max_tokens: 8000,
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
        if (geminiApiKeys.length > 0 && openRouterApiKey) {
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
