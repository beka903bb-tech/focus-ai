import { useRef, useState } from 'react';
import {
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ONBOARDING_COLORS, OnboardingSlideItem } from '@/components/onboarding/OnboardingSlideItem';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { appWidth } from '@/constants/layout';
import { useUserStore } from '@/store/userStore';

interface Slide {
  key: string;
  image: ImageSourcePropType;
}

// Frames from the intro film (same petrol + caramel world as the landing page),
// captions = the landing's four feature cards.
const SLIDES: Slide[] = [
  { key: 'time', image: require('@/assets/onboarding/time.jpg') },
  { key: 'streak', image: require('@/assets/onboarding/streak.jpg') },
  { key: 'coach', image: require('@/assets/onboarding/coach.jpg') },
  { key: 'luna', image: require('@/assets/onboarding/luna.jpg') },
];

const CONTROLS_HEIGHT = 128;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const width = appWidth();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const finish = () => {
    completeOnboarding();
    router.replace('/login');
  };

  const goNext = () => {
    if (index === SLIDES.length - 1) {
      finish();
      return;
    }
    const next = index + 1;
    // Update the index right away (on web the momentum event never fires).
    setIndex(next);
    if (Platform.OS === 'web') return;
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const isLast = index === SLIDES.length - 1;
  const bottomInset = CONTROLS_HEIGHT + insets.bottom + 8;

  const renderSlide = (item: Slide, i: number) => (
    <OnboardingSlideItem
      width={width}
      height={height}
      image={item.image}
      number={`0${i + 1}`}
      tag={t(`onboarding.slides.${item.key}.tag`)}
      title={t(`onboarding.slides.${item.key}.title`)}
      description={t(`onboarding.slides.${item.key}.description`)}
      active={i === index}
      bottomInset={bottomInset}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: ONBOARDING_COLORS.petrol }}>
      <StatusBar style="light" />

      {Platform.OS === 'web' ? (
        // Web: browser scroll-snap fights programmatic paging, so show one slide at a time.
        <View style={{ flex: 1 }}>{renderSlide(SLIDES[index], index)}</View>
      ) : (
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          bounces={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          renderItem={({ item, index: i }) => renderSlide(item, i)}
        />
      )}

      {/* Skip — same dark pill as on the intro film */}
      <Pressable
        onPress={finish}
        hitSlop={10}
        accessibilityRole="button"
        style={{
          position: 'absolute',
          top: insets.top + 12,
          right: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(10,38,39,0.6)',
          borderWidth: 1,
          borderColor: ONBOARDING_COLORS.line,
        }}
      >
        <AppText size="sm" weight="semiBold" color={ONBOARDING_COLORS.cream}>
          {t('onboarding.skip')}
        </AppText>
      </Pressable>

      <View
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: insets.bottom + 20,
          gap: 22,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.key}
              style={{
                width: dotIndex === index ? 26 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotIndex === index ? ONBOARDING_COLORS.gold : 'rgba(246,235,221,0.3)',
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          style={({ pressed }) => ({
            height: 58,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            backgroundColor: ONBOARDING_COLORS.caramel,
            borderWidth: 1,
            borderColor: 'rgba(246,235,221,0.35)',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <AppIcon name={isLast ? 'rocket' : 'arrow-forward'} color="#fff" size={20} />
          <AppText weight="extraBold" size="lg" color="#fff">
            {isLast ? t('onboarding.start') : t('onboarding.next')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
