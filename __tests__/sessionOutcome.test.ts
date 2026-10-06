import { FocusSessionRecord, SessionOutcome } from '@/types/habit';
import { daysAgoStart, outcomeStats } from '@/utils/sessionOutcome';

function rec(id: string, completedAt: string, outcome?: SessionOutcome): FocusSessionRecord {
  return { id, habitId: 'h', habitName: 'Read', durationMinutes: 25, completedAt, outcome };
}

describe('outcomeStats', () => {
  it('returns null rate when nothing was answered', () => {
    const s = outcomeStats([rec('a', '2026-10-01T10:00:00Z')]);
    expect(s).toEqual({ answered: 0, yes: 0, partial: 0, no: 0, goalRate: null });
  });

  it('counts yes fully and partial as half; unanswered sessions are ignored', () => {
    const s = outcomeStats([
      rec('a', '2026-10-01T10:00:00Z', 'yes'),
      rec('b', '2026-10-02T10:00:00Z', 'partial'),
      rec('c', '2026-10-03T10:00:00Z', 'no'),
      rec('d', '2026-10-03T11:00:00Z', 'yes'),
      rec('e', '2026-10-03T12:00:00Z'),
    ]);
    expect(s.answered).toBe(4);
    expect(s.yes).toBe(2);
    expect(s.partial).toBe(1);
    expect(s.no).toBe(1);
    expect(s.goalRate).toBe(63); // (2 + 0.5) / 4 = 62.5 → 63
  });

  it('respects the since date', () => {
    const s = outcomeStats(
      [rec('old', '2026-08-01T10:00:00Z', 'no'), rec('new', '2026-10-05T10:00:00Z', 'yes')],
      new Date('2026-09-01T00:00:00Z'),
    );
    expect(s.answered).toBe(1);
    expect(s.goalRate).toBe(100);
  });

  it('skips records with an invalid date', () => {
    expect(outcomeStats([rec('x', 'not-a-date', 'yes')]).answered).toBe(0);
  });
});

describe('daysAgoStart', () => {
  it('covers N calendar days including today, starting at midnight', () => {
    const d = daysAgoStart(30, new Date(2026, 9, 6, 15, 30));
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // September
    expect(d.getDate()).toBe(7);
    expect(d.getHours()).toBe(0);
  });
});
