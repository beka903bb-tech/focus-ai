import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { pickMotivationMessage } from '@/utils/motivation';
import { SESSION_OUTCOMES } from '@/utils/sessionOutcome';
import { SessionOutcome } from '@/types/habit';

interface SessionResultModalProps {
  visible: boolean;
  percent: number;
  minutes: number;
  goalMinutes: number;
  phoneFreeBonusPercent?: number | null;
  /** When provided, the modal asks "Did you reach your goal?" and reports the answer. */
  onOutcome?: (outcome: SessionOutcome) => void;
  onClose: () => void;
}

export function SessionResultModal({
  visible,
  percent,
  minutes,
  goalMinutes,
  phoneFreeBonusPercent,
  onOutcome,
  onClose,
}: SessionResultModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const completed = percent >= 100;
  const accentColor = completed ? theme.colors.primary : theme.colors.secondary;
  const accentMuted = completed ? theme.colors.primaryMuted : theme.colors.secondaryMuted;

  const [motivation, setMotivation] = useState(() => pickMotivationMessage(t, percent));

  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);

  useEffect(() => {
    if (visible) {
      setMotivation(pickMotivationMessage(t, percent));
      setOutcome(null);
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

          {onOutcome ? (
            <View style={{ width: '100%', gap: spacing.sm }}>
              <AppText weight="bold" size="sm" style={{ textAlign: 'center' }}>
                {t('sessionResult.outcomeQuestion')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {SESSION_OUTCOMES.map((key) => {
                  const active = outcome === key;
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        setOutcome(key);
                        onOutcome(key);
                      }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        borderRadius: radius.full,
                        borderWidth: 1,
                        borderColor: active ? accentColor : theme.colors.border,
                        backgroundColor: active ? accentColor : theme.colors.surfaceAlt,
                      }}
                    >
                      <AppText size="sm" weight="bold" color={active ? '#fff' : theme.colors.textSecondary}>
                        {t(`sessionResult.outcome_${key}`)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <Button label={t('sessionResult.continueButton')} onPress={onClose} iconName="checkmark-circle" />
        </View>
      </View>
    </Modal>
  );
}
