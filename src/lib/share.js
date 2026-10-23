const EMOJI = { correct: '🟩', present: '🟨', absent: '⬛' };

export function buildShareText({ statusesPerRow, maxGuesses, url, won }) {
  const score = won ? statusesPerRow.length : 'X';
  const grid = statusesPerRow
    .map((row) => row.map((s) => EMOJI[s] || '⬛').join(''))
    .join('\n');
  return `Yourdle ${score}/${maxGuesses}\n${grid}\n${url}`;
}
