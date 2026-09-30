import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {quizTemplateContract} from '../../scripts/quiz-template-contracts.mjs';
import {scoreQuiz} from './scoring.ts';
import {resolveProfileArtwork} from './profileArtwork.ts';
import {getSiteLocales} from '../../scripts/quiz-catalogue.mjs';
import {marryRevealLabels, marryTranslations} from '../../scripts/localize-marry.mjs';
import {marryChapterLabel} from '../../scripts/marry-content.mjs';
import englishEdits from '../../scripts/marry-locales/en.mjs';

const root = 'data/quizzes/marry';
const read = (name: string) => JSON.parse(fs.readFileSync(`${root}/${name}.json`, 'utf8'));
const manifest = read('quiz'), copy = read('en');
const expanded = expandQuizLocale(manifest, copy, 'en');
const questions = expanded.stages.flatMap((stage: any, stageIndex: number) => stage.questions.map((q: any) => ({
  id: q.id, stage: stageIndex, choiceIds: q.answerIds,
  choices: Array.isArray(q.answers) ? q.answers : Object.keys(q.answers),
  choiceWeights: Array.isArray(q.answers) ? undefined : Object.values(q.answers),
  calibrationValues: q.calibration,
})));
const quiz = {
  engine: {...manifest.engine, scoring: {type: 'weighted-profile'}},
  questions, stages: expanded.stages.map((s: any) => s.title), theme: manifest.theme,
  result: {
    profiles: expanded.results.profiles,
    profileReveal: expanded.results.profileReveal,
    scoreDimensions: expanded.results.dimensions.map((d: any) => ({label: d.label, categories: d.profiles})),
  },
} as Quiz;

test('Marry restores its long edition as ten eight-question stages in every site locale', () => {
  assert.equal(copy.title, 'AI Will Draw The Person You’ll Marry');
  assert.deepEqual(manifest.activeLocales, getSiteLocales());
  assert.deepEqual(fs.readdirSync(root).filter(f => /^[a-z]{2,3}\.json$/.test(f)).sort(), getSiteLocales().map(locale => `${locale}.json`));
  assert.equal(manifest.template, 'ten-stage-eight-question-v1');
  assert.equal(quizTemplateContract(manifest.template).questionsPerStage, 8);
  assert.deepEqual(expanded.stages.map((s: any) => s.questions.length), Array(10).fill(8));
  assert.equal(new Set(questions.map((q: any) => q.id)).size, 80);
  assert.equal(new Set(expanded.stages.flatMap((s: any) => s.questions.map((q: any) => q.question))).size, 80);
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(manifest.engine.entry, 'first-answer');
  for (let stage = 1; stage <= 5; stage++) {
    assert.deepEqual(manifest.structure.stages[stage - 1].questionIds, Array.from({length: 8}, (_, i) => `marry-r${stage}q${i + 1}`));
  }
});

test('every Marry translation preserves all eighty questions, four choices and the final portrait reveal', () => {
  const scoringShape = (content: any) => content.stages.flatMap((stage: any) => stage.questions.map((q: any) => ({
    id: q.id, answerIds: q.answerIds,
    weights: Array.isArray(q.answers) ? undefined : Object.values(q.answers),
    calibration: q.calibration,
  })));
  const sourceShape = scoringShape(expanded);
  for (const locale of getSiteLocales()) {
    const words = read(locale), translated = expandQuizLocale(manifest, words, locale);
    assert.deepEqual(translated.stages.map((s: any) => s.questions.length), Array(10).fill(8), locale);
    assert.deepEqual(scoringShape(translated), sourceShape, `${locale}: translation must not change scoring`);
    assert.equal(new Set(translated.stages.flatMap((s: any) => s.questions.map((q: any) => q.question))).size, 80, locale);
    assert.equal(translated.career.stages[9].preAdButton, marryRevealLabels[locale]);
    for (const [index, stage] of manifest.structure.stages.entries()) {
      assert.doesNotMatch(words.career.stages[stage.id].preAdCopy, /\{profile\}/);
      for (const id of stage.questionIds) {
        const q = words.stages[stage.id].questions[id];
        assert.deepEqual(Object.keys(q.answers), manifest.structure.questions[id].answerIds);
        assert.equal(new Set(Object.values(q.answers)).size, 4, `${locale}/${id}`);
        if (locale !== 'en') {
          assert.notEqual(q.question, copy.stages[stage.id].questions[id].question, `${locale}/${id}: untranslated prompt`);
          for (const [answerId, text] of Object.entries(q.answers)) {
            assert.notEqual(text, copy.stages[stage.id].questions[id].answers[answerId], `${locale}/${id}/${answerId}: untranslated choice`);
          }
        }
      }
      if (index < 9) assert.ok(words.career.stages[stage.id].next.tagline.trim());
    }
    assert.match(words.results.profileReveal.portraitAlt, /\{profile\}/);
    assert.doesNotMatch(JSON.stringify(words.results.profileReveal.consistencyLabels), /\d+\s*%/);
    assert.deepEqual(Object.keys(words.results.profiles).sort(), Object.keys(copy.results.profiles).sort());
  }
});

