const cache = new Map();

export function parseWordList(text) {
  return new Set(
    text
      .split('\n')
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
  );
}

function wordsUrl(length) {
  return `${import.meta.env.BASE_URL}words/len-${length}.txt`;
}

export async function loadDictionary(length, fetcher = fetch) {
  if (cache.has(length)) return cache.get(length);
  const res = await fetcher(wordsUrl(length));
  if (!res.ok) throw new Error(`dictionary for length ${length} is unavailable`);
  const set = parseWordList(await res.text());
  cache.set(length, set);
  return set;
}

export function isValidWord(word) {
  const w = String(word).toLowerCase();
  const set = cache.get(w.length);
  return set ? set.has(w) : false;
}

export function isLengthLoaded(length) {
  return cache.has(length);
}
