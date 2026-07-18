import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { darkTheme, lightTheme, ThemeMode, ThemePalette } from '@/constants/theme';

interface ThemeState {
  mode: ThemeMode;
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      hasHydrated: false,
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'focus-ai/theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

export function usePalette(): ThemePalette {
  const mode = useThemeStore((state) => state.mode);
  return mode === 'dark' ? darkTheme : lightTheme;
}
