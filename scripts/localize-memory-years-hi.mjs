import fs from 'node:fs';
import assert from 'node:assert/strict';
import {translateMemoryHindi} from './chapter-locales/memory-hi.mjs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

for (const slug of ['memory', 'years-left']) {
  const root = `data/quizzes/${slug}`;
  const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
  const before = structuredClone(manifest);
  const english = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
  const copy = slug === 'memory' ? translateMemoryHindi(english, manifest) : translateYearsLeft('hi', english, manifest);
  assert.deepEqual(manifest, before, 'Translation cannot modify scoring or behaviour.');
  fs.writeFileSync(`${root}/hi.json`, JSON.stringify(copy, null, 2) + '\n');
  manifest.activeLocales = [...new Set([...(manifest.activeLocales ?? ['en']), 'hi'])].sort();
  fs.writeFileSync(`${root}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
}
console.log('Hindi: Memory 10 × 7 and Years Left 10 × 10; scoring and rewarded flows retained.');
