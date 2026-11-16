#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH } from '../src/lib/constants.js';

const SOURCE = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'words');

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`fetch failed ${res.status} for ${SOURCE}`);
const lines = (await res.text()).replace(/\r/g, '').split('\n');

const byLength = new Map();
for (let n = MIN_WORD_LENGTH; n <= MAX_WORD_LENGTH; n += 1) byLength.set(n, new Set());
for (const raw of lines) {
  const w = raw.trim().toLowerCase();
  if (!/^[a-z]+$/.test(w)) continue;
  if (w.length < MIN_WORD_LENGTH || w.length > MAX_WORD_LENGTH) continue;
  byLength.get(w.length).add(w);
}

mkdirSync(outDir, { recursive: true });
for (const [n, set] of byLength) {
  const sorted = [...set].sort();
  writeFileSync(join(outDir, `len-${n}.txt`), `${sorted.join('\n')}\n`);
  console.log(`len-${n}.txt: ${sorted.length} words`);
}
