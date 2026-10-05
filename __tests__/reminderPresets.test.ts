import { formatReminderTime, isSameReminderTime, REMINDER_PRESETS } from '@/utils/reminderPresets';

describe('reminder presets', () => {
  it('are valid, unique and sorted through the day', () => {
    const minutes = REMINDER_PRESETS.map((p) => p.hour * 60 + p.minute);
    REMINDER_PRESETS.forEach((p) => {
      expect(p.hour).toBeGreaterThanOrEqual(0);
      expect(p.hour).toBeLessThan(24);
      expect(p.minute).toBeGreaterThanOrEqual(0);
      expect(p.minute).toBeLessThan(60);
    });
    expect(new Set(minutes).size).toBe(minutes.length);
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes);
  });
  it.each([
    [{ hour: 7, minute: 0 }, '07:00'],
    [{ hour: 21, minute: 30 }, '21:30'],
    [{ hour: 0, minute: 5 }, '00:05'],
  ])('formats %j as %s', (t, s) => {
    expect(formatReminderTime(t)).toBe(s);
  });
  it('compares times', () => {
    expect(isSameReminderTime({ hour: 9, minute: 0 }, { hour: 9, minute: 0 })).toBe(true);
    expect(isSameReminderTime({ hour: 9, minute: 0 }, { hour: 9, minute: 30 })).toBe(false);
  });
});
