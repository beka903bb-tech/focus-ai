import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageSourcePropType, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AppText } from '@/components/ui/AppText';

// Same petrol + caramel look as the landing page and the intro film.
export const ONBOARDING_COLORS = {
  petrol: '#0A2627',
  cream: '#F6EBDD',
  creamSoft: 'rgba(246,235,221,0.82)',
  gold: '#E6B66A',
  caramel: '#D98B3F',
  line: 'rgba(230,182,106,0.35)',
};

interface OnboardingSlideItemProps {
  width: number;
  height: number;
  image: ImageSourcePropType;
  tag: string;
  number: string;
  title: string;
  description: string;
  active: boolean;
  /** Space kept free at the bottom for the dots + button overlay. */
  bottomInset: number;
}

/** Full-bleed frame from the intro film, a petrol fade at the bottom and the site's caption style. */
export function OnboardingSlideItem({
  width,
  height,
  image,
  tag,
  number,
  title,
  description,
  active,
  bottomInset,
}: OnboardingSlideItemProps) {
  const zoom = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(active ? 1 : 0)).current;

  // Slow "Ken Burns" push-in, like the film; native driver so it stays smooth.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [zoom]);

  // Caption rises in each time the slide becomes active.
  useEffect(() => {
    if (active) {
      reveal.setValue(0);
      Animated.timing(reveal, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [active, reveal]);

  const scale = zoom.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.09] });
  const translateY = reveal.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: ONBOARDING_COLORS.petrol }}>
      <Animated.Image
        source={image}
        resizeMode="cover"
        style={{ position: 'absolute', width, height, transform: [{ scale }] }}
      />
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="0.45" />
            <Stop offset="0.16" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="0" />
            <Stop offset="0.38" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="0" />
            <Stop offset="0.56" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="0.78" />
            <Stop offset="0.7" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="0.94" />
            <Stop offset="1" stopColor={ONBOARDING_COLORS.petrol} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#fade)" />
      </Svg>

      <Animated.View
        style={{
          position: 'absolute',
          left: 28,
          right: 28,
          bottom: bottomInset,
          gap: 12,
          opacity: reveal,
          transform: [{ translateY }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppText weight="extraBold" size="sm" color={ONBOARDING_COLORS.gold} style={{ letterSpacing: 2 }}>
            {number}
          </AppText>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: ONBOARDING_COLORS.line,
              backgroundColor: 'rgba(10,38,39,0.55)',
            }}
          >
            <AppText size="xs" weight="bold" color={ONBOARDING_COLORS.cream}>
              {tag}
            </AppText>
          </View>
        </View>
        <AppText
          weight="extraBold"
          color={ONBOARDING_COLORS.gold}
          style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.5 }}
        >
          {title}
        </AppText>
        <AppText size="md" color={ONBOARDING_COLORS.creamSoft} style={{ lineHeight: 23 }}>
          {description}
        </AppText>
      </Animated.View>
    </View>
  );
}
