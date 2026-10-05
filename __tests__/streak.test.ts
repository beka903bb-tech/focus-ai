import type { TFunction } from 'i18next';
import {
  calculateHabitStreak, calculateLongestStreak, calculateOverallStreak, completionPercent, dailyFocusMinutes,
  getStreakDisplay, isScheduledOn, monthlyFocusComparison, todaysCompletedCount, weeklyFocusComparison,
} from '@/utils/streak';
import { addDays, toDateKey } from '@/utils/date';
import { Habit } from '@/types/habit';

const TODAY = new Date(2026, 9, 7, 12); // Wednesday
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
});
afterAll(() => jest.useRealTimers());

function habit(daysAgoDone: number[], frequency: number[] = [], minutes: Record<number, number> = {}): Habit {
  const completions: Record<string, boolean> = {};
  const progressMinutes: Record<string, number> = {};
  daysAgoDone.forEach((d) => { completions[toDateKey(addDays(TODAY, -d))] = true; });
  Object.entries(minutes).forEach(([d, m]) => { progressMinutes[toDateKey(addDays(TODAY, -Number(d)))] = m; });
  return { id: Math.random().toString(), name: 'h', iconKey: 'book', colorKey: '#000', durationMinutes: 20,
    frequency, createdAt: '', completions, progressMinutes };
}

const t = ((key: string, opts?: { count?: number }) => (opts?.count !== undefined ? `${key}:${opts.count}` : key)) as unknown as TFunction;

describe('isScheduledOn', () => {
  it.each([0, 1, 2, 3, 4, 5, 6])('empty frequency = every day (dow %i)', (dow) => {
    const date = addDays(TODAY, dow - TODAY.getDay());
    expect(isScheduledOn(habit([]), date)).toBe(true);
  });
  it.each([
    [[1, 3, 5], 3, true], [[1, 3, 5], 2, false], [[0, 6], 6, true], [[0, 6], 1, false],
  ])('frequency %j on dow %i → %s', (frequency, dow, expected) => {
    const date = addDays(TODAY, dow - TODAY.getDay());
    expect(isScheduledOn(habit([], frequency as number[]), date)).toBe(expected);
  });
});

describe('calculateHabitStreak', () => {
  it.each([
    ['nothing done', [], 0],
    ['only today', [0], 1],
    ['today + 4 days back', [0, 1, 2, 3, 4], 5],
    ['yesterday chain still counts before today is done', [1, 2, 3], 3],
    ['gap breaks it', [0, 1, 3, 4], 2],
    ['two days ago only', [2], 0],
  ])('%s', (_name, done, expected) => {
    expect(calculateHabitStreak(habit(done as number[]))).toBe(expected);
  });
  it('unscheduled days are skipped, not breaking the streak', () => {
    // Mon/Wed/Fri habit; today is Wednesday → done today, Monday, last Friday
    expect(calculateHabitStreak(habit([0, 2, 5], [1, 3, 5]))).toBe(3);
  });
});

describe('calculateOverallStreak', () => {
  it('0 with no habits', () => expect(calculateOverallStreak([])).toBe(0));
  it('any habit done keeps the day', () => {
    expect(calculateOverallStreak([habit([0, 2]), habit([1])])).toBe(3);
  });
  it('stops at the first empty day', () => {
    expect(calculateOverallStreak([habit([0, 1]), habit([3])])).toBe(2);
  });
});

describe('calculateLongestStreak', () => {
  it.each([
    [[], 0], [[5], 1], [[1, 2, 3], 3], [[1, 2, 5, 6, 7, 8], 4], [[0, 10, 11], 2],
  ])('%j → %i', (done, expected) => {
    expect(calculateLongestStreak([habit(done as number[])])).toBe(expected);
  });
  it('merges days across habits', () => {
    expect(calculateLongestStreak([habit([1, 3]), habit([2])])).toBe(3);
  });
});

