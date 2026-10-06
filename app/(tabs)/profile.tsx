import { useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { showAlert } from '@/utils/alert';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LanguageModal } from '@/components/profile/LanguageModal';
import { ReminderTimeModal } from '@/components/profile/ReminderTimeModal';
import { Screen } from '@/components/ui/Screen';
import { StatChip } from '@/components/ui/StatChip';
import { Toggle } from '@/components/ui/Toggle';
import { radius, spacing } from '@/constants/theme';
import { usePalette, useThemeStore } from '@/store/themeStore';
import { isCoachProfileComplete, useCoachProfileStore } from '@/store/coachProfileStore';
import { useHabitStore } from '@/store/habitStore';
import { useLocaleStore } from '@/store/localeStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserStore } from '@/store/userStore';
import { pickAvatarImage, deleteAvatarImage } from '@/utils/avatarImage';
import { calculateLevel } from '@/utils/level';
import { buildDemoData, DemoHabitSpec } from '@/utils/demoData';
import { getLevelBadgeIcon } from '@/utils/levelTheme';
import { calculateOverallStreak, completionPercent, weeklyFocusComparison } from '@/utils/streak';
import { ShareResultModal } from '@/components/profile/ShareResultModal';
import { ThoughtListCard } from '@/components/profile/ThoughtListCard';
import { useThoughtStore } from '@/store/thoughtStore';
import { formatReminderTime, isSameReminderTime, REMINDER_PRESETS } from '@/utils/reminderPresets';
import { sendTestReminder, TEST_REMINDER_SECONDS } from '@/hooks/useDailyReminder';

interface SettingsRowProps {
  iconName: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

function SettingsRow({ iconName, title, subtitle, right, onPress }: SettingsRowProps) {
  const theme = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={iconName} color={theme.colors.textSecondary} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="semiBold" size="sm">
          {title}
        </AppText>
        <AppText size="xs" variant="tertiary">
          {subtitle}
        </AppText>
      </View>
      {right ?? (onPress ? <AppIcon name="chevron-forward" color={theme.colors.textTertiary} size={18} /> : null)}
    </Pressable>
  );
}

