import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface SegmentedControlProps {
  options: { key: string; label: string }[];
  selectedKey: string;
  onChange: (key: string) => void;
}

export function SegmentedControl({ options, selectedKey, onChange }: SegmentedControlProps) {
  const theme = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: radius.full,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {options.map((option) => {
        const active = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.full,
              alignItems: 'center',
              backgroundColor: active ? theme.colors.primary : 'transparent',
            }}
          >
            <AppText
              weight="semiBold"
              size="sm"
              color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
