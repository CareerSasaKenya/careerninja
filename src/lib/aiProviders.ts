/**
 * Unified AI Provider Module
 * Priority chain: Gemini → Groq → OpenRouter
 *
 * Usage:
 *   import { callAI } from '@/lib/aiProviders';
 *   const result = await callAI(prompt, { systemPrompt, maxTokens, temperature });
 *
 * Returns: { text: string, model: string, provider: 'gemini' | 'groq' | 'openrouter' }
 * Throws: Error if all providers fail
 */

export interface AIOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  /** If true, parse response as JSON and return the object */
  json?: boolean;
}

export interface AIResult {
  text: string;
  model: string;
  provider: 'gemini' | 'groq' | 'openrouter';
  parsed?: any;
}

// ---------------------------------------------------------------------------
// Provider: Gemini
// ---------------------------------------------------------------------------
async function callGemini(
  apiKey: string,
  prompt: string,
  opts: AIOptions
): Promise<AIResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const body: any = {
    contents: [{ parts: [{ text: opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.2,
      maxOutputTokens: opts.maxTokens ?? 2000,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: empty response');

  return { text, model: 'gemini-2.5-flash', provider: 'gemini' };
}

// ---------------------------------------------------------------------------
// Provider: Groq (Llama 3.3 70B)
// ---------------------------------------------------------------------------
async function callGroq(
  apiKey: string,
  prompt: string,
  opts: AIOptions
): Promise<AIResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const messages: any[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 2000,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Groq ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq: empty response');

  return { text, model: 'llama-3.3-70b-versatile', provider: 'groq' };
}

// ---------------------------------------------------------------------------
// Provider: OpenRouter
// ---------------------------------------------------------------------------
async function callOpenRouter(
  apiKey: string,
  prompt: string,
  opts: AIOptions
): Promise<AIResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const messages: any[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 2000,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter: empty response');

  return { text, model: 'gemini-2.5-flash (openrouter)', provider: 'openrouter' };
}

// ---------------------------------------------------------------------------
// Unified entry point
// ---------------------------------------------------------------------------

/**
 * Call AI with automatic provider fallback.
 * Priority: Gemini (3 keys) → Groq → OpenRouter
 */
export async function callAI(prompt: string, opts: AIOptions = {}): Promise<AIResult> {
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];

  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKeys.length === 0 && !groqKey && !openRouterKey) {
    throw new Error('No AI API keys configured');
  }

  const errors: string[] = [];

  // 1. Try Gemini keys
  for (const key of geminiKeys) {
    try {
      const result = await callGemini(key, prompt, opts);
      if (opts.json) {
        const cleaned = stripFences(result.text);
        result.parsed = JSON.parse(cleaned);
      }
      return result;
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  // 2. Try Groq
  if (groqKey) {
    try {
      const result = await callGroq(groqKey, prompt, opts);
      if (opts.json) {
        const cleaned = stripFences(result.text);
        result.parsed = JSON.parse(cleaned);
      }
      return result;
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  // 3. Try OpenRouter
  if (openRouterKey) {
    try {
      const result = await callOpenRouter(openRouterKey, prompt, opts);
      if (opts.json) {
        const cleaned = stripFences(result.text);
        result.parsed = JSON.parse(cleaned);
      }
      return result;
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  console.error('[aiProviders] All providers failed:', errors);
  throw new Error(errors.join('; ') || 'All AI providers failed');
}

/**
 * Check if at least one AI provider is configured.
 */
export function hasAIConfigured(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_2 ||
    process.env.GEMINI_API_KEY_3 ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
}
