import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setError('');
      setSent(false);
    }
  }, [visible]);

  const handleSend = () => {
    if (!email.trim()) {
      setError(t('forgotPassword.errorEmailRequired'));
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          {sent ? (
            <>
              <View style={{ alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.colors.primaryMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon name="mail-open" color={theme.colors.primary} size={26} />
                </View>
                <AppText weight="bold" size="md" style={{ textAlign: 'center' }}>
                  {t('forgotPassword.sentTitle')}
                </AppText>
                <AppText variant="secondary" size="sm" style={{ textAlign: 'center', lineHeight: 20 }}>
                  {t('forgotPassword.sentMessage', { email: email.trim() })}
                </AppText>
              </View>
              <Button label={t('forgotPassword.close')} onPress={onClose} iconName="checkmark-circle" />
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText weight="bold" size="md">
                  {t('forgotPassword.title')}
                </AppText>
                <Pressable onPress={onClose} hitSlop={8}>
                  <AppIcon name="close" color={theme.colors.textSecondary} size={20} />
                </Pressable>
              </View>

              <AppText variant="secondary" size="sm" style={{ lineHeight: 20 }}>
                {t('forgotPassword.description')}
              </AppText>

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
                  onSubmitEditing={handleSend}
                  autoFocus
                />
                {error ? (
                  <AppText size="sm" color={theme.colors.danger}>
                    {error}
                  </AppText>
                ) : null}
              </View>

              <Button label={t('forgotPassword.sendButton')} onPress={handleSend} iconName="paper-plane" />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
