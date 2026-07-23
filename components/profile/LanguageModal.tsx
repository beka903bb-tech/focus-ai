import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import type { AppLanguage } from '@/i18n';
import { usePalette } from '@/store/themeStore';

interface LanguageModalProps {
  visible: boolean;
  current: AppLanguage;
  onClose: () => void;
  onSelect: (language: AppLanguage) => void;
}

const LANGUAGE_OPTIONS: { code: AppLanguage; flag: string }[] = [
  { code: 'uz', flag: '🇺🇿' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'en', flag: '🇬🇧' },
];

export function LanguageModal({ visible, current, onClose, onSelect }: LanguageModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        {/* Swallows the tap so pressing inside the card doesn't bubble up and close it. */}
        <Pressable
          onPress={() => {}}
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
                <AppIcon name="language" color={theme.colors.textSecondary} size={16} />
              </View>
              <AppText weight="bold" size="md">
                {t('profile.languageModal.title')}
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" color={theme.colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <AppText variant="secondary" size="sm" style={{ marginTop: -spacing.sm }}>
            {t('profile.languageModal.subtitle')}
          </AppText>

          <View style={{ gap: spacing.sm }}>
            {LANGUAGE_OPTIONS.map((option) => {
              const active = option.code === current;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => {
                    onSelect(option.code);
                    onClose();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.md,
                    borderRadius: radius.lg,
                    backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surfaceAlt,
                    borderWidth: 1.5,
                    borderColor: active ? theme.colors.primary : 'transparent',
                  }}
                >
                  <AppText size="xl">{option.flag}</AppText>
                  <View style={{ flex: 1 }}>
                    <AppText weight="semiBold" size="sm">
                      {t(`profile.languageNames.${option.code}`)}
                    </AppText>
                    <AppText size="xs" variant="tertiary">
                      {t(`profile.languageModal.descriptions.${option.code}`)}
                    </AppText>
                  </View>
                  {active ? <AppIcon name="checkmark-circle" color={theme.colors.primary} size={22} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
