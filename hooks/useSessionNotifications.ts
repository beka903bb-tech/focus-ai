import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserStore } from '@/store/userStore';
import { finishActiveTimerHeadless } from '@/utils/sessionActions';
import { computeElapsedSeconds, formatClock, TimerState } from '@/utils/timer';

// Ongoing "Live Activity"-style notification for a running focus session, backed by
// plain expo-notifications (no custom native foreground service). Known limitation:
// while the app is fully backgrounded/the screen is locked for an extended period,
// JS timers are suspended by the OS, so the notification text will not tick every
// literal second — it catches up and re-syncs from timestamps whenever the app comes
// back to the foreground, a pause/resume/finish action fires, or the periodic refresh
// below gets a chance to run.
// One-shot "habit completed" notifications use this identifier prefix so the handler
// below can tell them apart from the ongoing sticky tracker.
const COMPLETION_ID_PREFIX = 'focus-complete-';
// The daily reminder (hooks/useDailyReminder.ts) is a separate one-shot-per-day alert,
// not the frequently-reposted sticky tracker, so it belongs in the same "should play
// sound" bucket as the completion alert.
const DAILY_REMINDER_ID_PREFIX = 'daily-reminder-';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // The ongoing sticky tracker re-posts every few seconds while foregrounded and
    // should stay quiet then (the in-app haptic/toast already covers foreground
    // feedback) — but the one-shot completion alert is the only place sound actually
    // plays (expo-audio was removed after crashing the app), so it must not be muted
    // just because the user happened to be looking at the app when it fired.
    const id = notification.request.identifier;
    const shouldPlaySound = id.startsWith(COMPLETION_ID_PREFIX) || id.startsWith(DAILY_REMINDER_ID_PREFIX);
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound,
      shouldSetBadge: false,
    };
  },
});

// v3: Android notification channels are immutable after first creation — bumping the
// id is the only way to make sound/vibration settings actually take effect on devices
// that already created an older 'focus-session'/'focus-session-v2' channel with
// weaker settings.
const CHANNEL_ID = 'focus-session-v3';
// Separate channel for the one-shot completion alert. Android/XOS silently downgrades
// a channel's *effective* importance (HIGH -> LOW, which mutes sound) once it decides
// the app is posting "too many" notifications on it — confirmed via dumpsys
// (`importance=2` instead of the configured 4) after the ongoing tracker above had
// been re-posting every few seconds for a while. A dedicated, rarely-used channel for
// completions never accumulates that history, so it keeps its sound.
const COMPLETION_CHANNEL_ID = 'focus-complete-v1';
// Long-pause-long-pause-long reads as clearly stronger than a single short buzz.
const VIBRATION_PATTERN = [0, 500, 200, 500, 200, 500];
const CATEGORY_RUNNING = 'focus-session-running';
const CATEGORY_PAUSED = 'focus-session-paused';
// Every refresh re-posts the ongoing notification (scheduleNotificationAsync with the
// same identifier). At 5s this ROM's adaptive notification system flags the app as
// spammy within minutes and silently caps its importance to LOW app-wide — which also
// mutes the separate, rarely-posted completion-sound channel, since that cap applies
// per app, not per channel. 30s is still a "live" lock-screen timer, just far less
// chatty — reduces posting volume 6x, which should meaningfully slow the demotion.
const REFRESH_INTERVAL_MS = 30000;
const ACTION_PAUSE = 'pause';
const ACTION_RESUME = 'resume';
const ACTION_FINISH = 'finish';

function notificationIdFor(habitId: string) {
  return `focus-session-${habitId}`;
}

async function createChannel(channelId: string, name: string) {
  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: VIBRATION_PATTERN,
    enableVibrate: true,
    sound: 'default',
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.NOTIFICATION,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  await createChannel(CHANNEL_ID, i18n.t('sessionNotification.channelName'));
  channelReady = true;
}

let completionChannelReady = false;
async function ensureCompletionChannel() {
  if (completionChannelReady || Platform.OS !== 'android') return;
  await createChannel(COMPLETION_CHANNEL_ID, i18n.t('sessionNotification.completionChannelName'));
  completionChannelReady = true;
}

async function registerCategories() {
  await Notifications.setNotificationCategoryAsync(CATEGORY_RUNNING, [
    {
      identifier: ACTION_PAUSE,
      buttonTitle: i18n.t('sessionNotification.pauseAction'),
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_FINISH,
      buttonTitle: i18n.t('sessionNotification.finishAction'),
      options: { opensAppToForeground: false },
    },
  ]);
  await Notifications.setNotificationCategoryAsync(CATEGORY_PAUSED, [
    {
      identifier: ACTION_RESUME,
      buttonTitle: i18n.t('sessionNotification.resumeAction'),
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_FINISH,
      buttonTitle: i18n.t('sessionNotification.finishAction'),
      options: { opensAppToForeground: false },
    },
  ]);
}

