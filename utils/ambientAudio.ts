import { Audio } from 'expo-av';
import { AmbientTrack, useUserStore } from '@/store/userStore';

const TRACK_SOURCES: Partial<Record<AmbientTrack, number>> = {
  brownNoise: require('@/assets/sounds/brown-noise.mp3'),
  pinkNoise: require('@/assets/sounds/pink-noise.mp3'),
  rain: require('@/assets/sounds/rain.mp3'),
  nature: require('@/assets/sounds/nature.mp3'),
};

let sound: Audio.Sound | null = null;
let currentTrack: AmbientTrack = 'none';
let audioModeReady: Promise<void> | null = null;

function isSoundEnabled(): boolean {
  return useUserStore.getState().soundEnabled;
}

function ensureAudioMode(): Promise<void> {
  if (!audioModeReady) {
    audioModeReady = Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }
  return audioModeReady;
}

// Loops the given ambient track from the start. Stops whatever was already playing first.
export async function startAmbient(track: AmbientTrack): Promise<void> {
  await stopAmbient();
  if (track === 'none' || !isSoundEnabled()) return;
  const source = TRACK_SOURCES[track];
  if (!source) return;
  try {
    await ensureAudioMode();
    const { sound: created } = await Audio.Sound.createAsync(source, { isLooping: true, volume: 0.5 });
    sound = created;
    currentTrack = track;
    await sound.playAsync();
  } catch {
    sound = null;
    currentTrack = 'none';
  }
}

export async function pauseAmbient(): Promise<void> {
  if (!sound) return;
  try {
    await sound.pauseAsync();
  } catch {}
}

// Resumes the currently loaded track (no-op if nothing was started or sound got disabled meanwhile).
export async function resumeAmbient(): Promise<void> {
  if (!sound || currentTrack === 'none' || !isSoundEnabled()) return;
  try {
    await sound.playAsync();
  } catch {}
}

export async function stopAmbient(): Promise<void> {
  currentTrack = 'none';
  const toUnload = sound;
  sound = null;
  if (!toUnload) return;
  try {
    await toUnload.stopAsync();
    await toUnload.unloadAsync();
  } catch {}
}
