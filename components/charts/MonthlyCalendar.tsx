import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { Habit } from '@/types/habit';
import { daysInMonth, firstWeekdayOfMonth, toDateKey } from '@/utils/date';
import { completionPercent } from '@/utils/streak';

interface MonthlyCalendarProps {
  habits: Habit[];
}

const WEEKDAY_HEADER_VALUES = [1, 2, 3, 4, 5, 6, 0];

export function MonthlyCalendar({ habits }: MonthlyCalendarProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const total = daysInMonth(year, month);
    const firstWeekday = firstWeekdayOfMonth(year, month);
    const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

    const items: { day: number | null; date: Date | null }[] = [];
    for (let i = 0; i < mondayOffset; i += 1) {
      items.push({ day: null, date: null });
    }
    for (let day = 1; day <= total; day += 1) {
      items.push({ day, date: new Date(year, month, day) });
    }
    return items;
  }, [cursor]);

  const changeMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText weight="semiBold" size="sm">
          {t(`common.months.${cursor.getMonth()}`)} {cursor.getFullYear()}
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => changeMonth(-1)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="chevron-back" size={14} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => changeMonth(1)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="chevron-forward" size={14} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAY_HEADER_VALUES.map((value) => (
          <View key={value} style={{ flex: 1, alignItems: 'center' }}>
            <AppText size="xs" variant="tertiary">
              {t(`common.weekdaysShort.${value}`)}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((cell, index) => {
          if (!cell.date) {
            return <View key={`empty-${index}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          }
          const isFuture = cell.date > today;
          const percent = isFuture ? 0 : completionPercent(habits, cell.date);
          const isToday = toDateKey(cell.date) === toDateKey(today);

          let backgroundColor = 'transparent';
          let textColor = theme.colors.textSecondary;
          if (!isFuture && percent === 100) {
            backgroundColor = theme.colors.primary;
            textColor = theme.colors.onPrimary;
          } else if (!isFuture && percent > 0) {
            backgroundColor = theme.colors.primaryMuted;
            textColor = theme.colors.primary;
          }

          return (
            <View key={cell.day} style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: theme.colors.primary,
                }}
              >
                <AppText size="xs" weight={isToday ? 'bold' : 'regular'} color={textColor}>
                  {cell.day}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} />
          <AppText size="xs" variant="tertiary">
            {t('monthlyCalendar.legendComplete')}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryMuted }} />
          <AppText size="xs" variant="tertiary">
            {t('monthlyCalendar.legendPartial')}
          </AppText>
        </View>
      </View>
    </View>
  );
}
