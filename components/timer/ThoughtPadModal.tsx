import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useThoughtStore } from '@/store/thoughtStore';
import { useToastStore } from '@/store/toastStore';
import { lightTap } from '@/utils/haptics';
import { THOUGHT_MAX_LENGTH } from '@/utils/thoughts';

interface ThoughtPadModalProps {
  visible: boolean;
  habitName?: string;
  onClose: () => void;
}

/** Park a distracting thought without stopping the session timer. */
export function ThoughtPadModal({ visible, habitName, onClose }: ThoughtPadModalProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const add = useThoughtStore((s) => s.add);
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible) setText('');
  }, [visible]);

  const save = () => {
    if (add(text, habitName)) {
      lightTap();
      useToastStore.getState().showToast(t('thoughts.saved'));
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: spacing.xl }}
      >
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: spacing.xl,
            gap: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppIcon name="bulb" color={theme.colors.primary} size={22} />
            <AppText weight="extraBold" size="lg">
              {t('thoughts.title')}
            </AppText>
          </View>
          <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
            {t('thoughts.hint')}
          </AppText>
          <Input
            value={text}
            onChangeText={setText}
            placeholder={t('thoughts.placeholder')}
            autoFocus
            multiline
            maxLength={THOUGHT_MAX_LENGTH}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={save}
            style={{ minHeight: 64, textAlignVertical: 'top' }}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button label={t('thoughts.cancel')} variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('thoughts.save')} iconName="checkmark" onPress={save} disabled={!text.trim()} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
