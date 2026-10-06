import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addThought,
  clearDoneThoughts,
  ParkedThought,
  removeThought,
  toggleThought,
} from '@/utils/thoughts';

function makeId(): string {
  return `thought_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ThoughtState {
  thoughts: ParkedThought[];
  add: (text: string, habitName?: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearDone: () => void;
  reset: () => void;
}

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set, get) => ({
      thoughts: [],
      add: (text, habitName) => {
        const before = get().thoughts;
        const next = addThought(before, text, { id: makeId(), habitName });
        if (next === before) return false;
        set({ thoughts: next });
        return true;
      },
      toggle: (id) => set((s) => ({ thoughts: toggleThought(s.thoughts, id) })),
      remove: (id) => set((s) => ({ thoughts: removeThought(s.thoughts, id) })),
      clearDone: () => set((s) => ({ thoughts: clearDoneThoughts(s.thoughts) })),
      reset: () => set({ thoughts: [] }),
    }),
    {
      name: 'focus-ai-thoughts',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
