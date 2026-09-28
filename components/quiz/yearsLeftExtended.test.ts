import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';
import type {Quiz} from '../../lib/quizzes.ts';
import {scoreQuiz} from './scoring.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${file}.json`, 'utf8'));
const englishManifest = () => resolveQuizLocaleManifest(read('quiz'), 'en');

test('English Years Left has ten distinct ten-question chapters and a checkpoint after each', () => {
  const manifest = englishManifest();
  const copy = read('en');
  const quiz = expandQuizLocale(manifest, copy, 'en');
  assert.equal(manifest.template, 'ten-stage-ten-question-v1');
  assert.deepEqual(manifest.activeLocales, fs.readdirSync('data/i18n').filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5)).sort());
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(quiz.stages.length, 10);
  assert.deepEqual(quiz.stages.map((stage: {questions: unknown[]}) => stage.questions.length), Array(10).fill(10));
  const questions = quiz.stages.flatMap((stage: {questions: {id: string; question: string; answers: Record<string, string>}[]}) => stage.questions);
  assert.equal(new Set(questions.map((question: {id: string}) => question.id)).size, 100);
  assert.equal(questions.at(-1).id, 'yl-s10q7', 'the original final instinct stays last');
  for (const question of questions) {
    assert.ok(question.question.trim(), question.id);
    assert.equal(Object.values(question.answers).length, 3, question.id);
    assert.equal(new Set(Object.values(question.answers)).size, 3, question.id);
  }
  assert.equal(quiz.career.stages.length, 10);
  assert.ok(quiz.career.stages.every((stage: {preAdTitle: string; preAdCopy: string}) => stage.preAdTitle && stage.preAdCopy));
  assert.doesNotMatch(copy.landing.intro, /\b(?:10|ten|70|seventy|100|hundred)\b|rounds?|stages?/i);
  assert.doesNotMatch(copy.summary, /\b(?:10|ten|70|seventy|100|hundred)\b|rounds?|stages?/i);
  assert.doesNotMatch(JSON.stringify(copy.career.stages), /ROUND \d|OF 10|seven more choices|more precise|halfway|\b(?:one|two|\d+) chapters? (?:left|to go)\b/i);
  assert.doesNotMatch(copy.about.body, /\b(?:10|ten|70|seventy|7|seven)\b/);
});

test('English chapters preserve the requested landing and deliver distinct, mapped choices', () => {
  const manifest = englishManifest();
  const copy = read('en');
  assert.deepEqual(copy.landing, { intro: 'One surprising result.\nWhat age will you get?', cta: 'Start' });
  assert.equal(copy.stages['stage-1'].questions['yl-s1q1'].headerLabel, 'Death Clock Test');
  assert.equal(copy.stages['stage-1'].questions['yl-s1q2'].headerLabel, 'YOUR MORNING MODE');
  const answerSets = new Set();
  for (const [index, stage] of manifest.structure.stages.entries()) {
    const gate = copy.career.stages[stage.id];
    assert.equal(gate.preAdButton, index < 9 ? 'Continue' : 'See My Result');
    if (index < 9) assert.match(gate.preAdCopy, /\{profile\}/);
    for (const id of stage.questionIds) {
      const answers = copy.stages[stage.id].questions[id].answers;
      const labels = Object.values(answers) as string[];
      assert.ok(labels.every(label => label.length <= 66), id);
      answerSets.add(JSON.stringify(labels));
      assert.deepEqual(Object.keys(manifest.structure.questions[id].choiceMeanings), Object.keys(answers));
    }
  }
  assert.equal(answerSets.size, 100, 'each question has its own answer set');
  assert.deepEqual(manifest.structure.questions['yl-s1q1'].choiceMeanings.a3, { steady_long_game: 1 }, 'an unhurried morning means a steady routine');
  assert.deepEqual(manifest.structure.questions['yl-s4q1'].choiceMeanings.a4, { stress_sprinter: 1 }, 'late replies mean pressure, not weekend spontaneity');
  assert.deepEqual(manifest.structure.questions['yl-s6q6'].choiceMeanings.a1, { comfort_creature: 1 }, 'quiet time is comfort, not a negative social-health judgement');
});