// Ask for notification permission at most once per app run (lazily, only once a
// session is actually active) — if denied, back off silently rather than nagging.
let hasRequestedPermission = false;
async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (hasRequestedPermission) return false;
  hasRequestedPermission = true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function presentForTimer(
  habitId: string,
  habitName: string,
  timer: TimerState,
  alert: boolean
) {
  const elapsedSeconds = computeElapsedSeconds(timer);
  const percent =
    timer.goalSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / timer.goalSeconds) * 100)) : 0;
  const isPaused = timer.status === 'paused';
  const bodyKey = isPaused ? 'sessionNotification.pausedBody' : 'sessionNotification.runningBody';

  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdFor(habitId),
    content: {
      title: habitName,
      body: i18n.t(bodyKey, {
        clock: formatClock(elapsedSeconds),
        goalClock: formatClock(timer.goalSeconds),
        percent,
      }),
      data: { habitId },
      categoryIdentifier: isPaused ? CATEGORY_PAUSED : CATEGORY_RUNNING,
      sticky: true,
      autoDismiss: false,
      // Only alert (vibrate/sound) on the first presentation and on pause/resume —
      // this notification also gets re-sent every REFRESH_INTERVAL_MS just to update
      // the elapsed-time text, and expo-notifications has no `onlyAlertOnce` escape
      // hatch, so without this guard the phone would buzz/ding every 5 seconds for the
      // entire duration of a running session.
      ...(alert ? { vibrate: VIBRATION_PATTERN, sound: 'default' } : {}),
    },
    // `trigger: null` was silently discarding the channel — Android's channel selection
    // reads trigger.getNotificationChannel(), not content, so without this the OS fell
    // back to expo's generic "expo_notifications_fallback_notification_channel" (no
    // vibration/sound configured), completely bypassing our focus-session-v3 channel.
    trigger: { channelId: CHANNEL_ID },
  });
}

// One-shot "habit completed" alert (DARAJA 1.5), separate from the ongoing sticky
// session tracker above. Sticky/ongoing notifications (FLAG_ONGOING_EVENT) are treated
// by Android as low-disruption status indicators and don't reliably play sound even
// with a fully-configured channel — only a plain, dismissible notification does. This
// is the only place actual sound plays for a completion, since expo-audio was removed
// after crashing the app; it also covers the case where the app is backgrounded and
// the in-app haptic/toast celebration never gets a chance to run.
export async function presentCompletionAlert(
  habitId: string,
  habitName: string,
  minutes: number
): Promise<void> {
  const notificationsEnabled = useUserStore.getState().notificationsEnabled;
  if (!notificationsEnabled) return;

  const granted = await ensurePermission().catch((error) => {
    console.error('[completionAlert] ensurePermission threw:', error);
    return false;
  });
  if (!granted) return;

  await ensureCompletionChannel().catch((error) => {
    console.error('[completionAlert] ensureCompletionChannel failed:', error);
  });

  await Notifications.scheduleNotificationAsync({
    identifier: `${COMPLETION_ID_PREFIX}${habitId}-${Date.now()}`,
    content: {
      title: habitName,
      body: i18n.t('toast.habitCompleted', { habitName, minutes }),
      data: { habitId },
      sticky: false,
      autoDismiss: true,
      vibrate: VIBRATION_PATTERN,
      sound: 'default',
    },
    trigger: { channelId: COMPLETION_CHANNEL_ID },
  });
}

export function useSessionNotifications() {
  // Tracks the last-known status we alerted for, per habitId — lets us tell a genuine
  // state change (start, pause, resume) that deserves a buzz/ding apart from the
  // REFRESH_INTERVAL_MS text-only tick that shouldn't.
  const shownStatusRef = useRef<Map<string, TimerState['status']>>(new Map());

  useEffect(() => {
    const refresh = async () => {
      const notificationsEnabled = useUserStore.getState().notificationsEnabled;
      const activeTimers = useSessionStore.getState().activeTimers;
      const habits = useHabitStore.getState().habits;
      const activeIds = new Set(Object.keys(activeTimers));

      for (const shownId of Array.from(shownStatusRef.current.keys())) {
        if (!activeIds.has(shownId) || !notificationsEnabled) {
          Notifications.dismissNotificationAsync(notificationIdFor(shownId)).catch(() => {});
          shownStatusRef.current.delete(shownId);
        }
      }

      if (!notificationsEnabled || activeIds.size === 0) return;

      const granted = await ensurePermission().catch(() => false);
      if (!granted) return;
      await ensureChannel().catch(() => {});

      for (const [habitId, timer] of Object.entries(activeTimers)) {
        const habit = habits.find((item) => item.id === habitId);
        if (!habit) continue;
        const previousStatus = shownStatusRef.current.get(habitId);
        const alert = previousStatus === undefined || previousStatus !== timer.status;
        await presentForTimer(habitId, habit.name, timer, alert).catch(() => {});
        shownStatusRef.current.set(habitId, timer.status);
      }
    };

    registerCategories().catch(() => {});
    const onLanguageChange = () => registerCategories().catch(() => {});
    i18n.on('languageChanged', onLanguageChange);

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const habitId = response.notification.request.content.data?.habitId as string | undefined;
      if (!habitId) return;
      const actionId = response.actionIdentifier;
      if (actionId === ACTION_PAUSE) {
        useSessionStore.getState().pauseTimer(habitId);
        refresh();
      } else if (actionId === ACTION_RESUME) {
        useSessionStore.getState().resumeTimer(habitId);
        refresh();
      } else if (actionId === ACTION_FINISH) {
        finishActiveTimerHeadless(habitId);
        Notifications.dismissNotificationAsync(notificationIdFor(habitId)).catch(() => {});
        shownStatusRef.current.delete(habitId);
      }
    });

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    const unsubscribeStore = useSessionStore.subscribe((state, prevState) => {
      if (state.activeTimers !== prevState.activeTimers) refresh();
    });
    const appStateSub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') refresh();
    });

    refresh();

    return () => {
      i18n.off('languageChanged', onLanguageChange);
      responseSub.remove();
      clearInterval(interval);
      unsubscribeStore();
      appStateSub.remove();
    };
  }, []);
}
