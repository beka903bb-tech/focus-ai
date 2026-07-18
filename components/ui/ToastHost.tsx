import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useToastStore } from '@/store/toastStore';

const DISPLAY_DURATION_MS = 1800;
const ANIMATION_MS = 220;
const HIDDEN_OFFSET = -120;

export function ToastHost() {
  const theme = usePalette();
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const toastKey = useToastStore((state) => state.key);
  const hideToast = useToastStore((state) => state.hideToast);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    translateY.setValue(HIDDEN_OFFSET);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }),
      Animated.timing(opacity, { toValue: 1, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: HIDDEN_OFFSET, duration: ANIMATION_MS, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
      ]).start(() => hideToast());
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastKey]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + spacing.md,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Animated.View
        style={{
          width: '90%',
          backgroundColor: theme.colors.primary,
          borderRadius: radius.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <AppText weight="semiBold" size="sm" color={theme.colors.onPrimary} numberOfLines={1} style={{ textAlign: 'center' }}>
          {message}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}
