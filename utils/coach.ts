import type { TFunction } from 'i18next';
import { ActivityLevel, CoachProfile } from '@/store/coachProfileStore';
import { Habit, FocusSessionRecord } from '@/types/habit';
import { calculateHabitStreak } from '@/utils/streak';
import { completionPercent, todaysCompletedCount, todaysScheduledHabits } from '@/utils/streak';

const ACTIVITY_LABEL_KEYS: Record<ActivityLevel, string> = {
  low: 'coachProfile.activityLow',
  medium: 'coachProfile.activityMedium',
  high: 'coachProfile.activityHigh',
};

export function dailyQuote(t: TFunction): string {
  const quotes = t('coach.quotes', { returnObjects: true }) as string[];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
}

export function dailyTip(t: TFunction, habits: Habit[]): string {
  const scheduled = todaysScheduledHabits(habits);
  const percent = scheduled.length ? Math.round((todaysCompletedCount(habits) / scheduled.length) * 100) : 0;
  if (percent >= 100) return t('coach.tip.perfect');
  if (percent >= 50) return t('coach.tip.good');
  if (percent > 0) return t('coach.tip.started');
  return t('coach.tip.none');
}

export function analyzeHabits(
  t: TFunction,
  habits: Habit[],
  sessions: FocusSessionRecord[],
  overallStreak: number
): string {
  if (habits.length === 0) {
    return t('coach.analysis.noHabits');
  }
  const scheduled = todaysScheduledHabits(habits);
  const done = todaysCompletedCount(habits);
  const percent = completionPercent(habits);

  const best = habits.reduce<{ name: string; streak: number } | null>((acc, habit) => {
    const streak = calculateHabitStreak(habit);
    if (!acc || streak > acc.streak) return { name: habit.name, streak };
    return acc;
  }, null);

  const totalSessions = sessions.length;

  let text = t('coach.analysis.summary', { count: habits.length, done, total: scheduled.length, percent });
  if (best && best.streak > 0) {
    text += t('coach.analysis.bestHabit', { name: best.name, count: best.streak });
  }
  if (overallStreak > 0) {
    text += t('coach.analysis.overallStreak', { count: overallStreak });
  }
  if (totalSessions > 0) {
    text += t('coach.analysis.totalSessions', { count: totalSessions });
  }
  return text;
}

export function motivationBoost(t: TFunction, overallStreak: number): string {
  if (overallStreak >= 7) {
    return t('coach.motivation.highStreak', { count: overallStreak });
  }
  if (overallStreak > 0) {
    return t('coach.motivation.someStreak', { count: overallStreak });
  }
  return t('coach.motivation.noStreak');
}

export function buildCoachContext(
  t: TFunction,
  habits: Habit[],
  sessions: FocusSessionRecord[],
  overallStreak: number,
  coachProfile?: CoachProfile
): string {
  // Profile info is collected first and independently of habits, since a user
  // might ask for coaching (e.g. a diet plan) before creating any habit at all —
  // it must never be skipped just because the habit list happens to be empty.
  const lines: string[] = [];

  if (coachProfile?.goalType) {
    const goalLabel =
      coachProfile.goalType === 'custom'
        ? coachProfile.customGoal || t('coachProfile.goals.custom')
        : t(`coachProfile.goals.${coachProfile.goalType}`);
    lines.push(t('coach.context.profileGoal', { goal: goalLabel }));

    if (coachProfile.heightCm || coachProfile.weightKg || coachProfile.age || coachProfile.activityLevel) {
      lines.push(
        t('coach.context.profilePhysical', {
          height: coachProfile.heightCm ?? '—',
          weight: coachProfile.weightKg ?? '—',
          age: coachProfile.age ?? '—',
          activity: coachProfile.activityLevel ? t(ACTIVITY_LABEL_KEYS[coachProfile.activityLevel]) : '—',
        })
      );
    }
  } else {
    lines.push(t('coach.context.profileMissing'));
  }

  if (coachProfile?.profession) {
    if (coachProfile.profession === 'child') {
      const interestLabel = coachProfile.childInterest
        ? t(`coachProfile.interests.${coachProfile.childInterest}`)
        : undefined;
      lines.push(
        interestLabel
          ? t('coach.context.profileProfessionChild', {
              profession: t('coachProfile.professions.child'),
              interest: interestLabel,
            })
          : t('coach.context.profileProfessionChildNoInterest', {
              profession: t('coachProfile.professions.child'),
            })
      );
    } else {
      const professionLabel =
        coachProfile.profession === 'other'
          ? coachProfile.customProfession || t('coachProfile.professions.other')
          : t(`coachProfile.professions.${coachProfile.profession}`);
      lines.push(t('coach.context.profileProfession', { profession: professionLabel }));
    }
  }

  if (habits.length === 0) {
    lines.push(t('coach.context.noHabits'));
    return lines.join('\n');
  }

  const scheduled = todaysScheduledHabits(habits);
  const done = todaysCompletedCount(habits);
  const percent = completionPercent(habits);
  const totalSessions = sessions.length;
  const avgMinutes = totalSessions
    ? (sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / totalSessions).toFixed(1)
    : '0';
  const habitLines = habits
    .map((habit) => t('coach.context.habitLine', { name: habit.name, count: calculateHabitStreak(habit) }))
    .join('\n');

  lines.push(
    t('coach.context.overallStreak', { count: overallStreak }),
    t('coach.context.todayCompletion', { done, total: scheduled.length, percent }),
    t('coach.context.sessionsSummary', { count: totalSessions, avg: avgMinutes }),
    t('coach.context.habitsListTitle'),
    habitLines
  );

  return lines.join('\n');
}
