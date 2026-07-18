import { Text, TextProps } from 'react-native';
import { fontFamily, fontSize } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
type Size = keyof typeof fontSize;

interface AppTextProps extends TextProps {
  weight?: Weight;
  size?: Size;
  color?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export function AppText({
  weight = 'regular',
  size = 'md',
  color,
  variant = 'primary',
  style,
  ...rest
}: AppTextProps) {
  const theme = usePalette();
  const variantColor =
    variant === 'secondary'
      ? theme.colors.textSecondary
      : variant === 'tertiary'
      ? theme.colors.textTertiary
      : theme.colors.textPrimary;

  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamily[weight],
          fontSize: fontSize[size],
          color: color ?? variantColor,
        },
        style,
      ]}
    />
  );
}
