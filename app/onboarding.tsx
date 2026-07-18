import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingSlideItem } from '@/components/onboarding/OnboardingSlideItem';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  image: ImageSourcePropType;
}

const SLIDES: Slide[] = [
  { key: 'focus', image: require('@/assets/images/onboarding-focus.png') },
  { key: 'track', image: require('@/assets/images/onboarding-track.png') },
  { key: 'ai', image: require('@/assets/images/onboarding-ai.png') },
  { key: 'pomodoro', image: require('@/assets/images/onboarding-pomodoro.png') },
];

export default function OnboardingScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
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
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <Screen edges={['top', 'bottom']} style={{ padding: 0 }}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Pressable onPress={finish} hitSlop={10}>
          <AppText variant="tertiary" size="sm" weight="medium">
            {t('onboarding.skip')}
          </AppText>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <OnboardingSlideItem
            width={width}
            image={item.image}
            title={t(`onboarding.slides.${item.key}.title`)}
            description={t(`onboarding.slides.${item.key}.description`)}
          />
        )}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.key}
              style={{
                width: dotIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotIndex === index ? theme.colors.primary : theme.colors.border,
              }}
            />
          ))}
        </View>

        <Button
          label={isLast ? t('onboarding.start') : t('onboarding.next')}
          onPress={goNext}
          iconName={isLast ? 'rocket' : 'arrow-forward'}
        />
      </View>
    </Screen>
  );
}
