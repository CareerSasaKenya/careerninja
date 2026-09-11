import { productForTemplateName, productBySku } from '@/lib/pricing/defaults';

export const FUNNEL_ACTIONS = ['chosen', 'uploaded', 'edited', 'purchased', 'emailed'] as const;
export type FunnelAction = (typeof FUNNEL_ACTIONS)[number];

export type FunnelEvent = {
  user_id: string;
  action: FunnelAction;
  sku: string | null;
  template_id: string | null;
  template_name: string | null;
  cv_id: string | null;
  payment_id: string | null;
  created_at: string;
};

export type PaymentLite = {
  id: string;
  user_id: string | null;
  status: string;
  amount: number | string;
  phone_number: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
};

export type CvLite = {
  id: string;
  user_id: string;
  title: string;
  template_id: string | null;
  file_url: string | null;
  is_primary: boolean | null;
  last_emailed_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProfileLite = {
  id: string;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export type DocumentLite = {
  candidate_id: string;
  file_url: string;
  candidate_cv_id: string | null;
  document_name: string;
};

export type CandidateLite = {
  id: string;
  user_id: string;
  phone: string | null;
  full_name?: string | null;
};

export type LeadRow = {
  key: string;
  userId: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  sku: string | null;
  productName: string | null;
  amountKes: number | null;
  paymentStatus: string | null;
  paymentId: string | null;
  paidAt: string | null;
  cvId: string | null;
  cvTitle: string | null;
  cvUpdatedAt: string | null;
  fileUrl: string | null;
  profileDocumentUrl: string | null;
  lastAction: FunnelAction | 'cv' | 'payment' | null;
  lastActionAt: string | null;
  emailedAt: string | null;
  sources: FunnelAction[];
  kind: 'buyer' | 'cart';
};

export function isCvRelatedSku(sku: string | null | undefined): boolean {
  if (!sku) return false;
  return sku.startsWith('template.cv.') || sku.startsWith('service.cv.');
}

export function paymentSku(payment: PaymentLite): string | null {
  const sku = payment.metadata?.sku;
  return typeof sku === 'string' && sku ? sku : null;
}

export function skuForTemplateName(templateName: string | null | undefined): string | null {
  if (!templateName) return null;
  return productForTemplateName('cv_template', templateName)?.sku ?? null;
}

export function leadKey(input: {
  userId: string;
  sku?: string | null;
  templateId?: string | null;
  cvId?: string | null;
}): string {
  if (input.sku) return `${input.userId}::sku:${input.sku}`;
  if (input.templateId) return `${input.userId}::tpl:${input.templateId}`;
  if (input.cvId) return `${input.userId}::cv:${input.cvId}`;
  return `${input.userId}::unknown`;
}

function later(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b || null;
  if (!b) return a;
  return a >= b ? a : b;
}

function displayName(profile: ProfileLite | undefined, candidate: CandidateLite | undefined): string | null {
  if (profile?.full_name) return profile.full_name;
  const combined = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  if (combined) return combined;
  return candidate?.full_name || null;
}

function mergeRow(existing: LeadRow | undefined, patch: Partial<LeadRow> & { key: string; userId: string }): LeadRow {
  if (!existing) {
    return {
      email: null,
      name: null,
      phone: null,
      sku: null,
      productName: null,
      amountKes: null,
      paymentStatus: null,
      paymentId: null,
      paidAt: null,
      cvId: null,
      cvTitle: null,
      cvUpdatedAt: null,
      fileUrl: null,
      profileDocumentUrl: null,
      lastAction: null,
      lastActionAt: null,
      emailedAt: null,
      sources: [],
      kind: 'cart',
      ...patch,
    };
  }
  const sources = [...existing.sources];
  for (const src of patch.sources || []) {
    if (!sources.includes(src)) sources.push(src);
  }
  const lastActionAt = later(existing.lastActionAt, patch.lastActionAt);
  return {
    ...existing,
    ...patch,
    email: patch.email || existing.email,
    name: patch.name || existing.name,
    phone: patch.phone || existing.phone,
    sku: patch.sku || existing.sku,
    productName: patch.productName || existing.productName,
    amountKes: patch.amountKes ?? existing.amountKes,
    paymentStatus: patch.paymentStatus || existing.paymentStatus,
    paymentId: patch.paymentId || existing.paymentId,
    paidAt: later(existing.paidAt, patch.paidAt),
    cvId: patch.cvId || existing.cvId,
    cvTitle: patch.cvTitle || existing.cvTitle,
    cvUpdatedAt: later(existing.cvUpdatedAt, patch.cvUpdatedAt),
    fileUrl: patch.fileUrl || existing.fileUrl,
    profileDocumentUrl: patch.profileDocumentUrl || existing.profileDocumentUrl,
    lastAction: lastActionAt === patch.lastActionAt ? patch.lastAction || existing.lastAction : existing.lastAction,
    lastActionAt,
    emailedAt: later(existing.emailedAt, patch.emailedAt),
    sources,
  };
}

export function buildBuyerAndCartRows(input: {
  payments: PaymentLite[];
  cvs: CvLite[];
  events: FunnelEvent[];
  templates: { id: string; name: string }[];
  profiles: ProfileLite[];
  candidates: CandidateLite[];
  documents: DocumentLite[];
  emails: Record<string, string | null>;
}): { buyers: LeadRow[]; carts: LeadRow[] } {
  const templatesById = new Map(input.templates.map((t) => [t.id, t.name]));
  const profilesById = new Map(input.profiles.map((p) => [p.id, p]));
  const candidatesByUser = new Map(input.candidates.map((c) => [c.user_id, c]));
  const docsByCv = new Map(
    input.documents.filter((d) => d.candidate_cv_id).map((d) => [d.candidate_cv_id as string, d.file_url])
  );
  const rows = new Map<string, LeadRow>();

  const person = (userId: string) => {
    const profile = profilesById.get(userId);
    const candidate = candidatesByUser.get(userId);
    return {
      email: input.emails[userId] || null,
      name: displayName(profile, candidate),
      phone: profile?.phone || candidate?.phone || null,
    };
  };

  for (const payment of input.payments) {
    if (!payment.user_id) continue;
    const sku = paymentSku(payment);
    if (sku) {
      if (!isCvRelatedSku(sku)) continue;
    } else {
      const desc = (payment.description || '').toLowerCase();
      if (!/cv|resume|template/.test(desc)) continue;
    }
    const key = leadKey({ userId: payment.user_id, sku });
    const product = sku ? productBySku(sku) : undefined;
    rows.set(
      key,
      mergeRow(rows.get(key), {
        key,
        userId: payment.user_id,
        ...person(payment.user_id),
        sku,
        productName: product?.name || payment.description,
        amountKes: Number(payment.amount),
        paymentStatus: payment.status,
        paymentId: payment.id,
        paidAt: payment.paid_at,
        phone: payment.phone_number || person(payment.user_id).phone,
        lastAction: 'payment',
        lastActionAt: payment.paid_at || payment.created_at,
      })
    );
  }

  for (const cv of input.cvs) {
    const templateName = cv.template_id ? templatesById.get(cv.template_id) || null : null;
    const sku = skuForTemplateName(templateName);
    const key = leadKey({ userId: cv.user_id, sku, templateId: cv.template_id, cvId: cv.id });
    rows.set(
      key,
      mergeRow(rows.get(key), {
        key,
        userId: cv.user_id,
        ...person(cv.user_id),
        sku,
        productName: templateName,
        cvId: cv.id,
        cvTitle: cv.title,
        cvUpdatedAt: cv.updated_at,
        fileUrl: cv.file_url,
        profileDocumentUrl: docsByCv.get(cv.id) || null,
        lastAction: 'cv',
        lastActionAt: cv.updated_at || cv.created_at,
        emailedAt: cv.last_emailed_at || null,
      })
    );
  }

  for (const event of input.events) {
    const sku = event.sku || skuForTemplateName(event.template_name);
    const key = leadKey({
      userId: event.user_id,
      sku,
      templateId: event.template_id,
      cvId: event.cv_id,
    });
    rows.set(
      key,
      mergeRow(rows.get(key), {
        key,
        userId: event.user_id,
        ...person(event.user_id),
        sku,
        productName: event.template_name,
        cvId: event.cv_id,
        paymentId: event.payment_id,
        lastAction: event.action,
        lastActionAt: event.created_at,
        emailedAt: event.action === 'emailed' ? event.created_at : null,
        sources: [event.action],
      })
    );
  }

  const buyers: LeadRow[] = [];
  const carts: LeadRow[] = [];
  for (const row of rows.values()) {
    const kind: LeadRow['kind'] = row.paymentStatus === 'SUCCESS' ? 'buyer' : 'cart';
    const finalRow = { ...row, kind };
    if (kind === 'buyer') buyers.push(finalRow);
    else carts.push(finalRow);
  }

  const byTime = (a: LeadRow, b: LeadRow) => (b.lastActionAt || '').localeCompare(a.lastActionAt || '');
  buyers.sort(byTime);
  carts.sort(byTime);
  return { buyers, carts };
}

export function recentlyEmailed(lastEmailedAt: string | null | undefined, withinMs = 10 * 60 * 1000): boolean {
  if (!lastEmailedAt) return false;
  const then = Date.parse(lastEmailedAt);
  if (!Number.isFinite(then)) return false;
  return Date.now() - then < withinMs;
}
