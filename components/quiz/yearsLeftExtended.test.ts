import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';
import type {Quiz} from '../../lib/quizzes.ts';
import {scoreQuiz} from './scoring.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${file}.json`, 'utf8'));
const expectedEditions = [
  'ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'gu',
  'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'jv', 'km', 'kn', 'ko', 'ml', 'mr', 'ms',
  'nb', 'ne', 'nl', 'pa', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sr', 'sv', 'sw', 'ta',
  'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh',
];

test('Years Left has one ten-question round with the same structure in every active edition', () => {
  const source = read('quiz');
  assert.equal(source.template, 'single-stage-rewarded-v1');
  assert.equal(source.engine.entry, 'landing');
  assert.equal(source.engine.localeParity, 'independent');
  assert.equal(source.engine.displayAds, undefined);
  assert.equal(source.engine.hardRefreshCheckpoints, true, 'rewarded stage transitions preserve progress across checkpoints');
  assert.equal(source.localeExtensions, undefined);
  const files = fs.readdirSync('data/quizzes/years-left').filter(file => /^[a-z]{2,3}(?:-[a-z]{4})?\.json$/.test(file));
  assert.deepEqual(source.activeLocales, files.map(file => file.slice(0, -5)).sort());
  assert.deepEqual(source.activeLocales, expectedEditions);
  for (const locale of source.activeLocales) {
    const manifest = resolveQuizLocaleManifest(source, locale);
    const copy = read(locale);
    const shared = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8'));
    assert.equal(shared.locale.code, locale);
    assert.equal(shared.locale.direction, ['ar', 'fa', 'he', 'ur'].includes(locale) ? 'rtl' : 'ltr');
    const quiz = expandQuizLocale(manifest, copy, locale);
    assert.equal(quiz.stages.length, 1, locale);
    assert.deepEqual(quiz.stages.map((stage: any) => stage.questions.length), [10]);
    const ids = quiz.stages[0].questions.map((question: {id: string}) => question.id);
    assert.equal(new Set(ids).size, 10);
    assert.deepEqual(ids.map((id: string) => Number(id.match(/^yl-s(\d+)q/)?.[1])), Array.from({length: 10}, (_, i) => i + 1));
    assert.equal(quiz.career.stages.length, 1);
    assert.equal(quiz.career.stages.at(-1).next, undefined);
    assert.equal(quiz.career.stages.at(-1).preAdChecks.length, 3);
    assert.ok(copy.landing.cta.trim());
    assert.deepEqual(Object.keys(copy.landing), ['cta']);
    for (const [stageIndex, stage] of quiz.stages.entries()) {
      for (const question of stage.questions) {
        const logic = manifest.structure.questions[question.id];
        const native = copy.stages[`stage-${stageIndex + 1}`].questions[question.id];
        assert.ok(question.question.trim(), `${locale}/${question.id}`);
        assert.equal(logic.answerIds.length, 4);
        assert.deepEqual(Object.keys(native.answers), logic.answerIds);
        assert.deepEqual(Object.keys(logic.choiceMeanings), logic.answerIds);
        assert.equal(new Set(Object.values(native.answers)).size, 4);
      }
    }
  }
  assert.deepEqual(read('en').landing, {cta: 'Start'});
});

test('all eight clock personalities remain reachable with bounded estimates in ten questions', () => {
  const manifest = read('quiz');
  const expanded = expandQuizLocale(manifest, read('en'), 'en');
  const quiz = {
    engine: {scoring: {type: 'weighted-profile'}, estimate: manifest.engine.estimate},
    questions: expanded.stages.flatMap((stage: any, stageIndex: number) => stage.questions.map((question: any) => ({
      id: question.id, stage: stageIndex, choiceWeights: Object.values(question.answers), calibrationValues: question.calibration,
    }))),
    result: {
      profiles: expanded.results.profiles,
      scoreDimensions: expanded.results.dimensions.map((dimension: any) => ({label: dimension.label, categories: dimension.profiles})),
    },
  } as Quiz;
  for (const profile of quiz.result.profiles) {
    const totals: Record<string, number> = {};
    const answers = Object.fromEntries(quiz.questions.map((question, index) => {
      const match = question.choiceWeights!.findIndex(weights => weights[profile.id!] > 0);
      const choice = match < 0 ? question.choiceWeights!.map((weights, position) => ({
        position, total: totals[Object.keys(weights)[0]] ?? 0,
      })).sort((a, b) => a.total - b.total)[0].position : match;
      for (const [key, value] of Object.entries(question.choiceWeights![choice])) totals[key] = (totals[key] ?? 0) + value;
      return [question.id, choice];
    }));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.profile.id, profile.id, profile.id);
    assert.ok(result.estimatedAge! >= 73 && result.estimatedAge! <= 95);
  }
  assert.equal(quiz.questions.filter(question => question.calibrationValues).length, 1);
  assert.equal(quiz.questions.at(-1)!.id, 'yl-s10q7');
});
