import { Habit } from '@/types/habit';
import { addDays, toDateKey, todayKey } from '@/utils/date';

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (!habit.frequency || habit.frequency.length === 0) return true;
  return habit.frequency.includes(date.getDay());
}

export function calculateHabitStreak(habit: Habit): number {
  let streak = 0;
  let cursor = new Date();

  if (!habit.completions[todayKey()]) {
    cursor = addDays(cursor, -1);
  }

  for (let i = 0; i < 3650; i += 1) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    const key = toDateKey(cursor);
    if (habit.completions[key]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateOverallStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();

  const anyCompletedOn = (date: Date) =>
    habits.some((habit) => habit.completions[toDateKey(date)]);

  if (!anyCompletedOn(cursor)) {
    cursor = addDays(cursor, -1);
  }

  for (let i = 0; i < 3650; i += 1) {
    if (anyCompletedOn(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return streak;
}

export function todaysScheduledHabits(habits: Habit[], date: Date = new Date()): Habit[] {
  return habits.filter((habit) => isScheduledOn(habit, date));
}

export function todaysCompletedCount(habits: Habit[], date: Date = new Date()): number {
  const key = toDateKey(date);
  return todaysScheduledHabits(habits, date).filter((habit) => habit.completions[key]).length;
}

export function completionPercent(habits: Habit[], date: Date = new Date()): number {
  const scheduled = todaysScheduledHabits(habits, date);
  if (scheduled.length === 0) return 0;
  const done = todaysCompletedCount(habits, date);
  return Math.round((done / scheduled.length) * 100);
}

// Longest historical run of consecutive days where at least one habit was completed —
// distinct from calculateOverallStreak, which only tracks the *current* run ending today.
export function calculateLongestStreak(habits: Habit[]): number {
  const dateKeys = new Set<string>();
  habits.forEach((habit) => {
    Object.keys(habit.completions).forEach((key) => {
      if (habit.completions[key]) dateKeys.add(key);
    });
  });
  if (dateKeys.size === 0) return 0;

  const sortedDates = Array.from(dateKeys)
    .sort()
    .map((key) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
    });

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i += 1) {
    const diffDays = Math.round((sortedDates[i] - sortedDates[i - 1]) / 86400000);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

export function dailyFocusMinutes(habits: Habit[], date: Date): number {
  const key = toDateKey(date);
  return habits.reduce((sum, habit) => sum + (habit.progressMinutes?.[key] ?? 0), 0);
}

export function weeklyCompletionSeries(habits: Habit[]): { dayIndex: number; percent: number }[] {
  const today = new Date();
  const currentDow = today.getDay();
  const mondayOffset = currentDow === 0 ? -6 : 1 - currentDow;
  const monday = addDays(today, mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const dayIndex = date.getDay();
    if (date > today) {
      return { dayIndex, percent: 0 };
    }
    return { dayIndex, percent: completionPercent(habits, date) };
  });
}
