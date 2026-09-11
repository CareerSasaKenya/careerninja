import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/mpesa';
import { parseFunnelAction, recordFunnelEvent } from '@/lib/cvDelivery';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const action = await parseFunnelAction(body.action);
  if (!action || action === 'emailed') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await recordFunnelEvent(auth.adminClient, {
    userId: auth.user.id,
    action,
    sku: typeof body.sku === 'string' ? body.sku : null,
    templateId: typeof body.templateId === 'string' ? body.templateId : null,
    templateName: typeof body.templateName === 'string' ? body.templateName : null,
    cvId: typeof body.cvId === 'string' ? body.cvId : null,
    paymentId: typeof body.paymentId === 'string' ? body.paymentId : null,
  });

  return NextResponse.json({ ok: true });
}
