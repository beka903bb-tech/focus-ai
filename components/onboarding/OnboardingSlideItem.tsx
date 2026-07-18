import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface OnboardingSlideItemProps {
  width: number;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

const FLOAT_DISTANCE = 12;
const FLOAT_LEG_DURATION = 1400;

export function OnboardingSlideItem({ width, image, title, description }: OnboardingSlideItemProps) {
  const theme = usePalette();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: FLOAT_LEG_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: FLOAT_LEG_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [FLOAT_DISTANCE / 2, -FLOAT_DISTANCE / 2],
  });

  const cardSize = Math.min(width - spacing.xl * 2, 280);

  return (
    <View
      style={{
        width,
        flex: 1,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: cardSize,
          height: cardSize,
          borderRadius: radius.xl,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Image
            source={image}
            style={{ width: cardSize * 0.72, height: cardSize * 0.72 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <AppText weight="extraBold" size="xxl" style={{ textAlign: 'center', marginTop: spacing.xl }}>
        {title}
      </AppText>
      <AppText
        variant="secondary"
        size="md"
        style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 }}
      >
        {description}
      </AppText>
    </View>
  );
}
