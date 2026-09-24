import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/english-extended/${file}.json`, 'utf8'));

test('English Years Left has ten distinct seven-question chapters and a rewarded checkpoint after each', () => {
  const manifest = read('quiz');
  const copy = read('en');
  const quiz = expandQuizLocale(manifest, copy, 'en');
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.deepEqual(manifest.activeLocales, ['en']);
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
  assert.doesNotMatch(JSON.stringify(copy.career.stages), /ROUND \d|OF 10|seven more choices|more precise/i);
});
