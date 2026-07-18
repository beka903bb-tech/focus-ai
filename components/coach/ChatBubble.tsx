import { View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface ChatBubbleProps {
  text: string;
  from: 'bot' | 'user';
}

export function ChatBubble({ text, from }: ChatBubbleProps) {
  const theme = usePalette();
  const isBot = from === 'bot';

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: isBot ? 'flex-start' : 'flex-end',
      }}
    >
      {isBot ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="hardware-chip" color={theme.colors.primary} size={15} />
        </View>
      ) : null}
      <View
        style={{
          maxWidth: '85%',
          backgroundColor: isBot ? theme.colors.surface : theme.colors.primary,
          borderWidth: isBot ? 1 : 0,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          borderTopLeftRadius: isBot ? 4 : radius.lg,
          borderTopRightRadius: isBot ? radius.lg : 4,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        }}
      >
        <AppText size="sm" color={isBot ? theme.colors.textPrimary : theme.colors.onPrimary} style={{ lineHeight: 20 }}>
          {text}
        </AppText>
      </View>
    </View>
  );
}
