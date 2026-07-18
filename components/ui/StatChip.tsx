import { View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { IconFamily } from '@/constants/icons';

interface StatChipProps {
  value: string;
  label: string;
  iconName?: string;
  iconFamily?: IconFamily;
  valueColor?: string;
}

export function StatChip({ value, label, iconName, iconFamily, valueColor }: StatChipProps) {
  const theme = usePalette();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: 4,
        alignItems: 'center',
        gap: 4,
      }}
    >
      {iconName ? (
        <AppIcon name={iconName} family={iconFamily} color={valueColor ?? theme.colors.primary} size={16} />
      ) : null}
      <AppText weight="bold" size="lg" color={valueColor ?? theme.colors.textPrimary}>
        {value}
      </AppText>
      <AppText
        size="xs"
        variant="tertiary"
        style={{ textAlign: 'center', fontSize: 10 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </AppText>
    </View>
  );
}
