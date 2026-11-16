import { MIN_GUESSES, MAX_GUESSES } from './constants.js';

export function stepGuesses(current, delta) {
  return Math.min(MAX_GUESSES, Math.max(MIN_GUESSES, current + delta));
}
