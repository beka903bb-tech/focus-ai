import { View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  iconName?: string;
}

export function Badge({ label, color, backgroundColor, iconName }: BadgeProps) {
  const theme = usePalette();
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedBg = backgroundColor ?? theme.colors.primaryMuted;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: resolvedBg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        alignSelf: 'flex-start',
      }}
    >
      {iconName ? <AppIcon name={iconName} color={resolvedColor} size={12} /> : null}
      <AppText weight="semiBold" size="xs" color={resolvedColor}>
        {label}
      </AppText>
    </View>
  );
}
