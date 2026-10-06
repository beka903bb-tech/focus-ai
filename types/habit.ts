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

/** Self-reported answer to "Did you reach your goal?" after a session. */
export type SessionOutcome = 'yes' | 'partial' | 'no';

export interface FocusSessionRecord {
  id: string;
  habitId: string | null;
  habitName: string;
  durationMinutes: number;
  completedAt: string;
  phoneFreeBonus?: boolean;
  outcome?: SessionOutcome;
}
