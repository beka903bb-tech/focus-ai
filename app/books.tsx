import { Linking, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { BookRecommendation, BOOK_LIST } from '@/constants/books';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useToastStore } from '@/store/toastStore';

export default function BooksScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const habits = useHabitStore((state) => state.habits);
  const addHabit = useHabitStore((state) => state.addHabit);

  const formatReadingTime = (hours: number) =>
    hours < 1
      ? t('books.readingTimeMinutesLabel', { minutes: Math.round(hours * 60) })
      : t('books.readingTimeLabel', { hours });

  // Readable-in-app titles first — Array.prototype.sort is stable, so within each
  // group (readable / not) the original constants/books.ts order is preserved.
  const sortedBooks = [...BOOK_LIST].sort((a, b) => Number(!!b.content) - Number(!!a.content));
  const readableBooks = sortedBooks.filter((book) => !!book.content);

  const handleStart = (book: BookRecommendation) => {
    const habitName = `📖 ${book.title}`;
    if (habits.some((habit) => habit.name === habitName)) {
      useToastStore.getState().showToast(t('books.alreadyAdded'));
      return;
    }
    addHabit({
      name: habitName,
      iconKey: 'book',
      colorKey: book.coverColor,
      durationMinutes: 30,
      frequency: [],
    });
    useToastStore.getState().showToast(t('books.addedToast', { title: book.title }));
    router.back();
  };

  return (
    <Screen scroll>
      <BackHeader title={t('books.title')} />

      {readableBooks.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <AppText weight="bold" size="md">
            {t('books.readableShelfTitle')}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
            style={{ marginHorizontal: -spacing.xl }}
          >
            <View style={{ width: spacing.xl }} />
            {readableBooks.map((book) => (
              <Pressable
                key={book.id}
                onPress={() => router.push({ pathname: '/book-reader', params: { bookId: book.id } })}
                style={{ width: 128 }}
              >
                <View
                  style={{
                    width: 128,
                    height: 96,
                    borderRadius: radius.lg,
                    backgroundColor: `${book.coverColor}26`,
                    borderWidth: 1,
                    borderColor: `${book.coverColor}55`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.xs,
                  }}
                >
                  <AppIcon name="book" color={book.coverColor} size={30} />
                </View>
                <AppText weight="semiBold" size="xs" numberOfLines={2}>
                  {book.title}
                </AppText>
                <AppText size="xs" variant="tertiary" numberOfLines={1}>
                  {book.author}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        {sortedBooks.map((book) => {
          const isReadable = !!book.content;
          return (
          <Card
            key={book.id}
            style={{
              gap: spacing.md,
              borderColor: isReadable ? book.coverColor : theme.colors.border,
              borderWidth: isReadable ? 1.5 : 1,
            }}
          >
            {isReadable ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 3,
                  borderRadius: radius.full,
                  backgroundColor: `${book.coverColor}22`,
                }}
              >
                <AppIcon name="sparkles" color={book.coverColor} size={12} />
                <AppText size="xs" weight="bold" style={{ color: book.coverColor }}>
                  {t('books.readableBadge')}
                </AppText>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius.md,
                  backgroundColor: `${book.coverColor}26`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="book" color={book.coverColor} size={24} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText weight="bold" size="md">
                  {book.title}
                </AppText>
                <AppText size="xs" variant="secondary">
                  {book.author}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 }}>
                  <View
                    style={{
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: radius.full,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                  >
                    <AppText size="xs" variant="tertiary">
                      {t(`books.genres.${book.genreKey}`)}
                    </AppText>
                  </View>
                  <AppText size="xs" variant="tertiary">
                    •
                  </AppText>
                  <AppText size="xs" variant="tertiary">
                    {formatReadingTime(book.estimatedHours)}
                  </AppText>
                </View>
              </View>
            </View>

            <AppText size="sm" variant="secondary" style={{ lineHeight: 20 }}>
              {t(`books.items.${book.id}.description`)}
            </AppText>

            {book.content ? (
              <Button
                label={t('books.readButton')}
                variant="outline"
                iconName="reader-outline"
                onPress={() => router.push({ pathname: '/book-reader', params: { bookId: book.id } })}
              />
            ) : null}

            <Button label={t('books.startButton')} onPress={() => handleStart(book)} iconName="book" />

            {book.amazonUrl ? (
              <Button
                label={t('books.amazonButton')}
                variant="ghost"
                iconName="open-outline"
                onPress={() => Linking.openURL(book.amazonUrl!)}
              />
            ) : null}
          </Card>
          );
        })}
      </View>

      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: radius.lg,
          padding: spacing.lg,
        }}
      >
        <AppText size="sm" variant="tertiary" style={{ textAlign: 'center' }}>
          {t('books.comingSoon')}
        </AppText>
      </View>
    </Screen>
  );
}
