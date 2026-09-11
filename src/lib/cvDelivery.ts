import type { SupabaseClient } from '@supabase/supabase-js';
import { buildCvWordBuffer, cvPlaintext } from '@/lib/careerDocumentExport';
import { sendCvDeliveryEmail } from '@/lib/email';
import { buildPlaintextPdf } from '@/lib/cvPdf';
import {
  FUNNEL_ACTIONS,
  isCvRelatedSku,
  recentlyEmailed,
  skuForTemplateName,
  type FunnelAction,
} from '@/lib/cvFunnel';
import { fileBasename, wordFilename } from '@/lib/downloadBlob';
import { productBySku } from '@/lib/pricing/defaults';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://careersasa.co.ke';

export type FunnelEventInput = {
  userId: string;
  action: FunnelAction;
  sku?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  cvId?: string | null;
  paymentId?: string | null;
  metadata?: Record<string, unknown>;
};

export type DeliverCvResult = {
  stored: boolean;
  emailed: boolean;
  fileUrl?: string | null;
  error?: string;
};

function missingRelation(error: { message?: string; code?: string } | null | undefined): boolean {
  const message = error?.message || '';
  return error?.code === '42P01' || /does not exist|schema cache/i.test(message);
}

function missingColumn(error: { message?: string } | null | undefined, column: string): boolean {
  const message = error?.message || '';
  return new RegExp(column, 'i').test(message) && /column/i.test(message);
}

export async function recordFunnelEvent(
  admin: SupabaseClient,
  input: FunnelEventInput
): Promise<void> {
  if (!FUNNEL_ACTIONS.includes(input.action)) return;
  const { error } = await admin.from('career_funnel_events' as never).insert({
    user_id: input.userId,
    action: input.action,
    sku: input.sku || null,
    template_id: input.templateId || null,
    template_name: input.templateName || null,
    cv_id: input.cvId || null,
    payment_id: input.paymentId || null,
    metadata: input.metadata || {},
  } as never);
  if (error && !missingRelation(error)) {
    console.error('[cvDelivery] Failed to record funnel event:', error.message);
  }
}

async function resolveTemplateName(
  admin: SupabaseClient,
  templateId: string | null | undefined,
  fallback?: string | null
): Promise<string | null> {
  if (fallback) return fallback;
  if (!templateId) return null;
  const { data } = await admin.from('cv_templates').select('name').eq('id', templateId).maybeSingle();
  return (data as { name?: string } | null)?.name || null;
}

async function userHasPurchasedSku(admin: SupabaseClient, userId: string, sku: string | null): Promise<boolean> {
  if (!sku) return false;
  const { data } = await admin
    .from('payments')
    .select('metadata')
    .eq('user_id', userId)
    .eq('status', 'SUCCESS');
  for (const row of (data || []) as { metadata?: Record<string, unknown> | null }[]) {
    if (row.metadata?.sku === sku) return true;
  }
  return false;
}

async function ensureCandidateProfileId(
  admin: SupabaseClient,
  userId: string,
  fullName: string
): Promise<string | null> {
  const existing = await admin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id as string;

  const inserted = await admin
    .from('candidate_profiles')
    .insert({ user_id: userId, full_name: fullName || 'Candidate' })
    .select('id')
    .single();
  if (inserted.error) {
    console.error('[cvDelivery] Failed to create candidate profile:', inserted.error.message);
    return null;
  }
  return inserted.data?.id as string;
}

async function resolveRecipient(
  admin: SupabaseClient,
  userId: string,
  content: unknown
): Promise<{ email: string | null; name: string; phone: string | null }> {
  const personal =
    content && typeof content === 'object' && !Array.isArray(content)
      ? (content as Record<string, unknown>).personal
      : null;
  const personalRec = personal && typeof personal === 'object' ? (personal as Record<string, unknown>) : {};
  const contentEmail = typeof personalRec.email === 'string' ? personalRec.email : null;
  const contentName = typeof personalRec.name === 'string' ? personalRec.name : null;
  const contentPhone = typeof personalRec.phone === 'string' ? personalRec.phone : null;

  const [{ data: userData }, profileRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from('user_profiles').select('full_name, first_name, last_name, phone').eq('id', userId).maybeSingle(),
  ]);
  let profile = profileRes.data;
  if (profileRes.error) {
    const base = await admin.from('user_profiles').select('full_name').eq('id', userId).maybeSingle();
    profile = base.data as typeof profile;
  }

  const profileRec = (profile || {}) as {
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  };
  const name =
    contentName ||
    profileRec.full_name ||
    [profileRec.first_name, profileRec.last_name].filter(Boolean).join(' ').trim() ||
    userData.user?.user_metadata?.full_name ||
    'there';
  const email =
    contentEmail ||
    userData.user?.email ||
    (typeof userData.user?.user_metadata?.email === 'string' ? userData.user.user_metadata.email : null);
  const phone = contentPhone || profileRec.phone || null;
  return { email, name: String(name), phone };
}

