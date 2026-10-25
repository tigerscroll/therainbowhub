import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildMemoryGeneralKnowledge} from './memory-general-knowledge.mjs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

const read = (slug, locale) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const save = (slug, locale, content) => fs.writeFileSync(`data/quizzes/${slug}/${locale}.json`, JSON.stringify(content, null, 2) + '\n');
const {manifest, copies} = buildMemoryGeneralKnowledge();
assert.deepEqual(manifest, read('memory', 'quiz'), 'Keep Memory scoring, IDs and flow unchanged.');
assert.deepEqual(copies.en, read('memory', 'en'), 'Keep English Memory unchanged.');
const yearsManifest = read('years-left', 'quiz');
for (const locale of ['it', 'nl']) {
  save('memory', locale, copies[locale]);
  save('years-left', locale, translateYearsLeft(locale, read('years-left', 'en'), yearsManifest));
}
yearsManifest.activeLocales = [...new Set([...(yearsManifest.activeLocales ?? ['en']), 'it', 'nl'])].sort();
save('years-left', 'quiz', yearsManifest);
console.log('Italian and Dutch: Memory 10 × 7 and Years Left 10 × 10; complete checkpoints/results with English scoring and flows retained.');
