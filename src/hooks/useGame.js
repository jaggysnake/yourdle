import { useReducer, useCallback } from 'react';
import { isValidWord } from '../lib/dictionary.js';
import { evaluateGuess } from '../lib/evaluate.js';

const RANK = { absent: 0, present: 1, correct: 2 };

function mergeKeyStates(prev, guess, statuses) {
  const next = { ...prev };
  for (let i = 0; i < guess.length; i += 1) {
    const ch = guess[i];
    const status = statuses[i];
    if (!(ch in next) || RANK[status] > RANK[next[ch]]) next[ch] = status;
  }
  return next;
}

export function createInitialState({ answer, maxGuesses }) {
  const normalized = String(answer).toLowerCase();
  return {
    answer: normalized,
    wordLength: normalized.length,
    maxGuesses,
    rows: [],
    current: '',
    keyStates: {},
    status: 'playing',
    toast: null,
    shake: false,
  };
}

export function reducer(state, action) {
  if (state.status !== 'playing' && action.type !== 'clearToast' && action.type !== 'clearShake') {
    return state;
  }
  switch (action.type) {
    case 'key': {
      if (state.current.length >= state.wordLength) return state;
      if (!/^[a-z]$/.test(action.letter)) return state;
      return { ...state, current: state.current + action.letter, toast: null };
    }
    case 'backspace':
      return { ...state, current: state.current.slice(0, -1), shake: false };
    case 'enter': {
      if (state.current.length < state.wordLength) {
        return { ...state, toast: 'Not enough letters', shake: true };
      }
      if (!isValidWord(state.current)) {
        return { ...state, toast: 'Not in word list', shake: true };
      }
      const statuses = evaluateGuess(state.current, state.answer);
      const rows = [...state.rows, { guess: state.current, statuses }];
      const keyStates = mergeKeyStates(state.keyStates, state.current, statuses);
      const won = state.current === state.answer;
      const lost = !won && rows.length >= state.maxGuesses;
      return {
        ...state,
        rows,
        current: '',
        keyStates,
        status: won ? 'won' : lost ? 'lost' : 'playing',
        toast: null,
        shake: false,
      };
    }
    case 'clearToast':
      return { ...state, toast: null };
    case 'clearShake':
      return { ...state, shake: false };
    default:
      return state;
  }
}

export function useGame({ answer, maxGuesses }) {
  const [state, dispatch] = useReducer(reducer, { answer, maxGuesses }, createInitialState);
  const onKey = useCallback((letter) => dispatch({ type: 'key', letter: String(letter).toLowerCase() }), []);
  const onBackspace = useCallback(() => dispatch({ type: 'backspace' }), []);
  const onEnter = useCallback(() => dispatch({ type: 'enter' }), []);
  const clearToast = useCallback(() => dispatch({ type: 'clearToast' }), []);
  const clearShake = useCallback(() => dispatch({ type: 'clearShake' }), []);
  return { state, onKey, onBackspace, onEnter, clearToast, clearShake };
}
