import { describe, it, expect } from 'vitest';
import { buildShareText } from './share.js';

describe('buildShareText', () => {
  it('formats a win with the emoji grid and url', () => {
    const statusesPerRow = [
      ['absent', 'absent', 'present', 'absent', 'absent'],
      ['correct', 'correct', 'present', 'absent', 'absent'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    const text = buildShareText({
      statusesPerRow,
      maxGuesses: 4,
      url: 'https://yourdle.com/?word=abc',
      won: true,
    });
    expect(text).toBe(
      'Yourdle 3/4\n⬛⬛🟨⬛⬛\n🟩🟩🟨⬛⬛\n🟩🟩🟩🟩🟩\nhttps://yourdle.com/?word=abc'
    );
  });

  it('formats a loss with X score', () => {
    const text = buildShareText({
      statusesPerRow: [['absent', 'absent', 'absent', 'absent', 'absent']],
      maxGuesses: 6,
      url: 'u',
      won: false,
    });
    expect(text.startsWith('Yourdle X/6')).toBe(true);
  });
});
