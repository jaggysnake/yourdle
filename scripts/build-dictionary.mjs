#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SOURCE = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const MIN_LEN = 4;
const MAX_LEN = 10;

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'words');

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`fetch failed ${res.status} for ${SOURCE}`);
const lines = (await res.text()).replace(/\r/g, '').split('\n');

const byLength = new Map();
for (let n = MIN_LEN; n <= MAX_LEN; n += 1) byLength.set(n, new Set());
for (const raw of lines) {
  const w = raw.trim().toLowerCase();
  if (!/^[a-z]+$/.test(w)) continue;
  if (w.length < MIN_LEN || w.length > MAX_LEN) continue;
  byLength.get(w.length).add(w);
}

mkdirSync(outDir, { recursive: true });
for (const [n, set] of byLength) {
  const sorted = [...set].sort();
  writeFileSync(join(outDir, `len-${n}.txt`), `${sorted.join('\n')}\n`);
  console.log(`len-${n}.txt: ${sorted.length} words`);
}
