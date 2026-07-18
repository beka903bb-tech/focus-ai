import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AppIcon } from '@/components/ui/AppIcon';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  iconName?: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  iconName,
  iconFamily,
  style,
  fullWidth = true,
}: ButtonProps) {
  const theme = usePalette();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
      ? theme.colors.dangerMuted
      : 'transparent';

  const borderColor =
    variant === 'outline'
      ? theme.colors.border
      : variant === 'primary'
      ? theme.colors.primary
      : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'danger'
      ? theme.colors.danger
      : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor,
          borderRadius: radius.full,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {iconName ? <AppIcon name={iconName} family={iconFamily} color={textColor} size={18} /> : null}
          <AppText weight="semiBold" size="md" color={textColor}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
