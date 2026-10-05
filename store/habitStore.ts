import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Habit } from '@/types/habit';
import { todayKey } from '@/utils/date';
import { deleteHabitImage } from '@/utils/habitImage';

function makeId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'completions' | 'progressMinutes'>;

interface HabitState {
  habits: Habit[];
  // Completions of habits the user has deleted — kept so XP/levels never go down.
  archivedCompletions: number;
  addHabit: (habit: HabitInput) => void;
  updateHabit: (id: string, changes: HabitInput) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (id: string, dateKey?: string) => void;
  isCompletedOn: (id: string, dateKey?: string) => boolean;
  logProgress: (id: string, totalMinutes: number, dateKey?: string) => void;
  resetProgress: (id: string, dateKey?: string) => void;
  resetHabits: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      archivedCompletions: 0,
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: makeId(),
              createdAt: new Date().toISOString(),
              completions: {},
              progressMinutes: {},
            },
          ],
        })),
      updateHabit: (id, changes) =>
        set((state) => ({
          habits: state.habits.map((habit) => (habit.id === id ? { ...habit, ...changes } : habit)),
        })),
      removeHabit: (id) =>
        set((state) => {
          const habit = state.habits.find((item) => item.id === id);
          if (habit?.imageUri) deleteHabitImage(habit.imageUri);
          return {
            habits: state.habits.filter((item) => item.id !== id),
            archivedCompletions:
              (state.archivedCompletions ?? 0) + (habit ? Object.keys(habit.completions).length : 0),
          };
        }),
      toggleCompletion: (id, dateKey = todayKey()) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const isDone = !!habit.completions[dateKey];
            const completions = { ...habit.completions };
            const progressMinutes = { ...(habit.progressMinutes ?? {}) };
            if (isDone) {
              delete completions[dateKey];
              delete progressMinutes[dateKey];
            } else {
              completions[dateKey] = true;
              progressMinutes[dateKey] = habit.durationMinutes;
            }
            return { ...habit, completions, progressMinutes };
          }),
        })),
      isCompletedOn: (id, dateKey = todayKey()) => {
        const habit = get().habits.find((item) => item.id === id);
        return !!habit?.completions[dateKey];
      },
      logProgress: (id, totalMinutes, dateKey = todayKey()) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const current = habit.progressMinutes?.[dateKey] ?? 0;
            const total = Math.max(current, totalMinutes);
            const progressMinutes = { ...(habit.progressMinutes ?? {}), [dateKey]: total };
            const completions = { ...habit.completions };
            if (total >= habit.durationMinutes) {
              completions[dateKey] = true;
            }
            return { ...habit, progressMinutes, completions };
          }),
        })),
      resetProgress: (id, dateKey = todayKey()) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const progressMinutes = { ...(habit.progressMinutes ?? {}) };
            const completions = { ...habit.completions };
            delete progressMinutes[dateKey];
            delete completions[dateKey];
            return { ...habit, progressMinutes, completions };
          }),
        })),
      resetHabits: () =>
        set((state) => {
          state.habits.forEach((habit) => {
            if (habit.imageUri) deleteHabitImage(habit.imageUri);
          });
          return { habits: [], archivedCompletions: 0 };
        }),
    }),
    {
      name: 'focus-ai/habits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
