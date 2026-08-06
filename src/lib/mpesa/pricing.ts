/**
 * Pricing for paid job actions (M-Pesa STK Push).
 *
 * Prices are in KES and can be adjusted here — they are the single source of
 * truth for what the checkout dialog charges and what the server validates.
 */

export type PaidJobAction = 'promote' | 'feature';

export interface PaidJobActionPricing {
  action: PaidJobAction;
  tier?: 'basic' | 'premium' | 'enterprise';
  amount: number;
  durationDays: number;
  label: string;
  description: string;
}

export const PAID_JOB_ACTIONS: PaidJobActionPricing[] = [
  {
    action: 'promote',
    tier: 'basic',
    amount: 1000,
    durationDays: 7,
    label: 'Promote job (7 days)',
    description: 'Boosts the job above organic results for 7 days.',
  },
  {
    action: 'promote',
    tier: 'premium',
    amount: 2500,
    durationDays: 14,
    label: 'Promote job (14 days)',
    description: 'Boosts the job above organic results for 14 days.',
  },
  {
    action: 'feature',
    amount: 2000,
    durationDays: 7,
    label: 'Feature job (7 days)',
    description: 'Places the job in the featured section for 7 days.',
  },
];

export function getPaidJobActionPricing(
  action: PaidJobAction,
  tier?: string
): PaidJobActionPricing | undefined {
  return PAID_JOB_ACTIONS.find(
    (p) => p.action === action && (tier ? p.tier === tier : !p.tier)
  );
}
