import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CoachGoalType =
  | 'lose_weight'
  | 'gain_weight'
  | 'stay_fit'
  | 'reading'
  | 'cycling'
  | 'custom';

export type ActivityLevel = 'low' | 'medium' | 'high';

export type Profession = 'driver' | 'developer' | 'teacher' | 'doctor' | 'business' | 'child' | 'other';

export type ChildInterest = 'sport' | 'art' | 'science' | 'games';

export interface CoachProfile {
  goalType: CoachGoalType | null;
  customGoal?: string;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  activityLevel?: ActivityLevel;
  profession?: Profession;
  customProfession?: string;
  childInterest?: ChildInterest;
}

const EMPTY_PROFILE: CoachProfile = { goalType: null };

interface CoachProfileState {
  coachProfile: CoachProfile;
  hasHydrated: boolean;
  setCoachProfile: (profile: CoachProfile) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCoachProfileStore = create<CoachProfileState>()(
  persist(
    (set) => ({
      coachProfile: EMPTY_PROFILE,
      hasHydrated: false,
      setCoachProfile: (profile) => set({ coachProfile: profile }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'focus-ai/coach-profile',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function isCoachProfileComplete(profile: CoachProfile): boolean {
  return profile.goalType !== null;
}
