// 3D page-flip reader for book pages. Ported from a standalone reference component into
// this app's design system (usePalette instead of hardcoded hex, AppText for fonts).
// Requires react-native-reanimated + react-native-gesture-handler (GestureHandlerRootView
// is already mounted once at the app root in app/_layout.tsx — no extra setup needed here).
import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

const DUR = 650;
const EASE = Easing.bezier(0.4, 0.15, 0.2, 1);

interface PageFlipBookProps {
  pages: string[];
  title?: string;
  subtitle?: string;
  accent?: string;
}

function PageCard({ text, accent, cardBg }: { text: string; accent: string; cardBg: string }) {
  return (
    <View style={[styles.card, { borderColor: `${accent}33`, backgroundColor: cardBg }]}>
      <AppText size="md" style={styles.cardText}>
        {text}
      </AppText>
    </View>
  );
}

function Dots({
  count,
  active,
  accent,
  inactiveColor,
}: {
  count: number;
  active: number;
  accent: string;
  inactiveColor: string;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, k) => (
        <View
          key={k}
          style={[
            styles.dot,
            k === active ? { width: 18, backgroundColor: accent } : { width: 7, backgroundColor: inactiveColor },
          ]}
        />
      ))}
    </View>
  );
}

export default function PageFlipBook({ pages = [], title, subtitle, accent }: PageFlipBookProps) {
  const theme = usePalette();
  const resolvedAccent = accent ?? theme.colors.primary;
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const rotate = useSharedValue(0);
  const shade = useSharedValue(0);

  const last = pages.length - 1;

  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1400 }, { rotateY: `${rotate.value}deg` }],
  }));
  const shadeStyle = useAnimatedStyle(() => ({ opacity: shade.value }));

  const goNext = useCallback(() => {
    if (busy || index >= last) return;
    setBusy(true);
    shade.value = withTiming(0.28, { duration: DUR, easing: EASE });
    rotate.value = withTiming(-165, { duration: DUR, easing: EASE }, (fin) => {
      'worklet';
      if (fin) {
        rotate.value = 0;
        shade.value = 0;
        runOnJS(setIndex)(index + 1);
        runOnJS(setBusy)(false);
      }
    });
  }, [busy, index, last, rotate, shade]);

  const goPrev = useCallback(() => {
    if (busy || index <= 0) return;
    setBusy(true);
    setIndex(index - 1);
    // Once the new page has re-rendered, open it back in from the edge.
    rotate.value = -165;
    shade.value = 0.28;
    requestAnimationFrame(() => {
      shade.value = withTiming(0, { duration: DUR, easing: EASE });
      rotate.value = withTiming(0, { duration: DUR, easing: EASE }, (fin) => {
        'worklet';
        if (fin) runOnJS(setBusy)(false);
      });
    });
  }, [busy, index, rotate, shade]);

  const pan = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        'worklet';
        if (e.translationX < -40) runOnJS(goNext)();
        else if (e.translationX > 40) runOnJS(goPrev)();
      }),
    [goNext, goPrev]
  );

  if (!pages.length) return null;

  const underText = pages[Math.min(index + 1, last)];
  const leafText = pages[index];

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap}>
        {!!title && (
          <AppText weight="semiBold" size="md" style={styles.title}>
            {title}
          </AppText>
        )}
        {!!subtitle && (
          <AppText size="sm" variant="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}

        <View style={styles.stage}>
          {/* Underlying (next) page — static */}
          <View style={styles.abs}>
            <PageCard text={underText} accent={resolvedAccent} cardBg={theme.colors.surface} />
          </View>

          {/* The flipping leaf */}
          <Animated.View style={[styles.abs, styles.leaf, leafStyle]}>
            <PageCard text={leafText} accent={resolvedAccent} cardBg={theme.colors.surface} />
          </Animated.View>

          {/* Depth shading */}
          <Animated.View pointerEvents="none" style={[styles.shade, shadeStyle]} />
        </View>

        <Dots count={pages.length} active={index} accent={resolvedAccent} inactiveColor={theme.colors.border} />
        <AppText size="xs" variant="tertiary" style={styles.hint}>
          swipe left / right
        </AppText>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: spacing.md },
  stage: { height: 380, position: 'relative' },
  abs: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  leaf: {
    transformOrigin: 'left',
    backfaceVisibility: 'hidden',
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardText: { lineHeight: 25 },
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderRadius: radius.lg,
  },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: spacing.md },
  dot: { height: 7, borderRadius: 4 },
  hint: { textAlign: 'center', marginTop: spacing.sm },
});
