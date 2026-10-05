import { useCallback, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/ui/AppText';
import { introOverlay } from '@/utils/introTimeline';

// First-launch intro: the same petrol + caramel film as the landing page (cropped to 9:16,
// 2.3 MB, no sound), with the gold «Focus AI» titles drawn on top so they follow the app
// language. Shown once before onboarding; «Skip» or the end of the clip continues.
const GOLD = '#F0B46A';
const SERIF = Platform.select({ android: 'serif', ios: 'Georgia', default: 'Georgia, serif' });

export default function IntroScreen() {
  const { t } = useTranslation();
  const title = useRef(new Animated.Value(0)).current;
  const finale = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.replace('/onboarding');
  }, []);

  // Safety net: never trap the user on the intro if the video can't play on some device.
  useEffect(() => {
    const id = setTimeout(finish, 13000);
    return () => clearTimeout(id);
  }, [finish]);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) finish();
      return;
    }
    const o = introOverlay(status.positionMillis, status.durationMillis ?? 10000);
    title.setValue(o.title);
    finale.setValue(o.finale);
    if (status.didJustFinish) setTimeout(finish, 900);
  };

  return (
    <View style={styles.root}>
      <Video
        source={require('@/assets/intro/intro.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted
        isLooping={false}
        progressUpdateIntervalMillis={80}
        onPlaybackStatusUpdate={onStatus}
      />

      <Animated.View style={[styles.titleWrap, { opacity: title, transform: [{ translateY: title.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
        <AppText style={[styles.gold, { fontFamily: SERIF }]}>Focus AI</AppText>
        <AppText weight="extraBold" style={styles.tagline}>{t('intro.tagline')}</AppText>
      </Animated.View>

      <Animated.View style={[styles.finaleWrap, { opacity: finale }]}>
        <AppText style={[styles.gold, { fontFamily: SERIF }]}>Focus AI</AppText>
        <AppText weight="extraBold" style={styles.tagline}>{t('intro.finale')}</AppText>
      </Animated.View>

      <Pressable onPress={finish} accessibilityRole="button" hitSlop={12} style={styles.skip}>
        <AppText weight="bold" style={{ color: '#F7ECDD' }}>{t('intro.skip')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A2627' },
  titleWrap: { position: 'absolute', left: 0, right: 0, top: '16%', alignItems: 'center' },
  finaleWrap: { position: 'absolute', left: 0, right: 0, bottom: '11%', alignItems: 'center' },
  gold: {
    color: GOLD,
    fontSize: 58,
    lineHeight: 66,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 14,
  },
  tagline: {
    color: '#F7ECDD',
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  skip: {
    position: 'absolute',
    top: 48,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(6,28,29,0.55)',
  },
});
