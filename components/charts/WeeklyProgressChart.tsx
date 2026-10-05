import { View } from 'react-native';
import { appWidth } from '@/constants/layout';
import { LineChart } from 'react-native-chart-kit';
import { usePalette } from '@/store/themeStore';
import { spacing } from '@/constants/theme';

interface WeeklyProgressChartProps {
  data: { label: string; percent: number }[];
}

const screenWidth = appWidth();

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const theme = usePalette();
  const chartWidth = screenWidth - spacing.xl * 2 - spacing.lg * 2;

  function hexToRgb(hex: string): string {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  const primaryRgb = hexToRgb(theme.colors.primary);
  const textRgb = hexToRgb(theme.colors.textSecondary);

  return (
    <View>
      <LineChart
        data={{
          labels: data.map((point) => point.label),
          datasets: [{ data: data.map((point) => point.percent) }],
        }}
        width={chartWidth}
        height={180}
        fromZero
        segments={4}
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(${primaryRgb}, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(${textRgb}, ${opacity})`,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
          propsForBackgroundLines: {
            stroke: theme.colors.border,
          },
          style: { borderRadius: 16 },
        }}
        bezier
        style={{ borderRadius: 16, paddingRight: spacing.xl }}
        withInnerLines
        withOuterLines={false}
      />
    </View>
  );
}
