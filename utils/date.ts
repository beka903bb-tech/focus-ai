import type { TFunction } from 'i18next';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function formatLongDate(t: TFunction, date: Date = new Date()): string {
  const dayName = t(`common.weekdaysLong.${date.getDay()}`);
  const monthName = t(`common.months.${date.getMonth()}`);
  return `${dayName}, ${date.getDate()} ${monthName}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function getLastNDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    days.push(addDays(today, -i));
  }
  return days;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
