import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { fontFamily } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

export default function TabsLayout() {
  const theme = usePalette();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <AppIcon name="home" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t('tabs.statistics'),
          tabBarIcon: ({ color, size }) => <AppIcon name="bar-chart" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: t('tabs.coach'),
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="hardware-chip" color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <AppIcon name="person" color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
