import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FocusSessionRecord } from '@/types/habit';
import { TimerState } from '@/utils/timer';

function makeId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface SessionState {
  sessions: FocusSessionRecord[];
  activeTimers: Record<string, TimerState>;
  addSession: (record: Omit<FocusSessionRecord, 'id' | 'completedAt'>) => void;
  resetSessions: () => void;
  startTimer: (habitId: string, baseSeconds: number, goalSeconds: number) => void;
  pauseTimer: (habitId: string) => void;
  resumeTimer: (habitId: string) => void;
  stopTimer: (habitId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      activeTimers: {},
      addSession: (record) =>
        set((state) => ({
          sessions: [
            { ...record, id: makeId(), completedAt: new Date().toISOString() },
            ...state.sessions,
          ].slice(0, 200),
        })),
      resetSessions: () => set({ sessions: [] }),
      startTimer: (habitId, baseSeconds, goalSeconds) =>
        set((state) => ({
          activeTimers: {
            ...state.activeTimers,
            [habitId]: {
              status: 'running',
              baseSeconds,
              accumulatedMs: 0,
              runningSince: Date.now(),
              goalSeconds,
            },
          },
        })),
      pauseTimer: (habitId) =>
        set((state) => {
          const timer = state.activeTimers[habitId];
          if (!timer || timer.status !== 'running') return state;
          const liveMs = timer.runningSince ? Date.now() - timer.runningSince : 0;
          return {
            activeTimers: {
              ...state.activeTimers,
              [habitId]: {
                ...timer,
                status: 'paused',
                accumulatedMs: timer.accumulatedMs + liveMs,
                runningSince: null,
              },
            },
          };
        }),
      resumeTimer: (habitId) =>
        set((state) => {
          const timer = state.activeTimers[habitId];
          if (!timer || timer.status !== 'paused') return state;
          return {
            activeTimers: {
              ...state.activeTimers,
              [habitId]: { ...timer, status: 'running', runningSince: Date.now() },
            },
          };
        }),
      stopTimer: (habitId) =>
        set((state) => {
          const activeTimers = { ...state.activeTimers };
          delete activeTimers[habitId];
          return { activeTimers };
        }),
    }),
    {
      name: 'focus-ai/sessions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
