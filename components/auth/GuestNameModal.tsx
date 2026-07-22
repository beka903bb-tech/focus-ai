import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface GuestNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function GuestNameModal({ visible, onClose, onSubmit }: GuestNameModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const valid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit(name.trim());
    setName('');
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
                <AppIcon name="person-outline" color={theme.colors.textSecondary} size={16} />
              </View>
              <AppText weight="bold" size="md">
                {t('guestModal.title')}
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" color={theme.colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <AppText variant="secondary" size="sm" style={{ lineHeight: 20 }}>
            {t('guestModal.description')}
          </AppText>

          <View style={{ gap: spacing.xs }}>
            <AppText variant="secondary" size="sm" weight="medium">
              {t('guestModal.nameLabel')}
            </AppText>
            <Input
              iconName="person"
              placeholder={t('guestModal.namePlaceholder')}
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleSubmit}
              autoFocus
            />
          </View>

          <Button label={t('guestModal.continue')} onPress={handleSubmit} disabled={!valid} iconName="arrow-forward" />
        </View>
      </View>
    </Modal>
  );
}
