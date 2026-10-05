import { computeElapsedSeconds, formatClock, goalCrossedAt, MAX_UNATTENDED_MS, TimerState } from '@/utils/timer';

const NOW = new Date('2026-03-10T12:00:00Z').getTime();
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});
afterAll(() => jest.useRealTimers());

function timer(partial: Partial<TimerState>): TimerState {
  return { status: 'running', baseSeconds: 0, accumulatedMs: 0, runningSince: NOW, goalSeconds: 3600, ...partial };
}

describe('computeElapsedSeconds', () => {
  it.each([
    ['just started', timer({}), 0],
    ['10 s running', timer({ runningSince: NOW - 10_000 }), 10],
    ['banked base is added', timer({ baseSeconds: 120, runningSince: NOW - 30_000 }), 150],
    ['accumulated pause cycles', timer({ accumulatedMs: 45_000, runningSince: NOW - 15_000 }), 60],
    ['paused: no live time', timer({ status: 'paused', runningSince: null, accumulatedMs: 90_000 }), 90],
    ['fractions are floored', timer({ runningSince: NOW - 1_999 }), 1],
    ['clamped to goal', timer({ runningSince: NOW - 2 * 3600_000 }), 3600],
    ['never below base', timer({ baseSeconds: 100, runningSince: NOW + 5_000 }), 100],
    ['goal reached exactly', timer({ runningSince: NOW - 3600_000 }), 3600],
  ])('%s', (_name, state, expected) => {
    expect(computeElapsedSeconds(state)).toBe(expected);
  });

  it('a timer left running overnight counts at most 3 hours', () => {
    const state = timer({ goalSeconds: 10 * 3600, runningSince: NOW - 9 * 3600_000 });
    expect(computeElapsedSeconds(state)).toBe(MAX_UNATTENDED_MS / 1000);
  });

  it('earlier banked time is kept even when the live stretch is capped', () => {
    const state = timer({ goalSeconds: 10 * 3600, baseSeconds: 600, runningSince: NOW - 9 * 3600_000 });
    expect(computeElapsedSeconds(state)).toBe(600 + MAX_UNATTENDED_MS / 1000);
  });

  it('is accurate after a long background sleep within the cap', () => {
    const state = timer({ goalSeconds: 4 * 3600, runningSince: NOW - 2 * 3600_000 - 5_000 });
    expect(computeElapsedSeconds(state)).toBe(2 * 3600 + 5);
  });
});

describe('goalCrossedAt', () => {
  it('returns the moment the goal was reached', () => {
    const state = timer({ goalSeconds: 600, runningSince: NOW - 3600_000 });
    expect(goalCrossedAt(state).getTime()).toBe(NOW - 3600_000 + 600_000);
  });
  it('accounts for banked base and accumulated time', () => {
    const state = timer({ goalSeconds: 600, baseSeconds: 300, accumulatedMs: 100_000, runningSince: NOW - 3600_000 });
    expect(goalCrossedAt(state).getTime()).toBe(NOW - 3600_000 + 200_000);
  });
  it('never returns a future moment', () => {
    const state = timer({ goalSeconds: 3600, runningSince: NOW - 10_000 });
    expect(goalCrossedAt(state).getTime()).toBe(NOW);
  });
  it('paused timer → now', () => {
    expect(goalCrossedAt(timer({ runningSince: null })).getTime()).toBe(NOW);
  });
});

describe('formatClock', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [59, '00:59'],
    [60, '01:00'],
    [61, '01:01'],
    [599, '09:59'],
    [1500, '25:00'],
    [3599, '59:59'],
    [3600, '60:00'],
    [5400, '90:00'],
  ])('%i s → %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected);
  });
});
