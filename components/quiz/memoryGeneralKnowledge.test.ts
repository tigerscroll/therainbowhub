import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';
import {applyTextThreeChoices} from '../../scripts/three-choice-entry.mjs';
import {buildMemoryGeneralKnowledge} from '../../scripts/memory-general-knowledge.mjs';
import {scoreQuiz} from './scoring.ts';

const read = (name: string) => JSON.parse(fs.readFileSync(`data/quizzes/memory/${name}.json`, 'utf8'));
const manifest = read('quiz'), copy = read('en');
const allIds = manifest.structure.stages.flatMap((stage: any) => stage.questionIds);
const allCopy = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));

test('English /memory has one ten-question general-knowledge round and a subtitle-free landing', () => {
  assert.equal(copy.title, 'Most Adults Can’t Score 80% On This Test');
  assert.deepEqual(copy.landing, {cta: 'Start'});
  assert.equal(resolveQuizLocaleManifest(manifest, 'en').template, 'single-stage-rewarded-v1');
  const english = expandQuizLocale(manifest, copy, 'en');
  assert.deepEqual(english.stages.map((stage: any) => stage.questions.length), [10]);
  assert.equal(english.career.stages.length, 1);
  assert.equal(english.career.stages[0].preAdButton, 'See My Result');
  assert.equal(english.career.stages[0].next, undefined);
  assert.match(copy.about.body, /8 correct to reach 80%/);
  assert.equal(manifest.engine.entry, 'landing');
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(manifest.engine.scoring, 'correct-answer');
  assert.equal(manifest.engine.targetRatio, .8);
  assert.equal(allIds.length, 10);
  assert.equal(new Set(allIds).size, 10);
  assert.equal(new Set(Object.values(allCopy).map((q: any) => q.question)).size, 10);
  assert.deepEqual(manifest.structure.stages.map((stage: any) => stage.questionIds.length), [10]);
  assert.match(allCopy['memory-gk-s4q1'].question, /ocean/i);
  assert.match(allCopy['memory-gk-s6q1'].question, /Mona Lisa/);
  for (const text of [copy.about.body, copy.summary, JSON.stringify(copy.results)]) {
    assert.doesNotMatch(text, /memory (?:area|assess|challenge|test)|recall|study board/i);
  }
});

test('all localized editions retain the full bank, with three answers and no study waits', () => {
  const englishBank = expandQuizLocale(manifest, copy, 'en');
  const {manifest: rebuilt, copies} = buildMemoryGeneralKnowledge();
  assert.deepEqual(rebuilt, manifest, 'authoring is repeatable');
  const yearsLeft = JSON.parse(fs.readFileSync('data/quizzes/years-left/quiz.json', 'utf8'));
  assert.deepEqual(manifest.activeLocales, yearsLeft.activeLocales);
  const positions = [0, 0, 0];
  for (const id of allIds) {
    const logic = manifest.structure.questions[id];
    assert.equal(logic.answerIds.length, 3);
    assert.equal(logic.presentation, 'text');
    for (const field of ['study', 'memoryItems', 'visual', 'image', 'delay']) assert.equal(logic[field], undefined);
    positions[logic.answerIds.indexOf(logic.correctAnswerId)]++;
  }
  assert.deepEqual(positions, [4, 3, 3]);
  for (const locale of manifest.activeLocales) {
    const native = read(locale);
    const expanded = expandQuizLocale(manifest, native, locale);
    const signature = (value: any) => value.stages.flatMap((stage: any) => stage.questions.map((q: any) => [q.id, q.answerIds, q.correct]));
    assert.deepEqual(Object.keys(native.landing), ['cta'], locale);
    assert.deepEqual(signature(expanded), signature(englishBank), locale);
    assert.equal(expanded.career.stages.length, 1, locale);
    assert.equal(expanded.career.stages[0].next, undefined, locale);
    for (const stage of expanded.stages) for (const question of stage.questions) {
      assert.equal(question.study, undefined, `${locale}/${question.id}`);
      assert.equal(new Set(question.answers).size, 3);
    }
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
  assert.deepEqual(allIds.map(correct), [
    'Mars', 'Dolphin', 'Pacific Ocean', 'Rice', 'Four', 'Canberra',
    'Leonardo da Vinci', 'Ball', 'Inca', 'Second',
  ]);
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

test('the quiz reaches the 80% target at 8/10', () => {
  const quiz = scoringQuiz();
  for (const count of [0, 7, 8, 10]) {
    const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, i < count ? q.answerIndex : (q.answerIndex! + 1) % 3]));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.total, 10);
    assert.equal(result.score, count);
    assert.equal(result.targetStatus === 'achieved', count >= 8);
  }
});
