import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { MonthlyCalendar } from '@/components/charts/MonthlyCalendar';
import { StreakHeatmap } from '@/components/charts/StreakHeatmap';
import { WeeklyProgressChart } from '@/components/charts/WeeklyProgressChart';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatChip } from '@/components/ui/StatChip';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { computeAchievements } from '@/utils/achievements';
import { success } from '@/utils/haptics';
import { calculateLevel } from '@/utils/level';
import { calculateOverallStreak, completionPercent, weeklyCompletionSeries, weeklyFocusComparison } from '@/utils/streak';
import { useTodayKey } from '@/hooks/useTodayKey';

type Segment = 'achievements' | 'challenges' | 'overview';

function bestFocusWindowKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function StatisticsScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const habits = useHabitStore((state) => state.habits);
  const sessions = useSessionStore((state) => state.sessions);
  const [segment, setSegment] = useState<Segment>('achievements');
  // Forces a re-render exactly when the calendar day changes, so the this-week/last-week
  // boundary below doesn't go stale if the app stays open across midnight.
  useTodayKey();

  const overallStreak = calculateOverallStreak(habits);
  const achievements = computeAchievements(t, habits, sessions, overallStreak);
  const unlocked = achievements.filter((item) => item.unlocked);
  const locked = achievements.filter((item) => !item.unlocked);
  const level = calculateLevel(t, habits, sessions);
  const weeklySeries = weeklyCompletionSeries(habits).map((point) => ({
    label: t(`common.weekdaysShort.${point.dayIndex}`),
    percent: point.percent,
  }));
  const todayPercent = completionPercent(habits);
  const weeklyComparison = weeklyFocusComparison(habits);

  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessions.filter((session) => new Date(session.completedAt) >= weekAgo).length;
  }, [sessions]);

  // Level and achievements are derived values, not events — detect increases across
  // renders to fire a haptic exactly once per level-up / newly unlocked achievement.
  const prevLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevLevelRef.current !== null && level.level > prevLevelRef.current) {
      success();
    }
    prevLevelRef.current = level.level;
  }, [level.level]);

  const prevUnlockedRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevUnlockedRef.current !== null && unlocked.length > prevUnlockedRef.current) {
      success();
    }
    prevUnlockedRef.current = unlocked.length;
  }, [unlocked.length]);

  return (
    <Screen scroll>
      <AppHeader />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText weight="extraBold" size="xxl">
          {t('statistics.title')}
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: radius.full,
            paddingHorizontal: spacing.md,
            paddingVertical: 4,
          }}
        >
          <AppIcon name="trophy" color={theme.colors.primary} size={14} />
          <AppText size="sm" weight="bold" color={theme.colors.primary}>
            {unlocked.length}
          </AppText>
        </View>
      </View>

      <SegmentedControl
        options={[
          { key: 'achievements', label: t('statistics.tabAchievements') },
          { key: 'challenges', label: t('statistics.tabChallenges') },
          { key: 'overview', label: t('statistics.tabOverview') },
        ]}
        selectedKey={segment}
        onChange={(key) => setSegment(key as Segment)}
      />

      {segment === 'achievements' ? (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AppIcon name="star" color={theme.colors.primary} size={18} />
              <AppText weight="bold" size="md">
                {level.title}
              </AppText>
            </View>
            <AppText size="sm" variant="secondary">
              {t('statistics.xpToNext', { count: level.xpToNext })}
            </AppText>
            <ProgressBar progress={level.xpInLevel / level.xpPerLevel} />
            <AppText size="xs" variant="tertiary">
              {t('statistics.levelProgress', { level: level.level, xpInLevel: level.xpInLevel, xpPerLevel: level.xpPerLevel })}
            </AppText>
          </Card>

          <View style={{ gap: spacing.sm }}>
            <AppText weight="bold" size="md">
              {t('statistics.unlockedCount', { count: unlocked.length })}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {unlocked.map((achievement) => (
                <AchievementCard key={achievement.key} achievement={achievement} />
              ))}
              {unlocked.length === 0 ? (
                <AppText size="sm" variant="tertiary">
                  {t('statistics.noAchievements')}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText weight="bold" size="md">
              {t('statistics.lockedCount', { count: locked.length })}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {locked.map((achievement) => (
                <AchievementCard key={achievement.key} achievement={achievement} />
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {segment === 'challenges' ? (
        <View style={{ gap: spacing.md }}>
          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText weight="semiBold" size="sm">
                {t('statistics.challengeWeeklySessions')}
              </AppText>
              <AppText size="sm" variant="secondary">
                {Math.min(sessionsThisWeek, 5)}/5
              </AppText>
            </View>
            <ProgressBar progress={sessionsThisWeek / 5} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText weight="semiBold" size="sm">
                {t('statistics.challengeStreak10')}
              </AppText>
              <AppText size="sm" variant="secondary">
                {Math.min(overallStreak, 10)}/10
              </AppText>
            </View>
            <ProgressBar progress={overallStreak / 10} color={theme.colors.secondary} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText weight="semiBold" size="sm">
                {t('statistics.challengeToday100')}
              </AppText>
              <AppIcon
                name={todayPercent === 100 ? 'checkmark-circle' : 'ellipse-outline'}
                color={todayPercent === 100 ? theme.colors.primary : theme.colors.textTertiary}
                size={20}
              />
            </View>
            <ProgressBar progress={todayPercent / 100} />
          </Card>
        </View>
      ) : null}

      {segment === 'overview' ? (
        <View style={{ gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatChip
              value={`${overallStreak}`}
              label={t('statistics.currentStreak')}
              iconName="flame"
              valueColor={theme.colors.primary}
            />
            <StatChip
              value={`${todayPercent}%`}
              label={t('statistics.todayCompletion')}
              iconName="checkmark-done"
              valueColor={theme.colors.secondary}
            />
          </View>

          <Card style={{ gap: spacing.xs }}>
            <AppText weight="semiBold" size="sm" variant="secondary">
              {t('statistics.weeklyComparisonTitle')}
            </AppText>
            <AppText weight="extraBold" size="xl">
              {t('statistics.weeklyComparisonMinutes', { minutes: weeklyComparison.thisWeekMinutes })}
            </AppText>
            {weeklyComparison.percentChange === null ? (
              <AppText size="sm" variant="tertiary">
                {t('statistics.weeklyComparisonNoBaseline')}
              </AppText>
            ) : weeklyComparison.percentChange > 0 ? (
              <AppText size="sm" weight="semiBold" color={theme.colors.primary}>
                {t('statistics.weeklyComparisonUp', { percent: weeklyComparison.percentChange })}
              </AppText>
            ) : weeklyComparison.percentChange < 0 ? (
              <AppText size="sm" weight="semiBold" color={theme.colors.danger}>
                {t('statistics.weeklyComparisonDown', { percent: Math.abs(weeklyComparison.percentChange) })}
              </AppText>
            ) : (
              <AppText size="sm" variant="tertiary">
                {t('statistics.weeklyComparisonSame')}
              </AppText>
            )}
          </Card>

          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              backgroundColor: theme.colors.primaryMuted,
              borderRadius: radius.lg,
              padding: spacing.lg,
            }}
          >
            <AppIcon name="bulb" color={theme.colors.primary} size={20} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="semiBold" size="sm" color={theme.colors.primary}>
                {t('statistics.focusAnalysisTitle')}
              </AppText>
              <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
                {t('statistics.focusAnalysisText', { window: t(`statistics.focusWindow.${bestFocusWindowKey()}`) })}
              </AppText>
            </View>
          </View>

          <Card style={{ gap: spacing.md }}>
            <AppText weight="bold" size="md">
              {t('statistics.weeklyProgressTitle')}
            </AppText>
            <WeeklyProgressChart data={weeklySeries} />
          </Card>

          <Card style={{ gap: spacing.md }}>
            <AppText weight="bold" size="md">
              {t('statistics.heatmapTitle')}
            </AppText>
            <StreakHeatmap habits={habits} />
          </Card>

          <Card style={{ gap: spacing.md }}>
            <AppText weight="bold" size="md">
              {t('statistics.monthlyViewTitle')}
            </AppText>
            <MonthlyCalendar habits={habits} />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
