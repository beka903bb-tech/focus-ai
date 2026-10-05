import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { Platform, View } from 'react-native';
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
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
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
      {/* Web: on a wide screen the app sits in a centered, phone-width "book page" column
          instead of stretching edge to edge. */}
      <View
        style={
          Platform.OS === 'web'
            ? { flex: 1, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center' }
            : { flex: 1, backgroundColor: theme.colors.background }
        }
      >
      <View
        style={
          Platform.OS === 'web'
            ? {
                flex: 1,
                width: '100%',
                maxWidth: 520,
                backgroundColor: theme.colors.background,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: theme.colors.border,
              }
            : { flex: 1 }
        }
      >
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
      </View>
    </GestureHandlerRootView>
  );
}
