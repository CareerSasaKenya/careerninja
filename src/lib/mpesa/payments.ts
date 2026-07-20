import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { getAdminServiceClient } from '@/lib/adminAuth';
import { initiateStkPush } from './client';
import { normalizeKenyanPhone } from './phone';
import { generateTransactionReference } from './utils';
import type { InitiateStkPushInput, InitiateStkPushResult } from './types';

export type UserAuthResult =
  | { ok: true; user: User; adminClient: SupabaseClient }
  | { ok: false; status: number; message: string };

export async function requireAuthenticatedUser(
  request: NextRequest
): Promise<UserAuthResult> {
  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true, user, adminClient: getAdminServiceClient() };
}

/**
 * Create a PENDING payment row, initiate Daraja STK Push, then store request IDs.
 */
export async function createPendingPaymentAndStkPush(
  adminClient: SupabaseClient,
  input: InitiateStkPushInput
): Promise<InitiateStkPushResult> {
  const phoneNumber = normalizeKenyanPhone(input.phoneNumber);
  const amount = Math.round(Number(input.amount));

  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error('Amount must be at least 1 KES');
  }

  const description = (input.description || 'CareerSasa payment').trim().slice(0, 100);
  const transactionReference = generateTransactionReference();

  const { data: payment, error: insertError } = await adminClient
    .from('payments')
    .insert({
      provider: 'mpesa',
      transaction_reference: transactionReference,
      amount,
      phone_number: phoneNumber,
      status: 'PENDING',
      description,
      user_id: input.userId || null,
      job_id: input.jobId || null,
      metadata: input.metadata || {},
    })
    .select('id, transaction_reference')
    .single();

  if (insertError || !payment) {
    console.error('[M-Pesa] Failed to create payment row:', insertError);
    throw new Error('Failed to create payment record');
  }

  try {
    const stk = await initiateStkPush({
      amount,
      phoneNumber,
      accountReference: transactionReference,
      transactionDesc: description,
    });

    const { error: updateError } = await adminClient
      .from('payments')
      .update({
        merchant_request_id: stk.MerchantRequestID,
        checkout_request_id: stk.CheckoutRequestID,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('[M-Pesa] Failed to store STK request IDs:', updateError);
    }

    return {
      paymentId: payment.id,
      transactionReference: payment.transaction_reference,
      merchantRequestId: stk.MerchantRequestID,
      checkoutRequestId: stk.CheckoutRequestID,
      customerMessage: stk.CustomerMessage,
      status: 'PENDING',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'STK Push failed';
    await adminClient
      .from('payments')
      .update({
        status: 'FAILED',
        result_desc: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    throw err;
  }
}
