import { Dimensions, Platform } from 'react-native';

// On the web the whole app is rendered in a centered column (see app/_layout.tsx), so
// anything sized from the screen width must use the column width instead.
export const WEB_MAX_WIDTH = 520;

export function appWidth(): number {
  const width = Dimensions.get('window').width;
  return Platform.OS === 'web' ? Math.min(width, WEB_MAX_WIDTH) : width;
}
