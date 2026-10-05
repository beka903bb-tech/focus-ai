// Opacity of the two title overlays on the intro film, as a function of playback time.
// Same rhythm as the landing page: the title fades in at the start and leaves before the
// phone opens up (~0–35 % of the clip); the closing title appears after the golden flash
// (≥ 86 %). Pure function → unit-tested, so the timing can't silently break.
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export function introOverlay(positionMs: number, durationMs: number): { title: number; finale: number } {
  const v = durationMs > 0 ? clamp(positionMs / durationMs) : 0;
  const title = ramp(v, 0.02, 0.1) * (1 - ramp(v, 0.3, 0.38));
  const finale = ramp(v, 0.86, 0.95);
  return { title: Math.round(title * 1000) / 1000, finale: Math.round(finale * 1000) / 1000 };
}
