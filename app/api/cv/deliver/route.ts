import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/mpesa';
import { deliverCandidateCv, parseFunnelAction } from '@/lib/cvDelivery';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const cvId = typeof body.cvId === 'string' ? body.cvId : null;
  if (!cvId) {
    return NextResponse.json({ error: 'cvId is required' }, { status: 400 });
  }

  const action = await parseFunnelAction(body.action);
  const result = await deliverCandidateCv(auth.adminClient, {
    cvId,
    userId: auth.user.id,
    action: action && action !== 'emailed' && action !== 'purchased' ? action : 'edited',
    sku: typeof body.sku === 'string' ? body.sku : null,
    templateName: typeof body.templateName === 'string' ? body.templateName : null,
  });

  if (result.error === 'Forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (result.error === 'CV not found') {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result);
}
