import { FocusSessionRecord, SessionOutcome } from '@/types/habit';

export const SESSION_OUTCOMES: SessionOutcome[] = ['yes', 'partial', 'no'];

export interface OutcomeStats {
  answered: number;
  yes: number;
  partial: number;
  no: number;
  /** 0–100: "yes" counts fully, "partial" counts half. `null` when nothing was answered. */
  goalRate: number | null;
}

/**
 * Summarises the self-reported "Did you reach your goal?" answers.
 * Only sessions completed on/after `since` are counted (all sessions when omitted);
 * sessions without an answer are ignored rather than counted as failures.
 */
export function outcomeStats(sessions: FocusSessionRecord[], since?: Date): OutcomeStats {
  const sinceMs = since ? since.getTime() : -Infinity;
  const stats = { answered: 0, yes: 0, partial: 0, no: 0 };
  for (const s of sessions) {
    if (!s.outcome) continue;
    const at = Date.parse(s.completedAt);
    if (!Number.isFinite(at) || at < sinceMs) continue;
    stats.answered += 1;
    stats[s.outcome] += 1;
  }
  const goalRate =
    stats.answered === 0 ? null : Math.round(((stats.yes + stats.partial * 0.5) / stats.answered) * 100);
  return { ...stats, goalRate };
}

/** Start of the day `days - 1` days before `today` (so `days = 30` covers the last 30 calendar days). */
export function daysAgoStart(days: number, today: Date = new Date()): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() - (days - 1));
  return d;
}
