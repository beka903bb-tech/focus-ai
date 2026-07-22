import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface ReminderTimeModalProps {
  visible: boolean;
  hour: number;
  minute: number;
  onClose: () => void;
  onSubmit: (hour: number, minute: number) => void;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function Stepper({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (delta: number) => void;
}) {
  const theme = usePalette();
  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <AppText variant="tertiary" size="xs" weight="medium">
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable
          onPress={() => onChange(-1)}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="chevron-down" color={theme.colors.textSecondary} size={16} />
        </Pressable>
        <AppText weight="extraBold" size="xxl" style={{ minWidth: 48, textAlign: 'center' }}>
          {value}
        </AppText>
        <Pressable
          onPress={() => onChange(1)}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="chevron-up" color={theme.colors.textSecondary} size={16} />
        </Pressable>
      </View>
    </View>
  );
}

export function ReminderTimeModal({ visible, hour, minute, onClose, onSubmit }: ReminderTimeModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const [draftHour, setDraftHour] = useState(hour);
  const [draftMinute, setDraftMinute] = useState(minute);

  const handleShow = () => {
    setDraftHour(hour);
    setDraftMinute(minute);
  };

  const handleSubmit = () => {
    onSubmit(draftHour, draftMinute);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={handleShow}>
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
                <AppIcon name="alarm" color={theme.colors.textSecondary} size={16} />
              </View>
              <AppText weight="bold" size="md">
                {t('reminderModal.title')}
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" color={theme.colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <AppText variant="secondary" size="sm" style={{ lineHeight: 20 }}>
            {t('reminderModal.description')}
          </AppText>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
            <Stepper
              value={pad(draftHour)}
              label={t('reminderModal.hourLabel')}
              onChange={(delta) => setDraftHour((prev) => (prev + delta + 24) % 24)}
            />
            <AppText weight="extraBold" size="xxl">
              :
            </AppText>
            <Stepper
              value={pad(draftMinute)}
              label={t('reminderModal.minuteLabel')}
              onChange={(delta) => setDraftMinute((prev) => (prev + delta * 5 + 60) % 60)}
            />
          </View>

          <Button label={t('reminderModal.save')} onPress={handleSubmit} iconName="checkmark" />
        </View>
      </View>
    </Modal>
  );
}
