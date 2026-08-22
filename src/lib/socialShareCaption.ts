/**
 * Highly rewritten AI captions for job social posts.
 */

import { callAI, hasAIConfigured } from './aiProviders';

export type SocialShareJobInput = {
  title: string;
  company: string;
  location: string;
  employmentType?: string | null;
  experienceLevel?: string | null;
  description?: string | null;
  shareUrl: string;
  platform: 'facebook' | 'linkedin';
};

const SYSTEM_PROMPT = `You are CareerSasa's social copywriter for Kenya's job market.
Write ONE highly rewritten social post promoting a job listing.

Hard rules:
- Do NOT start with "Hiring:", "We're hiring", or "{Title} at {Company}".
- Rewrite heavily: fresh hook, varied structure, human voice for Kenyan professionals.
- Energetic but professional. No emoji spam (at most 1 subtle emoji if it fits).
- Include role, company, and location naturally — not as a template dump.
- End with a clear CTA and the exact job URL on its own last line.
- No hashtag floods (0–3 relevant hashtags max, optional).
- Output ONLY the post text. No quotes, no markdown fences, no preamble.
- Never invent salary, benefits, or requirements not implied by the input.`;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function platformLimit(platform: 'facebook' | 'linkedin'): number {
  return platform === 'linkedin' ? 700 : 500;
}

function fallbackCaption(job: SocialShareJobInput): string {
  const loc = job.location?.trim() || 'Kenya';
  return (
    `A strong opportunity just opened at ${job.company}: ${job.title} in ${loc}. ` +
    `If this fits your next move, apply on CareerSasa.\n\n${job.shareUrl}`
  );
}

export async function generateSocialShareCaption(
  job: SocialShareJobInput
): Promise<{ caption: string; provider?: string; usedFallback: boolean }> {
  const limit = platformLimit(job.platform);
  const desc = job.description ? stripHtml(job.description).slice(0, 600) : '';

  if (!hasAIConfigured()) {
    return { caption: fallbackCaption(job).slice(0, limit + 80), usedFallback: true };
  }

  const prompt = `Platform: ${job.platform} (keep under ~${limit} characters excluding the URL line)
Job title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Kenya'}
Employment type: ${job.employmentType || 'not specified'}
Experience level: ${job.experienceLevel || 'not specified'}
Short description: ${desc || 'n/a'}
Job URL (must appear alone on the final line): ${job.shareUrl}

Write a highly rewritten ${job.platform} post now.`;

  try {
    const result = await callAI(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.9,
      maxTokens: 450,
    });

    let caption = (result.text || '').trim();
    caption = caption.replace(/^["']|["']$/g, '').trim();

    if (!caption.includes(job.shareUrl)) {
      caption = `${caption}\n\n${job.shareUrl}`;
    }

    if (caption.length < 40) {
      return { caption: fallbackCaption(job), usedFallback: true };
    }

    return { caption, provider: result.provider, usedFallback: false };
  } catch (err) {
    console.error('[socialShareCaption] AI failed, using fallback:', err);
    return { caption: fallbackCaption(job), usedFallback: true };
  }
}
