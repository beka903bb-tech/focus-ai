import { Pressable } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface SuggestionChipProps {
  label: string;
  iconName: string;
  onPress: () => void;
}

export function SuggestionChip({ label, iconName, onPress }: SuggestionChipProps) {
  const theme = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: radius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <AppIcon name={iconName} color={theme.colors.primary} size={14} />
      <AppText size="xs" weight="medium">
        {label}
      </AppText>
    </Pressable>
  );
}
