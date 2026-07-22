import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayKey } from '@/utils/date';

// Components read "today" via plain `todayKey()`/`new Date()` calls at render time, which
// are only re-evaluated when something triggers a re-render. If the app stays open (or
// backgrounded but not killed) across midnight, nothing forces that re-render, so
// completions/progress/counters silently keep showing yesterday's data until some
// unrelated state change happens to refresh the screen. Subscribing to this hook forces
// a re-render exactly when the calendar day changes, so "today" never goes stale.
export function useTodayKey(): string {
  const [key, setKey] = useState(todayKey);

  // Self-correcting on every render, not just inside the effect below: while the phone is
  // locked overnight (deep sleep), neither `setInterval` nor AppState events are guaranteed
  // to fire — Android freezes JS timers for backgrounded apps, and some ROMs don't reliably
  // report an 'active' transition on unlock. So instead of trusting a timer/listener to catch
  // the day rollover, re-derive "today" fresh on every render and correct the stored value
  // immediately if it's stale — whatever unrelated re-render eventually happens after unlock
  // (navigation, any store update, the AppState listener below, etc.) is enough to fix it
  // before the stale "done" state ever paints.
  const current = todayKey();
  if (current !== key) {
    setKey(current);
  }

  useEffect(() => {
    const check = () => {
      const now = todayKey();
      setKey((prev) => (prev === now ? prev : now));
    };
    // Listen for ANY AppState change, not just 'active' — some devices report the
    // unlock transition inconsistently (straight to 'active' with no distinct
    // 'background'/'inactive' step observed, or vice versa).
    const subscription = AppState.addEventListener('change', check);
    // Fallback for the rarer case of the app staying foregrounded (screen never locked)
    // through midnight — not relied upon for the overnight-sleep case above.
    const interval = setInterval(check, 60000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return current;
}
