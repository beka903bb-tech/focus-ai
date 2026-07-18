import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const habitImagesDir = new Directory(Paths.document, 'habit-images');

function ensureDir(): void {
  if (!habitImagesDir.exists) {
    habitImagesDir.create({ intermediates: true, idempotent: true });
  }
}

function makeFileName(sourceUri: string): string {
  const lastSegment = sourceUri.split('/').pop() ?? '';
  const ext = lastSegment.split('.').pop()?.split('?')[0]?.toLowerCase();
  const safeExt = ext && ext.length <= 5 ? ext : 'jpg';
  return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
}

// Copies the picker's (often temporary/cache-scoped) URI into the app's persistent
// document directory so the image survives app restarts.
function persistImage(sourceUri: string): string {
  ensureDir();
  const sourceFile = new File(sourceUri);
  const destFile = new File(habitImagesDir, makeFileName(sourceUri));
  sourceFile.copy(destFile);
  return destFile.uri;
}

// Opens the gallery picker and returns a persistent local URI for the chosen image,
// or null if the user canceled or permission was denied.
export async function pickHabitImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  return persistImage(result.assets[0].uri);
}

export function deleteHabitImage(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // best-effort cleanup only
  }
}
