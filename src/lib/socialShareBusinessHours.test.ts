/**
 * Lightweight assertions for Kenyan business-hours helpers.
 * Run: npx tsx src/lib/socialShareBusinessHours.test.ts
 */

import {
  getEatDayUtcBounds,
  getNairobiParts,
  isKenyanBusinessHours,
  remainingDailyJobSlots,
} from './socialShareBusinessHours';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

// Wednesday 2026-07-22 10:30 EAT = 07:30 UTC
const wedMorningUtc = new Date('2026-07-22T07:30:00.000Z');
assert(isKenyanBusinessHours(wedMorningUtc) === true, 'Wed 10:30 EAT should be business hours');

const wedParts = getNairobiParts(wedMorningUtc);
assert(wedParts.dateKey === '2026-07-22', `expected 2026-07-22 got ${wedParts.dateKey}`);
assert(wedParts.hour === 10, `expected hour 10 got ${wedParts.hour}`);
assert(wedParts.weekday === 3, `expected Wed=3 got ${wedParts.weekday}`);

// Wednesday 07:59 EAT = 04:59 UTC — before open
assert(
  isKenyanBusinessHours(new Date('2026-07-22T04:59:00.000Z')) === false,
  '07:59 EAT should be closed'
);

// Wednesday 08:00 EAT = 05:00 UTC — open
assert(
  isKenyanBusinessHours(new Date('2026-07-22T05:00:00.000Z')) === true,
  '08:00 EAT should be open'
);

// Wednesday 17:00 EAT = 14:00 UTC — closed (exclusive end)
assert(
  isKenyanBusinessHours(new Date('2026-07-22T14:00:00.000Z')) === false,
  '17:00 EAT should be closed'
);

// Saturday
assert(
  isKenyanBusinessHours(new Date('2026-07-25T08:00:00.000Z')) === false,
  'Saturday should be closed'
);

const bounds = getEatDayUtcBounds(wedMorningUtc);
assert(
  bounds.startUtc.toISOString() === '2026-07-21T21:00:00.000Z',
  `EAT day start expected 2026-07-21T21:00:00.000Z got ${bounds.startUtc.toISOString()}`
);
assert(
  bounds.endUtc.toISOString() === '2026-07-22T21:00:00.000Z',
  `EAT day end expected 2026-07-22T21:00:00.000Z got ${bounds.endUtc.toISOString()}`
);

assert(remainingDailyJobSlots(0) === 10, '0 posted → 10 remaining');
assert(remainingDailyJobSlots(7) === 3, '7 posted → 3 remaining');
assert(remainingDailyJobSlots(10) === 0, '10 posted → 0 remaining');
assert(remainingDailyJobSlots(15) === 0, 'over cap → 0 remaining');

console.log('socialShareBusinessHours.test.ts: all assertions passed');
