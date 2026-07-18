import { View } from 'react-native';
import { radius } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface ProgressBarProps {
  progress: number; // 0..1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
  const theme = usePalette();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: theme.colors.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: color ?? theme.colors.primary,
        }}
      />
    </View>
  );
}
