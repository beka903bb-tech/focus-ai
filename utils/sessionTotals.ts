import { FocusSessionRecord } from '@/types/habit';

// Lifetime counters that never shrink. The `sessions` list is capped for storage size,
// so anything that must only ever grow (XP, levels, achievements) reads from these
// totals instead of from the (truncated) list.
export interface SessionTotals {
  count: number;
  minutes: number;
  phoneFreeCount: number;
}

export const EMPTY_TOTALS: SessionTotals = { count: 0, minutes: 0, phoneFreeCount: 0 };

export function addSessionToTotals(
  totals: SessionTotals,
  record: Pick<FocusSessionRecord, 'durationMinutes' | 'phoneFreeBonus'>
): SessionTotals {
  return {
    count: totals.count + 1,
    minutes: totals.minutes + Math.max(0, record.durationMinutes || 0),
    phoneFreeCount: totals.phoneFreeCount + (record.phoneFreeBonus ? 1 : 0),
  };
}

// Used once, when migrating data saved by an older app version that had no totals yet.
export function totalsFromSessions(sessions: FocusSessionRecord[]): SessionTotals {
  return sessions.reduce(addSessionToTotals, EMPTY_TOTALS);
}
