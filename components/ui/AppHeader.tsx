import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';

interface AppHeaderProps {
  rightElement?: React.ReactNode;
}

export function AppHeader({ rightElement }: AppHeaderProps) {
  const theme = usePalette();
  const { t } = useTranslation();
  const name = useUserStore((state) => state.name);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <AppIcon name="flash" color={theme.colors.primary} size={20} />
        <AppText weight="extraBold" size="lg">
          {t('common.brandName')}
        </AppText>
      </View>
      {rightElement ?? (
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Avatar name={name || 'F A'} size={38} />
        </Pressable>
      )}
    </View>
  );
}

interface BackHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function BackHeader({ title, rightElement, onBack }: BackHeaderProps) {
  const theme = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <AppIcon name="chevron-back" color={theme.colors.textPrimary} size={20} />
        </Pressable>
        <AppText weight="bold" size="xl" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </AppText>
      </View>
      {rightElement}
    </View>
  );
}
