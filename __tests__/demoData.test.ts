import type { TFunction } from 'i18next';
import { buildDemoData, DEMO_CURRENT_STREAK, DEMO_DAYS, DemoHabitSpec } from '@/utils/demoData';
import { calculateLongestStreak, calculateOverallStreak } from '@/utils/streak';
import { computeAchievements } from '@/utils/achievements';
import { calculateLevel } from '@/utils/level';
import { totalsFromSessions } from '@/utils/sessionTotals';

const NOW = new Date(2026, 9, 7, 12);
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});
afterAll(() => jest.useRealTimers());

const t = ((key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? ['a', 'b', 'c', 'd', 'e'] : key)) as unknown as TFunction;
const all = [0, 1, 2, 3, 4, 5, 6];
const specs: DemoHabitSpec[] = [
  { name: 'Read', iconKey: 'book', durationMinutes: 30, frequency: all, rate: 0.8 },
  { name: 'Walk', iconKey: 'walk', durationMinutes: 20, frequency: all, rate: 0.7 },
  { name: 'Meditate', iconKey: 'meditation', durationMinutes: 10, frequency: all, rate: 0.6 },
  { name: 'Gym', iconKey: 'barbell', durationMinutes: 45, frequency: [1, 3, 5], rate: 0.75 },
  { name: 'English', iconKey: 'flash', durationMinutes: 25, frequency: [1, 2, 3, 4, 5], rate: 0.65 },
];

describe('demo data for judges', () => {
  const demo = buildDemoData(specs, NOW);

  it('is deterministic', () => {
    expect(buildDemoData(specs, NOW)).toEqual(demo);
  });
  it('creates 5 habits', () => expect(demo.habits).toHaveLength(5));
  it(`current overall streak is exactly ${DEMO_CURRENT_STREAK} days`, () => {
    expect(calculateOverallStreak(demo.habits)).toBe(DEMO_CURRENT_STREAK);
  });
  it('history spans the demo window only', () => {
    const keys = demo.habits.flatMap((h) => Object.keys(h.completions)).sort();
    const first = new Date(keys[0]);
    const days = Math.round((NOW.getTime() - first.getTime()) / 86400000);
    expect(days).toBeLessThanOrEqual(DEMO_DAYS);
  });
  it('respects each habit schedule', () => {
    const gym = demo.habits[3];
    Object.keys(gym.completions).forEach((key) => {
      const [y, m, d] = key.split('-').map(Number);
      expect([1, 3, 5]).toContain(new Date(y, m - 1, d).getDay());
    });
  });
  it('every completion has matching progress minutes and a session', () => {
    demo.habits.forEach((habit) => {
      Object.keys(habit.completions).forEach((key) => {
        expect(habit.progressMinutes[key]).toBe(habit.durationMinutes);
      });
    });
    const completions = demo.habits.reduce((n, h) => n + Object.keys(h.completions).length, 0);
    expect(demo.sessions).toHaveLength(completions);
  });
  it('totals match the session list', () => {
    expect(demo.totals).toEqual(totalsFromSessions(demo.sessions));
  });
  it('sessions are newest first', () => {
    for (let i = 1; i < demo.sessions.length; i += 1) {
      expect(demo.sessions[i - 1].completedAt >= demo.sessions[i].completedAt).toBe(true);
    }
  });
  it('unlocks a meaningful set of achievements and levels', () => {
    const unlocked = computeAchievements(t, demo.habits, demo.totals, calculateOverallStreak(demo.habits)).filter((a) => a.unlocked);
    expect(unlocked.length).toBeGreaterThanOrEqual(7);
    expect(calculateLevel(t, demo.habits, demo.totals).level).toBeGreaterThan(5);
    expect(calculateLongestStreak(demo.habits)).toBeGreaterThanOrEqual(DEMO_CURRENT_STREAK);
  });
});
