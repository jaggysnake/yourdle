import { describe, it, expect } from 'vitest';
import { recordTap, shouldTrigger, TAP_WINDOW_MS } from './easterEgg.js';

describe('easterEgg tap detection', () => {
  it('triggers on three taps within the window (AC-EE1a)', () => {
    let taps = [];
    taps = recordTap(taps, 0);
    expect(shouldTrigger(taps)).toBe(false);
    taps = recordTap(taps, 200);
    expect(shouldTrigger(taps)).toBe(false);
    taps = recordTap(taps, 400);
    expect(shouldTrigger(taps)).toBe(true);
  });

  it('does not trigger when taps are spread beyond the window (AC-EE1b)', () => {
    let taps = [];
    // Each tap is more than a full window after the previous one, so no three
    // taps ever coexist inside the rolling window.
    taps = recordTap(taps, 0);
    taps = recordTap(taps, TAP_WINDOW_MS + 1);
    taps = recordTap(taps, 2 * (TAP_WINDOW_MS + 1));
    expect(taps).toHaveLength(1);
    expect(shouldTrigger(taps)).toBe(false);
  });

  it('prunes stale taps outside the rolling window (AC-EE1c)', () => {
    const now = 1000;
    const taps = recordTap([100, 300], now); // 100 is 900ms old -> dropped
    expect(taps).toEqual([300, 1000]);
  });

  it('keeps taps exactly on the window boundary', () => {
    const now = TAP_WINDOW_MS;
    const taps = recordTap([0], now);
    expect(taps).toEqual([0, TAP_WINDOW_MS]);
  });
});
