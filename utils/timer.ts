export const PHONE_FREE_THRESHOLD_PERCENT = 80;
export const PHONE_FREE_BONUS_XP = 10;
// Honesty gate: a single uninterrupted running stretch counts for at most 3 hours. A timer
// accidentally left running overnight must not turn into "9 hours of focus".
export const MAX_UNATTENDED_MS = 3 * 60 * 60 * 1000;

export interface TimerState {
  status: 'running' | 'paused';
  baseSeconds: number;
  accumulatedMs: number;
  runningSince: number | null;
  goalSeconds: number;
}

// base (banked before this run) + accumulated active ms from prior pause/resume cycles
// in this run + live ms since last resume. Clamped so background/sleep time is never
// lost and the value never exceeds the goal.
export function computeElapsedSeconds(timer: TimerState): number {
  const liveMs = timer.runningSince ? Math.min(Date.now() - timer.runningSince, MAX_UNATTENDED_MS) : 0;
  const totalSeconds = timer.baseSeconds + Math.floor((timer.accumulatedMs + liveMs) / 1000);
  return Math.min(Math.max(totalSeconds, timer.baseSeconds), timer.goalSeconds);
}

// Derives the wall-clock moment a running timer actually crossed its goal — used only to
// pick which CALENDAR DAY a late-discovered completion should be recorded against (e.g.
// the app was asleep all night and only notices the overrun the next morning). Purely a
// read-only derivation from the existing fields; does not change computeElapsedSeconds or
// how timer state itself is tracked/updated.
export function goalCrossedAt(timer: TimerState): Date {
  if (timer.runningSince == null) return new Date();
  const remainingMsAtResume = (timer.goalSeconds - timer.baseSeconds) * 1000 - timer.accumulatedMs;
  const crossingTimestamp = timer.runningSince + Math.max(remainingMsAtResume, 0);
  return new Date(Math.min(crossingTimestamp, Date.now()));
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
