// Quick-pick times for the daily reminder (profile screen): morning, start of work,
// lunch, evening, before sleep. One tap instead of scrolling the time picker.
export interface ReminderTime {
  hour: number;
  minute: number;
}

export const REMINDER_PRESETS: readonly ReminderTime[] = [
  { hour: 7, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 13, minute: 0 },
  { hour: 20, minute: 0 },
  { hour: 21, minute: 30 },
];

export function formatReminderTime({ hour, minute }: ReminderTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function isSameReminderTime(a: ReminderTime, b: ReminderTime): boolean {
  return a.hour === b.hour && a.minute === b.minute;
}
