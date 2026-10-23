import { describe, it, expect } from 'vitest';
import { encodePuzzle, decodePuzzle } from './puzzle.js';

const encode = (obj) =>
  Buffer.from(JSON.stringify(obj), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

describe('puzzle encoding', () => {
  it('matches the known base64url vector', () => {
    expect(encodePuzzle({ word: 'scary', guesses: 4 })).toBe('eyJ3b3JkIjoic2NhcnkiLCJndWVzc2VzIjo0fQ');
  });

  it('round-trips a payload', () => {
    expect(decodePuzzle(encodePuzzle({ word: 'scary', guesses: 4 }))).toEqual({ word: 'scary', guesses: 4 });
  });

  it('lowercases the word on encode', () => {
    expect(decodePuzzle(encodePuzzle({ word: 'SCARY', guesses: 6 }))).toEqual({ word: 'scary', guesses: 6 });
  });

  it('accepts the shortest (4) and longest (10) words', () => {
    expect(decodePuzzle(encode({ word: 'brav', guesses: 6 }))).toEqual({ word: 'brav', guesses: 6 });
    expect(decodePuzzle(encode({ word: 'strawberry', guesses: 6 }))).toEqual({ word: 'strawberry', guesses: 6 });
  });

  it('rejects words shorter than 4 or longer than 10', () => {
    expect(() => decodePuzzle(encode({ word: 'cat', guesses: 3 }))).toThrow();
    expect(() => decodePuzzle(encode({ word: 'abcdefghijk', guesses: 3 }))).toThrow();
  });

  it('rejects an out-of-range guess count', () => {
    expect(() => decodePuzzle(encode({ word: 'scary', guesses: 99 }))).toThrow();
  });
});
