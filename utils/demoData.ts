import { FocusSessionRecord, Habit } from '@/types/habit';
import { addDays, toDateKey } from '@/utils/date';
import { HABIT_COLORS } from '@/constants/icons';
import { SessionTotals, totalsFromSessions } from '@/utils/sessionTotals';

// "Demo for judges": an empty app can't show statistics, streaks or achievements, so one
// tap fills a realistic, deterministic history. Same seed → same data (tests rely on it).

export const DEMO_DAYS = 75;
export const DEMO_CURRENT_STREAK = 16;

export interface DemoHabitSpec {
  name: string;
  iconKey: string;
  durationMinutes: number;
  frequency: number[];
  // probability (0–1) of being done on a scheduled day outside the guaranteed streak
  rate: number;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DemoData {
  habits: Habit[];
  sessions: FocusSessionRecord[];
  totals: SessionTotals;
}

export function buildDemoData(specs: DemoHabitSpec[], now: Date = new Date(), seed = 42): DemoData {
  const random = mulberry32(seed);
  const start = addDays(now, -(DEMO_DAYS - 1));
  const sessions: FocusSessionRecord[] = [];

  const habits: Habit[] = specs.map((spec, index) => {
    const id = `demo_habit_${index + 1}`;
    const completions: Record<string, boolean> = {};
    const progressMinutes: Record<string, number> = {};

    for (let day = 0; day < DEMO_DAYS; day += 1) {
      const date = addDays(start, day);
      const scheduled = spec.frequency.length === 0 || spec.frequency.includes(date.getDay());
      if (!scheduled) continue;
      const daysAgo = DEMO_DAYS - 1 - day;
      // The first habit runs every day of the current streak so the overall streak is exact.
      const inStreak = index === 0 && daysAgo < DEMO_CURRENT_STREAK;
      const breakDay = index === 0 && daysAgo === DEMO_CURRENT_STREAK;
      if (breakDay) continue;
      if (!inStreak && random() > spec.rate) continue;

      const key = toDateKey(date);
      completions[key] = true;
      progressMinutes[key] = spec.durationMinutes;
      const completedAt = new Date(date);
      completedAt.setHours(7 + Math.floor(random() * 14), Math.floor(random() * 60), 0, 0);
      sessions.push({
        id: `demo_session_${index}_${day}`,
        habitId: id,
        habitName: spec.name,
        durationMinutes: spec.durationMinutes,
        completedAt: completedAt.toISOString(),
        phoneFreeBonus: random() < 0.35,
      });
    }

    return {
      id,
      name: spec.name,
      iconKey: spec.iconKey,
      colorKey: HABIT_COLORS[index % HABIT_COLORS.length],
      durationMinutes: spec.durationMinutes,
      frequency: spec.frequency,
      createdAt: start.toISOString(),
      completions,
      progressMinutes,
    };
  });

  // In the app the overall streak only counts days where *some* habit was done; make sure
  // no other habit accidentally fills the break day, or the streak would run longer.
  const breakKey = toDateKey(addDays(now, -DEMO_CURRENT_STREAK));
  habits.forEach((habit) => {
    if (habit.completions[breakKey]) {
      delete habit.completions[breakKey];
      delete habit.progressMinutes[breakKey];
    }
  });
  const filtered = sessions.filter((session) => toDateKey(new Date(session.completedAt)) !== breakKey);

  filtered.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return { habits, sessions: filtered, totals: totalsFromSessions(filtered) };
}
