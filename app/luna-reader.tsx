import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { appWidth } from '@/constants/layout';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Screen } from '@/components/ui/Screen';
import PageFlipBook from '@/components/books/PageFlipBook';
import { radius, spacing } from '@/constants/theme';
import { LUNA_BOOKS, LunaPage } from '@/constants/lunaBooks';
import { usePalette } from '@/store/themeStore';
import { LUNA_AUDIO } from '@/constants/lunaAudio';
import { playNarration, stopNarration } from '@/utils/narration';

// PageFlipBook wraps its card in paddingHorizontal: spacing.xl, and each page card
// itself adds padding: spacing.lg — so the illustration's available width is the
// screen width minus both, on both sides. Computed from the actual screen so it
// scales correctly across phone sizes instead of a fixed pixel value.
// Also capped by screen height so on a laptop the whole page (picture, text, buttons) fits
// without scrolling.
const CARD_CONTENT_WIDTH = Math.min(
  appWidth() - (spacing.xl + spacing.lg) * 2,
  Math.round(Dimensions.get('window').height * 0.42)
);

// Falls back to an accent-tinted placeholder for any page that doesn't (yet) have
// an `image` asset — every current Luna page has one, but new pages might not.
function PageIllustration({ page, accent }: { page: LunaPage; accent: string }) {
  if (page.image) {
    return (
      <Image
        source={page.image}
        style={{
          width: CARD_CONTENT_WIDTH,
          height: CARD_CONTENT_WIDTH,
          borderRadius: radius.md,
          alignSelf: 'center',
          marginBottom: spacing.md,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: CARD_CONTENT_WIDTH,
        height: CARD_CONTENT_WIDTH,
        borderRadius: radius.md,
        backgroundColor: `${accent}1f`,
        borderWidth: 1,
        borderColor: `${accent}45`,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.md,
      }}
    >
      <AppIcon name="paw" color={accent} size={page.type === 'cover' ? 40 : 32} />
    </View>
  );
}

function LunaPageBody({ page, accent }: { page: LunaPage; accent: string }) {
  const theme = usePalette();
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PageIllustration page={page} accent={accent} />
      <View
        style={{
          borderWidth: 1,
          borderColor: `${accent}40`,
          borderRadius: radius.lg,
          backgroundColor: theme.colors.surfaceAlt,
          padding: spacing.md,
          gap: spacing.xs,
          alignItems: 'center',
        }}
      >
        {page.tag && page.type === 'story' ? (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 3,
              borderRadius: radius.full,
              backgroundColor: `${accent}22`,
            }}
          >
            <AppText size="xs" weight="bold" style={{ color: accent }}>
              {page.tag}
            </AppText>
          </View>
        ) : null}
        <AppText
          size={page.type === 'cover' ? 'lg' : 'md'}
          weight={page.type === 'cover' ? 'bold' : 'regular'}
          style={{ textAlign: 'center', lineHeight: page.type === 'cover' ? 26 : 24 }}
        >
          {page.textUz}
        </AppText>
      </View>
    </View>
  );
}

export default function LunaReaderScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const book = LUNA_BOOKS.find((item) => item.id === bookId);
  const audio = book ? LUNA_AUDIO[book.id] : undefined;
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Turning the page stops the previous page's narration.
  const onPageChange = useCallback((next: number) => {
    setPage(next);
    setPlaying(false);
    stopNarration();
  }, []);
  useEffect(() => () => {
    stopNarration();
  }, []);

  const toggleListen = () => {
    const clip = audio?.[page];
    if (!clip) return;
    if (playing) {
      stopNarration();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    playNarration(clip, () => setPlaying(false));
  };

  if (!book) {
    return (
      <Screen>
        <BackHeader title={t('books.title')} />
        <AppText variant="secondary" size="sm">
          {t('books.readerEmpty')}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <BackHeader title={book.titleUz} />
      </View>

      <View style={{ alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md, paddingHorizontal: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: spacing.md,
            paddingVertical: 3,
            borderRadius: radius.full,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <AppIcon name="happy-outline" color={theme.colors.textSecondary} size={12} />
          <AppText size="xs" weight="semiBold" variant="secondary">
            {t('luna.ageRangeLabel', { range: book.ageRange })}
          </AppText>
        </View>
        {audio?.[page] ? (
          <Pressable
            onPress={toggleListen}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radius.full,
              backgroundColor: book.coverColor,
            }}
          >
            <AppIcon name={playing ? 'stop' : 'volume-high'} color={theme.colors.onPrimary} size={16} />
            <AppText size="sm" weight="bold" color={theme.colors.onPrimary}>
              {playing ? t('books.stop') : t('books.listen')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <PageFlipBook
        pages={book.pages.map((page) => page.textUz)}
        accent={book.coverColor}
        // Image fills the card width (square), so its height scales with the
        // screen; the rest is headroom for the tag badge + up to ~5 lines of text.
        stageHeight={CARD_CONTENT_WIDTH + 210}
        onPageChange={onPageChange}
        renderPage={(pageIndex) => <LunaPageBody page={book.pages[pageIndex]} accent={book.coverColor} />}
      />
    </Screen>
  );
}