function Divider() {
  const theme = usePalette();
  return <View style={{ height: 1, backgroundColor: theme.colors.border }} />;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export default function ProfileScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const language = useLocaleStore((state) => state.language);
  const setLanguage = useLocaleStore((state) => state.setLanguage);
  const coachProfile = useCoachProfileStore((state) => state.coachProfile);
  const user = useUserStore();
  const habits = useHabitStore((state) => state.habits);
  const resetHabits = useHabitStore((state) => state.resetHabits);
  const sessions = useSessionStore((state) => state.sessions);
  const resetSessions = useSessionStore((state) => state.resetSessions);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const overallStreak = calculateOverallStreak(habits);
  const todayPercent = completionPercent(habits);
  const isVerified = user.provider === 'email' || user.provider === 'google';
  const sessionTotals = useSessionStore((state) => state.totals);
  const archivedCompletions = useHabitStore((state) => state.archivedCompletions);
  const level = calculateLevel(t, habits, sessionTotals, archivedCompletions);
  const weekly = weeklyFocusComparison(habits);
  const levelBadgeIcon = getLevelBadgeIcon(coachProfile.profession, coachProfile.childInterest, level.level);

  const handleAvatarPress = async () => {
    const uri = await pickAvatarImage();
    if (uri) {
      if (user.avatarUri) deleteAvatarImage(user.avatarUri);
      user.setAvatarUri(uri);
    }
  };

  const handleExport = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: { name: user.name, email: user.email },
      habits,
      sessions,
    };
    try {
      await Share.share({
        message: JSON.stringify(payload, null, 2),
        title: t('profile.exportShareTitle'),
      });
    } catch {
      showAlert(t('profile.exportErrorTitle'), t('profile.exportErrorMessage'));
    }
  };

  const handleLogout = () => {
    showAlert(t('profile.logout'), t('profile.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logoutConfirmOk'),
        style: 'destructive',
        onPress: () => {
          user.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleDemoData = () => {
    showAlert(t('profile.demoConfirmTitle'), t('profile.demoConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.demoConfirmOk'),
        onPress: () => {
          const names = t('profile.demoHabits', { returnObjects: true }) as string[];
          const everyDay = [0, 1, 2, 3, 4, 5, 6];
          const specs: DemoHabitSpec[] = [
            { name: names[0], iconKey: 'book', durationMinutes: 30, frequency: everyDay, rate: 0.8 },
            { name: names[1], iconKey: 'walk', durationMinutes: 20, frequency: everyDay, rate: 0.7 },
            { name: names[2], iconKey: 'meditation', durationMinutes: 10, frequency: everyDay, rate: 0.6 },
            { name: names[3], iconKey: 'barbell', durationMinutes: 45, frequency: [1, 3, 5], rate: 0.75 },
            { name: names[4], iconKey: 'flash', durationMinutes: 25, frequency: [1, 2, 3, 4, 5], rate: 0.65 },
          ];
          const demo = buildDemoData(specs);
          useHabitStore.setState({ habits: demo.habits, archivedCompletions: 0 });
          useSessionStore.setState({ sessions: demo.sessions, totals: demo.totals, activeTimers: {} });
          showAlert(t('profile.demoDoneTitle'), t('profile.demoDoneMessage'));
        },
      },
    ]);
  };

  const handleResetApp = () => {
    showAlert(t('profile.resetAppConfirmTitle'), t('profile.resetAppConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.resetAppConfirmOk'),
        style: 'destructive',
        onPress: () => {
          user.resetOnboardingAndAuth();
          resetHabits();
          resetSessions();
          useThoughtStore.getState().reset();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <AppHeader />

      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Pressable onPress={handleAvatarPress} style={{ width: 88, height: 88 }}>
          <Avatar name={user.name || t('common.defaultUserName')} imageUri={user.avatarUri} size={88} />
          <View
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: theme.colors.primary,
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: theme.colors.background,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <AppIcon name={levelBadgeIcon.name} color={theme.colors.onPrimary} size={10} />
            <AppText weight="bold" size="xs" color={theme.colors.onPrimary}>
              {level.level}
            </AppText>
          </View>
        </Pressable>
        <AppText weight="extraBold" size="xl" style={{ marginTop: spacing.sm }}>
          {user.name || t('common.defaultUserName')}
        </AppText>
        {user.email ? (
          <AppText size="sm" variant="secondary">
            {user.email}
          </AppText>
        ) : null}
        <Badge
          label={isVerified ? t('profile.verified') : t('common.guestName')}
          iconName={isVerified ? 'checkmark-circle' : 'person'}
          color={isVerified ? theme.colors.primary : theme.colors.secondary}
          backgroundColor={isVerified ? theme.colors.primaryMuted : theme.colors.secondaryMuted}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatChip value={`${overallStreak}`} label={t('profile.streakLabel')} iconName="flame" />
        <StatChip
          value={`${todayPercent}%`}
          label={t('profile.todayFocusLabel')}
          iconName="checkmark-done"
          valueColor={theme.colors.secondary}
        />
      </View>

      <Card style={{ paddingVertical: spacing.sm }}>
        <SettingsRow
          iconName="share-social"
          title={t('share.buttonTitle')}
          subtitle={t('share.buttonSubtitle')}
          onPress={() => setShareVisible(true)}
        />
      </Card>

      <ThoughtListCard />

      <View style={{ gap: spacing.sm }}>
        <AppText weight="bold" size="sm" variant="tertiary" style={{ letterSpacing: 0.5 }}>
          {t('profile.settingsTitle')}
        </AppText>
        <Card style={{ paddingVertical: spacing.sm }}>
          <SettingsRow
            iconName="flag"
            title={t('coachProfile.profileLinkTitle')}
            subtitle={
              isCoachProfileComplete(coachProfile)
                ? t('coachProfile.profileLinkSubtitleFilled')
                : t('coachProfile.profileLinkSubtitleEmpty')
            }
            onPress={() => router.push('/coach-profile')}
          />
          <Divider />
          <SettingsRow
            iconName="notifications"
            title={t('profile.notifications')}
            subtitle={user.notificationsEnabled ? t('profile.notificationsOn') : t('profile.notificationsOff')}
            right={<Toggle value={user.notificationsEnabled} onValueChange={user.toggleNotifications} />}
          />
          <Divider />
          <SettingsRow
            iconName="alarm"
            title={t('profile.reminderTitle')}
            subtitle={
              user.reminderEnabled
                ? t('profile.reminderSubtitleOn', {
                    time: `${pad(user.reminderTime.hour)}:${pad(user.reminderTime.minute)}`,
                  })
                : t('profile.reminderSubtitleOff')
            }
            right={<Toggle value={user.reminderEnabled} onValueChange={user.setReminderEnabled} />}
          />
          {user.reminderEnabled ? (
            <>
              <Divider />
              <SettingsRow
                iconName="time-outline"
                title={t('profile.reminderTimeTitle')}
                subtitle={`${pad(user.reminderTime.hour)}:${pad(user.reminderTime.minute)}`}
                onPress={() => setReminderModalVisible(true)}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.sm }}>
                {REMINDER_PRESETS.map((preset) => {
                  const selected = isSameReminderTime(preset, user.reminderTime);
                  return (
                    <Pressable
                      key={formatReminderTime(preset)}
                      onPress={() => user.setReminderTime(preset.hour, preset.minute)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: 6,
                        borderRadius: radius.full,
                        backgroundColor: selected ? theme.colors.primary : theme.colors.primaryMuted,
                      }}
                    >
                      <AppText size="sm" weight="bold" color={selected ? '#fff' : theme.colors.primary}>
                        {formatReminderTime(preset)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              <Divider />
              <SettingsRow
                iconName="paper-plane-outline"
                title={t('profile.reminderTestTitle')}
                subtitle={t('profile.reminderTestSubtitle', { seconds: TEST_REMINDER_SECONDS })}
                onPress={async () => {
                  const result = await sendTestReminder().catch(() => 'denied' as const);
                  if (result === 'scheduled') {
                    showAlert(t('profile.reminderTestSentTitle'), t('profile.reminderTestSentBody', { seconds: TEST_REMINDER_SECONDS }));
                  } else if (result === 'denied') {
                    showAlert(t('profile.reminderTestDeniedTitle'), t('profile.reminderTestDeniedBody'));
                  } else {
                    showAlert(t('profile.reminderTestWebTitle'), t('profile.reminderTestWebBody'));
                  }
                }}
              />
            </>
          ) : null}
          <Divider />
          <SettingsRow
            iconName="phone-portrait"
            title={t('profile.haptics')}
            subtitle={user.hapticsEnabled ? t('profile.hapticsOn') : t('profile.hapticsOff')}
            right={<Toggle value={user.hapticsEnabled} onValueChange={user.toggleHaptics} />}
          />
          <Divider />
          <SettingsRow
            iconName="volume-high"
            title={t('profile.sound')}
            subtitle={user.soundEnabled ? t('profile.soundOn') : t('profile.soundOff')}
            right={<Toggle value={user.soundEnabled} onValueChange={user.toggleSound} />}
          />
          <Divider />
          <SettingsRow
            iconName="moon"
            title={t('profile.theme')}
            subtitle={mode === 'dark' ? t('profile.themeDark') : t('profile.themeLight')}
            right={
              <Toggle value={mode === 'light'} onValueChange={(value) => setMode(value ? 'light' : 'dark')} />
            }
          />
          <Divider />
          <SettingsRow
            iconName="language"
            title={t('profile.language')}
            subtitle={t(`profile.languageNames.${language}`)}
            onPress={() => setLanguageModalVisible(true)}
          />
          <Divider />
          <SettingsRow
            iconName="download"
            title={t('profile.exportData')}
            subtitle={t('profile.exportSubtitle')}
            onPress={handleExport}
          />
          <Divider />
          <SettingsRow
            iconName="lock-closed"
            title={t('profile.privacy')}
            subtitle={t('profile.privacySubtitle')}
            onPress={() => showAlert(t('profile.privacy'), t('profile.privacyAlertMessage'))}
          />
        </Card>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="bold" size="sm" variant="tertiary" style={{ letterSpacing: 0.5 }}>
          {t('profile.supportTitle')}
        </AppText>
        <Card style={{ paddingVertical: spacing.sm }}>
          <SettingsRow
            iconName="star"
            title={t('profile.rateApp')}
            subtitle={t('profile.rateAppSubtitle')}
            onPress={() => showAlert(t('profile.comingSoonTitle'), t('profile.comingSoonMessage'))}
          />
          <Divider />
          <SettingsRow
            iconName="chatbubble-ellipses"
            title={t('profile.feedback')}
            subtitle={t('profile.feedbackSubtitle')}
            onPress={() => showAlert(t('profile.feedback'), t('profile.comingSoonMessage'))}
          />
          <Divider />
          <SettingsRow
            iconName="sparkles"
            title={t('profile.demoData')}
            subtitle={t('profile.demoDataSubtitle')}
            onPress={handleDemoData}
          />
          <Divider />
          <SettingsRow
            iconName="refresh-circle"
            title={t('profile.resetApp')}
            subtitle={t('profile.resetAppSubtitle')}
            onPress={handleResetApp}
          />
        </Card>
      </View>

      <Pressable
        onPress={handleLogout}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: theme.colors.dangerMuted,
          borderRadius: radius.lg,
          padding: spacing.lg,
        }}
      >
        <AppIcon name="log-out" color={theme.colors.danger} size={20} />
        <View style={{ flex: 1 }}>
          <AppText weight="semiBold" size="sm" color={theme.colors.danger}>
            {t('profile.logout')}
          </AppText>
          <AppText size="xs" color={theme.colors.danger} style={{ opacity: 0.8 }}>
            {t('profile.logoutSubtitle')}
          </AppText>
        </View>
      </Pressable>

      <AppText size="xs" variant="tertiary" style={{ textAlign: 'center' }}>
        {t('profile.version', { version: '1.0.0' })}
      </AppText>

      <ShareResultModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        stats={{
          streak: overallStreak,
          weekMinutes: weekly.thisWeekMinutes,
          weekChange: weekly.percentChange,
          level: level.level,
          levelTitle: level.title,
        }}
      />
      <ReminderTimeModal
        visible={reminderModalVisible}
        hour={user.reminderTime.hour}
        minute={user.reminderTime.minute}
        onClose={() => setReminderModalVisible(false)}
        onSubmit={(hour, minute) => {
          user.setReminderTime(hour, minute);
          setReminderModalVisible(false);
        }}
      />
      <LanguageModal
        visible={languageModalVisible}
        current={language}
        onClose={() => setLanguageModalVisible(false)}
        onSelect={setLanguage}
      />
    </Screen>
  );
}