async function storeOnProfile(
  admin: SupabaseClient,
  params: {
    userId: string;
    cvId: string;
    title: string;
    name: string;
    pdf: Buffer;
    docx: Buffer;
  }
): Promise<string | null> {
  const candidateId = await ensureCandidateProfileId(admin, params.userId, params.name);
  const pdfPath = `${params.userId}/career-tools/${params.cvId}.pdf`;
  const docxPath = `${params.userId}/career-tools/${params.cvId}.docx`;

  const pdfUpload = await admin.storage.from('candidate-documents').upload(pdfPath, params.pdf, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (pdfUpload.error) {
    console.error('[cvDelivery] PDF upload failed:', pdfUpload.error.message);
  }
  await admin.storage.from('candidate-documents').upload(docxPath, params.docx, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upsert: true,
  });

  const { data: pub } = admin.storage.from('candidate-documents').getPublicUrl(pdfPath);
  const fileUrl = pub?.publicUrl || null;
  if (!fileUrl) return null;

  await admin
    .from('candidate_cvs')
    .update({
      file_url: fileUrl,
      last_generated_at: new Date().toISOString(),
    })
    .eq('id', params.cvId);

  if (!candidateId) return fileUrl;

  const existing = await admin
    .from('candidate_documents')
    .select('id, is_primary')
    .eq('candidate_cv_id', params.cvId)
    .maybeSingle();

  if (existing.error && missingColumn(existing.error, 'candidate_cv_id')) {
    const byName = await admin
      .from('candidate_documents')
      .select('id, is_primary')
      .eq('candidate_id', candidateId)
      .eq('document_name', fileBasename(params.title, 'pdf'))
      .maybeSingle();
    if (byName.data?.id) {
      await admin
        .from('candidate_documents')
        .update({
          file_url: fileUrl,
          file_size: params.pdf.length,
          file_type: 'application/pdf',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', byName.data.id);
      return fileUrl;
    }
  }

  const otherPrimary = await admin
    .from('candidate_documents')
    .select('id')
    .eq('candidate_id', candidateId)
    .in('document_type', ['cv', 'resume'])
    .eq('is_primary', true)
    .limit(1);
  const isPrimary = !otherPrimary.data?.length;

  const row: Record<string, unknown> = {
    candidate_id: candidateId,
    document_type: 'cv',
    document_name: fileBasename(params.title, 'pdf'),
    file_url: fileUrl,
    file_size: params.pdf.length,
    file_type: 'application/pdf',
    is_primary: existing.data?.is_primary ?? isPrimary,
    is_active: true,
    candidate_cv_id: params.cvId,
    updated_at: new Date().toISOString(),
  };

  if (existing.data?.id) {
    const update = await admin.from('candidate_documents').update(row).eq('id', existing.data.id);
    if (update.error && missingColumn(update.error, 'candidate_cv_id')) {
      const { candidate_cv_id: _, ...without } = row;
      await admin.from('candidate_documents').update(without).eq('id', existing.data.id);
    }
  } else {
    const insert = await admin.from('candidate_documents').insert(row);
    if (insert.error && missingColumn(insert.error, 'candidate_cv_id')) {
      const { candidate_cv_id: _, ...without } = row;
      await admin.from('candidate_documents').insert(without);
    } else if (insert.error) {
      console.error('[cvDelivery] Profile document insert failed:', insert.error.message);
    }
  }

  return fileUrl;
}

export async function deliverCandidateCv(
  admin: SupabaseClient,
  params: {
    cvId: string;
    userId?: string;
    action?: FunnelAction;
    sku?: string | null;
    templateName?: string | null;
    paymentId?: string | null;
    email?: boolean;
    forceEmail?: boolean;
  }
): Promise<DeliverCvResult> {
  const { data: cv, error } = await admin
    .from('candidate_cvs')
    .select('id, user_id, title, content, template_id, file_url, last_emailed_at')
    .eq('id', params.cvId)
    .maybeSingle();

  if (error || !cv) {
    return { stored: false, emailed: false, error: error?.message || 'CV not found' };
  }
  if (params.userId && cv.user_id !== params.userId) {
    return { stored: false, emailed: false, error: 'Forbidden' };
  }

  const templateName = await resolveTemplateName(admin, cv.template_id, params.templateName);
  const sku = params.sku || skuForTemplateName(templateName);
  const recipient = await resolveRecipient(admin, cv.user_id, cv.content);

  if (params.action && params.action !== 'emailed' && params.action !== 'purchased') {
    await recordFunnelEvent(admin, {
      userId: cv.user_id,
      action: params.action,
      sku,
      templateId: cv.template_id,
      templateName,
      cvId: cv.id,
      paymentId: params.paymentId,
    });
  }

  let pdf: Buffer;
  let docx: Buffer;
  try {
    const plain = cvPlaintext(cv.content, templateName || undefined);
    pdf = Buffer.from(buildPlaintextPdf(plain, cv.title));
    docx = await buildCvWordBuffer(cv.content, templateName || undefined);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate CV files';
    console.error('[cvDelivery] Generate failed:', message);
    return { stored: false, emailed: false, error: message };
  }

  let fileUrl: string | null = null;
  try {
    fileUrl = await storeOnProfile(admin, {
      userId: cv.user_id,
      cvId: cv.id,
      title: cv.title,
      name: recipient.name === 'there' ? cv.title : recipient.name,
      pdf,
      docx,
    });
  } catch (err) {
    console.error('[cvDelivery] Store failed:', err);
  }

  const purchased = await userHasPurchasedSku(admin, cv.user_id, sku);
  const shouldEmail =
    params.forceEmail ||
    (params.email !== false && purchased && (params.forceEmail || !recentlyEmailed(cv.last_emailed_at)));

  let emailed = false;
  if (shouldEmail && recipient.email) {
    const send = await sendCvDeliveryEmail({
      to: recipient.email,
      name: recipient.name,
      cvTitle: cv.title,
      templateName,
      profileUrl: `${SITE_URL}/dashboard/profile`,
      userId: cv.user_id,
      attachments: [
        { filename: fileBasename(cv.title, 'pdf'), content: pdf, contentType: 'application/pdf' },
        {
          filename: wordFilename(cv.title),
          content: docx,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    });
    emailed = send.success;
    if (send.success) {
      const stamped = await admin
        .from('candidate_cvs')
        .update({ last_emailed_at: new Date().toISOString() })
        .eq('id', cv.id);
      if (stamped.error && !missingColumn(stamped.error, 'last_emailed_at')) {
        console.error('[cvDelivery] Could not stamp last_emailed_at:', stamped.error.message);
      }
      await recordFunnelEvent(admin, {
        userId: cv.user_id,
        action: 'emailed',
        sku,
        templateId: cv.template_id,
        templateName,
        cvId: cv.id,
        paymentId: params.paymentId,
      });
    } else if (send.error) {
      console.error('[cvDelivery] Email failed:', send.error);
    }
  }

  return { stored: Boolean(fileUrl), emailed, fileUrl };
}

export async function deliverCvForSuccessfulPayment(
  admin: SupabaseClient,
  payment: { id: string; user_id: string | null; metadata?: Record<string, unknown> | null }
): Promise<void> {
  const userId = payment.user_id;
  if (!userId) return;
  const sku = typeof payment.metadata?.sku === 'string' ? payment.metadata.sku : null;
  if (!isCvRelatedSku(sku)) return;

  await recordFunnelEvent(admin, {
    userId,
    action: 'purchased',
    sku,
    paymentId: payment.id,
    templateName: typeof payment.metadata?.templateName === 'string' ? payment.metadata.templateName : null,
  });

  const templateName =
    (typeof payment.metadata?.templateName === 'string' && payment.metadata.templateName) ||
    (sku ? productBySku(sku)?.name : null);

  const { data: cvs } = await admin
    .from('candidate_cvs')
    .select('id, template_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (!cvs?.length) return;

  let matchId: string | null = null;
  if (templateName) {
    const { data: templates } = await admin.from('cv_templates').select('id, name');
    const templateId = (templates || []).find(
      (t: { id: string; name: string }) => t.name.toLowerCase() === String(templateName).toLowerCase()
    )?.id;
    if (templateId) {
      matchId = (cvs as { id: string; template_id: string | null }[]).find((c) => c.template_id === templateId)?.id || null;
    }
  }
  if (!matchId) {
    matchId = (cvs as { id: string }[])[0]?.id || null;
  }
  if (!matchId) return;

  await deliverCandidateCv(admin, {
    cvId: matchId,
    userId,
    sku,
    templateName,
    paymentId: payment.id,
    forceEmail: true,
  });
}

export async function parseFunnelAction(value: unknown): Promise<FunnelAction | null> {
  if (typeof value !== 'string') return null;
  return FUNNEL_ACTIONS.includes(value as FunnelAction) ? (value as FunnelAction) : null;
}
