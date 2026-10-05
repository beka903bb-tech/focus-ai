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

// «Iliq kitob» palitrasi (5-okt): Luna tulkichasining to'q sariq juni va firuza sharfi,
// krem qog'oz fon, jigarrang siyoh matn. Faqat tokenlar — ekranlar rangni shu yerdan oladi.
const shared = {
  primary: '#E8742F',
  primaryMuted: 'rgba(232, 116, 47, 0.14)',
  onPrimary: '#FFFFFF',
  secondary: '#1FA89A',
  secondaryMuted: 'rgba(31, 168, 154, 0.15)',
  onSecondary: '#FFFFFF',
  danger: '#D9534F',
  onDanger: '#FFFFFF',
};

export const darkTheme: ThemePalette = {
  mode: 'dark',
  colors: {
    ...shared,
    primary: '#F28A4A',
    primaryMuted: 'rgba(242, 138, 74, 0.18)',
    background: '#1C1714',
    backgroundSecondary: '#16120F',
    surface: '#26201B',
    surfaceAlt: '#2F2822',
    border: '#3A3129',
    borderStrong: '#4A3F35',
    dangerMuted: 'rgba(217, 83, 79, 0.16)',
    textPrimary: '#F7EFE5',
    textSecondary: '#BFAE9C',
    textTertiary: '#8C7B6A',
    tabBarBackground: '#211B17',
    tabBarInactive: '#9C8B7A',
    overlay: 'rgba(12, 8, 5, 0.72)',
    shadow: 'rgba(0, 0, 0, 0.45)',
  },
};

export const lightTheme: ThemePalette = {
  mode: 'light',
  colors: {
    ...shared,
    background: '#FBF5EC',
    backgroundSecondary: '#FFFDF9',
    surface: '#FFFDF9',
    surfaceAlt: '#F5ECDF',
    border: '#EBDFCD',
    borderStrong: '#DCCBB2',
    dangerMuted: '#FBE3E1',
    textPrimary: '#3A2A1E',
    textSecondary: '#7A6555',
    textTertiary: '#A8957F',
    tabBarBackground: '#FFFDF9',
    tabBarInactive: '#8C7766',
    overlay: 'rgba(58, 42, 30, 0.45)',
    shadow: 'rgba(120, 80, 40, 0.14)',
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
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

export const fontFamily = {
  // Nunito — yumaloq, iliq shrift (bolalar kitobi uslubiga mos), lotin va kirill bor.
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
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
