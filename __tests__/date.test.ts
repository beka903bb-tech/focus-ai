import { addDays, daysInMonth, firstWeekdayOfMonth, getLastNDays, isSameDay, toDateKey } from '@/utils/date';

describe('toDateKey', () => {
  it.each([
    [new Date(2026, 0, 1), '2026-01-01'],
    [new Date(2026, 8, 9), '2026-09-09'],
    [new Date(2026, 11, 31), '2026-12-31'],
    [new Date(2024, 1, 29), '2024-02-29'],
  ])('%s → %s', (date, key) => expect(toDateKey(date)).toBe(key));
});

describe('addDays', () => {
  it.each([
    [new Date(2026, 0, 31), 1, '2026-02-01'],
    [new Date(2026, 2, 1), -1, '2026-02-28'],
    [new Date(2024, 2, 1), -1, '2024-02-29'],
    [new Date(2026, 11, 31), 1, '2027-01-01'],
    [new Date(2026, 5, 15), 0, '2026-06-15'],
    [new Date(2026, 5, 15), 30, '2026-07-15'],
  ])('%s %+i', (date, n, key) => expect(toDateKey(addDays(date, n))).toBe(key));
  it('does not mutate the input', () => {
    const date = new Date(2026, 0, 1);
    addDays(date, 5);
    expect(toDateKey(date)).toBe('2026-01-01');
  });
});

describe('daysInMonth', () => {
  it.each([
    [2026, 0, 31], [2026, 1, 28], [2024, 1, 29], [2026, 3, 30], [2026, 6, 31], [2026, 8, 30], [2026, 11, 31],
  ])('%i-%i → %i', (y, m, n) => expect(daysInMonth(y, m)).toBe(n));
});

describe('calendar helpers', () => {
  it('firstWeekdayOfMonth', () => {
    expect(firstWeekdayOfMonth(2026, 9)).toBe(new Date(2026, 9, 1).getDay());
  });
  it('isSameDay ignores time of day', () => {
    expect(isSameDay(new Date(2026, 4, 5, 1), new Date(2026, 4, 5, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 4, 5), new Date(2026, 4, 6))).toBe(false);
  });
  it('getLastNDays ends today and is ordered', () => {
    const days = getLastNDays(7);
    expect(days).toHaveLength(7);
    expect(isSameDay(days[6], new Date())).toBe(true);
    expect(days[0].getTime()).toBeLessThan(days[6].getTime());
  });
});
