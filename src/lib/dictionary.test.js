import { describe, it, expect } from 'vitest';
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
