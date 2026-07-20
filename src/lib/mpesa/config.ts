import { getEnvVar } from '@/lib/env';
import type { MpesaConfig, MpesaEnvironment } from './types';

const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_BASE = 'https://api.safaricom.co.ke';

/**
 * Required server-only env vars:
 * - MPESA_CONSUMER_KEY
 * - MPESA_CONSUMER_SECRET
 * - MPESA_BUSINESS_SHORT_CODE
 * - MPESA_PASSKEY
 * - MPESA_CALLBACK_URL (public HTTPS URL Safaricom can reach)
 * - MPESA_ENV (sandbox | production) — defaults to sandbox
 */
export function getMpesaConfig(): MpesaConfig {
  const environment = (process.env.MPESA_ENV || 'sandbox').toLowerCase() as MpesaEnvironment;

  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error(`Invalid MPESA_ENV "${environment}". Use "sandbox" or "production".`);
  }

  const baseUrl = environment === 'production' ? PRODUCTION_BASE : SANDBOX_BASE;

  return {
    consumerKey: getEnvVar('MPESA_CONSUMER_KEY'),
    consumerSecret: getEnvVar('MPESA_CONSUMER_SECRET'),
    businessShortCode: getEnvVar('MPESA_BUSINESS_SHORT_CODE'),
    passkey: getEnvVar('MPESA_PASSKEY'),
    callbackUrl: getEnvVar('MPESA_CALLBACK_URL'),
    environment,
    baseUrl,
  };
}

export function isMpesaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_BUSINESS_SHORT_CODE &&
      process.env.MPESA_PASSKEY &&
      process.env.MPESA_CALLBACK_URL
  );
}
