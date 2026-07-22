import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppIcon } from '@/components/ui/AppIcon';
import { usePalette } from '@/store/themeStore';

interface PieProgressProps {
  size?: number;
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  checkColor?: string;
}

// Filled pie-sector progress (wedge growing clockwise from 12 o'clock), as opposed to
// CircularProgress's thin ring — used where the whole disc should read as "time elapsed"
// like a clock face rather than a loading ring.
export function PieProgress({ size = 36, progress, color, trackColor, checkColor }: PieProgressProps) {
  const theme = usePalette();
  const clamped = Math.max(0, Math.min(1, progress));
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.border;
  const resolvedCheckColor = checkColor ?? theme.colors.onPrimary;
  const isComplete = clamped >= 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  let sectorPath: string | null = null;
  if (clamped > 0 && clamped < 1) {
    const angle = clamped * 360;
    const startAngleRad = (-90 * Math.PI) / 180;
    const endAngleRad = ((-90 + angle) * Math.PI) / 180;
    const startX = cx + r * Math.cos(startAngleRad);
    const startY = cy + r * Math.sin(startAngleRad);
    const endX = cx + r * Math.cos(endAngleRad);
    const endY = cy + r * Math.sin(endAngleRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    sectorPath = `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} fill={isComplete ? resolvedColor : resolvedTrackColor} />
        {sectorPath ? <Path d={sectorPath} fill={resolvedColor} /> : null}
      </Svg>
      {isComplete ? (
        <View style={{ position: 'absolute' }}>
          <AppIcon name="checkmark" color={resolvedCheckColor} size={Math.round(size * 0.55)} />
        </View>
      ) : null}
    </View>
  );
}
