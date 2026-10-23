import { MIN_WORD_LENGTH, MAX_WORD_LENGTH, MIN_GUESSES, MAX_GUESSES } from './constants.js';

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

export function decodePuzzle(param) {
  const bytes = bytesFromBase64url(param);
  const json = new TextDecoder().decode(bytes);
  const obj = JSON.parse(json);
  const word = String(obj.word || '').toLowerCase();
  const guesses = Number(obj.guesses);
  const wordOk = /^[a-z]+$/.test(word) && word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH;
  const guessesOk = Number.isInteger(guesses) && guesses >= MIN_GUESSES && guesses <= MAX_GUESSES;
  if (!wordOk || !guessesOk) throw new Error('invalid puzzle payload');
  return { word, guesses };
}
