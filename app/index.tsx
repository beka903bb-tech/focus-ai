import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';

// Web: the site's front door is the animated presentation page (public/landing). Its
// "Open the app" button comes back here with ?app=1, which continues into the app itself.
const showLandingFirst = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname === '/';

export default function Index() {
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const { app } = useLocalSearchParams<{ app?: string }>();
  const toLanding = showLandingFirst() && !app;

  useEffect(() => {
    if (toLanding) window.location.replace('/landing/index.html');
  }, [toLanding]);

  if (toLanding) return null;
  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return <Redirect href="/(tabs)" />;
}
