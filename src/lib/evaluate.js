export function evaluateGuess(guess, answer) {
  const g = String(guess).toLowerCase();
  const a = String(answer).toLowerCase();
  const result = new Array(g.length).fill('absent');
  const remaining = {};
  for (const ch of a) remaining[ch] = (remaining[ch] || 0) + 1;
  for (let i = 0; i < g.length; i += 1) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
      remaining[g[i]] -= 1;
    }
  }
  for (let i = 0; i < g.length; i += 1) {
    if (result[i] === 'correct') continue;
    if (remaining[g[i]] > 0) {
      result[i] = 'present';
      remaining[g[i]] -= 1;
    }
  }
  return result;
}
