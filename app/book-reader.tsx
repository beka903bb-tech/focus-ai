import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Screen } from '@/components/ui/Screen';
import PageFlipBook from '@/components/books/PageFlipBook';
import { radius, spacing } from '@/constants/theme';
import { BOOK_LIST } from '@/constants/books';

export default function BookReaderScreen() {
  const { t } = useTranslation();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const book = BOOK_LIST.find((item) => item.id === bookId);

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

      <PageFlipBook pages={book.content} accent={book.coverColor} />
    </Screen>
  );
}
