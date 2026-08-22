/**
 * Kenyan business-hours helpers for the social share cron.
 * Window: Africa/Nairobi, Mon–Fri 08:00–17:00 EAT.
 */

export const SOCIAL_SHARE_TIMEZONE = 'Africa/Nairobi';
export const SOCIAL_SHARE_START_HOUR = 8;
export const SOCIAL_SHARE_END_HOUR = 17;
export const SOCIAL_SHARE_MAX_JOBS_PER_DAY = 10;

export type NairobiParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 1 = Monday … 7 = Sunday (ISO) */
  weekday: number;
  dateKey: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Parse a Date into calendar parts in Africa/Nairobi. */
export function getNairobiParts(now: Date = new Date()): NairobiParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: SOCIAL_SHARE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const parts = fmt.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '';

  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  let hour = Number(get('hour'));
  // Some engines emit "24" for midnight
  if (hour === 24) hour = 0;
  const minute = Number(get('minute'));
  const weekday = weekdayMap[get('weekday')] || 0;

  return {
    year,
    month,
    day,
    hour,
    minute,
    weekday,
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

/** True when now is Mon–Fri 08:00 inclusive through 17:00 exclusive (EAT). */
export function isKenyanBusinessHours(now: Date = new Date()): boolean {
  const p = getNairobiParts(now);
  if (p.weekday < 1 || p.weekday > 5) return false;
  if (p.hour < SOCIAL_SHARE_START_HOUR) return false;
  if (p.hour >= SOCIAL_SHARE_END_HOUR) return false;
  return true;
}

/**
 * UTC bounds for the current EAT calendar day.
 * EAT is always UTC+3 (no DST).
 */
export function getEatDayUtcBounds(now: Date = new Date()): {
  startUtc: Date;
  endUtc: Date;
  dateKey: string;
} {
  const p = getNairobiParts(now);
  const startUtc = new Date(Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0) - 3 * 60 * 60 * 1000);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc, dateKey: p.dateKey };
}

export function remainingDailyJobSlots(
  postedDistinctJobCount: number,
  maxPerDay: number = SOCIAL_SHARE_MAX_JOBS_PER_DAY
): number {
  return Math.max(0, maxPerDay - Math.max(0, postedDistinctJobCount));
}
