import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { GoogleMockModal } from '@/components/auth/GoogleMockModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const loginWithEmail = useUserStore((state) => state.loginWithEmail);
  const registerWithEmail = useUserStore((state) => state.registerWithEmail);
  const loginWithGoogle = useUserStore((state) => state.loginWithGoogle);
  const loginAsGuest = useUserStore((state) => state.loginAsGuest);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const enterApp = () => router.replace('/(tabs)');

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError(t('login.errorFillEmailPassword'));
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError(t('login.errorEnterName'));
      return;
    }
    setError('');
    if (mode === 'login') {
      loginWithEmail(email.trim());
    } else {
      registerWithEmail(name.trim(), email.trim());
    }
    enterApp();
  };

  const handleGoogleSubmit = (googleEmail: string) => {
    setGoogleModalVisible(false);
    loginWithGoogle(googleEmail);
    enterApp();
  };

  const handleGuest = () => {
    loginAsGuest();
    enterApp();
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', marginTop: spacing.xxl, gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AppIcon name="flash" color={theme.colors.primary} size={26} />
          <AppText weight="extraBold" size="xxxl">
            {t('common.brandName')}
          </AppText>
        </View>
        <AppText variant="secondary" size="md">
          {t('login.title')}
        </AppText>
      </View>

      <SegmentedControl
        options={[
          { key: 'login', label: t('login.tabLogin') },
          { key: 'register', label: t('login.tabRegister') },
        ]}
        selectedKey={mode}
        onChange={(key) => {
          setMode(key as Mode);
          setError('');
        }}
      />

      <View style={{ gap: spacing.lg }}>
        {mode === 'register' ? (
          <View style={{ gap: spacing.xs }}>
            <AppText variant="secondary" size="sm" weight="medium">
              {t('login.nameLabel')}
            </AppText>
            <Input iconName="person" placeholder={t('login.namePlaceholder')} value={name} onChangeText={setName} />
          </View>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          <AppText variant="secondary" size="sm" weight="medium">
            {t('login.emailLabel')}
          </AppText>
          <Input
            iconName="mail"
            placeholder={t('login.emailPlaceholder')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="secondary" size="sm" weight="medium">
              {t('login.passwordLabel')}
            </AppText>
            {mode === 'login' ? (
              <Pressable onPress={() => setForgotPasswordVisible(true)} hitSlop={8}>
                <AppText size="sm" weight="medium" color={theme.colors.primary}>
                  {t('login.forgotPassword')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
          <Input
            iconName="lock-closed"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightElement={
              <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                <AppIcon
                  name={showPassword ? 'eye-off' : 'eye'}
                  color={theme.colors.textSecondary}
                  size={18}
                />
              </Pressable>
            }
          />
        </View>

        {error ? (
          <AppText color={theme.colors.danger} size="sm">
            {error}
          </AppText>
        ) : null}

        <Button
          label={mode === 'login' ? t('login.submitLogin') : t('login.submitRegister')}
          onPress={handleSubmit}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          <AppText variant="tertiary" size="sm">
            {t('login.or')}
          </AppText>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
        </View>

        <Button
          label={t('login.google')}
          variant="outline"
          onPress={() => setGoogleModalVisible(true)}
          iconName="logo-google"
        />

        <Pressable onPress={handleGuest} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="person-outline" color={theme.colors.textSecondary} size={16} />
            <AppText variant="secondary" size="sm" weight="medium">
              {t('login.guest')}
            </AppText>
          </View>
        </Pressable>
      </View>

      <AppText variant="tertiary" size="xs" style={{ textAlign: 'center', marginTop: spacing.xl }}>
        {t('login.help')}
      </AppText>

      <GoogleMockModal
        visible={googleModalVisible}
        onClose={() => setGoogleModalVisible(false)}
        onSubmit={handleGoogleSubmit}
      />
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onClose={() => setForgotPasswordVisible(false)}
      />
    </Screen>
  );
}
