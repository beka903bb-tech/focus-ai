import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatChip } from '@/components/ui/StatChip';
import { HabitListItem } from '@/components/habit/HabitListItem';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useUserStore } from '@/store/userStore';
import { formatLongDate } from '@/utils/date';
import { todaysCompletedCount, todaysScheduledHabits } from '@/utils/streak';
import { dailyTip } from '@/utils/coach';

export default function HomeScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const name = useUserStore((state) => state.name);
  const habits = useHabitStore((state) => state.habits);

  const scheduledToday = todaysScheduledHabits(habits);
  const completedToday = todaysCompletedCount(habits);
  const remaining = scheduledToday.length - completedToday;
  const firstName = name.split(' ')[0] || t('common.defaultUserName');

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.xl,
          // Clear the floating (+) FAB: its own height + its offset from the bottom + breathing room.
          paddingBottom: 56 + spacing.xl + spacing.xxl,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader />

        <View style={{ gap: 2 }}>
          <AppText weight="extraBold" size="xxl">
            {t('home.greeting', { name: firstName })}
          </AppText>
          <AppText variant="secondary" size="sm">
            {formatLongDate(t)}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatChip value={String(scheduledToday.length)} label={t('home.totalHabits')} iconName="list" />
          <StatChip
            value={String(completedToday)}
            label={t('home.completedToday')}
            iconName="checkmark-circle"
            valueColor={theme.colors.primary}
          />
          <StatChip
            value={String(Math.max(remaining, 0))}
            label={t('home.remaining')}
            iconName="hourglass"
            valueColor={theme.colors.secondary}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText weight="bold" size="md">
            {t('home.todayHabits')}
          </AppText>
          <Pressable onPress={() => router.push('/(tabs)/statistics')}>
            <AppText size="sm" weight="medium" color={theme.colors.primary}>
              {t('home.seeAll')}
            </AppText>
          </Pressable>
        </View>

        {scheduledToday.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl }}>
            <AppIcon name="leaf" color={theme.colors.textTertiary} size={28} />
            <AppText variant="secondary" size="sm" style={{ textAlign: 'center' }}>
              {t('home.emptyToday')}
            </AppText>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {scheduledToday.map((habit) => (
              <HabitListItem key={habit.id} habit={habit} />
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: radius.lg,
            padding: spacing.lg,
            alignItems: 'flex-start',
          }}
        >
          <AppIcon name="bulb" color={theme.colors.primary} size={20} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText weight="semiBold" size="sm" color={theme.colors.primary}>
              {t('home.aiTipTitle')}
            </AppText>
            <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
              {dailyTip(t, habits)}
            </AppText>
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/add-habit')}
        style={{
          position: 'absolute',
          right: spacing.xl,
          bottom: spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <AppIcon name="add" color={theme.colors.onPrimary} size={28} />
      </Pressable>
    </Screen>
  );
}