test('all clock personalities are reachable and playful estimates retain their bounds', () => {
  const manifest = englishManifest();
  const copy = read('en');
  const quiz = {
    engine: { scoring: { type: 'weighted-profile' }, estimate: manifest.engine.estimate },
    questions: manifest.structure.stages.flatMap((stage: {questionIds: string[]}, stageIndex: number) => stage.questionIds.map(id => {
      const logic = manifest.structure.questions[id];
      return { id, stage: stageIndex, choiceWeights: logic.answerIds.map((key: string) => logic.choiceMeanings[key]), calibrationValues: logic.calibration && logic.answerIds.map((key: string) => logic.calibration[key]) };
    })),
    result: {
      profiles: manifest.structure.results.profiles.map((profile: {id: string}) => ({id: profile.id, ...copy.results.profiles[profile.id]})),
      scoreDimensions: manifest.structure.results.dimensions.map((dimension: {key: string; profiles: string[]}) => ({ label: copy.results.dimensions[dimension.key].label, categories: dimension.profiles })),
    },
  } as Quiz;
  for (const profile of quiz.result.profiles) {
    const answers = Object.fromEntries(quiz.questions.map((question, index) => {
      const match = question.choiceWeights!.findIndex(weights => weights[profile.id!] > 0);
      return [question.id, match < 0 ? index % question.choiceWeights!.length : match];
    }));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.profile.id, profile.id);
    assert.ok(result.estimatedAge! >= 73 && result.estimatedAge! <= 95);
  }
  assert.equal(quiz.questions.filter(question => question.calibrationValues).length, 1);
  assert.equal(manifest.engine.estimate.calibrationMax, 1);
});

test('every supported Years Left locale has three aligned choices per question', () => {
  const source = read('quiz');
  for (const locale of source.activeLocales) {
    const manifest = resolveQuizLocaleManifest(source, locale);
    assert.equal(manifest.engine.hardRefreshCheckpoints, true, `${locale}: reload at checkpoints`);
    const copy = read(locale);
    const firstHeader = copy.stages['stage-1'].questions['yl-s1q1'].headerLabel;
    assert.ok(firstHeader.trim(), `${locale}: first-screen identity`);
    if (locale !== 'en') assert.notEqual(firstHeader, 'Death Clock Test', `${locale}: translated first-screen identity`);
    const counts: Record<string, number> = {};
    for (const stage of manifest.structure.stages) {
      for (const id of stage.questionIds) {
        const logic = manifest.structure.questions[id];
        const answers = copy.stages[stage.id].questions[id].answers;
        assert.equal(logic.answerIds.length, 3, `${locale}/${id}`);
        assert.deepEqual(Object.keys(answers), logic.answerIds, `${locale}/${id}: translated choice IDs`);
        assert.deepEqual(Object.keys(logic.choiceMeanings), logic.answerIds, `${locale}/${id}: scoring IDs`);
        assert.equal(new Set(Object.values(answers)).size, 3, `${locale}/${id}: distinct labels`);
        for (const weights of Object.values(logic.choiceMeanings) as Record<string, number>[]) {
          assert.equal(Object.values(weights).reduce((sum, weight) => sum + weight, 0), 1);
          for (const profile of Object.keys(weights)) counts[profile] = (counts[profile] ?? 0) + 1;
        }
        if (logic.calibration) assert.deepEqual(Object.keys(logic.calibration), logic.answerIds);
      }
    }
    const originalCounts: Record<string, number> = locale === 'en'
      ? { centenarian_energy: 53, steady_long_game: 59, balanced_realist: 58, weekend_chaos: 42, stress_sprinter: 44, comfort_creature: 50, adventure_fuse: 51, reset_needed: 43 }
      : { centenarian_energy: 38, steady_long_game: 36, balanced_realist: 40, weekend_chaos: 33, stress_sprinter: 31, comfort_creature: 36, adventure_fuse: 35, reset_needed: 31 };
    for (const [profile, originalCount] of Object.entries(originalCounts)) {
      assert.ok(Math.abs(counts[profile] - originalCount * .75) <= 1.5, `${locale}/${profile}: preserve relative scoring opportunities`);
    }
  }
});
