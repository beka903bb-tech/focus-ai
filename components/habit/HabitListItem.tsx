import { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { PieProgress } from '@/components/ui/PieProgress';
import { getHabitIcon } from '@/constants/icons';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useSessionStore } from '@/store/sessionStore';
import { Habit } from '@/types/habit';
import { calculateHabitStreak, getStreakDisplay } from '@/utils/streak';
import { lightTap } from '@/utils/haptics';
import { computeElapsedSeconds } from '@/utils/timer';
import { useTodayKey } from '@/hooks/useTodayKey';

interface HabitListItemProps {
  habit: Habit;
}

export function HabitListItem({ habit }: HabitListItemProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const activeTimer = useSessionStore((state) => state.activeTimers[habit.id]);
  const icon = getHabitIcon(habit.iconKey);
  const today = useTodayKey();
  const done = !!habit.completions[today];
  const streak = calculateHabitStreak(habit);
  const streakDisplay = getStreakDisplay(t, streak);
  const isRunning = activeTimer?.status === 'running';
  const isPaused = activeTimer?.status === 'paused';

  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(() =>
    activeTimer ? computeElapsedSeconds(activeTimer) : 0
  );

  useEffect(() => {
    if (activeTimer) setLiveElapsedSeconds(computeElapsedSeconds(activeTimer));
  }, [activeTimer]);

  useEffect(() => {
    if (!isRunning || !activeTimer) return;
    const interval = setInterval(() => setLiveElapsedSeconds(computeElapsedSeconds(activeTimer)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, activeTimer]);

  const bankedMinutes = Math.min(habit.progressMinutes?.[today] ?? 0, habit.durationMinutes);
  const todayMinutes = activeTimer
    ? Math.min(Math.floor(liveElapsedSeconds / 60), habit.durationMinutes)
    : bankedMinutes;
  const progressPercent = habit.durationMinutes > 0 ? Math.round((todayMinutes / habit.durationMinutes) * 100) : 0;
  const showProgress = !done && (todayMinutes > 0 || !!activeTimer);
  const progressRatio = habit.durationMinutes > 0 ? Math.min(1, todayMinutes / habit.durationMinutes) : 0;
  const ringProgress = done ? 1 : progressRatio;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/focus-session', params: { habitId: habit.id } })}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: habit.imageUri ? 22 : radius.md,
          backgroundColor: `${habit.colorKey}26`,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {habit.imageUri ? (
          <Image source={{ uri: habit.imageUri }} style={{ width: 44, height: 44 }} />
        ) : (
          <AppIcon family={icon.family} name={icon.name} color={habit.colorKey} size={22} />
        )}
        {isRunning || isPaused ? (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: isRunning ? theme.colors.primary : theme.colors.textTertiary,
              borderWidth: 2,
              borderColor: theme.colors.surface,
            }}
          />
        ) : null}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText weight="semiBold" size="md">
          {habit.name}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <AppIcon name="time-outline" color={theme.colors.textTertiary} size={13} />
          <AppText variant="tertiary" size="xs">
            {t('common.minutesCount', { count: habit.durationMinutes })}
          </AppText>
          {streakDisplay ? (
            <>
              <AppText variant="tertiary" size="xs">
                •
              </AppText>
              <AppText size="xs" color={theme.colors.primary} weight="medium">
                {streakDisplay.emoji} {streakDisplay.text}
              </AppText>
            </>
          ) : null}
        </View>
        {showProgress ? (
          <View style={{ gap: 3, marginTop: 4 }}>
            <View
              style={{
                height: 4,
                borderRadius: radius.full,
                backgroundColor: theme.colors.surfaceAlt,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  borderRadius: radius.full,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
            <AppText variant="tertiary" size="xs">
              {t('habitItem.progress', { done: todayMinutes, goal: habit.durationMinutes, percent: progressPercent })}
            </AppText>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          lightTap();
          router.push({ pathname: '/add-habit', params: { habitId: habit.id } });
        }}
        hitSlop={8}
        style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
      >
        <AppIcon name="pencil" color={theme.colors.textTertiary} size={16} />
      </Pressable>

      <PieProgress
        size={36}
        progress={ringProgress}
        color={theme.colors.primary}
        trackColor={theme.colors.border}
      />
    </Pressable>
  );
}
