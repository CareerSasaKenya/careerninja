/**
 * Platform posters for automatic social sharing.
 * Facebook Page + LinkedIn Company Page.
 */

export type SocialPlatform = 'facebook' | 'linkedin';

export type PostToPlatformInput = {
  platform: SocialPlatform;
  caption: string;
  shareUrl: string;
  imageUrl?: string | null;
  title?: string;
};

export type PostToPlatformResult = {
  ok: boolean;
  skipped?: boolean;
  skipReason?: string;
  platformPostId?: string;
  error?: string;
  dryRun?: boolean;
};

function isDryRun(): boolean {
  return process.env.SOCIAL_SHARE_DRY_RUN === 'true' || process.env.SOCIAL_SHARE_DRY_RUN === '1';
}

export function getConfiguredPlatforms(): SocialPlatform[] {
  const platforms: SocialPlatform[] = [];
  if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    platforms.push('facebook');
  }
  if (process.env.LINKEDIN_ORGANIZATION_ID && process.env.LINKEDIN_ACCESS_TOKEN) {
    platforms.push('linkedin');
  }
  // Dry-run still "configures" both so the pipeline can be exercised.
  if (platforms.length === 0 && isDryRun()) {
    return ['facebook', 'linkedin'];
  }
  return platforms;
}

async function postFacebook(input: PostToPlatformInput): Promise<PostToPlatformResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { ok: false, skipped: true, skipReason: 'facebook_not_configured' };
  }

  if (isDryRun()) {
    return { ok: true, dryRun: true, platformPostId: `dry-run-fb-${Date.now()}` };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/feed`;
  const body = new URLSearchParams({
    message: input.caption,
    link: input.shareUrl,
    access_token: token,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!res.ok) {
    return {
      ok: false,
      error: json.error?.message || `Facebook HTTP ${res.status}`,
    };
  }

  return { ok: true, platformPostId: json.id || undefined };
}

async function postLinkedIn(input: PostToPlatformInput): Promise<PostToPlatformResult> {
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!orgId || !token) {
    return { ok: false, skipped: true, skipReason: 'linkedin_not_configured' };
  }

  if (isDryRun()) {
    return { ok: true, dryRun: true, platformPostId: `dry-run-li-${Date.now()}` };
  }

  const author = orgId.startsWith('urn:') ? orgId : `urn:li:organization:${orgId}`;
  const version = process.env.LINKEDIN_API_VERSION || '202411';

  const payload = {
    author,
    commentary: input.caption,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      article: {
        source: input.shareUrl,
        title: input.title || 'CareerSasa Job Opportunity',
        description: input.caption.slice(0, 200),
        // Thumbnail must be a LinkedIn media URN after upload — omit URL to avoid API errors.
        // LinkedIn will usually unfurl OG image from the article source URL.
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': version,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return {
      ok: false,
      error: errText.slice(0, 400) || `LinkedIn HTTP ${res.status}`,
    };
  }

  const postId =
    res.headers.get('x-restli-id') ||
    res.headers.get('x-linkedin-id') ||
    undefined;

  return { ok: true, platformPostId: postId || undefined };
}

export async function postToPlatform(
  input: PostToPlatformInput
): Promise<PostToPlatformResult> {
  try {
    if (input.platform === 'facebook') return await postFacebook(input);
    if (input.platform === 'linkedin') return await postLinkedIn(input);
    return { ok: false, skipped: true, skipReason: 'unknown_platform' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
