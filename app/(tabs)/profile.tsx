import { useState } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
import { getLevelBadgeIcon } from '@/utils/levelTheme';
import { calculateOverallStreak, completionPercent } from '@/utils/streak';

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

  const overallStreak = calculateOverallStreak(habits);
  const todayPercent = completionPercent(habits);
  const isVerified = user.provider === 'email' || user.provider === 'google';
  const sessionTotals = useSessionStore((state) => state.totals);
  const archivedCompletions = useHabitStore((state) => state.archivedCompletions);
  const level = calculateLevel(t, habits, sessionTotals, archivedCompletions);
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
      Alert.alert(t('profile.exportErrorTitle'), t('profile.exportErrorMessage'));
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirmMessage'), [
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

  const handleResetApp = () => {
    Alert.alert(t('profile.resetAppConfirmTitle'), t('profile.resetAppConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.resetAppConfirmOk'),
        style: 'destructive',
        onPress: () => {
          user.resetOnboardingAndAuth();
          resetHabits();
          resetSessions();
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
            onPress={() => Alert.alert(t('profile.privacy'), t('profile.privacyAlertMessage'))}
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
            onPress={() => Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonMessage'))}
          />
          <Divider />
          <SettingsRow
            iconName="chatbubble-ellipses"
            title={t('profile.feedback')}
            subtitle={t('profile.feedbackSubtitle')}
            onPress={() => Alert.alert(t('profile.feedback'), t('profile.comingSoonMessage'))}
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
