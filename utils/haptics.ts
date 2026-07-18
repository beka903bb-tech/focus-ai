import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/store/userStore';

function isEnabled(): boolean {
  return useUserStore.getState().hapticsEnabled;
}

// Light tap: momentary actions (start/pause/resume a timer, toggle a habit checkbox).
export function lightTap(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch((error) => {
    console.error('[haptics] lightTap failed:', error);
  });
}

// Success: meaningful achievements (level up, achievement unlocked, phone-free bonus
// earned).
export function success(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((error) => {
    console.error('[haptics] success failed:', error);
  });
}

// Habit/timer fully completed — the strongest feedback in the app. A heavy impact
// immediately followed by the success pattern reads as noticeably stronger than
// success() alone on most Android devices.
export function celebration(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((error) => {
    console.error('[haptics] celebration heavy impact failed:', error);
  });
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((error) => {
    console.error('[haptics] celebration success failed:', error);
  });
}
