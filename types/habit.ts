export interface Habit {
  id: string;
  name: string;
  iconKey: string;
  colorKey: string;
  imageUri?: string;
  durationMinutes: number;
  frequency: number[];
  createdAt: string;
  completions: Record<string, boolean>;
  progressMinutes: Record<string, number>;
}

export interface FocusSessionRecord {
  id: string;
  habitId: string | null;
  habitName: string;
  durationMinutes: number;
  completedAt: string;
  phoneFreeBonus?: boolean;
}
