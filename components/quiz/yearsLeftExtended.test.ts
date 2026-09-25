import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import type {Quiz} from '../../lib/quizzes.ts';
import {scoreQuiz} from './scoring.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${file}.json`, 'utf8'));

test('English Years Left has ten distinct seven-question chapters and a rewarded checkpoint after each', () => {
  const manifest = read('quiz');
  const copy = read('en');
  const quiz = expandQuizLocale(manifest, copy, 'en');
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.deepEqual(manifest.activeLocales, fs.readdirSync('data/i18n').filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5)).sort());
  assert.notEqual(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(quiz.stages.length, 10);
  assert.deepEqual(quiz.stages.map((stage: {questions: unknown[]}) => stage.questions.length), Array(10).fill(7));
  const questions = quiz.stages.flatMap((stage: {questions: {id: string; question: string; answers: Record<string, string>}[]}) => stage.questions);
  assert.equal(new Set(questions.map((question: {id: string}) => question.id)).size, 70);
  for (const question of questions) {
    assert.ok(question.question.trim(), question.id);
    assert.equal(Object.values(question.answers).length, 4, question.id);
    assert.equal(new Set(Object.values(question.answers)).size, 4, question.id);
  }
  assert.equal(quiz.career.stages.length, 10);
  assert.ok(quiz.career.stages.every((stage: {preAdTitle: string; preAdCopy: string}) => stage.preAdTitle && stage.preAdCopy));
  assert.doesNotMatch(copy.landing.intro, /\b(?:10|ten|70|seventy)\b|rounds?|stages?/i);
  assert.doesNotMatch(copy.summary, /\b(?:10|ten|70|seventy)\b|rounds?|stages?/i);
  assert.doesNotMatch(JSON.stringify(copy.career.stages), /ROUND \d|OF 10|seven more choices|more precise|halfway|\b(?:one|two|\d+) chapters? (?:left|to go)\b/i);
  assert.doesNotMatch(copy.about.body, /\b(?:10|ten|70|seventy|7|seven)\b/);
});

test('English chapters preserve the requested landing and deliver distinct, mapped choices', () => {
  const manifest = read('quiz');
  const copy = read('en');
  assert.deepEqual(copy.landing, { intro: 'One surprising result.\nWhat age will you get?', cta: 'Start' });
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
  assert.equal(answerSets.size, 70, 'each question has its own answer set');
  assert.deepEqual(manifest.structure.questions['yl-s1q1'].choiceMeanings.a3, { steady_long_game: 1 }, 'an unhurried morning means a steady routine');
  assert.deepEqual(manifest.structure.questions['yl-s4q1'].choiceMeanings.a4, { stress_sprinter: 1 }, 'late replies mean pressure, not weekend spontaneity');
  assert.deepEqual(manifest.structure.questions['yl-s6q6'].choiceMeanings.a1, { comfort_creature: 1 }, 'quiet time is comfort, not a negative social-health judgement');
});

test('all clock personalities are reachable and playful estimates retain their bounds', () => {
  const manifest = read('quiz');
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
      return [question.id, match < 0 ? index % 4 : match];
    }));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.profile.id, profile.id);
    assert.ok(result.estimatedAge! >= 73 && result.estimatedAge! <= 95);
  }
  assert.equal(quiz.questions.filter(question => question.calibrationValues).length, 1);
  assert.equal(manifest.engine.estimate.calibrationMax, 1);
});
