import { TextInput, TextInputProps, View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface InputProps extends TextInputProps {
  iconName?: string;
  rightElement?: React.ReactNode;
}

export function Input({ iconName, rightElement, style, ...rest }: InputProps) {
  const theme = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
      }}
    >
      {iconName ? <AppIcon name={iconName} color={theme.colors.textSecondary} size={18} /> : null}
      <TextInput
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          {
            flex: 1,
            paddingVertical: spacing.lg,
            color: theme.colors.textPrimary,
            fontSize: 15,
          },
          style,
        ]}
        {...rest}
      />
      {rightElement}
    </View>
  );
}
