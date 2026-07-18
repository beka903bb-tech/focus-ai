import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { StatChip } from '@/components/ui/StatChip';
import { ChatBubble } from '@/components/coach/ChatBubble';
import { SuggestionChip } from '@/components/coach/SuggestionChip';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useCoachProfileStore } from '@/store/coachProfileStore';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { useLocaleStore } from '@/store/localeStore';
import { analyzeHabits, buildCoachContext, dailyQuote, dailyTip, motivationBoost } from '@/utils/coach';
import { askDeepSeekCoach, DeepSeekCoachError } from '@/utils/deepseekCoach';
import { calculateOverallStreak, completionPercent } from '@/utils/streak';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

export default function CoachScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const language = useLocaleStore((state) => state.language);
  const coachProfile = useCoachProfileStore((state) => state.coachProfile);
  const habits = useHabitStore((state) => state.habits);
  const sessions = useSessionStore((state) => state.sessions);
  const overallStreak = calculateOverallStreak(habits);
  const todayPercent = completionPercent(habits);
  const avgSessionMinutes = sessions.length
    ? (sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / sessions.length).toFixed(1)
    : '0';

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', from: 'bot', text: t('coach.welcomeMessage') },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const pushMessage = (from: Message['from'], text: string) => {
    setMessages((prev) => [...prev, { id: `${from}_${Date.now()}_${Math.random()}`, from, text }]);
  };

  // Auto-collapse the stats block when the keyboard opens, so the chat/reply gets the
  // freed-up vertical space instead of getting squeezed under the keyboard.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(showEvent, () => {
      setStatsCollapsed(true);
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => subscription.remove();
  }, []);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;
    setDraft('');
    pushMessage('user', trimmed);
    setIsSending(true);
    try {
      const context = buildCoachContext(t, habits, sessions, overallStreak, coachProfile);
      const history = messages.map((message) => ({ from: message.from, text: message.text }));
      const reply = await askDeepSeekCoach(trimmed, context, language, history);
      pushMessage('bot', reply);
    } catch (error) {
      if (error instanceof DeepSeekCoachError) {
        pushMessage('bot', t(error.i18nKey, error.params));
      } else {
        pushMessage('bot', t('coach.connectionError'));
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestion = (label: string, generator: () => string) => {
    pushMessage('user', label);
    setTimeout(() => pushMessage('bot', generator()), 400);
  };

  return (
    <Screen style={{ padding: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={{ padding: spacing.xl, paddingBottom: 0, gap: spacing.md, flexShrink: 0 }}>
          <AppHeader />

          <Pressable
            onPress={() => setStatsCollapsed((prev) => !prev)}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4 }}
          >
            <AppText size="xs" variant="tertiary">
              {statsCollapsed ? t('coach.showStats') : t('coach.hideStats')}
            </AppText>
            <AppIcon
              name={statsCollapsed ? 'chevron-down' : 'chevron-up'}
              color={theme.colors.textTertiary}
              size={16}
            />
          </Pressable>

          {!statsCollapsed ? (
            <View style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  backgroundColor: theme.colors.primaryMuted,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                }}
              >
                <AppIcon name="bookmark" color={theme.colors.primary} size={18} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText weight="semiBold" size="xs" color={theme.colors.primary}>
                    {t('coach.todayMotivation')}
                  </AppText>
                  <AppText size="sm" style={{ lineHeight: 19, fontStyle: 'italic' }} variant="secondary">
                    "{dailyQuote(t)}"
                  </AppText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <StatChip value={`${overallStreak}`} label={t('coach.streakLabel')} iconName="flame" />
                <StatChip
                  value={`${todayPercent}%`}
                  label={t('coach.completedLabel')}
                  iconName="checkmark-done"
                  valueColor={theme.colors.primary}
                />
                <StatChip value={avgSessionMinutes} label={t('coach.avgSessionLabel')} iconName="timer" />
                <StatChip
                  value={`${sessions.length}`}
                  label={t('coach.sessionsLabel')}
                  iconName="rocket"
                  valueColor={theme.colors.secondary}
                />
              </View>
            </View>
          ) : null}
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} from={message.from} text={message.text} />
          ))}
          {isSending ? <ChatBubble from="bot" text={t('coach.typing')} /> : null}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexShrink: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
            keyboardShouldPersistTaps="handled"
          >
            <SuggestionChip
              label={t('coach.suggestionAnalyze')}
              iconName="stats-chart"
              onPress={() =>
                handleSuggestion(t('coach.suggestionAnalyze'), () => analyzeHabits(t, habits, sessions, overallStreak))
              }
            />
            <SuggestionChip
              label={t('coach.suggestionTip')}
              iconName="bulb"
              onPress={() => handleSuggestion(t('coach.suggestionTip'), () => dailyTip(t, habits))}
            />
            <SuggestionChip
              label={t('coach.suggestionMotivation')}
              iconName="flame"
              onPress={() => handleSuggestion(t('coach.suggestionMotivation'), () => motivationBoost(t, overallStreak))}
            />
            <SuggestionChip
              label={t('coach.suggestionGoal')}
              iconName="flag"
              onPress={() => router.push('/coach-profile')}
            />
          </ScrollView>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xl,
            flexShrink: 0,
          }}
        >
          <View style={{ flex: 1 }}>
            <Input
              placeholder={t('coach.inputPlaceholder')}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isSending}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={isSending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSending ? 0.6 : 1,
            }}
          >
            <AppIcon name="send" color={theme.colors.onPrimary} size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
