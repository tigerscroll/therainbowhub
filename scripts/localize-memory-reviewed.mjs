import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildMemoryGeneralKnowledge} from './memory-general-knowledge.mjs';
import {reviewedMemoryLocales} from './chapter-locales/memory-reviewed-locales.mjs';

const root = 'data/quizzes/memory';
const existingManifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const existingEnglish = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const {manifest, copies} = buildMemoryGeneralKnowledge();
assert.deepEqual(manifest, existingManifest, 'Localization must not change scoring, answer IDs or the flow.');
assert.deepEqual(copies.en, existingEnglish, 'Keep the current English source unchanged.');
for (const locale of reviewedMemoryLocales) {
  fs.writeFileSync(`${root}/${locale}.json`, JSON.stringify(copies[locale], null, 2) + '\n');
}
console.log(`Memory: reviewed ${reviewedMemoryLocales.join(', ')} against English; 10 × 7 questions, three answers and the original scoring/flow retained.`);
