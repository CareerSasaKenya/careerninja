import { NextRequest, NextResponse } from 'next/server';
import {
  createPendingPaymentAndStkPush,
  isMpesaConfigured,
  isValidKenyanPhone,
  requireAuthenticatedUser,
} from '@/lib/mpesa';

/**
 * POST /api/payments/mpesa/stkpush
 * Body: { amount: number, phoneNumber: string, description?: string, jobId?: string }
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

    const result = await createPendingPaymentAndStkPush(auth.adminClient, {
      amount,
      phoneNumber,
      description,
      userId: auth.user.id,
      jobId,
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
