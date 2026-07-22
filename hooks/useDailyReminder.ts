import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';
import { useUserStore } from '@/store/userStore';

// Fully separate channel + notification identifier from useSessionNotifications.ts
// (focus-session-v3 / focus-complete-v1) — this reminder must never share a channel or
// identifier with the running-session tracker or completion alert, so toggling it on/off
// can't affect (and can't be affected by) that unrelated notification flow.
// v2: Android notification channels are immutable after first creation — the v1 channel
// was created with importance HIGH/no vibration, so on devices that already have it,
// bumping sound/importance/vibration in code has no effect until the channel id changes.
const CHANNEL_ID = 'daily-reminder-v2';
const NOTIFICATION_ID = 'daily-reminder-v1';
const VIBRATION_PATTERN = [0, 500, 200, 500, 200, 500];

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: i18n.t('dailyReminder.channelName'),
    // MAX keeps this channel out of the OS's "batched/low priority" bucket that Infinix
    // XOS / MIUI-style battery optimization applies to HIGH-and-below channels, which is
    // what was causing the multi-minute delivery delay.
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: VIBRATION_PATTERN,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.NOTIFICATION,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
  channelReady = true;
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Without this, Android 12+ has no "Alarms & reminders" grant for the app, so the native
// scheduler (ExpoSchedulingDelegate.setupAlarm) falls back to setAndAllowWhileIdle instead
// of setExactAndAllowWhileIdle — an inexact alarm the OS is free to delay by several
// minutes (confirmed on-device: a 14:55 reminder was still unfired past 15:03). There is no
// runtime-permission dialog for this like POST_NOTIFICATIONS; the only way to grant it is
// the system "Alarms & reminders" settings screen. The "did we already ask" flag is
// persisted (not just an in-memory module flag) so this only opens once ever per install,
// not once per app cold start.
const EXACT_ALARM_ASKED_KEY = 'focus-ai/exactAlarmAsked';
async function requestExactAlarmSetting() {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 31) return;
  const alreadyAsked = await AsyncStorage.getItem(EXACT_ALARM_ASKED_KEY).catch(() => null);
  if (alreadyAsked) return;
  await AsyncStorage.setItem(EXACT_ALARM_ASKED_KEY, '1').catch(() => {});
  Linking.sendIntent('android.settings.REQUEST_SCHEDULE_EXACT_ALARM').catch(() => {});
}

async function scheduleDailyReminder(hour: number, minute: number) {
  const granted = await ensurePermission().catch(() => false);
  if (!granted) return;
  await ensureChannel().catch(() => {});
  await requestExactAlarmSetting();

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: i18n.t('dailyReminder.title'),
      body: i18n.t('dailyReminder.body'),
      sound: 'default',
      vibrate: VIBRATION_PATTERN,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

// Keeps the single repeating daily reminder in sync with the user's toggle/time choice
// in the profile screen. Any change cancels the previous schedule and, if still enabled,
// re-schedules it — so there is never more than one pending instance.
export function useDailyReminder() {
  const reminderEnabled = useUserStore((state) => state.reminderEnabled);
  const reminderHour = useUserStore((state) => state.reminderTime.hour);
  const reminderMinute = useUserStore((state) => state.reminderTime.minute);

  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => {});
      if (cancelled || !reminderEnabled) return;
      await scheduleDailyReminder(reminderHour, reminderMinute).catch(() => {});
    };

    apply();

    return () => {
      cancelled = true;
    };
  }, [reminderEnabled, reminderHour, reminderMinute]);
}
