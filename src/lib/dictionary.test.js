import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH } from './constants.js';
import { parseWordList, loadDictionary, isValidWord, isLengthLoaded } from './dictionary.js';

const fetcher = (text, ok = true) => async () => ({ ok, text: async () => text });

describe('dictionary', () => {
  it('parseWordList trims, lowercases, and dedupes', () => {
    const set = parseWordList('Scary\n scary \nBRAVE\n\n');
    expect(set.has('scary')).toBe(true);
    expect(set.has('brave')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('loads a length and validates against it (case-insensitive)', async () => {
    await loadDictionary(5, fetcher('scary\nbrave\n'));
    expect(isLengthLoaded(5)).toBe(true);
    expect(isValidWord('scary')).toBe(true);
    expect(isValidWord('SCARY')).toBe(true);
    expect(isValidWord('zzzzz')).toBe(false);
  });

  it('is false for a length that has not been loaded', () => {
    expect(isLengthLoaded(4)).toBe(false);
    expect(isValidWord('brav')).toBe(false);
  });

  it('throws when the dictionary file is unavailable', async () => {
    await expect(loadDictionary(9, fetcher('', false))).rejects.toThrow();
  });
});

// The allowed word lengths and the shipped word lists have to agree exactly: a length
// with no list 404s at play time, and a list outside the range is dead weight a reader
// would mistake for a supported length.
describe('allowed lengths and shipped word lists', () => {
  it('ships exactly one word list per allowed length and no others', () => {
    const allowed = Array.from(
      { length: MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1 },
      (_, i) => MIN_WORD_LENGTH + i,
    );
    const shipped = readdirSync('public/words')
      .map((name) => Number(name.match(/^len-(\d+)\.txt$/)?.[1]))
      .filter(Number.isInteger);

    expect(shipped.sort((a, b) => a - b)).toEqual(allowed);
  });
});
