import { describe, it, expect } from 'vitest';
import { encodePuzzle, decodePuzzle } from './puzzle.js';
import { MAX_GUESSES } from './constants.js';

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

// A puzzle link is entirely user-controlled, so decodePuzzle is the only thing standing
// between a hand-built query string and the game state.
describe('hand-crafted puzzle payloads', () => {
  const rejects = (param) => expect(() => decodePuzzle(param)).toThrow('invalid puzzle payload');

  it('rejects a param that is not a string', () => {
    [null, undefined, 42, {}, []].forEach(rejects);
  });

  it('rejects a string that does not decode to JSON', () => {
    ['', 'not base64!', 'has space', 'pad==', 'a'.repeat(5000)].forEach(rejects);
    rejects(Buffer.from('plain text', 'utf8').toString('base64url'));
  });

  it('rejects JSON that is not an object', () => {
    ['null', '[]', '42', '"scary"', 'true'].forEach((json) =>
      rejects(Buffer.from(json, 'utf8').toString('base64url')),
    );
  });

  it('rejects an object missing either field', () => {
    rejects(encode({ guesses: 4 }));
    rejects(encode({ word: 'scary' }));
  });

  it('rejects a word that is not purely a-z', () => {
    [' scary', 'sc4ry', 'sc-ry', 'scar\u00fd', 'sc ry'].forEach((word) =>
      rejects(encode({ word, guesses: 4 })),
    );
  });

  // String(true) is 'true' and String(['scary']) is 'scary', both of which satisfy the
  // a-z word check, so these only reject because the field must already be a string.
  it('rejects a word field that is not a string', () => {
    [42, ['scary'], { s: 1 }, true, false, null].forEach((word) =>
      rejects(encode({ word, guesses: 4 })),
    );
  });

  // Number would have coerced '4', true and '0x5' into the valid range.
  it('rejects a guess count that is not an integer in range', () => {
    [0, -1, 1.5, MAX_GUESSES + 1, '4', '0x5', 'six', null, [], true, false].forEach((guesses) =>
      rejects(encode({ word: 'scary', guesses })),
    );
  });

  it('ignores unknown keys rather than rejecting the payload', () => {
    expect(decodePuzzle(encode({ word: 'scary', guesses: 4, admin: true }))).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });

  it('accepts an uppercase crafted word by lowercasing it', () => {
    expect(decodePuzzle(encode({ word: 'SCARY', guesses: 4 }))).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });
});
