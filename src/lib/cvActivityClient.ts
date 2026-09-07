import { supabase } from '@/integrations/supabase/client';
import type { FunnelAction } from '@/lib/cvFunnel';

async function authHeaders(): Promise<HeadersInit | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return {
    Authorization: `Bearer ${data.session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function postCvActivity(input: {
  action: FunnelAction;
  sku?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  cvId?: string | null;
  paymentId?: string | null;
}): Promise<void> {
  try {
    const headers = await authHeaders();
    if (!headers) return;
    await fetch('/api/cv/activity', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error('Failed to record CV activity', error);
  }
}

export async function deliverCvToProfile(input: {
  cvId: string;
  action?: FunnelAction;
  sku?: string | null;
  templateName?: string | null;
}): Promise<void> {
  try {
    const headers = await authHeaders();
    if (!headers) return;
    await fetch('/api/cv/deliver', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error('Failed to save CV to profile / email', error);
  }
}
