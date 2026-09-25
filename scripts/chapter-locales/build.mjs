import fs from 'node:fs';
import path from 'node:path';
import {slugs, locales, ui} from './config.mjs';
import {adaptSource} from './source.mjs';
import {checkpointTitles, checkpointProfile} from './checkpoints.mjs';
import {checkpointTeasers} from './teasers.mjs';
import {polishMemory} from './memory.mjs';
import {polishCopy} from './polish.mjs';
import {stageTitles} from './titles.mjs';
import {localizeVisionImages} from './vision-images.mjs';
import {nativeNextTopic} from './remaining-native.mjs';
import {nativeRemainingTitle} from './remaining-titles.mjs';

const cache = process.env.CHAPTER_TRANSLATION_CACHE;
if (!cache || !path.isAbsolute(cache)) throw Error('Set CHAPTER_TRANSLATION_CACHE to the reviewed draft cache.');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const chosen = process.env.LOCALES?.split(',') ?? locales;
const selected = process.env.QUIZZES?.split(',') ?? slugs;
if (selected.some(slug => !slugs.includes(slug))) throw Error('Unknown chapter quiz');
if (chosen.some(locale => !locales.includes(locale))) throw Error('Unknown locale');
const drafts = Object.fromEntries(chosen.map(locale => [locale, read(path.join(cache, `${locale}.draft.json`))]));

for (const slug of selected) {
  const root = `data/quizzes/${slug}`;
  const manifest = read(`${root}/quiz.json`), english = read(`${root}/en.json`);
  for (const locale of chosen) {
    const copy = structuredClone(drafts[locale][slug]);
    const source = adaptSource(slug, english, manifest, locale);
    const labels = ui[locale];
    copy.landing.cta = labels.start;
    copy.career.resultProgressLabel = labels.challenge;
    for (const stage of manifest.structure.stages) {
      if (!stageTitles[slug]) copy.stages[stage.id].title = nativeRemainingTitle(english.stages[stage.id].title, locale, copy.stages[stage.id].title);
    }
    for (const [index, stage] of manifest.structure.stages.entries()) {
      copy.stages[stage.id].title = stageTitles[slug]?.[locale]?.[index] ?? copy.stages[stage.id].title;
      const checkpoint = copy.career.stages[stage.id];
      checkpoint.preAdTitle = checkpointTitles[locale][index];
      checkpoint.preAdButton = index === 9 ? labels.result : labels.next;
      checkpoint.difficulty = copy.stages[stage.id].title.toLocaleUpperCase(locale);
      if (index < 9) {
        checkpoint.preAdCopy = checkpointProfile[locale](copy.stages[stage.id].title);
        checkpoint.next.eyebrow = labels.upNext;
        checkpoint.next.tagline = checkpointTeasers[locale]?.[slug]?.[index] ?? nativeNextTopic(locale, copy.stages[manifest.structure.stages[index + 1].id].title, index);
      } else if (manifest.engine.scoring === 'correct-answer') {
        checkpoint.preAdCopy = labels.ready;
        checkpoint.preAdChecks = labels.checks;
      }
      for (const question of Object.values(copy.stages[stage.id].questions)) {
        question.headerLabel = checkpoint.difficulty;
        if (question.study?.continueLabel) question.study.continueLabel = labels.memorized;
      }
    }
    if (slug === 'memory') polishMemory(copy, source, locale);
    polishCopy(slug, locale, copy, source, manifest);
    save(`${root}/${locale}.json`, copy);
  }
  if (slug === 'vision') localizeVisionImages(manifest, chosen);
  save(`${root}/quiz.json`, manifest);
  console.log(`${slug}: ${chosen.length} localized chapter editions built (activation unchanged)`);
}
