import { useUserStore } from '@/store/userStore';

function isEnabled(): boolean {
  return useUserStore.getState().soundEnabled;
}

// TODO: expo-audio caused an immediate crash on launch in two separate preview builds
// now — once with a top-level import, once with a dynamic `await import('expo-audio')`
// inside a try/catch. Since the dynamic-import + try/catch attempt still crashed, the
// failure is likely a native-level crash (not a catchable JS error), so it needs a real
// device/Logcat trace before trying again. For now this is a safe no-op so the "Ovoz"
// toggle exists and persists without playing anything.
export async function playCompletionSound(): Promise<void> {
  if (!isEnabled()) return;
}
