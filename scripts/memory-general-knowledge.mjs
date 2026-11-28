import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {authoredShortMemoryCopy, memoryShortManifest, memorySteps, reuseShortMemoryCopy} from './chapter-locales/memory-short-authoring.mjs';
import {balkan} from './chapter-locales/memory-short-balkan.mjs';
import {dravidian} from './chapter-locales/memory-short-dravidian.mjs';
import {eastAsia} from './chapter-locales/memory-short-east-asia.mjs';
import {europe} from './chapter-locales/memory-short-europe.mjs';
import {more} from './chapter-locales/memory-short-more.mjs';
import {southAsia} from './chapter-locales/memory-short-south-asia.mjs';

const directory = 'data/quizzes/memory';
const read = name => JSON.parse(fs.readFileSync(`${directory}/${name}.json`, 'utf8'));
const editions = {...balkan, ...dravidian, ...eastAsia, ...europe, ...more, ...southAsia};

export function buildMemoryGeneralKnowledge() {
  const manifest = memoryShortManifest(read('quiz'));
  assert.deepEqual([...Object.keys(memorySteps), ...Object.keys(editions)].sort(), manifest.activeLocales);
  const copies = Object.fromEntries(manifest.activeLocales.map(locale => [locale, memorySteps[locale]
    ? reuseShortMemoryCopy(read(locale), manifest, locale)
    : authoredShortMemoryCopy(locale, editions[locale], manifest)]));
  const bank = manifest.structure.stages[0].questionIds.map(id => ({
    id,
    correct: copies.en.stages['stage-1'].questions[id].answers[manifest.structure.questions[id].correctAnswerId],
  }));
  return {manifest, copies, bank};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {manifest, copies, bank} = buildMemoryGeneralKnowledge();
  for (const [locale, copy] of Object.entries(copies)) fs.writeFileSync(`${directory}/${locale}.json`, JSON.stringify(copy, null, 2) + '\n');
  fs.writeFileSync(`${directory}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(`${directory}/ANSWER_KEY.md`, '# General knowledge at /memory\n\nOne ten-question round in each of the languages available on /years-left. The target is 8/10. The word-association question is adapted by locale, with the correct answer always keyed to the same stable ID. Rebuild with `node scripts/memory-general-knowledge.mjs`.\n\n| Question | Correct answer (English) |\n| --- | --- |\n' + bank.map(q => `| ${q.id} | ${q.correct} |`).join('\n') + '\n');
  console.log(`Memory: one round of 10 general-knowledge questions in ${Object.keys(copies).length} languages.`);
}
