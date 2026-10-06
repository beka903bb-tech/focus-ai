import { useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus, Image, Pressable, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTranslation } from 'react-i18next';
import { showAlert } from '@/utils/alert';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Screen } from '@/components/ui/Screen';
import { SessionResultModal } from '@/components/timer/SessionResultModal';
import { ThoughtPadModal } from '@/components/timer/ThoughtPadModal';
import { useThoughtStore } from '@/store/thoughtStore';
import { thoughtsSince } from '@/utils/thoughts';
import { getHabitIcon } from '@/constants/icons';
import { radius, spacing } from '@/constants/theme';
import { useFaceDownDetector } from '@/hooks/useFaceDownDetector';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { AmbientTrack, useUserStore } from '@/store/userStore';
import { todayKey, toDateKey } from '@/utils/date';
import { celebrateHabitCompletion } from '@/utils/celebration';
import { lightTap, success } from '@/utils/haptics';
import { pauseAmbient, resumeAmbient, startAmbient, stopAmbient } from '@/utils/ambientAudio';
import { computeElapsedSeconds, formatClock, goalCrossedAt, PHONE_FREE_THRESHOLD_PERCENT, TimerState, MAX_UNATTENDED_MS } from '@/utils/timer';

type SessionStatus = 'idle' | 'running' | 'paused' | 'done';

