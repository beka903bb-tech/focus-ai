import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePalette } from '@/store/themeStore';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  size = 180,
  strokeWidth = 14,
  progress,
  color,
  trackColor,
  children,
}: CircularProgressProps) {
  const theme = usePalette();
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const clamped = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clamped);
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.surfaceAlt;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
