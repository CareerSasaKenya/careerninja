import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function dbSalarySearch(
  jobTitle: string,
  location?: string,
  experienceLevel?: string
) {
  const admin = getAdminClient();
  if (!admin) return null;

  const { data, error } = await (admin.rpc as any)("get_salary_insights", {
    p_job_title: jobTitle,
    p_location: location || null,
    p_experience_level: experienceLevel || null,
  });

  if (error || !data || data.length === 0) return null;
  return data[0];
}

async function aiSalaryEstimate(
  jobTitle: string,
  location?: string,
  experienceLevel?: string
) {
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKeys.length === 0 && !groqKey && !openRouterKey) return null;

  const loc = location || "Nairobi, Kenya";
  const level = experienceLevel || "mid";

  const prompt = `You are a salary data expert for the Kenyan and East African job market.
Given a job title, location, and experience level, return realistic monthly salary estimates in KES (Kenyan Shillings).

Job Title: ${jobTitle}
Location: ${loc}
Experience Level: ${level}

Respond ONLY with valid JSON, no markdown or extra text:
{
  "min_salary": <number>,
  "max_salary": <number>,
  "median_salary": <number>,
  "percentile_25": <number>,
  "percentile_75": <number>,
  "currency": "KES"
}`;

  const errors: string[] = [];

  for (const apiKey of geminiKeys) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        errors.push(`Gemini ${res.status}: ${body.slice(0, 150)}`);
        continue;
      }

      const json = await res.json();
      const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        errors.push("Gemini: empty candidates response");
        continue;
      }

      // Strip markdown code fences if present
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.min_salary === "number" && typeof parsed.median_salary === "number") {
        return { ...parsed, sample_size: 0, ai_generated: true };
      }
    } catch (err: any) {
      errors.push(`Gemini: ${err.message?.slice(0, 100)}`);
      continue;
    }
  }

  // Groq fallback (fast, generous free tier, Llama 3.3 70B)
  if (groqKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a salary data expert for the Kenyan and East African job market. Respond ONLY with valid JSON, no markdown or extra text." },
            { role: "user", content: `Job Title: ${jobTitle}\nLocation: ${loc}\nExperience Level: ${level}\n\nReturn monthly salary estimates in KES:\n{"min_salary":<number>,"max_salary":<number>,"median_salary":<number>,"percentile_25":<number>,"percentile_75":<number>,"currency":"KES"}` },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        errors.push(`Groq ${res.status}: ${body.slice(0, 150)}`);
      } else {
        const json = await res.json();
        const text = json?.choices?.[0]?.message?.content;
        if (!text) {
          errors.push("Groq: empty response");
        } else {
          const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
          const parsed = JSON.parse(cleaned);
          if (typeof parsed.min_salary === "number" && typeof parsed.median_salary === "number") {
            return { ...parsed, sample_size: 0, ai_generated: true };
          }
        }
      }
    } catch (err: any) {
      errors.push(`Groq: ${err.message?.slice(0, 100)}`);
    }
  }

  if (openRouterKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        errors.push(`OpenRouter ${res.status}: ${body.slice(0, 150)}`);
      } else {
        const json = await res.json();
        const text = json?.choices?.[0]?.message?.content;
        if (!text) {
          errors.push("OpenRouter: empty response");
        } else {
          const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
          const parsed = JSON.parse(cleaned);
          if (typeof parsed.min_salary === "number" && typeof parsed.median_salary === "number") {
            return { ...parsed, sample_size: 0, ai_generated: true };
          }
        }
      }
    } catch (err: any) {
      errors.push(`OpenRouter: ${err.message?.slice(0, 100)}`);
    }
  }

  console.error("[salary-search] All AI providers failed:", errors);
  return { _errors: errors };
}

async function cacheSalaryResult(
  jobTitle: string,
  location: string,
  experienceLevel: string,
  insight: Record<string, any>
) {
  const admin = getAdminClient();
  if (!admin) return;
  try {
    await admin.from("salary_data").insert({
      job_title: jobTitle,
      location: location || "Nairobi",
      country: "Kenya",
      experience_level: experienceLevel || "mid",
      min_salary: insight.min_salary,
      max_salary: insight.max_salary,
      median_salary: insight.median_salary,
      currency: insight.currency || "KES",
      sample_size: 0,
      industry: 'Smart Estimate',
      company_size: "any",
      remote_type: "any",
      data_source: "ai_estimate",
    });
  } catch (err) {
    console.error("Failed to cache salary estimate:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, location, experienceLevel } = await request.json();

    if (!jobTitle || typeof jobTitle !== "string") {
      return NextResponse.json({ error: "jobTitle is required" }, { status: 400 });
    }

    const dbResult = await dbSalarySearch(jobTitle, location, experienceLevel);
    if (dbResult) {
      return NextResponse.json({ success: true, data: dbResult, source: "database" });
    }

    const aiResult = await aiSalaryEstimate(jobTitle, location, experienceLevel);
    if (aiResult && !aiResult._errors) {
      cacheSalaryResult(jobTitle, location || "Nairobi", experienceLevel || "mid", aiResult);
      return NextResponse.json({ success: true, data: aiResult, source: "ai" });
    }

    // Check if AI keys are configured at all
    const hasGemini = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].some(Boolean);
    const hasGroq = Boolean(process.env.GROQ_API_KEY);
    const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

    if (!hasGemini && !hasGroq && !hasOpenRouter) {
      return NextResponse.json({
        success: false,
        data: null,
        source: "none",
        reason: "No AI API keys configured on the server",
      });
    }

    return NextResponse.json({
      success: false,
      data: null,
      source: "none",
      reason: aiResult?._errors?.join("; ") || "AI estimate failed",
    });
  } catch (err: any) {
    console.error("Salary search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
