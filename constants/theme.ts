export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  mode: ThemeMode;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderStrong: string;
    primary: string;
    primaryMuted: string;
    onPrimary: string;
    secondary: string;
    secondaryMuted: string;
    onSecondary: string;
    danger: string;
    dangerMuted: string;
    onDanger: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    tabBarBackground: string;
    tabBarInactive: string;
    overlay: string;
    shadow: string;
  };
}

const shared = {
  primary: '#10B981',
  primaryMuted: 'rgba(16, 185, 129, 0.16)',
  onPrimary: '#FFFFFF',
  secondary: '#8B5CF6',
  secondaryMuted: 'rgba(139, 92, 246, 0.16)',
  onSecondary: '#FFFFFF',
  danger: '#EF4444',
  onDanger: '#FFFFFF',
};

export const darkTheme: ThemePalette = {
  mode: 'dark',
  colors: {
    ...shared,
    background: '#0D1526',
    backgroundSecondary: '#0A0F1D',
    surface: '#141F38',
    surfaceAlt: '#1B2740',
    border: '#22304A',
    borderStrong: '#2E3E5C',
    dangerMuted: 'rgba(239, 68, 68, 0.14)',
    textPrimary: '#F5F7FA',
    textSecondary: '#8A94A6',
    textTertiary: '#5B6478',
    tabBarBackground: '#101A30',
    tabBarInactive: '#8A94A6',
    overlay: 'rgba(4, 8, 16, 0.72)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export const lightTheme: ThemePalette = {
  mode: 'light',
  colors: {
    ...shared,
    background: '#F7F9FC',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F3F8',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    dangerMuted: '#FEE2E2',
    textPrimary: '#0D1526',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    tabBarBackground: '#FFFFFF',
    tabBarInactive: '#64748B',
    overlay: 'rgba(15, 23, 42, 0.45)',
    shadow: 'rgba(15, 23, 42, 0.12)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};