test('Marry topic labels preserve native punctuation and diacritics while removing the trailing decoration', () => {
  for (const [title, label] of [
    ['Votre code d’attirance ✨', 'Votre code d’attirance'],
    ['L’ultima intuizione ✏️', 'L’ultima intuizione'],
    ['ما الذي يجذبك؟ ✨', 'ما الذي يجذبك؟'],
    ['حياتكما معًا 🏡', 'حياتكما معًا'],
    ['Une complicité ❤️', 'Une complicité'],
    ['Ein Umweg 🌦️', 'Ein Umweg'],
    ['Un trait-d’union', 'Un trait-d’union'],
  ]) assert.equal(marryChapterLabel(title), label);
  for (const locale of getSiteLocales()) {
    const words = read(locale);
    for (const [id, stage] of Object.entries(words.stages) as [string, any][]) {
      const label = marryChapterLabel(stage.title);
      assert.equal(words.career.stages[id].difficulty, label, `${locale}/${id}: checkpoint label`);
      for (const [questionId, question] of Object.entries(stage.questions) as [string, any][]) {
        if (questionId !== 'marry-r1q1') assert.equal(question.headerLabel, label, `${locale}/${questionId}: topic label`);
      }
    }
  }
});

test('Marry proofreading overrides only replace existing content keys and survive regeneration', () => {
  for (const [locale, edits] of Object.entries({en: englishEdits, ...marryTranslations}) as [string, any][]) {
    const words = read(locale);
    const localeQuestions = Object.assign({}, ...Object.values(words.stages).map((stage: any) => stage.questions));
    for (const [id, correction] of Object.entries(edits.corrections ?? {}) as [string, any][]) {
      assert.ok(manifest.structure.questions[id], `${locale}/${id}: correction must reference an existing question`);
      if (correction.question) assert.equal(localeQuestions[id].question, correction.question);
      for (const [answerId, text] of Object.entries(correction.answers ?? {})) {
        assert.ok(manifest.structure.questions[id].answerIds.includes(answerId));
        assert.equal(localeQuestions[id].answers[answerId], text, `${locale}/${id}/${answerId}: correction must survive generation`);
      }
    }
    for (const [id, fields] of Object.entries(edits.profileOverrides ?? {}) as [string, any][]) {
      assert.ok(copy.results.profiles[id]);
      for (const [field, value] of Object.entries(fields)) {
        assert.ok(Object.hasOwn(copy.results.profiles[id], field));
        assert.deepEqual(words.results.profiles[id][field], value);
      }
    }
    for (const [id, label] of Object.entries(edits.dimensionLabels ?? {})) {
      assert.ok(Object.hasOwn(copy.results.dimensions, id));
      assert.equal(words.results.dimensions[id].label, label);
    }
    for (const [key, value] of Object.entries(edits.revealOverrides ?? {})) {
      assert.ok(Object.hasOwn(copy.results.profileReveal, key));
      assert.equal(words.results.profileReveal[key], value);
    }
    for (const [id, fields] of Object.entries(edits.careerOverrides ?? {}) as [string, any][]) {
      assert.ok(Object.hasOwn(copy.career.stages, id));
      for (const [key, value] of Object.entries(fields)) {
        assert.ok(Object.hasOwn(copy.career.stages[id], key));
        assert.equal(words.career.stages[id][key], value);
      }
    }
  }
  assert.doesNotMatch(read('de').results.profiles.magnetic_connector.copy, /Soziale Sicherheit/);
  assert.equal(read('es').results.profileReveal.strongestEnergy, 'Lo que os acerca');
});

