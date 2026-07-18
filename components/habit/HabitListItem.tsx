import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { getHabitIcon } from '@/constants/icons';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { Habit } from '@/types/habit';
import { calculateHabitStreak } from '@/utils/streak';
import { todayKey } from '@/utils/date';
import { celebrateQuickComplete } from '@/utils/celebration';
import { lightTap } from '@/utils/haptics';
import { computeElapsedSeconds } from '@/utils/timer';

interface HabitListItemProps {
  habit: Habit;
}

export function HabitListItem({ habit }: HabitListItemProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const activeTimer = useSessionStore((state) => state.activeTimers[habit.id]);
  const icon = getHabitIcon(habit.iconKey);
  const done = !!habit.completions[todayKey()];
  const streak = calculateHabitStreak(habit);
  const isRunning = activeTimer?.status === 'running';
  const isPaused = activeTimer?.status === 'paused';
  const checkScale = useRef(new Animated.Value(1)).current;

  const handleToggle = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!done) {
      celebrateQuickComplete();
      Animated.sequence([
        Animated.spring(checkScale, { toValue: 1.25, useNativeDriver: true, friction: 4, tension: 200 }),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 200 }),
      ]).start();
    } else {
      lightTap();
    }
    toggleCompletion(habit.id);
  };

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

  const bankedMinutes = Math.min(habit.progressMinutes?.[todayKey()] ?? 0, habit.durationMinutes);
  const todayMinutes = activeTimer
    ? Math.min(Math.floor(liveElapsedSeconds / 60), habit.durationMinutes)
    : bankedMinutes;
  const progressPercent = habit.durationMinutes > 0 ? Math.round((todayMinutes / habit.durationMinutes) * 100) : 0;
  const showProgress = !done && (todayMinutes > 0 || !!activeTimer);

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
          {streak > 0 ? (
            <>
              <AppText variant="tertiary" size="xs">
                •
              </AppText>
              <AppIcon name="flame" color={theme.colors.primary} size={13} />
              <AppText size="xs" color={theme.colors.primary} weight="medium">
                {t('common.daysCount', { count: streak })}
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

      <Pressable onPress={handleToggle} hitSlop={8}>
        <Animated.View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? theme.colors.primary : 'transparent',
            borderWidth: done ? 0 : 1.5,
            borderColor: theme.colors.border,
            transform: [{ scale: checkScale }],
          }}
        >
          {done ? <AppIcon name="checkmark" color={theme.colors.onPrimary} size={18} /> : null}
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
