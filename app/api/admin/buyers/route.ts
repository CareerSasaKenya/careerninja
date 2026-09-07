import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { buildBuyerAndCartRows, isCvRelatedSku, paymentSku, type FunnelEvent } from '@/lib/cvFunnel';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = auth.adminClient;
  const limit = Math.min(300, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 150)));

  const paymentsRes = await admin
    .from('payments')
    .select('id, user_id, status, amount, phone_number, description, metadata, paid_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  let cvsRes = await admin
    .from('candidate_cvs')
    .select('id, user_id, title, template_id, file_url, is_primary, last_emailed_at, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (cvsRes.error) {
    cvsRes = await admin
      .from('candidate_cvs')
      .select('id, user_id, title, template_id, file_url, is_primary, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit);
  }

  const templatesRes = await admin.from('cv_templates').select('id, name');
  const eventsRes = await admin
    .from('career_funnel_events')
    .select('user_id, action, sku, template_id, template_name, cv_id, payment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  const events = eventsRes.error ? [] : ((eventsRes.data || []) as FunnelEvent[]);
  const payments = (paymentsRes.data || []).filter((p) => {
    const sku = paymentSku(p as never);
    if (sku) return isCvRelatedSku(sku);
    const desc = String((p as { description?: string }).description || '').toLowerCase();
    return /cv|resume|template/.test(desc);
  });
  const cvs = cvsRes.data || [];
  const userIds = [
    ...new Set(
      [
        ...payments.map((p) => p.user_id),
        ...cvs.map((c) => c.user_id),
        ...events.map((e) => e.user_id),
      ].filter((id): id is string => Boolean(id))
    ),
  ];

  let profiles: { id: string; full_name: string | null; first_name?: string | null; last_name?: string | null; phone?: string | null }[] =
    [];
  if (userIds.length) {
    const extended = await admin
      .from('user_profiles')
      .select('id, full_name, first_name, last_name, phone')
      .in('id', userIds);
    if (extended.error) {
      const base = await admin.from('user_profiles').select('id, full_name').in('id', userIds);
      profiles = base.data || [];
    } else {
      profiles = extended.data || [];
    }
  }

  const { data: candidates } = userIds.length
    ? await admin.from('candidate_profiles').select('id, user_id, phone, full_name').in('user_id', userIds)
    : { data: [] as never[] };

  let documents: { candidate_id: string; file_url: string; candidate_cv_id: string | null; document_name: string }[] =
    [];
  const docsWithCv = await admin
    .from('candidate_documents')
    .select('candidate_id, file_url, candidate_cv_id, document_name')
    .not('candidate_cv_id', 'is', null);
  if (!docsWithCv.error) {
    documents = docsWithCv.data || [];
  }

  const emails: Record<string, string | null> = {};
  await Promise.all(
    userIds.slice(0, 200).map(async (id) => {
      try {
        const { data } = await admin.auth.admin.getUserById(id);
        emails[id] = data.user?.email ?? null;
      } catch {
        emails[id] = null;
      }
    })
  );

  const { buyers, carts } = buildBuyerAndCartRows({
    payments: payments as never,
    cvs: cvs as never,
    events,
    templates: (templatesRes.data || []) as { id: string; name: string }[],
    profiles: profiles as never,
    candidates: (candidates || []) as never,
    documents,
    emails,
  });

  return NextResponse.json({
    buyers,
    carts,
    counts: { buyers: buyers.length, carts: carts.length },
  });
}
