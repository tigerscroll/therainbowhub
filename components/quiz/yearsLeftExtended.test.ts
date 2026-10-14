import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';
import type {Quiz} from '../../lib/quizzes.ts';
import {scoreQuiz} from './scoring.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${file}.json`, 'utf8'));

test('Years Left is an English-only 100-question staged interstitial self-test', () => {
  const source = read('quiz');
  assert.equal(source.template, 'ten-stage-ten-question-interstitial-v1');
  assert.equal(source.engine.entry, 'landing');
  assert.equal(source.engine.localeParity, 'independent');
  assert.equal(source.engine.displayAds, undefined);
  assert.equal(source.engine.hardRefreshCheckpoints, false, 'estimate readiness stays in the same document');
  assert.equal(source.localeExtensions, undefined);
  assert.deepEqual(source.activeLocales, ['en']);
  for (const locale of source.activeLocales) {
    const manifest = resolveQuizLocaleManifest(source, locale);
    const copy = read(locale);
    const quiz = expandQuizLocale(manifest, copy, locale);
    assert.equal(quiz.stages.length, 10, locale);
    assert.deepEqual(quiz.stages.map((stage: any) => stage.questions.length), Array(10).fill(10));
    assert.equal(new Set(quiz.stages.flatMap((stage: any) => stage.questions.map((q: {id: string}) => q.id))).size, 100);
    assert.equal(quiz.career.stages.length, 10);
    assert.equal(quiz.career.stages.at(-1).next, undefined);
    assert.equal(quiz.career.stages.at(-1).preAdChecks.length, 3);
    assert.ok(copy.landing.cta.trim());
    assert.ok(copy.landing.intro.trim());
    for (const [stageIndex, stage] of quiz.stages.entries()) {
      for (const question of stage.questions) {
        const logic = manifest.structure.questions[question.id];
        const native = copy.stages[`stage-${stageIndex + 1}`].questions[question.id];
        assert.ok(question.question.trim(), `${locale}/${question.id}`);
        assert.equal(logic.answerIds.length, 3);
        assert.deepEqual(Object.keys(native.answers), logic.answerIds);
        assert.deepEqual(Object.keys(logic.choiceMeanings), logic.answerIds);
        assert.equal(new Set(Object.values(native.answers)).size, 3);
      }
    }
  }
  assert.deepEqual(read('en').landing, {intro: 'Your daily choices leave clues.\nWhat age is hiding in yours?', cta: 'Start Self Test'});
});

test('all eight clock personalities remain reachable with bounded estimates in the long quiz', () => {
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
