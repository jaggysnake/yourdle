import { describe, it, expect } from 'vitest';
import { encodePuzzle, decodePuzzle, isPuzzleLink } from './puzzle.js';
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH, MAX_GUESSES } from './constants.js';

const b64 = (text) => Buffer.from(text, 'utf8').toString('base64url');
const search = (entries) => `?${new URLSearchParams(entries)}`;
const fresh = ({ word, guesses }) => search({ word: b64(word), guesses: String(guesses) });

// Links shared before the format change carry base64url JSON in `word` and no `guesses`.
const legacy = (payload) => search({ word: b64(JSON.stringify(payload)) });

const wordSegment = (puzzle) => puzzle.split('&')[0];

describe('puzzle encoding', () => {
  it('base64urls only the word and leaves the count in plain text', () => {
    expect(encodePuzzle({ word: 'scary', guesses: 4 })).toBe('word=c2Nhcnk&guesses=4');
  });

  it('is shorter than encoding the whole payload as JSON', () => {
    const asJson = `word=${b64(JSON.stringify({ word: 'scary', guesses: 4 }))}`;

    expect(encodePuzzle({ word: 'scary', guesses: 4 }).length).toBeLessThan(asJson.length);
  });

  it('derives the encoded segment from the word alone', () => {
    const atFour = wordSegment(encodePuzzle({ word: 'scary', guesses: 4 }));
    const atNine = wordSegment(encodePuzzle({ word: 'scary', guesses: 9 }));

    expect(atFour).toBe(atNine);
    expect(atFour).toBe('word=c2Nhcnk');
    expect(wordSegment(encodePuzzle({ word: 'brave', guesses: 4 }))).toBe('word=YnJhdmU');
  });

  it('round-trips through the query string', () => {
    expect(decodePuzzle(`?${encodePuzzle({ word: 'scary', guesses: 4 })}`)).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });

  it('lowercases the word on encode and on decode', () => {
    expect(decodePuzzle(`?${encodePuzzle({ word: 'SCARY', guesses: 6 })}`).word).toBe('scary');
    expect(decodePuzzle(fresh({ word: 'SCARY', guesses: 6 })).word).toBe('scary');
  });

  it('accepts the shortest and longest allowed words', () => {
    const shortest = 'a'.repeat(MIN_WORD_LENGTH);
    const longest = 'a'.repeat(MAX_WORD_LENGTH);

    expect(decodePuzzle(fresh({ word: shortest, guesses: 6 })).word).toBe(shortest);
    expect(decodePuzzle(fresh({ word: longest, guesses: 6 })).word).toBe(longest);
  });

  it('recognises a puzzle link by its word parameter', () => {
    expect(isPuzzleLink(fresh({ word: 'scary', guesses: 4 }))).toBe(true);
    expect(isPuzzleLink(legacy({ word: 'scary', guesses: 4 }))).toBe(true);
    expect(isPuzzleLink('')).toBe(false);
    expect(isPuzzleLink('?guesses=4')).toBe(false);
  });
});

describe('links shared before the format change', () => {
  it('still plays, reading the count out of the JSON payload', () => {
    expect(decodePuzzle(legacy({ word: 'scary', guesses: 4 }))).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });

  it('is validated as strictly as a new link', () => {
    expect(() => decodePuzzle(legacy({ word: 'cat', guesses: 4 }))).toThrow();
    expect(() => decodePuzzle(legacy({ word: true, guesses: 4 }))).toThrow();
    expect(() => decodePuzzle(legacy({ word: 'scary', guesses: 99 }))).toThrow();
    expect(() => decodePuzzle(legacy({ word: 'scary' }))).toThrow();
  });

  it('is not reachable once a guess count is present, however malformed', () => {
    const json = b64(JSON.stringify({ word: 'scary', guesses: 4 }));

    expect(() => decodePuzzle(search({ word: json, guesses: 'x' }))).toThrow();
    expect(() => decodePuzzle(search({ word: json, guesses: '4' }))).toThrow();
  });
});

// A puzzle link is entirely user-controlled, so decodePuzzle is the only thing standing
// between a hand-built query string and the game state.
describe('hand-crafted puzzle links', () => {
  const rejects = (query) => expect(() => decodePuzzle(query)).toThrow('invalid puzzle payload');

  it('rejects a query string with no word at all', () => {
    rejects('');
    rejects('?guesses=4');
  });

  it('rejects a word parameter that atob will not decode', () => {
    ['not base64!', 'pad=='].forEach((word) => rejects(search({ word, guesses: '4' })));
  });

  it('rejects a decoded word that is not purely a-z', () => {
    [' scary', 'sc4ry', 'sc-ry', 'scar\u00fd', 'sc ry'].forEach((word) =>
      rejects(fresh({ word, guesses: 4 })),
    );
  });

  it('rejects a decoded word outside the length range', () => {
    ['', 'a'.repeat(MIN_WORD_LENGTH - 1), 'a'.repeat(MAX_WORD_LENGTH + 1)].forEach((word) =>
      rejects(fresh({ word, guesses: 4 })),
    );
  });

  it('rejects a guess count that is not plain digits in range', () => {
    ['', '0', '-1', '1.5', String(MAX_GUESSES + 1), '0x5', ' 4 ', '1e1', 'six'].forEach(
      (guesses) => rejects(search({ word: b64('scary'), guesses })),
    );
  });

  it('rejects legacy JSON that is not an object', () => {
    ['null', '[]', '42', '"scary"', 'true'].forEach((json) => rejects(search({ word: b64(json) })));
  });

  it('rejects a legacy word or count of the wrong type', () => {
    [42, ['scary'], { s: 1 }, true, false, null].forEach((word) =>
      rejects(legacy({ word, guesses: 4 })),
    );
    ['4', true, [], null].forEach((guesses) => rejects(legacy({ word: 'scary', guesses })));
  });

  it('ignores unknown parameters rather than rejecting the link', () => {
    expect(decodePuzzle(search({ word: b64('scary'), guesses: '4', admin: 'true' }))).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });

  it('takes the first value when a parameter is repeated', () => {
    expect(decodePuzzle(`?word=${b64('scary')}&word=${b64('brave')}&guesses=4&guesses=9`)).toEqual({
      word: 'scary',
      guesses: 4,
    });
  });
});
