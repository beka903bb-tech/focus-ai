import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { View } from 'react-native';
import '@/i18n';
import { ToastHost } from '@/components/ui/ToastHost';
import { useDailyReminder } from '@/hooks/useDailyReminder';
import { useGlobalTimerWatcher } from '@/hooks/useGlobalTimerWatcher';
import { useSessionNotifications } from '@/hooks/useSessionNotifications';
import { usePalette, useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useLocaleStore } from '@/store/localeStore';
import { useCoachProfileStore } from '@/store/coachProfileStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const themeHydrated = useThemeStore((state) => state.hasHydrated);
  const userHydrated = useUserStore((state) => state.hasHydrated);
  const localeHydrated = useLocaleStore((state) => state.hasHydrated);
  const coachProfileHydrated = useCoachProfileStore((state) => state.hasHydrated);
  const theme = usePalette();
  const ready = fontsLoaded && themeHydrated && userHydrated && localeHydrated && coachProfileHydrated;

  useGlobalTimerWatcher();
  useSessionNotifications();
  useDailyReminder();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="focus-session" options={{ presentation: 'card' }} />
          <Stack.Screen name="add-habit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="coach-profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="books" options={{ presentation: 'modal' }} />
          <Stack.Screen name="book-reader" options={{ presentation: 'card' }} />
        </Stack>
        <ToastHost />
      </View>
    </GestureHandlerRootView>
  );
}
