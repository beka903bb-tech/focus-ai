export const PHONE_FREE_THRESHOLD_PERCENT = 80;
export const PHONE_FREE_BONUS_XP = 10;

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
  const liveMs = timer.runningSince ? Date.now() - timer.runningSince : 0;
  const totalSeconds = timer.baseSeconds + Math.floor((timer.accumulatedMs + liveMs) / 1000);
  return Math.min(Math.max(totalSeconds, timer.baseSeconds), timer.goalSeconds);
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
