import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {getSiteLocales} from './quiz-catalogue.mjs';
import {ui} from './chapter-locales/config.mjs';
import {polishNeutralPortuguese} from './chapter-locales/portuguese-neutral.mjs';
import {applyEntryLabel} from './three-choice-entry.mjs';
import {marryChapterLabel} from './marry-content.mjs';
import en from './marry-locales/en.mjs';
import ar from './marry-locales/ar.mjs';
import de from './marry-locales/de.mjs';
import es from './marry-locales/es.mjs';
import fr from './marry-locales/fr.mjs';
import it from './marry-locales/it.mjs';
import nl from './marry-locales/nl.mjs';
import pt from './marry-locales/pt.mjs';

export const marryTranslations = {ar, de, es, fr, it, nl, pt};
export const marryRevealLabels = Object.fromEntries([
  ['en', 'Reveal My Portrait'],
  ...Object.entries(marryTranslations).map(([locale, words]) => [locale, words.reveal]),
]);

function rows(text, count, columns) {
  const result = text.trim().split('\n').map(line => line.split('|').map(value => value.trim()));
  assert.equal(result.length, count);
  result.forEach(row => assert.equal(row.length, columns));
  return result;
}

export function localizeMarry() {
  const root = 'data/quizzes/marry';
  const read = name => JSON.parse(fs.readFileSync(`${root}/${name}.json`, 'utf8'));
  const manifest = read('quiz'), english = read('en');
  english.about.body = 'Explore attraction, personality, everyday life and the little things that make a connection feel right. There are ten themed stages of eight questions, with no right or wrong answers. The opening choice sets the portrait presentation; the other choices contribute to your relationship-style match.\n\nChoose your first answer, watch a short ad, then continue to question two. Each checkpoint introduces a fresh topic, while the finished portrait stays hidden until the final reveal. Your progress is saved on this device.\n\nYour answers select a result from an original library of fictional portraits. The image is not drawn live, based on a real person or a prediction of whom you will marry. This is an entertainment experience, not a psychological or relationship assessment.';
  english.about.howToPlay.steps = [
    'Choose the portrait presentation. A short ad follows your first answer.',
    'Answer each set of eight questions, then continue after the checkpoint ad.',
    'Reveal your fictional partner portrait and relationship style. Explore your preferences in more detail after an optional extra ad.',
  ];
  const copies = {en: english};
  for (const [locale, words] of Object.entries(marryTranslations)) {
    // The long archive contains six translations. Arabic's shorter archive
    // supplies the original result profiles; its forty legacy questions are
    // authored explicitly alongside the new forty, keeping the same IDs.
    const ref = locale === 'ar' ? 'b46cc7fd' : 'eb1a3f5e';
    const original = JSON.parse(execFileSync('git', ['show', `${ref}:${root}/${locale}.json`], {encoding: 'utf8'}));
    const oldQuestions = Object.assign({}, ...Object.values(original.stages).map(stage => stage.questions));
    const oldRows = words.oldQuestions ? rows(words.oldQuestions, 40, 5) : undefined;
    const added = rows(words.questions, 40, 5), stages = rows(words.stages, 10, 4);
    const copy = structuredClone(english);
    Object.assign(copy, {title: original.title, eyebrow: words.eyebrow, summary: words.summary});
    copy.landing = {intro: words.intro, cta: ui[locale].start};
    copy.about = {body: words.about, howToPlay: {steps: words.steps}, disclaimer: words.disclaimer};
    copy.results = structuredClone(original.results);
    delete copy.results.share;
    copy.results.name = words.progress.toLocaleUpperCase(locale);
    Object.assign(copy.results.profileReveal, {
      eyebrow: words.eyebrow,
      consistency: words.consistency,
      consistencyLabels: Object.fromEntries(['high', 'medium', 'mixed'].map((key, index) => [key, words.consistencyLabels[index]])),
      breakdown: Object.fromEntries(['eyebrow', 'title', 'copy', 'button', 'adNote', 'heading'].map((key, index) => [key, words.breakdown[index]])),
    });
    copy.career = {resultProgressLabel: words.progress, stages: {}};
    for (const [index, stage] of manifest.structure.stages.entries()) {
      const [title, preAdTitle, preAdCopy, teaser] = stages[index];
      const headerLabel = marryChapterLabel(title);
      const questions = {};
      for (const [questionIndex, id] of stage.questionIds.entries()) {
        const logic = manifest.structure.questions[id];
        let source;
        if (index < 5 && !oldRows) {
          const old = oldQuestions[id];
          assert.ok(old && Array.isArray(old.answers), `${locale}/${id}: missing archived choices`);
          source = [old.question, ...old.answers];
        } else source = index < 5 ? oldRows[index * 8 + questionIndex] : added[(index - 5) * 8 + questionIndex];
        assert.equal(source.length, 5);
        // Answer IDs, not shuffled display positions, own the profile weights.
        questions[id] = {
          question: id === 'marry-r5q8' ? words.instinct : source[0], headerLabel,
          answers: Object.fromEntries(logic.answerIds.map(answerId => [answerId, source[Number(answerId.slice(1))]])),
        };
      }
      copy.stages[stage.id] = {title, questions};
      copy.career.stages[stage.id] = {
        difficulty: headerLabel, preAdTitle, preAdCopy,
        preAdButton: index === 9 ? words.reveal : ui[locale].next,
        ...(index === 9 ? {preAdChecks: words.checks} : {next: {eyebrow: words.upNext, tagline: teaser}}),
      };
    }
    copies[locale] = copy;
  }
  for (const [locale, copy] of Object.entries(copies)) {
    const words = locale === 'en' ? en : marryTranslations[locale];
    for (const stage of Object.values(copy.stages)) for (const [id, question] of Object.entries(stage.questions)) {
      const correction = words.corrections?.[id];
      if (correction?.question) question.question = correction.question;
      Object.assign(question.answers, correction?.answers);
    }
    for (const [id, replacement] of Object.entries(words.profileOverrides ?? {})) Object.assign(copy.results.profiles[id], replacement);
    Object.assign(copy.results.profileReveal, words.revealOverrides);
    for (const [id, label] of Object.entries(words.dimensionLabels ?? {})) copy.results.dimensions[id].label = label;
    for (const [id, replacement] of Object.entries(words.careerOverrides ?? {})) Object.assign(copy.career.stages[id], replacement);
  }
  manifest.activeLocales = getSiteLocales();
  assert.deepEqual(Object.keys(copies).sort(), manifest.activeLocales);
  applyEntryLabel(manifest, copies);
  polishNeutralPortuguese('marry', copies.pt, manifest);
  for (const [name, value] of Object.entries({quiz: manifest, ...copies})) {
    fs.writeFileSync(`${root}/${name}.json`, JSON.stringify(value, null, 2) + '\n');
  }
  console.log('Marry: eight locales, 10 × 8 questions, first-answer rewarded entry, original portrait scoring preserved.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) localizeMarry();
