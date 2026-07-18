import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthProvider = 'email' | 'google' | 'guest' | null;

interface UserState {
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  provider: AuthProvider;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  completeOnboarding: () => void;
  loginWithEmail: (email: string) => void;
  registerWithEmail: (name: string, email: string) => void;
  loginWithGoogle: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  toggleNotifications: () => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
  setHasHydrated: (value: boolean) => void;
  resetOnboardingAndAuth: () => void;
}

function nameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      isAuthenticated: false,
      hasHydrated: false,
      provider: null,
      name: '',
      email: '',
      notificationsEnabled: true,
      hapticsEnabled: true,
      soundEnabled: true,
      completeOnboarding: () => set({ hasOnboarded: true }),
      loginWithEmail: (email) =>
        set({
          isAuthenticated: true,
          provider: 'email',
          email,
          name: nameFromEmail(email),
        }),
      registerWithEmail: (name, email) =>
        set({
          isAuthenticated: true,
          provider: 'email',
          email,
          name,
        }),
      loginWithGoogle: (email) =>
        set({
          isAuthenticated: true,
          provider: 'google',
          email,
          name: nameFromEmail(email),
        }),
      loginAsGuest: () =>
        set({
          isAuthenticated: true,
          provider: 'guest',
          email: '',
          name: '',
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          provider: null,
          name: '',
          email: '',
        }),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      resetOnboardingAndAuth: () =>
        set({
          hasOnboarded: false,
          isAuthenticated: false,
          provider: null,
          name: '',
          email: '',
        }),
    }),
    {
      name: 'focus-ai/user',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
