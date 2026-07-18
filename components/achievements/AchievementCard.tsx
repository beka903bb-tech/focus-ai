import { View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { Achievement } from '@/utils/achievements';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const theme = usePalette();
  const { unlocked } = achievement;

  return (
    <View
      style={{
        flex: 1,
        minWidth: '46%',
        backgroundColor: theme.colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: unlocked ? theme.colors.primary : theme.colors.border,
        padding: spacing.md,
        gap: spacing.sm,
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: unlocked ? theme.colors.primaryMuted : theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon
            name={unlocked ? achievement.icon : 'lock-closed'}
            color={unlocked ? theme.colors.primary : theme.colors.textTertiary}
            size={18}
          />
        </View>
        {unlocked ? <AppIcon name="checkmark-circle" color={theme.colors.primary} size={18} /> : null}
      </View>
      <View style={{ gap: 2 }}>
        <AppText weight="semiBold" size="sm">
          {achievement.title}
        </AppText>
        <AppText size="xs" variant="tertiary" style={{ lineHeight: 15 }}>
          {achievement.description}
        </AppText>
      </View>
    </View>
  );
}
