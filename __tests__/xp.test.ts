import type { TFunction } from 'i18next';
import { calculateLevel, calculateXp } from '@/utils/level';
import { addSessionToTotals, EMPTY_TOTALS, totalsFromSessions } from '@/utils/sessionTotals';
import { computeAchievements } from '@/utils/achievements';
import { Habit, FocusSessionRecord } from '@/types/habit';

const t = ((key: string, opts?: { returnObjects?: boolean }) =>
  opts?.returnObjects ? ['L1', 'L2', 'L3', 'L4', 'L5'] : key) as unknown as TFunction;

function habit(id: string, completedDays: number): Habit {
  const completions: Record<string, boolean> = {};
  for (let i = 0; i < completedDays; i += 1) completions[`2026-01-${String(i + 1).padStart(2, '0')}`] = true;
  return {
    id, name: id, iconKey: 'book', colorKey: 'green', durationMinutes: 10, frequency: [0, 1, 2, 3, 4, 5, 6],
    createdAt: '2026-01-01T00:00:00Z', completions, progressMinutes: {},
  };
}

function session(i: number, phoneFree = false): FocusSessionRecord {
  return { id: `s${i}`, habitId: 'h', habitName: 'h', durationMinutes: 25, completedAt: '2026-01-01T00:00:00Z', phoneFreeBonus: phoneFree };
}

describe('session totals', () => {
  it('counts every session, not just the stored history', () => {
    let totals = EMPTY_TOTALS;
    for (let i = 0; i < 250; i += 1) totals = addSessionToTotals(totals, session(i, i % 5 === 0));
    expect(totals.count).toBe(250);
    expect(totals.minutes).toBe(250 * 25);
    expect(totals.phoneFreeCount).toBe(50);
  });

  it('migrates old saved history into totals', () => {
    const sessions = [session(1, true), session(2), session(3)];
    expect(totalsFromSessions(sessions)).toEqual({ count: 3, minutes: 75, phoneFreeCount: 1 });
  });

  it('ignores negative/missing durations', () => {
    expect(addSessionToTotals(EMPTY_TOTALS, { durationMinutes: -5 }).minutes).toBe(0);
  });
});

describe('XP never goes down', () => {
  it('XP keeps growing past the old 200-session cap', () => {
    let totals = EMPTY_TOTALS;
    let previous = 0;
    for (let i = 0; i < 300; i += 1) {
      totals = addSessionToTotals(totals, session(i));
      const xp = calculateXp([], totals);
      expect(xp).toBeGreaterThan(previous);
      previous = xp;
    }
  });

  it('deleting a habit keeps its completions in XP', () => {
    const totals = { count: 4, minutes: 100, phoneFreeCount: 1 };
    const before = calculateXp([habit('a', 5), habit('b', 3)], totals, 0);
    const after = calculateXp([habit('a', 5)], totals, 3); // b deleted, its 3 completions archived
    expect(after).toBe(before);
  });

  it('level is derived from XP', () => {
    const level = calculateLevel(t, [habit('a', 10)], { count: 4, minutes: 100, phoneFreeCount: 0 });
    // 10 completions*10 + 4 sessions*15 = 160 XP → level 2
    expect(level.xp).toBe(160);
    expect(level.level).toBe(2);
    expect(level.title).toBe('L2');
  });
});

describe('achievements use lifetime totals', () => {
  it('session achievements stay unlocked after history is trimmed', () => {
    const achievements = computeAchievements(t, [], { count: 300, minutes: 7500, phoneFreeCount: 0 }, 0);
    const unlocked = achievements.filter((a) => a.unlocked).map((a) => a.key);
    expect(unlocked).toEqual(expect.arrayContaining(['fokus-boshlandi', 'fokus-ustasi', 'chuqur-ish']));
  });
});
