import { describe, it, expect, beforeAll } from 'vitest';
import { reducer, createInitialState } from './useGame.js';
import { loadDictionary } from '../lib/dictionary.js';

beforeAll(async () => {
  await loadDictionary(5, async () => ({ ok: true, text: async () => 'scary\ncares\n' }));
});

const init = (answer = 'scary', maxGuesses = 4) => createInitialState({ answer, maxGuesses });

function typeWord(state, word) {
  return word.split('').reduce((s, letter) => reducer(s, { type: 'key', letter }), state);
}

function submit(state, word) {
  return reducer(typeWord(state, word), { type: 'enter' });
}

describe('game reducer', () => {
  it('derives wordLength from the answer', () => {
    expect(init('scary').wordLength).toBe(5);
  });

  it('appends letters up to wordLength and no further', () => {
    let state = typeWord(init(), 'scare');
    expect(state.current).toBe('scare');
    state = reducer(state, { type: 'key', letter: 'x' });
    expect(state.current).toBe('scare');
  });

  it('rejects a short guess on enter without consuming a row', () => {
    const state = reducer(typeWord(init(), 'sca'), { type: 'enter' });
    expect(state.rows).toHaveLength(0);
    expect(state.toast).toBe('Not enough letters');
    expect(state.shake).toBe(true);
  });

  it('rejects an invalid word without consuming a row', () => {
    const state = submit(init(), 'zzzzz');
    expect(state.rows).toHaveLength(0);
    expect(state.toast).toBe('Not in word list');
  });

  it('wins on the correct guess', () => {
    const state = submit(init(), 'scary');
    expect(state.status).toBe('won');
    expect(state.rows).toHaveLength(1);
  });

  it('loses after exhausting the guess budget', () => {
    const state = submit(init('scary', 1), 'cares');
    expect(state.status).toBe('lost');
  });

  it('tracks keyboard states with correct > present > absent precedence', () => {
    let state = submit(init(), 'cares');
    expect(state.keyStates.c).toBe('present');
    expect(state.keyStates.e).toBe('absent');
    state = submit(state, 'scary');
    expect(state.keyStates.c).toBe('correct');
  });

  it('ignores input once the game is over', () => {
    let state = submit(init(), 'scary');
    state = reducer(state, { type: 'key', letter: 'a' });
    expect(state.current).toBe('');
  });
});
