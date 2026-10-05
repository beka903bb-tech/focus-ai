import type { TFunction } from 'i18next';
import { Habit } from '@/types/habit';
import { SessionTotals } from '@/utils/sessionTotals';
import { PHONE_FREE_BONUS_XP } from '@/utils/timer';

const LEVEL_TITLE_COUNT = 5;

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  xpInLevel: number;
  xpToNext: number;
  xpPerLevel: number;
}

// XP is built only from lifetime counters (see utils/sessionTotals.ts) and from completions
// of current + deleted habits, so it can only ever grow.
export function calculateXp(habits: Habit[], totals: SessionTotals, archivedCompletions = 0): number {
  const totalCompletions =
    habits.reduce((sum, habit) => sum + Object.keys(habit.completions).length, 0) + archivedCompletions;
  return totalCompletions * 10 + totals.count * 15 + totals.phoneFreeCount * PHONE_FREE_BONUS_XP;
}

export function calculateLevel(
  t: TFunction,
  habits: Habit[],
  totals: SessionTotals,
  archivedCompletions = 0
): LevelInfo {
  const xp = calculateXp(habits, totals, archivedCompletions);
  const xpPerLevel = 100;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpInLevel = xp % xpPerLevel;
  const titleIndex = Math.min(level - 1, LEVEL_TITLE_COUNT - 1);
  const titles = t('levels.titles', { returnObjects: true }) as string[];

  return {
    level,
    title: titles[titleIndex],
    xp,
    xpInLevel,
    xpToNext: xpPerLevel - xpInLevel,
    xpPerLevel,
  };
}