test('all eight portrait outcomes are reachable and receive equal scoring opportunity', () => {
  const exposure = Object.fromEntries(quiz.result.profiles.map(profile => [profile.id!, 0]));
  for (const q of questions) {
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4);
    for (const weights of q.choiceWeights ?? []) for (const [profile, weight] of Object.entries(weights)) exposure[profile] += Number(weight) / 4;
  }
  assert.equal(new Set(Object.values(exposure)).size, 1);
  for (const profile of quiz.result.profiles) {
    const answers = Object.fromEntries(questions.map((q: any) => {
      const weights = q.choiceWeights?.map((w: any) => w[profile.id!] ?? 0) ?? [0, 0, 0, 0];
      return [q.id, weights.indexOf(Math.max(...weights))];
    }));
    assert.equal(scoreQuiz(quiz, answers).profile.id, profile.id);
    const baseline = scoreQuiz(quiz, answers);
    for (const [choice, variant] of ['masculine', 'feminine', 'androgynous'].entries()) {
      const changed = {...answers, 'marry-r1q1': choice};
      assert.deepEqual(scoreQuiz(quiz, changed), baseline, 'presentation must not change the relationship profile');
      const artwork = resolveProfileArtwork(quiz, changed, profile.id)!;
      assert.ok(artwork.endsWith(`-${variant}.webp`));
      assert.ok(fs.existsSync(`${root}/${artwork}`));
    }
  }
});

test('checkpoints encourage a new topic without exposing the final portrait or claiming a real prediction', () => {
  assert.equal(manifest.theme.artwork.checkpoints, undefined);
  assert.equal(manifest.theme.artwork.checkpointVariants, undefined);
  const checkpoints = expanded.career.stages;
  assert.equal(new Set(checkpoints.map((c: any) => c.preAdTitle)).size, 10);
  for (const [index, checkpoint] of checkpoints.entries()) {
    assert.doesNotMatch(checkpoint.preAdCopy, /\{profile\}/);
    assert.equal(checkpoint.preAdButton, index === 9 ? 'Reveal My Portrait' : 'Continue');
    if (index < 9) {
      assert.equal(checkpoint.next.title, expanded.stages[index + 1].title);
      assert.ok(checkpoint.next.tagline.trim());
      assert.equal(checkpoint.preAdChecks, undefined);
    } else assert.equal(checkpoint.preAdChecks.length, 3);
  }
  assert.match(copy.about.body, /not drawn live/);
  assert.match(copy.about.disclaimer, /does not identify a real person or predict/);
  assert.doesNotMatch(JSON.stringify(copy.results.profileReveal.consistencyLabels), /\d+%/);
});

test('every picture choice and all twenty-four portrait variants have recovered assets', () => {
  let visualChoices = 0;
  for (const logic of Object.values(manifest.structure.questions) as any[]) {
    if (!logic.icons) continue;
    assert.deepEqual(Object.keys(logic.icons), logic.answerIds);
    for (const icon of Object.values(logic.icons) as string[]) {
      assert.ok(fs.existsSync(`data${icon}`), icon);
      visualChoices++;
    }
  }
  assert.ok(visualChoices >= 16);
  const portraits = Object.values(manifest.theme.artwork.profileVariants).flatMap((variants: any) => Object.values(variants)) as string[];
  assert.equal(new Set(portraits).size, 24);
  portraits.forEach(portrait => assert.ok(fs.existsSync(`${root}/${portrait}`), portrait));
});
