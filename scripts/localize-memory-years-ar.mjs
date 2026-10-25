import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildMemoryGeneralKnowledge} from './memory-general-knowledge.mjs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

const read = (slug, locale) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const save = (slug, locale, content) => fs.writeFileSync(`data/quizzes/${slug}/${locale}.json`, JSON.stringify(content, null, 2) + '\n');
const {manifest, copies} = buildMemoryGeneralKnowledge();
assert.deepEqual(manifest, read('memory', 'quiz'), 'Keep Memory scoring, IDs and flow unchanged.');
assert.deepEqual(copies.en, read('memory', 'en'), 'Keep English Memory unchanged.');
save('memory', 'ar', copies.ar);
const yearsManifest = read('years-left', 'quiz');
save('years-left', 'ar', translateYearsLeft('ar', read('years-left', 'en'), yearsManifest));
yearsManifest.activeLocales = [...new Set([...(yearsManifest.activeLocales ?? ['en']), 'ar'])].sort();
save('years-left', 'quiz', yearsManifest);
console.log('Arabic: Memory 10 × 7 and Years Left 10 × 10, including checkpoints and results; English scoring and flows retained.');
