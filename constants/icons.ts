export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons';

export interface HabitIconOption {
  key: string;
  label: string;
  family: IconFamily;
  name: string;
}

export const HABIT_ICONS: HabitIconOption[] = [
  { key: 'bicycle', label: 'Velosiped', family: 'Ionicons', name: 'bicycle' },
  { key: 'swim', label: 'Suzish', family: 'MaterialCommunityIcons', name: 'swim' },
  { key: 'book', label: "O'qish", family: 'Ionicons', name: 'book' },
  { key: 'water', label: 'Suv ichish', family: 'Ionicons', name: 'water' },
  { key: 'meditation', label: 'Meditatsiya', family: 'MaterialCommunityIcons', name: 'meditation' },
  { key: 'walk', label: 'Yurish', family: 'Ionicons', name: 'walk' },
  { key: 'barbell', label: 'Sport zali', family: 'Ionicons', name: 'barbell' },
  { key: 'moon', label: 'Uyqu', family: 'Ionicons', name: 'moon' },
  { key: 'flash', label: 'Energiya', family: 'Ionicons', name: 'flash' },
  { key: 'nutrition', label: 'Ovqatlanish', family: 'Ionicons', name: 'nutrition' },
];

export const HABIT_COLORS: string[] = ['#10B981', '#8B5CF6', '#38BDF8', '#F472B6', '#FBBF24'];

export function getHabitIcon(key: string): HabitIconOption {
  return HABIT_ICONS.find((icon) => icon.key === key) ?? HABIT_ICONS[0];
}