export default function FocusSessionScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const { habitId } = useLocalSearchParams<{ habitId?: string }>();
  const habit = useHabitStore((state) => state.habits.find((item) => item.id === habitId));
  const logProgress = useHabitStore((state) => state.logProgress);
  const resetProgress = useHabitStore((state) => state.resetProgress);
  const addSession = useSessionStore((state) => state.addSession);
  const setSessionOutcome = useSessionStore((state) => state.setSessionOutcome);
  // id of the session record just saved, so the "Did you reach your goal?" answer can be attached to it
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  // Thought pad: park a distracting thought without stopping the timer.
  const [thoughtPadVisible, setThoughtPadVisible] = useState(false);
  const [screenOpenedAt] = useState(() => Date.now());
  const parkedThisSession = useThoughtStore((state) => thoughtsSince(state.thoughts, screenOpenedAt));
  const soundEnabled = useUserStore((state) => state.soundEnabled);
  const ambientTrack = useUserStore((state) => state.ambientTrack);
  const setAmbientTrack = useUserStore((state) => state.setAmbientTrack);
  // A real habit's timer lives in sessionStore (shared, keyed by habitId) so it keeps
  // running independently of this screen and of any other habit's session. The
  // habit-less "free focus" fallback (not reachable from the current UI, but kept
  // working defensively) has no id to key by, so it stays purely local.
  const storedTimer = useSessionStore((state) => (habit ? state.activeTimers[habit.id] : undefined));
  const [localTimer, setLocalTimer] = useState<TimerState | null>(null);
  const timer = habit ? storedTimer ?? null : localTimer;

  const goalMinutes = habit?.durationMinutes ?? 25;
  const goalSeconds = goalMinutes * 60;
  const icon = habit ? getHabitIcon(habit.iconKey) : null;
  const todayMinutes = habit?.progressMinutes?.[todayKey()] ?? 0;
  const isDoneToday = goalMinutes > 0 && todayMinutes >= goalMinutes;

  const [isDone, setIsDone] = useState(false);
  const status: SessionStatus = isDone ? 'done' : timer?.status ?? 'idle';
  const [elapsed, setElapsed] = useState(() =>
    timer ? computeElapsedSeconds(timer) : Math.min(todayMinutes * 60, goalSeconds)
  );
  const [resultPercent, setResultPercent] = useState<number | null>(null);
  const [resultMinutes, setResultMinutes] = useState(0);
  const [resultPhoneFreePercent, setResultPhoneFreePercent] = useState<number | null>(null);

  const getLiveElapsedSeconds = () => {
    if (habit) {
      const fresh = useSessionStore.getState().activeTimers[habit.id];
      return fresh ? computeElapsedSeconds(fresh) : elapsed;
    }
    return localTimer ? computeElapsedSeconds(localTimer) : elapsed;
  };

  // "Phone-free" focus tracking (creative feature): the accelerometer can only be
  // sampled while this screen is mounted and the app is foregrounded, so this is
  // local, not stored — unlike the main timer it cannot be reconstructed from
  // timestamps alone if the screen unmounts.
  const isFaceDown = useFaceDownDetector(status === 'running');
  const [phoneFreeMs, setPhoneFreeMs] = useState(0);
  const [phoneFreeSince, setPhoneFreeSince] = useState<number | null>(null);
  const getPhoneFreeMs = () => phoneFreeMs + (phoneFreeSince ? Date.now() - phoneFreeSince : 0);

  useEffect(() => {
    if (status !== 'running') {
      if (phoneFreeSince !== null) {
        setPhoneFreeMs((prev) => prev + (Date.now() - phoneFreeSince));
        setPhoneFreeSince(null);
      }
      return;
    }
    if (isFaceDown && phoneFreeSince === null) {
      setPhoneFreeSince(Date.now());
    } else if (!isFaceDown && phoneFreeSince !== null) {
      setPhoneFreeMs((prev) => prev + (Date.now() - phoneFreeSince));
      setPhoneFreeSince(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFaceDown, status]);

  useEffect(() => {
    const KEEP_AWAKE_TAG = 'focus-session';
    if (status === 'running') {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    } else {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    }
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || !timer) return;
    const interval = setInterval(() => {
      setElapsed(computeElapsedSeconds(timer));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timer]);

  // Switches the looping ambient track live if the user changes their pick mid-session.
  useEffect(() => {
    if (status === 'running') {
      void startAmbient(ambientTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientTrack]);

  // Respects the global "Ovoz" toggle even if it's switched off mid-session.
  useEffect(() => {
    if (!soundEnabled) void stopAmbient();
  }, [soundEnabled]);

  // Never leave ambient audio playing after this screen unmounts.
  useEffect(() => () => void stopAmbient(), []);

  // Timers are suspended while the app is backgrounded or the phone sleeps. Recompute
  // from timestamps the moment the app comes back so elapsed time stays accurate.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active' && status === 'running') {
        setElapsed(getLiveElapsedSeconds());
      }
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, habit?.id]);

  useEffect(() => {
    if (elapsed >= goalSeconds && status === 'running') {
      completeGoal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, goalSeconds, status]);

  const progress = goalSeconds > 0 ? elapsed / goalSeconds : 0;
  const percent = Math.round(progress * 100);

  const stopCurrentTimer = () => {
    if (habit) {
      useSessionStore.getState().stopTimer(habit.id);
    } else {
      setLocalTimer(null);
    }
  };

  // Reaching the full goal duration: bank the full goal as today's progress and mark the habit done.
  const completeGoal = () => {
    const finalElapsed = getLiveElapsedSeconds();
    const finalPhoneFreeMs = getPhoneFreeMs();
    const baseSeconds = timer?.baseSeconds ?? 0;
    stopCurrentTimer();
    void stopAmbient();
    setIsDone(true);
    const sessionSeconds = finalElapsed - baseSeconds;
    const sessionMinutes = Math.round(sessionSeconds / 60);
    const phoneFreePercent = sessionSeconds > 0 ? Math.round((finalPhoneFreeMs / 1000 / sessionSeconds) * 100) : 0;
    const phoneFreeBonus = phoneFreePercent >= PHONE_FREE_THRESHOLD_PERCENT;
    setLastSessionId(null);
    if (sessionMinutes > 0 && habit) {
      const savedId = addSession({
        habitId: habit.id,
        habitName: habit.name,
        durationMinutes: sessionMinutes,
        phoneFreeBonus,
      });
      setLastSessionId(savedId);
    }
    if (habit) {
      // Same reasoning as useGlobalTimerWatcher.ts: if this effect fires because a timer
      // left running overnight was already past its goal by the time this screen mounted
      // (not a live completion the user just watched happen), attribute it to the day the
      // goal was actually reached, not the day it happened to be noticed.
      const dateKey = timer ? toDateKey(goalCrossedAt(timer)) : todayKey();
      logProgress(habit.id, goalMinutes, dateKey);
    }
    setResultMinutes(goalMinutes);
    setResultPercent(100);
    setResultPhoneFreePercent(phoneFreeBonus ? phoneFreePercent : null);
    if (habit) {
      celebrateHabitCompletion(habit.id, habit.name, goalMinutes);
    } else {
      success();
    }
  };

  // Manual "Yakunlash" before reaching the goal: bank whatever was accumulated today so far.
  const stopEarly = () => {
    const finalElapsed = getLiveElapsedSeconds();
    const finalPhoneFreeMs = getPhoneFreeMs();
    const baseSeconds = timer?.baseSeconds ?? 0;
    stopCurrentTimer();
    void stopAmbient();
    setIsDone(true);
    const totalMinutes = Math.round(finalElapsed / 60);
    const sessionSeconds = finalElapsed - baseSeconds;
    const sessionMinutes = Math.round(sessionSeconds / 60);
    const phoneFreePercent = sessionSeconds > 0 ? Math.round((finalPhoneFreeMs / 1000 / sessionSeconds) * 100) : 0;
    const phoneFreeBonus = phoneFreePercent >= PHONE_FREE_THRESHOLD_PERCENT;
    setLastSessionId(null);
    if (sessionMinutes > 0 && habit) {
      const savedId = addSession({
        habitId: habit.id,
        habitName: habit.name,
        durationMinutes: sessionMinutes,
        phoneFreeBonus,
      });
      setLastSessionId(savedId);
    }
    if (habit && totalMinutes > 0) {
      logProgress(habit.id, totalMinutes);
    }
    const finalPercent = Math.min(100, Math.round((totalMinutes / goalMinutes) * 100));
    setResultMinutes(totalMinutes);
    setResultPercent(finalPercent);
    setResultPhoneFreePercent(phoneFreeBonus ? phoneFreePercent : null);
    if (finalPercent >= 100) {
      if (habit) {
        celebrateHabitCompletion(habit.id, habit.name, totalMinutes);
      } else {
        success();
      }
    } else if (phoneFreeBonus) {
      success();
    }
  };

  const startRun = (continueFromSaved: boolean) => {
    const base = continueFromSaved ? Math.min(todayMinutes * 60, goalSeconds) : 0;
    lightTap();
    setIsDone(false);
    setPhoneFreeMs(0);
    setPhoneFreeSince(null);
    if (habit) {
      useSessionStore.getState().startTimer(habit.id, base, goalSeconds);
    } else {
      setLocalTimer({ status: 'running', baseSeconds: base, accumulatedMs: 0, runningSince: Date.now(), goalSeconds });
    }
    setElapsed(base);
    void startAmbient(ambientTrack);
  };

  const togglePause = () => {
    lightTap();
    if (status === 'running') {
      void pauseAmbient();
    } else {
      void resumeAmbient();
    }
    if (habit) {
      if (status === 'running') {
        useSessionStore.getState().pauseTimer(habit.id);
      } else {
        useSessionStore.getState().resumeTimer(habit.id);
      }
      const fresh = useSessionStore.getState().activeTimers[habit.id];
      if (fresh) setElapsed(computeElapsedSeconds(fresh));
      return;
    }
    setLocalTimer((prev) => {
      if (!prev) return prev;
      const next: TimerState =
        prev.status === 'running'
          ? {
              ...prev,
              status: 'paused',
              accumulatedMs:
                prev.accumulatedMs +
                (prev.runningSince ? Math.min(Date.now() - prev.runningSince, MAX_UNATTENDED_MS) : 0),
              runningSince: null,
            }
          : { ...prev, status: 'running', runningSince: Date.now() };
      setElapsed(computeElapsedSeconds(next));
      return next;
    });
  };

  const handleRestart = () => {
    if (!habit) {
      startRun(false);
      return;
    }
    showAlert(
      t('focusSession.restartConfirmTitle'),
      t('focusSession.restartConfirmMessage', { count: todayMinutes }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('focusSession.restartConfirmOk'),
          style: 'destructive',
          onPress: () => {
            resetProgress(habit.id);
            startRun(false);
          },
        },
      ]
    );
  };

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'running':
        return t('focusSession.statusRunning');
      case 'paused':
        return t('focusSession.statusPaused');
      case 'done':
        return t('focusSession.statusDone');
      default:
        return t('focusSession.statusIdle');
    }
  }, [status, t]);

  const elapsedMinutes = Math.floor(elapsed / 60);
  const unsavedMinutes = Math.floor((elapsed - (timer?.baseSeconds ?? 0)) / 60);

  const handleBack = () => {
    // A real habit's timer survives navigation (it keeps running in sessionStore), so
    // there is nothing to warn about. Only the local-only free-session fallback loses
    // its progress on back.
    if (!habit && (status === 'running' || status === 'paused') && unsavedMinutes > 0) {
      showAlert(
        t('focusSession.exitConfirmTitle'),
        t('focusSession.exitConfirmMessage', { count: unsavedMinutes }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('focusSession.exitConfirmOk'), style: 'destructive', onPress: () => router.back() },
        ]
      );
      return;
    }
    router.back();
  };

  return (
    <Screen
      scroll
      header={<BackHeader title={t('focusSession.headerTitle')} onBack={handleBack} />}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.lg }}
    >
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: radius.full,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {habit?.imageUri ? (
            <Image source={{ uri: habit.imageUri }} style={{ width: 18, height: 18, borderRadius: 9 }} />
          ) : (
            <AppIcon
              family={icon?.family}
              name={icon?.name ?? 'flash'}
              color={habit?.colorKey ?? theme.colors.primary}
              size={16}
            />
          )}
          <AppText weight="semiBold" size="sm">
            {habit?.name ?? t('focusSession.freeSessionName')}
          </AppText>
        </View>

        <CircularProgress progress={progress} size={220} strokeWidth={16}>
          <AppText weight="extraBold" size="xxxl">
            {formatClock(elapsed)}
          </AppText>
          <AppText variant="tertiary" size="sm" weight="medium">
            {percent}%
          </AppText>
        </CircularProgress>

        <AppText variant="secondary" size="sm">
          {t('focusSession.goalLabel', { count: goalMinutes })}
        </AppText>

        {(status === 'idle' || status === 'done') && todayMinutes > 0 ? (
          <AppText variant="tertiary" size="xs">
            {t('focusSession.accumulatedLabel', { done: Math.min(todayMinutes, goalMinutes), goal: goalMinutes })}
          </AppText>
        ) : null}

        <AppText weight="semiBold" size="md" color={theme.colors.primary}>
          {statusLabel}
        </AppText>

        {status === 'running' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isFaceDown ? theme.colors.primaryMuted : theme.colors.surfaceAlt,
              borderRadius: radius.full,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: isFaceDown ? theme.colors.primary : theme.colors.border,
            }}
          >
            <AppText
              size="xs"
              weight="medium"
              color={isFaceDown ? theme.colors.primary : theme.colors.textSecondary}
            >
              {isFaceDown ? t('focusSession.phoneFreeActive') : t('focusSession.phoneFreeInactive')}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.md }}>
        {status === 'idle' || status === 'done' ? (
          todayMinutes > 0 && !isDoneToday ? (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={t('focusSession.resumeWithProgress', { done: todayMinutes, goal: goalMinutes })}
                  iconName="play"
                  onPress={() => startRun(true)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label={t('focusSession.restart')}
                  variant="outline"
                  iconName="refresh"
                  onPress={handleRestart}
                />
              </View>
            </View>
          ) : (
            <Button label={t('focusSession.start')} iconName="play" onPress={() => startRun(false)} />
          )
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button
                label={
                  status === 'running'
                    ? t('focusSession.pause')
                    : t('focusSession.resumeWithProgress', { done: elapsedMinutes, goal: goalMinutes })
                }
                variant="outline"
                iconName={status === 'running' ? 'pause' : 'play'}
                onPress={togglePause}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('focusSession.finish')} iconName="checkmark" onPress={stopEarly} />
            </View>
          </View>
        )}

        {status === 'running' || status === 'paused' ? (
          <Pressable
            onPress={() => setThoughtPadVisible(true)}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.colors.primary,
            }}
          >
            <AppIcon name="bulb" color={theme.colors.primary} size={18} />
            <AppText size="sm" weight="bold" color={theme.colors.primary}>
              {t('thoughts.button')}
            </AppText>
            {parkedThisSession > 0 ? (
              <AppText size="xs" variant="tertiary">
                · {t('thoughts.sessionCount', { count: parkedThisSession })}
              </AppText>
            ) : null}
          </Pressable>
        ) : null}

        {status !== 'done' ? (
          <View style={{ gap: spacing.sm }}>
            <AppText weight="semiBold" size="sm" variant="secondary">
              {t('focusSession.ambientSoundTitle')}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {(
                [
                  { key: 'none', label: t('focusSession.ambientSoundNone') },
                  { key: 'brownNoise', label: t('focusSession.ambientSoundBrown') },
                  { key: 'pinkNoise', label: t('focusSession.ambientSoundPink') },
                  { key: 'rain', label: t('focusSession.ambientSoundRain') },
                  { key: 'nature', label: t('focusSession.ambientSoundNature') },
                ] as { key: AmbientTrack; label: string }[]
              ).map((option) => {
                const active = option.key === ambientTrack;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setAmbientTrack(option.key)}
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.lg,
                      borderRadius: radius.full,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <AppText
                      size="sm"
                      weight="semiBold"
                      color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <AppIcon name="hardware-chip" color={theme.colors.primary} size={20} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText weight="semiBold" size="sm" color={theme.colors.primary}>
              {t('focusSession.aiAdviceTitle')}
            </AppText>
            <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
              {t('focusSession.aiAdviceText')}
            </AppText>
          </View>
        </View>
      </View>

      <ThoughtPadModal
        visible={thoughtPadVisible}
        habitName={habit?.name}
        onClose={() => setThoughtPadVisible(false)}
      />

      <SessionResultModal
        visible={resultPercent !== null}
        percent={resultPercent ?? 0}
        minutes={resultMinutes}
        goalMinutes={goalMinutes}
        phoneFreeBonusPercent={resultPhoneFreePercent}
        onOutcome={lastSessionId ? (outcome) => setSessionOutcome(lastSessionId, outcome) : undefined}
        onClose={() => {
          setResultPercent(null);
          setResultPhoneFreePercent(null);
          router.back();
        }}
      />
    </Screen>
  );
}
