import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { computeElapsedSeconds } from '@/utils/timer';

// Headless finish: same accounting as focus-session.tsx's "Yakunlash" button
// (bank whatever was accumulated, log progress, record a session), but callable from
// outside the component tree — used by the notification "Finish" action, which may
// fire while no focus-session screen is mounted.
export function finishActiveTimerHeadless(habitId: string): void {
  const sessionState = useSessionStore.getState();
  const habitState = useHabitStore.getState();
  const timer = sessionState.activeTimers[habitId];
  if (!timer) return;

  const elapsedSeconds = computeElapsedSeconds(timer);
  const totalMinutes = Math.round(elapsedSeconds / 60);
  const sessionMinutes = Math.round((elapsedSeconds - timer.baseSeconds) / 60);

  sessionState.stopTimer(habitId);

  const habit = habitState.habits.find((item) => item.id === habitId);
  if (!habit) return;

  if (sessionMinutes > 0) {
    sessionState.addSession({ habitId, habitName: habit.name, durationMinutes: sessionMinutes });
  }
  if (totalMinutes > 0) {
    habitState.logProgress(habitId, totalMinutes);
  }
}
