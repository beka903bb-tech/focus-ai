import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FocusSessionRecord } from '@/types/habit';
import { TimerState } from '@/utils/timer';
import { addSessionToTotals, EMPTY_TOTALS, SessionTotals, totalsFromSessions } from '@/utils/sessionTotals';

// Recent-history list kept for charts/feeds; lifetime numbers live in `totals`.
export const SESSION_HISTORY_LIMIT = 1000;

function makeId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface SessionState {
  sessions: FocusSessionRecord[];
  totals: SessionTotals;
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
      totals: EMPTY_TOTALS,
      activeTimers: {},
      addSession: (record) =>
        set((state) => ({
          sessions: [
            { ...record, id: makeId(), completedAt: new Date().toISOString() },
            ...state.sessions,
          ].slice(0, SESSION_HISTORY_LIMIT),
          totals: addSessionToTotals(state.totals ?? EMPTY_TOTALS, record),
        })),
      resetSessions: () => set({ sessions: [], totals: EMPTY_TOTALS }),
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
      version: 1,
      // v0 had no lifetime totals — rebuild them once from whatever history was saved.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SessionState>;
        if (version < 1 || !state.totals) {
          return { ...state, totals: totalsFromSessions(state.sessions ?? []) } as SessionState;
        }
        return state as SessionState;
      },
    }
  )
);
