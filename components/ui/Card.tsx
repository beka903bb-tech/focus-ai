import { View, ViewProps } from 'react-native';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface CardProps extends ViewProps {
  padded?: boolean;
  bordered?: boolean;
}

export function Card({ padded = true, bordered = true, style, ...rest }: CardProps) {
  const theme = usePalette();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: radius.lg,
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.colors.border,
          padding: padded ? spacing.lg : 0,
        },
        style,
      ]}
    />
  );
}
