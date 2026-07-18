import { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { pickMotivationMessage } from '@/utils/motivation';

interface SessionResultModalProps {
  visible: boolean;
  percent: number;
  minutes: number;
  goalMinutes: number;
  phoneFreeBonusPercent?: number | null;
  onClose: () => void;
}

export function SessionResultModal({
  visible,
  percent,
  minutes,
  goalMinutes,
  phoneFreeBonusPercent,
  onClose,
}: SessionResultModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const completed = percent >= 100;
  const accentColor = completed ? theme.colors.primary : theme.colors.secondary;
  const accentMuted = completed ? theme.colors.primaryMuted : theme.colors.secondaryMuted;

  const [motivation, setMotivation] = useState(() => pickMotivationMessage(t, percent));

  useEffect(() => {
    if (visible) {
      setMotivation(pickMotivationMessage(t, percent));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
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
            borderColor: accentColor,
            padding: spacing.xxl,
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: accentMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name={motivation.icon} color={accentColor} size={44} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: accentMuted,
              borderRadius: radius.full,
              paddingHorizontal: spacing.md,
              paddingVertical: 4,
            }}
          >
            <AppText weight="bold" size="sm" color={accentColor}>
              {t('sessionResult.percentBadge', { percent })}
            </AppText>
          </View>

          <AppText weight="extraBold" size="xxl" style={{ textAlign: 'center' }}>
            {motivation.message}
          </AppText>

          <AppText variant="secondary" size="md" style={{ textAlign: 'center', lineHeight: 22 }}>
            {completed
              ? t('sessionResult.completedText', { count: minutes, minutes })
              : t('sessionResult.incompleteText', { count: minutes, minutes, goal: goalMinutes })}
          </AppText>

          {phoneFreeBonusPercent != null ? (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: theme.colors.primaryMuted,
                borderRadius: radius.lg,
                padding: spacing.md,
              }}
            >
              <AppIcon name="phone-portrait" color={theme.colors.primary} size={22} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText weight="bold" size="sm" color={theme.colors.primary}>
                  {t('sessionResult.phoneFreeBonusTitle')}
                </AppText>
                <AppText size="xs" variant="secondary" style={{ lineHeight: 17 }}>
                  {t('sessionResult.phoneFreeBonusMessage', { percent: phoneFreeBonusPercent })}
                </AppText>
              </View>
            </View>
          ) : null}

          <Button label={t('sessionResult.continueButton')} onPress={onClose} iconName="checkmark-circle" />
        </View>
      </View>
    </Modal>
  );
}
