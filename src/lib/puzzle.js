import { MIN_WORD_LENGTH, MAX_WORD_LENGTH, MIN_GUESSES, MAX_GUESSES } from './constants.js';

const INVALID_PUZZLE = 'invalid puzzle payload';

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
  const payload = { word: String(word).toLowerCase(), guesses: Number(guesses) };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return base64urlFromBytes(bytes);
}

// atob and JSON.parse each throw a different error type on malformed input. Returning
// null instead keeps every rejection in decodePuzzle on one error.
function parsePayload(param) {
  try {
    return JSON.parse(new TextDecoder().decode(bytesFromBase64url(param)));
  } catch {
    return null;
  }
}

// typeof gate: String(true) is "true", a valid four-letter word.
function wordFrom(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function isAllowedWord(word) {
  return /^[a-z]+$/.test(word) && word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH;
}

// Number.isInteger is the type gate as well as the integer check: it is false for
// strings, booleans, null and arrays, all of which Number() would have coerced.
function isAllowedGuessCount(guesses) {
  return Number.isInteger(guesses) && guesses >= MIN_GUESSES && guesses <= MAX_GUESSES;
}

export function decodePuzzle(param) {
  if (typeof param !== 'string') throw new Error(INVALID_PUZZLE);

  const payload = parsePayload(param);
  const word = wordFrom(payload?.word);
  const guesses = payload?.guesses;
  if (!isAllowedWord(word) || !isAllowedGuessCount(guesses)) throw new Error(INVALID_PUZZLE);

  return { word, guesses };
}
