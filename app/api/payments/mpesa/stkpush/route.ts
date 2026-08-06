import { NextRequest, NextResponse } from 'next/server';
import {
  createPendingPaymentAndStkPush,
  isMpesaConfigured,
  isValidKenyanPhone,
  requireAuthenticatedUser,
} from '@/lib/mpesa';
import { getPaidJobActionPricing } from '@/lib/mpesa/pricing';

/**
 * POST /api/payments/mpesa/stkpush
 * Body: { amount: number, phoneNumber: string, description?: string, jobId?: string,
 *         action?: 'promote' | 'feature', tier?: 'basic' | 'premium' | 'enterprise' }
 *
 * When `action` is provided, the amount is validated against the configured
 * pricing for that action/tier so clients cannot underpay.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isMpesaConfigured()) {
      console.error('[M-Pesa] Missing required environment variables');
      return NextResponse.json(
        { error: 'M-Pesa is not configured on this server' },
        { status: 503 }
      );
    }

    const auth = await requireAuthenticatedUser(request);
    if (auth.ok === false) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const phoneNumber = String(body.phoneNumber || body.phone || '').trim();
    const description =
      typeof body.description === 'string' ? body.description.trim() : undefined;
    const jobId = typeof body.jobId === 'string' ? body.jobId : undefined;
    const action = body.action;
    const tier = typeof body.tier === 'string' ? body.tier : undefined;

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be a number of at least 1 KES' },
        { status: 400 }
      );
    }

    if (!phoneNumber || !isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use 07XXXXXXXX or 2547XXXXXXXX' },
        { status: 400 }
      );
    }

    let metadata: Record<string, unknown> | undefined;

    if (action) {
      if (action !== 'promote' && action !== 'feature') {
        return NextResponse.json(
          { error: 'action must be "promote" or "feature"' },
          { status: 400 }
        );
      }
      const pricing = getPaidJobActionPricing(action, tier);
      if (!pricing) {
        return NextResponse.json(
          { error: `No pricing configured for action "${action}"${tier ? ` and tier "${tier}"` : ''}` },
          { status: 400 }
        );
      }
      if (amount !== pricing.amount) {
        return NextResponse.json(
          { error: `Amount must be exactly KES ${pricing.amount} for ${pricing.label}` },
          { status: 400 }
        );
      }
      if (!jobId) {
        return NextResponse.json(
          { error: 'jobId is required for a paid job action' },
          { status: 400 }
        );
      }
      metadata = {
        action,
        tier: pricing.tier || null,
        durationDays: pricing.durationDays,
        jobId,
      };
    }

    const result = await createPendingPaymentAndStkPush(auth.adminClient, {
      amount,
      phoneNumber,
      description,
      userId: auth.user.id,
      jobId,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: result.customerMessage || 'STK Push sent. Check your phone to complete payment.',
      data: {
        paymentId: result.paymentId,
        transactionReference: result.transactionReference,
        merchantRequestId: result.merchantRequestId,
        checkoutRequestId: result.checkoutRequestId,
        status: result.status,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[M-Pesa] STK Push endpoint error:', msg);
    return NextResponse.json(
      { success: false, error: msg || 'Failed to initiate STK Push' },
      { status: 500 }
    );
  }
}