describe('completion percent and counts', () => {
  it('0% with no scheduled habits', () => expect(completionPercent([])).toBe(0));
  it.each([
    [[[0], [], []], 33],
    [[[0], [0], []], 67],
    [[[0], [0], [0]], 100],
    [[[], [], []], 0],
  ])('%j → %i%%', (sets, expected) => {
    expect(completionPercent((sets as number[][]).map((d) => habit(d)))).toBe(expected);
  });
  it('counts only scheduled habits', () => {
    const notToday = habit([0], [TODAY.getDay() === 1 ? 2 : 1]);
    expect(todaysCompletedCount([habit([0]), notToday])).toBe(1);
  });
});

describe('focus minutes', () => {
  it('sums minutes of all habits for a day', () => {
    expect(dailyFocusMinutes([habit([], [], { 0: 20 }), habit([], [], { 0: 15, 1: 50 })], TODAY)).toBe(35);
  });
  it('weekly comparison: no data → 0%', () => {
    expect(weeklyFocusComparison([habit([])])).toEqual({ thisWeekMinutes: 0, lastWeekMinutes: 0, percentChange: 0 });
  });
  it('weekly comparison: nothing last week → null (no fake percentage)', () => {
    expect(weeklyFocusComparison([habit([], [], { 0: 30 })]).percentChange).toBeNull();
  });
  it('weekly comparison: +100%', () => {
    const result = weeklyFocusComparison([habit([], [], { 0: 60, 7: 30 })]);
    expect(result.thisWeekMinutes).toBe(60);
    expect(result.lastWeekMinutes).toBe(30);
    expect(result.percentChange).toBe(100);
  });
  // TODAY = 7 Oct → compares 1–7 Oct with 1–7 Sep
  it('monthly comparison: month-to-date vs the same days of last month', () => {
    const r = monthlyFocusComparison([habit([], [], { 0: 40, 6: 20, 30: 30, 36: 10, 20: 999 })], TODAY);
    expect(r.days).toBe(7);
    expect(r.thisMonthMinutes).toBe(60);       // 7 Oct + 1 Oct
    expect(r.lastMonthMinutes).toBe(40);       // 7 Sep (30 days ago) + 1 Sep (36 days ago); 17 Sep ignored
    expect(r.percentChange).toBe(50);
  });
  it('monthly comparison: empty last month → null, both empty → 0', () => {
    expect(monthlyFocusComparison([habit([], [], { 0: 10 })], TODAY).percentChange).toBeNull();
    expect(monthlyFocusComparison([habit([])], TODAY)).toEqual({ thisMonthMinutes: 0, lastMonthMinutes: 0, days: 7, percentChange: 0 });
  });
  it('monthly comparison: 31 March is capped at 28 Feb (no overflow into March)', () => {
    const d = new Date(2027, 2, 31, 12);
    const h = habit([]);
    h.progressMinutes = { [toDateKey(new Date(2027, 1, 28, 12))]: 30, [toDateKey(new Date(2027, 2, 1, 12))]: 0, [toDateKey(d)]: 15 };
    const r = monthlyFocusComparison([h], d);
    expect(r.lastMonthMinutes).toBe(30);
    expect(r.thisMonthMinutes).toBe(15);
    expect(r.percentChange).toBe(-50);
  });
  it('monthly comparison: drop is negative', () => {
    expect(monthlyFocusComparison([habit([], [], { 0: 10, 30: 40 })], TODAY).percentChange).toBe(-75);
  });
});

describe('getStreakDisplay', () => {
  it.each([
    [0, null], [1, '🔥'], [6, '🔥'], [7, '🔥🔥'], [29, '🔥🔥'], [30, '🔥🔥🔥'], [99, '🔥🔥🔥'], [100, '👑🔥'], [400, '👑🔥'],
  ])('%i days → %s', (streak, emoji) => {
    const result = getStreakDisplay(t, streak as number);
    expect(result ? result.emoji : null).toBe(emoji);
  });
  it.each([
    [1, 'streakDisplay.started'], [7, 'streakDisplay.oneWeek'], [30, 'streakDisplay.oneMonth'],
    [100, 'streakDisplay.hundredDays'], [12, 'common.daysCount:12'],
  ])('%i days text', (streak, text) => {
    expect(getStreakDisplay(t, streak as number)?.text).toBe(text);
  });
});
