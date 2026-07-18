import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n, { AppLanguage } from '@/i18n';

interface LocaleState {
  language: AppLanguage;
  hasHydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: 'uz',
      hasHydrated: false,
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language).catch(() => {});
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'focus-ai/locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        i18n.changeLanguage(state.language).finally(() => state.setHasHydrated(true));
      },
      partialize: (state) => ({ language: state.language }),
    }
  )
);
