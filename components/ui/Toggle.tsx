import { Platform, Switch } from 'react-native';
import { usePalette } from '@/store/themeStore';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const theme = usePalette();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor={Platform.OS === 'android' ? theme.colors.onPrimary : undefined}
      ios_backgroundColor={theme.colors.border}
    />
  );
}
