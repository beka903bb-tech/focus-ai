import { introOverlay } from '@/utils/introTimeline';

describe('intro overlay timeline', () => {
  it('starts hidden, shows the title early, hides it before the phone opens up', () => {
    expect(introOverlay(0, 10000)).toEqual({ title: 0, finale: 0 });
    expect(introOverlay(1500, 10000).title).toBe(1);
    expect(introOverlay(4000, 10000).title).toBe(0);
  });
  it('fades the closing title in after the golden flash and keeps it to the end', () => {
    expect(introOverlay(8000, 10000).finale).toBe(0);
    expect(introOverlay(9600, 10000).finale).toBe(1);
    expect(introOverlay(10000, 10000).finale).toBe(1);
  });
  it('never shows both titles at once and stays within 0..1', () => {
    for (let ms = 0; ms <= 10000; ms += 50) {
      const o = introOverlay(ms, 10000);
      expect(o.title * o.finale).toBe(0);
      [o.title, o.finale].forEach((x) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      });
    }
  });
  it('handles unknown / zero duration and positions past the end', () => {
    expect(introOverlay(500, 0)).toEqual({ title: 0, finale: 0 });
    expect(introOverlay(20000, 10000).finale).toBe(1);
  });
});
