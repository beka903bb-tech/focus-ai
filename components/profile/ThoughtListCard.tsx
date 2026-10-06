import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useThoughtStore } from '@/store/thoughtStore';
import { openThoughtCount } from '@/utils/thoughts';

const SHOWN = 20;

/** Profile list of thoughts parked during focus sessions (mark done / delete). */
export function ThoughtListCard() {
  const theme = usePalette();
  const { t } = useTranslation();
  const thoughts = useThoughtStore((s) => s.thoughts);
  const toggle = useThoughtStore((s) => s.toggle);
  const remove = useThoughtStore((s) => s.remove);
  const clearDone = useThoughtStore((s) => s.clearDone);
  const open = openThoughtCount(thoughts);
  const hasDone = open < thoughts.length;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText weight="bold" size="sm" variant="tertiary" style={{ letterSpacing: 0.5 }}>
          {t('thoughts.listTitle')}
          {thoughts.length ? ` · ${t('thoughts.openCount', { count: open })}` : ''}
        </AppText>
        {hasDone ? (
          <Pressable onPress={clearDone} accessibilityRole="button" hitSlop={8}>
            <AppText size="xs" weight="bold" color={theme.colors.primary}>
              {t('thoughts.clearDone')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <Card style={{ gap: spacing.sm }}>
        {thoughts.length === 0 ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <AppIcon name="bulb-outline" color={theme.colors.textTertiary} size={20} />
            <AppText size="sm" variant="secondary" style={{ flex: 1, lineHeight: 19 }}>
              {t('thoughts.listEmpty')}
            </AppText>
          </View>
        ) : (
          thoughts.slice(0, SHOWN).map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pressable
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.done }}
                hitSlop={6}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.full,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  backgroundColor: item.done ? theme.colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.done ? <AppIcon name="checkmark" color="#fff" size={14} /> : null}
              </Pressable>
              <View style={{ flex: 1 }}>
                <AppText
                  size="sm"
                  weight="semiBold"
                  variant={item.done ? 'tertiary' : undefined}
                  style={item.done ? { textDecorationLine: 'line-through' } : undefined}
                >
                  {item.text}
                </AppText>
                {item.habitName ? (
                  <AppText size="xs" variant="tertiary">
                    {item.habitName}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                onPress={() => remove(item.id)}
                accessibilityRole="button"
                accessibilityLabel={t('thoughts.delete')}
                hitSlop={8}
              >
                <AppIcon name="close" color={theme.colors.textTertiary} size={18} />
              </Pressable>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}
