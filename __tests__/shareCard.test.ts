import type { TFunction } from 'i18next';
import i18n from '@/i18n';
import { buildShareMessage, formatMinutes, SHARE_URL, weekChangeLabel } from '@/utils/shareCard';

// Fake t: key + params, so the tests check WHICH string is chosen and with WHAT numbers.
const t = ((key: string, o?: Record<string, unknown>) => (o ? `${key}${JSON.stringify(o)}` : key)) as unknown as TFunction;

describe('formatMinutes', () => {
  it.each([
    [0, 'share.minutesOnly{"m":0}'],
    [45, 'share.minutesOnly{"m":45}'],
    [60, 'share.hoursOnly{"h":1}'],
    [135, 'share.hoursMinutes{"h":2,"m":15}'],
    [-5, 'share.minutesOnly{"m":0}'],
    [59.6, 'share.hoursOnly{"h":1}'],
  ])('%p min → %s', (min, out) => {
    expect(formatMinutes(t, min as number)).toBe(out);
  });
});

describe('weekChangeLabel', () => {
  it('hides the badge when there is no baseline or no change (no fake numbers)', () => {
    expect(weekChangeLabel(t, null)).toBeNull();
    expect(weekChangeLabel(t, 0)).toBeNull();
  });
  it('shows up / down with an absolute percent', () => {
    expect(weekChangeLabel(t, 38)).toBe('share.changeUp{"percent":38}');
    expect(weekChangeLabel(t, -20)).toBe('share.changeDown{"percent":20}');
  });
});

describe('buildShareMessage', () => {
  const stats = { streak: 12, weekMinutes: 135, weekChange: 38, levelTitle: 'Fokus ustasi', level: 4 };
  it('contains streak, week time, change, level and the link', () => {
    const msg = buildShareMessage(t, stats);
    expect(msg).toContain('share.headline{"count":12}');
    expect(msg).toContain('share.weekLine');
    expect(msg).toMatch(/share\.hoursMinutes\{\\"h\\":2,\\"m\\":15\}/); // nested inside weekLine's params
    expect(msg).toContain('share.changeUp{"percent":38}');
    expect(msg).toContain('share.levelLine{"level":4,"title":"Fokus ustasi"}');
    expect(msg).toContain(SHARE_URL);
  });
  it('omits the change part when there is no baseline', () => {
    expect(buildShareMessage(t, { ...stats, weekChange: null })).not.toContain('share.change');
  });
  it.each(['uz', 'ru', 'en'])('real %s translations exist for every share key', async (lng) => {
    await i18n.changeLanguage(lng);
    const real = i18n.t.bind(i18n) as unknown as TFunction;
    const msg = buildShareMessage(real, stats);
    expect(msg).not.toMatch(/share\./);          // no missing keys leak as raw "share.xxx"
    expect(msg).toContain('12');
    expect(msg).toContain(SHARE_URL);
  });
});
