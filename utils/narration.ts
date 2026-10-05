import { Audio } from 'expo-av';

// Plays one narration clip at a time (a page of a Luna book). Starting a new clip stops the
// previous one; `onEnd` fires when the clip finishes on its own.
let current: Audio.Sound | null = null;

export async function stopNarration(): Promise<void> {
  const sound = current;
  current = null;
  if (!sound) return;
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    // already unloaded
  }
}

export async function playNarration(source: number, onEnd?: () => void): Promise<void> {
  await stopNarration();
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
    current = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        if (current === sound) current = null;
        sound.unloadAsync().catch(() => {});
        onEnd?.();
      }
    });
  } catch {
    onEnd?.();
  }
}
