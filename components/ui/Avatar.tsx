import { Image, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { usePalette } from '@/store/themeStore';

interface AvatarProps {
  name: string;
  size?: number;
  imageUri?: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 38, imageUri }: AvatarProps) {
  const theme = usePalette();

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      }}
    >
      <AppText weight="bold" size="sm" color={theme.colors.primary}>
        {getInitials(name)}
      </AppText>
    </View>
  );
}
