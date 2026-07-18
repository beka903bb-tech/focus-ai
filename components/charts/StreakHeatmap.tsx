import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { Habit } from '@/types/habit';
import { addDays, toDateKey } from '@/utils/date';
import {
  calculateLongestStreak,
  completionPercent,
  dailyFocusMinutes,
  todaysCompletedCount,
} from '@/utils/streak';

interface StreakHeatmapProps {
  habits: Habit[];
}

const WEEKS = 13;
const CELL_SIZE = 14;
const CELL_GAP = 3;
const LABELED_ROWS = [0, 2, 4]; // Monday, Wednesday, Friday

function hexToRgb(hex: string): string {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

export function StreakHeatmap({ habits }: StreakHeatmapProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);

  const primaryRgb = useMemo(() => hexToRgb(theme.colors.primary), [theme.colors.primary]);

  const weeks = useMemo(() => {
    const todayDow = today.getDay();
    const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow;
    const thisMonday = addDays(today, mondayOffset);
    const gridStart = addDays(thisMonday, -(WEEKS - 1) * 7);

    return Array.from({ length: WEEKS }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day))
    );
  }, [today]);

  const longestStreak = useMemo(() => calculateLongestStreak(habits), [habits]);

  const activeDaysThisMonth = useMemo(() => {
    let count = 0;
    for (let day = 1; day <= today.getDate(); day += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      if (completionPercent(habits, date) > 0) count += 1;
    }
    return count;
  }, [habits, today]);

  const levelColor = (percent: number, isFuture: boolean) => {
    if (isFuture) return 'transparent';
    if (percent <= 0) return theme.colors.surfaceAlt;
    if (percent < 50) return `rgba(${primaryRgb}, 0.3)`;
    if (percent < 100) return `rgba(${primaryRgb}, 0.6)`;
    return theme.colors.primary;
  };

  const selectedKey = toDateKey(selectedDate);
  const selectedCount = todaysCompletedCount(habits, selectedDate);
  const selectedMinutes = dailyFocusMinutes(habits, selectedDate);
  const selectedDateLabel = `${selectedDate.getDate()} ${t(`common.months.${selectedDate.getMonth()}`)}`;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText size="xs" variant="tertiary">
            {t('statistics.longestStreak')}
          </AppText>
          <AppText weight="bold" size="md" color={theme.colors.primary}>
            {t('common.daysCount', { count: longestStreak })}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText size="xs" variant="tertiary">
            {t('statistics.activeDaysThisMonth')}
          </AppText>
          <AppText weight="bold" size="md" color={theme.colors.secondary}>
            {activeDaysThisMonth}
          </AppText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={{ gap: CELL_GAP, marginTop: 0, justifyContent: 'flex-start' }}>
            {Array.from({ length: 7 }, (_, row) => (
              <View key={row} style={{ height: CELL_SIZE, justifyContent: 'center' }}>
                {LABELED_ROWS.includes(row) ? (
                  <AppText size="xs" variant="tertiary" style={{ fontSize: 9 }}>
                    {t(`common.weekdaysShort.${row === 6 ? 0 : row + 1}`)}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: CELL_GAP }}>
            {weeks.map((week, weekIndex) => {
              const firstDay = week[0];
              const prevWeekFirstDay = weekIndex > 0 ? weeks[weekIndex - 1][0] : null;
              const showMonthLabel =
                weekIndex === 0 || (prevWeekFirstDay && firstDay.getMonth() !== prevWeekFirstDay.getMonth());

              return (
                <View key={weekIndex} style={{ gap: CELL_GAP }}>
                  <View style={{ height: 12 }}>
                    {showMonthLabel ? (
                      <AppText size="xs" variant="tertiary" style={{ fontSize: 9 }}>
                        {t(`common.months.${firstDay.getMonth()}`).slice(0, 3)}
                      </AppText>
                    ) : null}
                  </View>
                  {week.map((date, dayIndex) => {
                    const isFuture = date > today;
                    const percent = isFuture ? 0 : completionPercent(habits, date);
                    const isSelected = toDateKey(date) === selectedKey;
                    return (
                      <Pressable
                        key={dayIndex}
                        disabled={isFuture}
                        onPress={() => setSelectedDate(date)}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 3,
                          backgroundColor: levelColor(percent, isFuture),
                          borderWidth: isSelected ? 1.5 : 0,
                          borderColor: theme.colors.textPrimary,
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText size="xs" variant="tertiary">
          {t('statistics.heatmapLess')}
        </AppText>
        <View style={{ flexDirection: 'row', gap: CELL_GAP }}>
          {[theme.colors.surfaceAlt, `rgba(${primaryRgb}, 0.3)`, `rgba(${primaryRgb}, 0.6)`, theme.colors.primary].map(
            (color, index) => (
              <View
                key={index}
                style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3, backgroundColor: color }}
              />
            )
          )}
        </View>
        <AppText size="xs" variant="tertiary">
          {t('statistics.heatmapMore')}
        </AppText>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: radius.md,
          padding: spacing.md,
        }}
      >
        <AppText size="sm" variant="secondary">
          {t('statistics.heatmapDayDetail', {
            date: selectedDateLabel,
            habitsPhrase: t('common.habitsCount', { count: selectedCount }),
            minutesPhrase: t('common.minutesCount', { count: selectedMinutes }),
          })}
        </AppText>
      </View>
    </View>
  );
}
