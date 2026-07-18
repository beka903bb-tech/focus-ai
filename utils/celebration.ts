import { presentCompletionAlert } from '@/hooks/useSessionNotifications';
import i18n from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { celebration, success } from '@/utils/haptics';
import { playCompletionSound } from '@/utils/sound';

// Haptic + toast + sound, in one call. Uses the i18n singleton directly (not the
// useTranslation hook) so it works identically from a React component (e.g.
// focus-session.tsx) and from headless code with no component tree of its own (e.g.
// the background timer watcher). Uses the strongest haptic pattern — the notification
// channel's vibration only fires while the app is backgrounded, so foreground
// completions need their own noticeably strong feedback. Also fires a one-shot (non-
// sticky) notification, since that's the only reliable way to get an actual sound —
// the ongoing session tracker notification is sticky and Android suppresses sound for
// those regardless of channel config.
export function celebrateHabitCompletion(habitId: string, habitName: string, minutes: number): void {
  celebration();
  playCompletionSound();
  presentCompletionAlert(habitId, habitName, minutes).catch((error) => {
    console.error('[celebration] presentCompletionAlert failed:', error);
  });
  useToastStore.getState().showToast(i18n.t('toast.habitCompleted', { habitName, minutes }));
}

let lastQuickMessage: string | undefined;

// Lighter celebration for manually checking a habit's box (not a timer completion) —
// a short random motivational phrase instead of the habit-name/minutes toast above.
export function celebrateQuickComplete(): void {
  success();
  const messages = i18n.t('toast.quickComplete', { returnObjects: true }) as string[];
  const candidates = messages.length > 1 && lastQuickMessage ? messages.filter((m) => m !== lastQuickMessage) : messages;
  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  lastQuickMessage = choice;
  useToastStore.getState().showToast(choice);
}
