import type { TFunction } from 'i18next';
import { Habit, FocusSessionRecord } from '@/types/habit';
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

export function calculateLevel(t: TFunction, habits: Habit[], sessions: FocusSessionRecord[]): LevelInfo {
  const totalCompletions = habits.reduce(
    (sum, habit) => sum + Object.keys(habit.completions).length,
    0
  );
  const phoneFreeBonusCount = sessions.filter((session) => session.phoneFreeBonus).length;
  const xp = totalCompletions * 10 + sessions.length * 15 + phoneFreeBonusCount * PHONE_FREE_BONUS_XP;
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
