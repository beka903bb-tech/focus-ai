import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { celebrateHabitCompletion } from '@/utils/celebration';
import { toDateKey } from '@/utils/date';
import { computeElapsedSeconds, goalCrossedAt } from '@/utils/timer';

// Finalizes any habit timer that reached its goal while no focus-session screen was
// mounted to catch it (e.g. the user was on a different habit's timer, or on the home
// screen, or the app was backgrounded). Safe to run alongside focus-session.tsx's own
// completion check: whichever fires first calls stopTimer, so the other is a no-op.
function finalizeCompletedTimers() {
  const sessionState = useSessionStore.getState();
  const habitState = useHabitStore.getState();

  Object.entries(sessionState.activeTimers).forEach(([habitId, timer]) => {
    if (timer.status !== 'running') return;
    const elapsedSeconds = computeElapsedSeconds(timer);
    if (elapsedSeconds < timer.goalSeconds) return;

    const habit = habitState.habits.find((item) => item.id === habitId);
    const goalMinutes = Math.round(timer.goalSeconds / 60);
    const sessionMinutes = Math.round((elapsedSeconds - timer.baseSeconds) / 60);

    sessionState.stopTimer(habitId);
    if (!habit) return;

    // Attribute the completion to the day the goal was actually reached, not the day the
    // app happened to be reopened to notice it (e.g. a timer left running overnight while
    // the phone was asleep must not silently mark TODAY as done).
    const dateKey = toDateKey(goalCrossedAt(timer));
    habitState.logProgress(habitId, goalMinutes, dateKey);
    celebrateHabitCompletion(habitId, habit.name, goalMinutes);
    if (sessionMinutes > 0) {
      sessionState.addSession({ habitId, habitName: habit.name, durationMinutes: sessionMinutes });
    }
  });
}

export function useGlobalTimerWatcher() {
  useEffect(() => {
    const interval = setInterval(finalizeCompletedTimers, 1000);
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') finalizeCompletedTimers();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);
}
