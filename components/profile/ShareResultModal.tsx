import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, Share, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { showAlert } from '@/utils/alert';
import { buildShareMessage, formatMinutes, SHARE_URL, ShareStats, weekChangeLabel } from '@/utils/shareCard';

// Card colours are fixed (not theme-dependent): the shared PNG must look the same whether
// the sender uses light or dark mode — same petrol + caramel brand as the landing page.
const CARD = { bg: '#0A2627', panel: '#10393A', line: 'rgba(230,182,106,0.25)', ink: '#F7ECDD', ink2: '#CDBBA2', gold: '#F0B46A', fox: '#D98A3D', sea: '#7FD3C9' };

interface Props {
  visible: boolean;
  stats: ShareStats;
  onClose: () => void;
}

export function ShareResultModal({ visible, stats, onClose }: Props) {
  const theme = usePalette();
  const { t } = useTranslation();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const change = weekChangeLabel(t, stats.weekChange);
  const message = buildShareMessage(t, stats);

  const shareText = async () => {
    try {
      await Share.share({ message, title: t('share.dialogTitle') });
    } catch {
      showAlert(t('share.dialogTitle'), message);
    }
  };

  // Native: capture the card as a 1080×1350 PNG and open the system share sheet
  // (Telegram, Instagram, gallery…). Web / failure: share the same content as text.
  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && cardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: 1350, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('share.dialogTitle'), UTI: 'public.png' });
      } else {
        await shareText();
      }
    } catch {
      showAlert(t('share.errorTitle'), t('share.errorBody'));
      await shareText();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: theme.colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
      >
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, gap: spacing.lg, alignItems: 'center' }}>
          {/* ---- the card that becomes the PNG (4:5) ---- */}
          <View
            ref={cardRef}
            collapsable={false}
            style={{ width: 300, height: 375, backgroundColor: CARD.bg, borderRadius: 28, padding: 22, overflow: 'hidden', justifyContent: 'space-between' }}
          >
            <View style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(217,138,61,0.22)' }} />
            <View style={{ position: 'absolute', left: -50, bottom: -70, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(127,211,201,0.12)' }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={require('@/assets/luna/luna-avatar.jpg')} style={{ width: 30, height: 30, borderRadius: 15 }} />
              <AppText weight="extraBold" size="md" color={CARD.ink}>
                Focus <AppText weight="extraBold" size="md" color={CARD.gold}>AI</AppText>
              </AppText>
            </View>

            <View>
              <AppText weight="extraBold" color={CARD.gold} style={{ fontSize: 76, lineHeight: 82 }}>
                {stats.streak}
              </AppText>
              <AppText weight="bold" size="md" color={CARD.ink}>
                🔥 {t('share.cardStreak')}
              </AppText>
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ backgroundColor: CARD.panel, borderColor: CARD.line, borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <AppText size="xs" color={CARD.ink2}>{t('share.cardWeek')}</AppText>
                  <AppText weight="extraBold" size="md" color={CARD.ink}>{formatMinutes(t, stats.weekMinutes)}</AppText>
                </View>
                {change ? (
                  <View style={{ backgroundColor: (stats.weekChange ?? 0) > 0 ? CARD.sea : CARD.fox, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <AppText size="xs" weight="extraBold" color={CARD.bg}>{change}</AppText>
                  </View>
                ) : null}
              </View>
              <View style={{ backgroundColor: CARD.panel, borderColor: CARD.line, borderWidth: 1, borderRadius: 16, padding: 12 }}>
                <AppText size="xs" color={CARD.ink2}>{t('share.cardLevel')} {stats.level}</AppText>
                <AppText weight="extraBold" size="md" color={CARD.ink} numberOfLines={1}>⭐ {stats.levelTitle}</AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText size="xs" weight="bold" color={CARD.fox}>{t('share.cardTagline')}</AppText>
              <AppText size="xs" color={CARD.ink2}>{SHARE_URL.replace('https://', '')}</AppText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md, width: 300 }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={{ flex: 1, paddingVertical: 14, borderRadius: radius.full, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center' }}
            >
              <AppText weight="bold" color={theme.colors.primary}>{t('share.close')}</AppText>
            </Pressable>
            <Pressable
              onPress={onShare}
              accessibilityRole="button"
              disabled={busy}
              style={{ flex: 1.4, paddingVertical: 14, borderRadius: radius.full, backgroundColor: theme.colors.primary, alignItems: 'center' }}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <AppText weight="bold" color="#fff">{t('share.shareButton')} ↗</AppText>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
