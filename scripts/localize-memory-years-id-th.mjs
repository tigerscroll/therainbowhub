import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildMemoryGeneralKnowledge} from './memory-general-knowledge.mjs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

for (const slug of ['memory', 'years-left']) {
  const root = `data/quizzes/${slug}`;
  const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
  const original = structuredClone(manifest);
  const english = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
  for (const locale of ['id', 'th']) {
    const copy = slug === 'memory' ? buildMemoryGeneralKnowledge().copies[locale] : translateYearsLeft(locale, english, manifest);
    assert.deepEqual(manifest, original, 'Translations cannot change quiz behaviour or scoring.');
    fs.writeFileSync(`${root}/${locale}.json`, JSON.stringify(copy, null, 2) + '\n');
  }
  manifest.activeLocales = [...new Set([...manifest.activeLocales, 'id', 'th'])].sort();
  fs.writeFileSync(`${root}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
}
console.log('Thai and Indonesian: Memory and Years Left, 10 questions each; scoring and rewarded flows unchanged.');
