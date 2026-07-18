import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return <Redirect href="/(tabs)" />;
}
