import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

// Convention: lying flat with the screen facing UP gives z ~ -1g, screen facing DOWN
// gives z ~ +1g (matches the commonly documented expo-sensors/Android SensorManager
// behavior). Not verified on physical hardware in this environment — flip the sign
// here if real-device testing shows the opposite.
const FACE_DOWN_Z_THRESHOLD = 0.75;
const FLAT_XY_THRESHOLD = 0.35;
const UPDATE_INTERVAL_MS = 400;

// Detects whether the phone is lying flat, screen down. Only samples the sensor while
// `enabled` is true (i.e. while a focus session is actively running in the foreground) —
// there is no way to know phone orientation while the screen isn't mounted/foregrounded.
export function useFaceDownDetector(enabled: boolean): boolean {
  const [isFaceDown, setIsFaceDown] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsFaceDown(false);
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    Accelerometer.isAvailableAsync()
      .then((available) => {
        if (!available || cancelled) return;
        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const isFlat = Math.abs(x) < FLAT_XY_THRESHOLD && Math.abs(y) < FLAT_XY_THRESHOLD;
          setIsFaceDown(isFlat && z > FACE_DOWN_Z_THRESHOLD);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      subscription?.remove();
      setIsFaceDown(false);
    };
  }, [enabled]);

  return isFaceDown;
}
