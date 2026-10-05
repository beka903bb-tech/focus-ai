import type { TFunction } from 'i18next';

// «Natijani ulashish» — what the streak card says. Pure (no React / native modules) so the
// wording and the numbers are unit-tested; the screen renders it and captures it as a PNG.
export interface ShareStats {
  streak: number;
  weekMinutes: number;
  /** Week-over-week change from weeklyFocusComparison; null = no baseline yet. */
  weekChange: number | null;
  levelTitle: string;
  level: number;
}

export const SHARE_URL = 'https://focus-ai-stitch.expo.app';

export function formatMinutes(t: TFunction, minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return t('share.minutesOnly', { m });
  if (m === 0) return t('share.hoursOnly', { h });
  return t('share.hoursMinutes', { h, m });
}

export function weekChangeLabel(t: TFunction, change: number | null): string | null {
  if (change === null || change === 0) return null;
  return change > 0 ? t('share.changeUp', { percent: change }) : t('share.changeDown', { percent: Math.abs(change) });
}

// Plain-text version: the fallback when an image can't be captured/shared (web, old devices)
// and the caption that goes along with the image.
export function buildShareMessage(t: TFunction, s: ShareStats): string {
  const lines = [
    t('share.headline', { count: s.streak }),
    t('share.weekLine', { time: formatMinutes(t, s.weekMinutes) }) + (weekChangeLabel(t, s.weekChange) ? ` (${weekChangeLabel(t, s.weekChange)})` : ''),
    t('share.levelLine', { level: s.level, title: s.levelTitle }),
    '',
    t('share.cta', { url: SHARE_URL }),
  ];
  return lines.join('\n');
}
