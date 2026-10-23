import { describe, it, expect } from 'vitest';
import { evaluateGuess } from './evaluate.js';

describe('evaluateGuess', () => {
  it('all correct on exact match', () => {
    expect(evaluateGuess('scary', 'scary')).toEqual(
      ['correct', 'correct', 'correct', 'correct', 'correct']
    );
  });

  it('cares vs scary', () => {
    expect(evaluateGuess('cares', 'scary')).toEqual(
      ['present', 'present', 'present', 'absent', 'present']
    );
  });

  it('marks all absent when nothing matches', () => {
    expect(evaluateGuess('blimp', 'scary')).toEqual(
      ['absent', 'absent', 'absent', 'absent', 'absent']
    );
  });

  it('duplicate letter in guess but single in answer marks only one present', () => {
    expect(evaluateGuess('eerie', 'abide')).toEqual(
      ['absent', 'absent', 'absent', 'present', 'correct']
    );
  });

  it('is case-insensitive', () => {
    expect(evaluateGuess('CARES', 'ScArY')).toEqual(
      ['present', 'present', 'present', 'absent', 'present']
    );
  });

  it('works for a 4-letter word', () => {
    expect(evaluateGuess('grab', 'brag')).toEqual(['present', 'correct', 'correct', 'present']);
  });
});
