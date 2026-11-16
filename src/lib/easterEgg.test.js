import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { recordTap, shouldTrigger, TAP_WINDOW_MS } from './easterEgg.js';
import { GUESS_EGG_WORD, guessEggMessage, GUESS_EGG_MESSAGE } from './easterEgg.js';

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

describe('guess easter egg', () => {
  it('returns the message for the egg word and nothing for anything else', () => {
    expect(guessEggMessage(GUESS_EGG_WORD)).toBe(GUESS_EGG_MESSAGE);
    expect(guessEggMessage('scary')).toBeNull();
  });

  // The reducer rejects any guess outside the dictionary, so the egg is unreachable if
  // the word ever drops out of the shipped list. The reducer test uses a stub list and
  // would not catch that.
  it('uses a word that is actually in the shipped five-letter list', () => {
    const words = readFileSync('public/words/len-5.txt', 'utf8');

    expect(words.split('\n').map((w) => w.trim())).toContain(GUESS_EGG_WORD);
  });
});
