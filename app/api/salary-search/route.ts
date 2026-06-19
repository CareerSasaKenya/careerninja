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

  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKeys.length === 0 && !openRouterKey) return null;

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

  for (const apiKey of geminiKeys) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      if (!res.ok) continue;

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text.trim());
      if (typeof parsed.min_salary === "number" && typeof parsed.median_salary === "number") {
        return { ...parsed, sample_size: 0, ai_generated: true };
      }
    } catch {
      continue;
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
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return null;

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (!text) return null;

      const parsed = JSON.parse(text.trim());
      if (typeof parsed.min_salary === "number" && typeof parsed.median_salary === "number") {
        return { ...parsed, sample_size: 0, ai_generated: true };
      }
    } catch {
      return null;
    }
  }

  return null;
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
      industry: "AI-Generated",
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
    if (aiResult) {
      cacheSalaryResult(jobTitle, location || "Nairobi", experienceLevel || "mid", aiResult);
      return NextResponse.json({ success: true, data: aiResult, source: "ai" });
    }

    return NextResponse.json({ success: true, data: null, source: "none" });
  } catch (err: any) {
    console.error("Salary search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
