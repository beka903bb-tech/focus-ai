import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface GoogleMockModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function GoogleMockModal({ visible, onClose, onSubmit }: GoogleMockModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const valid = isValidEmail(email);

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit(email.trim());
    setEmail('');
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText weight="extraBold" size="sm" color="#EA4335">
                  G
                </AppText>
              </View>
              <AppText weight="bold" size="md">
                {t('googleModal.title')}
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" color={theme.colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <AppText variant="secondary" size="sm" style={{ lineHeight: 20 }}>
            {t('googleModal.description')}
          </AppText>

          <View style={{ gap: spacing.xs }}>
            <AppText variant="secondary" size="sm" weight="medium">
              {t('googleModal.emailLabel')}
            </AppText>
            <Input
              iconName="mail"
              placeholder={t('googleModal.emailPlaceholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={handleSubmit}
              autoFocus
            />
          </View>

          <Button label={t('googleModal.continue')} onPress={handleSubmit} disabled={!valid} iconName="arrow-forward" />
        </View>
      </View>
    </Modal>
  );
}
