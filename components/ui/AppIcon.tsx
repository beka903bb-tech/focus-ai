import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { IconFamily } from '@/constants/icons';

interface AppIconProps {
  family?: IconFamily;
  name: string;
  size?: number;
  color: string;
}

export function AppIcon({ family = 'Ionicons', name, size = 20, color }: AppIconProps) {
  if (family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={name as never} size={size} color={color} />;
  }
  return <Ionicons name={name as never} size={size} color={color} />;
}
