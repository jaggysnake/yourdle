import { MIN_WORD_LENGTH, MAX_WORD_LENGTH, MIN_GUESSES, MAX_GUESSES } from './constants.js';

const INVALID_PUZZLE = 'invalid puzzle payload';
const WORD_PARAM = 'word';
const GUESSES_PARAM = 'guesses';

function base64urlFromBytes(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bytesFromBase64url(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodePuzzle({ word, guesses }) {
  const normalized = String(word).toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const encoded = base64urlFromBytes(bytes);
  return `${WORD_PARAM}=${encoded}&${GUESSES_PARAM}=${Number(guesses)}`;
}

export function isPuzzleLink(search) {
  return new URLSearchParams(search).has(WORD_PARAM);
}

// atob throws on characters outside the alphabet. Returning null instead keeps every
// rejection in decodePuzzle on one error.
function decodedText(param) {
  try {
    return new TextDecoder().decode(bytesFromBase64url(param));
  } catch {
    return null;
  }
}

function legacyPayload(rawWord) {
  const text = decodedText(rawWord);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function currentPayload(rawWord, rawGuesses) {
  return { word: decodedText(rawWord), guesses: guessCountFrom(rawGuesses) };
}

// typeof gate: String(true) is "true", a valid four-letter word.
function wordFrom(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

// Only plain digits convert, which keeps Number's other readings of a query value --
// '0x5', ' 4 ', '1e1' -- out of the valid range.
function guessCountFrom(raw) {
  return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

function isAllowedWord(word) {
  return /^[a-z]+$/.test(word) && word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH;
}

// Number.isInteger is the type gate as well as the integer check: it is false for
// strings, booleans, null and arrays, all of which Number() would have coerced.
function isAllowedGuessCount(guesses) {
  return Number.isInteger(guesses) && guesses >= MIN_GUESSES && guesses <= MAX_GUESSES;
}

export function decodePuzzle(search) {
  const params = new URLSearchParams(search);
  const rawWord = params.get(WORD_PARAM);
  const rawGuesses = params.get(GUESSES_PARAM);
  if (rawWord === null) throw new Error(INVALID_PUZZLE);

  // A link shared before this format is identified by carrying no guess count at all;
  // its word parameter holds base64url JSON with both fields in it.
  const payload =
    rawGuesses === null ? legacyPayload(rawWord) : currentPayload(rawWord, rawGuesses);

  const word = wordFrom(payload?.word);
  const guesses = payload?.guesses;
  if (!isAllowedWord(word) || !isAllowedGuessCount(guesses)) throw new Error(INVALID_PUZZLE);

  return { word, guesses };
}
