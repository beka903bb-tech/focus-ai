import type { TFunction } from 'i18next';
import { Habit, FocusSessionRecord } from '@/types/habit';
import { completionPercent } from '@/utils/streak';

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

function hasPerfectDay(habits: Habit[]): boolean {
  const dateKeys = new Set<string>();
  habits.forEach((habit) => {
    Object.keys(habit.completions).forEach((key) => dateKeys.add(key));
  });
  for (const key of dateKeys) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (completionPercent(habits, date) === 100) return true;
  }
  return false;
}

export function computeAchievements(
  t: TFunction,
  habits: Habit[],
  sessions: FocusSessionRecord[],
  overallStreak: number
): Achievement[] {
  const totalFocusMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

  const definitions: { key: string; icon: string; unlocked: boolean }[] = [
    { key: 'birinchi-qadam', icon: 'flag', unlocked: habits.length >= 1 },
    { key: 'tezkor-start', icon: 'flash', unlocked: overallStreak >= 3 },
    { key: 'fokus-boshlandi', icon: 'timer', unlocked: sessions.length >= 1 },
    { key: 'bir-hafta', icon: 'calendar', unlocked: overallStreak >= 7 },
    { key: 'mukammal-kun', icon: 'checkmark-done', unlocked: hasPerfectDay(habits) },
    { key: 'kop-qirrali', icon: 'apps', unlocked: habits.length >= 5 },
    { key: 'fokus-ustasi', icon: 'rocket', unlocked: sessions.length >= 5 },
    { key: 'temir-intizom', icon: 'shield-checkmark', unlocked: overallStreak >= 14 },
    { key: 'chuqur-ish', icon: 'bulb', unlocked: totalFocusMinutes >= 300 },
    { key: 'chempion', icon: 'trophy', unlocked: overallStreak >= 30 },
  ];

  return definitions.map((item) => ({
    key: item.key,
    icon: item.icon,
    unlocked: item.unlocked,
    title: t(`achievements.items.${item.key}.title`),
    description: t(`achievements.items.${item.key}.description`),
  }));
}
