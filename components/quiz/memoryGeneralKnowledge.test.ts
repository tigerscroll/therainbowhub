import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {applyTextThreeChoices} from '../../scripts/three-choice-entry.mjs';
import {buildMemoryGeneralKnowledge} from '../../scripts/memory-general-knowledge.mjs';
import {getChapterAnswers} from './engagement.ts';
import {scoreQuiz} from './scoring.ts';

const read = (name: string) => JSON.parse(fs.readFileSync(`data/quizzes/memory/${name}.json`, 'utf8'));
const manifest = read('quiz'), copy = read('en');
const allIds = manifest.structure.stages.flatMap((stage: any) => stage.questionIds);
const allCopy = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));

test('/memory is now a ten-stage general-knowledge quiz with the requested title and subtitle', () => {
  assert.equal(copy.title, 'Most Adults Can’t Score 80% On This Test');
  assert.deepEqual(copy.landing, {intro: "Think you're smart? Put it to the test.", cta: 'Start'});
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.equal(manifest.engine.entry, 'landing');
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(manifest.engine.scoring, 'correct-answer');
  assert.equal(manifest.engine.targetRatio, .8);
  assert.equal(allIds.length, 70);
  assert.equal(new Set(allIds).size, 70);
  assert.equal(new Set(Object.values(allCopy).map((q: any) => q.question)).size, 70);
  assert.deepEqual(manifest.structure.stages.map((stage: any) => stage.questionIds.length), Array(10).fill(7));
  assert.match(allCopy['memory-gk-s4q1'].question, /ocean/i);
  assert.match(allCopy['memory-gk-s6q1'].question, /Mona Lisa/);
  for (const text of [copy.about.body, copy.summary, JSON.stringify(copy.results)]) {
    assert.doesNotMatch(text, /memory (?:area|assess|challenge|test)|recall|study board/i);
  }
});

test('all existing locales retain scoring parity, three answers, balanced positions and no study waits', () => {
  const english = expandQuizLocale(manifest, copy, 'en');
  const positions = [0, 0, 0];
  for (const id of allIds) {
    const logic = manifest.structure.questions[id];
    assert.equal(logic.answerIds.length, 3);
    assert.equal(logic.presentation, 'text');
    for (const field of ['study', 'memoryItems', 'visual', 'image', 'delay']) assert.equal(logic[field], undefined);
    positions[logic.answerIds.indexOf(logic.correctAnswerId)]++;
  }
  assert.deepEqual(positions, [24, 23, 23]);
  for (const locale of manifest.activeLocales) {
    const native = read(locale);
    const expanded = expandQuizLocale(manifest, native, locale);
    const signature = (value: any) => value.stages.flatMap((stage: any) => stage.questions.map((q: any) => [q.id, q.answerIds, q.correct]));
    assert.deepEqual(signature(expanded), signature(english), locale);
    for (const stage of expanded.stages) for (const question of stage.questions) {
      assert.equal(question.study, undefined, `${locale}/${question.id}`);
      assert.equal(new Set(question.answers).size, 3);
    }
    const {manifest: rebuilt, copies} = buildMemoryGeneralKnowledge();
    assert.deepEqual(rebuilt, manifest, 'authoring is repeatable');
    assert.deepEqual(copies[locale], native, `${locale}: no stale memory copy returns on regeneration`);
  }
});

test('question IDs invalidate saved memory-recall answers instead of reinterpreting them', () => {
  assert(allIds.every((id: string) => id.startsWith('memory-gk-')));
  assert.equal(manifest.structure.questions['memory-s1q1'], undefined);
  assert.equal(manifest.structure.questions['memory-s1q2'], undefined);
});

test('fact answers remain correct after choice shuffling and across languages', () => {
  const correct = (id: string) => allCopy[id].answers[manifest.structure.questions[id].correctAnswerId];
  const expected = ['Pacific Ocean', 'Asia', 'Canberra', 'Nile', 'South America', 'Australia', 'Italy'];
  expected.forEach((answer, i) => assert.equal(correct(`memory-gk-s4q${i + 1}`), answer));
  assert.equal(correct('memory-gk-s6q1'), 'Leonardo da Vinci');
  assert.equal(correct('memory-gk-s6q2'), 'Neil Armstrong');
  assert.equal(correct('memory-gk-s6q6'), 'Inca');
  assert.equal(correct('memory-gk-s10q1'), '90 degrees');
  assert.equal(correct('memory-gk-s10q2'), 'Second');
  assert.equal(correct('memory-gk-s10q3'), '45');
  assert.equal(correct('memory-gk-s10q4'), '6');
  assert.equal(correct('memory-gk-s10q6'), '9');
  assert.equal(correct('memory-gk-s10q7'), 'Ottawa');
  const drafts = Object.fromEntries(manifest.activeLocales.map((locale: string) => [locale, read(locale)]));
  const nextManifest = structuredClone(manifest);
  applyTextThreeChoices(nextManifest, drafts);
  assert.deepEqual(nextManifest, manifest);
  for (const locale of manifest.activeLocales) assert.deepEqual(drafts[locale], read(locale));
});

function scoringQuiz(): Quiz {
  return {
    engine: {scoring: {type: 'correct-answer'}, targetRatio: .8},
    stages: manifest.structure.stages.map((stage: any) => copy.stages[stage.id].title),
    questions: manifest.structure.stages.flatMap((stage: any, i: number) => stage.questionIds.map((id: string) => {
      const logic = manifest.structure.questions[id];
      return {id, stage: i, answerIndex: logic.answerIds.indexOf(logic.correctAnswerId), category: logic.category};
    })),
    result: {
      profiles: manifest.structure.results.profiles.map((p: any) => ({minRatio: p.min, ...copy.results.profiles[p.key]})),
      scoreDimensions: manifest.structure.results.dimensions.map((d: any) => ({label: copy.results.dimensions[d.key].label, categories: d.categories})),
    },
  } as Quiz;
}

test('the full quiz needs 56/70 for 80%, and checkpoints score only their own seven answers', () => {
  const quiz = scoringQuiz();
  for (const count of [0, 35, 49, 55, 56, 63, 70]) {
    const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, i < count ? q.answerIndex : (q.answerIndex! + 1) % 3]));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.score, count);
    assert.equal(result.total, 70);
    assert.equal(result.targetStatus === 'achieved', count >= 56);
  }
  const perfect = Object.fromEntries(quiz.questions.map(q => [q.id, q.answerIndex!]));
  for (let i = 0; i < 10; i++) {
    const questions = quiz.questions.filter(q => q.stage === i);
    const result = scoreQuiz({...quiz, questions}, getChapterAnswers(quiz.questions, perfect, i));
    assert.equal(result.total, 7);
    assert.equal(result.profile.title, 'Quiz Master');
    assert.equal(copy.career.stages[`stage-${i + 1}`].preAdButton, i === 9 ? 'See My Result' : 'Continue');
  }
});
