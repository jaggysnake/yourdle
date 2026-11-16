import { describe, expect, it } from 'vitest';
import { stepGuesses } from './guesses.js';
import { MIN_GUESSES, MAX_GUESSES } from './constants.js';

describe('stepGuesses', () => {
  it('moves by the requested delta inside the range', () => {
    expect(stepGuesses(6, 1)).toBe(7);
    expect(stepGuesses(6, -1)).toBe(5);
  });

  it('holds at the bound rather than leaving the range', () => {
    expect(stepGuesses(MIN_GUESSES, -1)).toBe(MIN_GUESSES);
    expect(stepGuesses(MAX_GUESSES, 1)).toBe(MAX_GUESSES);
  });
});
