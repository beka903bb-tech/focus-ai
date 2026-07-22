import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { BOOK_LIST } from '@/constants/books';

const { width } = Dimensions.get('window');

export default function BookReaderScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const book = BOOK_LIST.find((item) => item.id === bookId);
  const listRef = useRef<FlatList<string>>(null);
  const [index, setIndex] = useState(0);

  if (!book || !book.content || book.content.length === 0) {
    return (
      <Screen>
        <BackHeader title={t('books.title')} />
        <AppText variant="secondary" size="sm">
          {t('books.readerEmpty')}
        </AppText>
      </Screen>
    );
  }

  const pages = book.content;
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  return (
    <Screen edges={['top', 'bottom']} style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <BackHeader title={book.title} />
      </View>

      <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, paddingHorizontal: spacing.xl }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.lg,
            backgroundColor: `${book.coverColor}22`,
            borderWidth: 1,
            borderColor: `${book.coverColor}55`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="book" color={book.coverColor} size={30} />
        </View>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <AppText weight="bold" size="lg" style={{ textAlign: 'center' }}>
            {book.title}
          </AppText>
          <AppText size="sm" variant="secondary">
            {book.author}
          </AppText>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={pages}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: spacing.xl }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Card style={{ borderColor: `${book.coverColor}33` }}>
                <AppText size="md" style={{ lineHeight: 29 }} selectable>
                  {item}
                </AppText>
              </Card>
            </ScrollView>
          </View>
        )}
      />

      {pages.length > 1 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.lg,
          }}
        >
          {pages.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={{
                width: dotIndex === index ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: dotIndex === index ? book.coverColor : theme.colors.border,
              }}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
